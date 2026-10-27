import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mountPluginService } from '@motus-ai/seed-sdk/testing';
import SampleService from '../src/service.ts';
import type { Greeting, PreferencesSnapshot } from '../src/preferences.ts';

const project = new URL('../', import.meta.url);

test('saves a name and reads it after creating a new service instance', async () => {
  const settings: Record<string, unknown> = {};
  const first = await mountPluginService(SampleService, { project, settings });
  try {
    const initial = (await first.service.call('readPreferences', {})) as PreferencesSnapshot;
    assert.deepEqual(initial.value, { name: '' });
    await first.service.call('savePreferences', { name: '  Ada  ', revision: initial.revision });
  } finally {
    await first.dispose();
  }
  const second = await mountPluginService(SampleService, { project, settings });
  try {
    const saved = (await second.service.call('readPreferences', {})) as PreferencesSnapshot;
    assert.deepEqual(saved.value, { name: 'Ada' });
    const greeting = (await second.service.call('greet', {})) as Greeting;
    assert.equal(greeting.message, 'Hello, Ada!');
    assert.ok(Number.isFinite(Date.parse(greeting.time)));
  } finally {
    await second.dispose();
  }
});

test('a stale page cannot overwrite a newer saved name', async () => {
  const context = await mountPluginService(SampleService, { project });
  try {
    const initial = (await context.service.call('readPreferences', {})) as PreferencesSnapshot;
    await context.service.call('savePreferences', { name: 'Ada', revision: initial.revision });
    await assert.rejects(
      context.service.call('savePreferences', { name: 'Grace', revision: initial.revision }),
      /plugin_settings_conflict/,
    );
    const saved = (await context.service.call('readPreferences', {})) as PreferencesSnapshot;
    assert.equal(saved.value.name, 'Ada');
  } finally {
    await context.dispose();
  }
});

test('validates input without changing saved preferences', async () => {
  const context = await mountPluginService(SampleService, { project });
  try {
    const initial = (await context.service.call('readPreferences', {})) as PreferencesSnapshot;
    for (const name of [null, 42, 'x'.repeat(81)]) {
      await assert.rejects(
        context.service.call('savePreferences', { name, revision: initial.revision }),
        /80 characters/,
      );
    }
    await assert.rejects(context.service.call('savePreferences', { name: 'Ada' }), /80 characters/);
    assert.deepEqual(
      ((await context.service.call('readPreferences', {})) as PreferencesSnapshot).value,
      { name: '' },
    );
  } finally {
    await context.dispose();
  }
});

test('reports unreadable stored preferences instead of silently replacing them', async () => {
  const settings = { preferences: { name: 42 } };
  const context = await mountPluginService(SampleService, { project, settings });
  try {
    await assert.rejects(context.service.call('readPreferences', {}), /could not be read/);
    assert.deepEqual(settings.preferences, { name: 42 });
  } finally {
    await context.dispose();
  }
});

test('uses the selected language and a default name before anything is saved', async () => {
  const context = await mountPluginService(SampleService, { project, locale: 'zh-CN' });
  try {
    assert.equal(((await context.service.call('greet', {})) as Greeting).message, '你好，朋友！');
  } finally {
    await context.dispose();
  }
});

test('rejects cancelled writes and calls after unloading', async () => {
  const context = await mountPluginService(SampleService, { project });
  try {
    const initial = (await context.service.call('readPreferences', {})) as PreferencesSnapshot;
    const controller = new AbortController();
    controller.abort(new Error('Cancelled by test'));
    await assert.rejects(
      context.service.call(
        'savePreferences',
        { name: 'Ada', revision: initial.revision },
        controller.signal,
      ),
      /Cancelled by test/,
    );
    assert.equal(
      ((await context.service.call('readPreferences', {})) as PreferencesSnapshot).value.name,
      '',
    );
  } finally {
    await context.dispose();
  }
  await assert.rejects(context.service.call('greet', {}), /not running/);
});
