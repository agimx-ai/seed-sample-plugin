import { PluginService, SeedPluginError } from '@motus-ai/seed-sdk';
import { isPreferences, MAX_NAME_LENGTH, type PreferencesSnapshot } from './preferences.ts';

export default class SampleService extends PluginService {
  override onload() {
    // Private methods are called by this plugin's page, not exposed as Agent tools.
    this.registerMethod('readPreferences', (_args, signal) => this.readPreferences(signal));

    this.registerMethod('savePreferences', async ({ name, revision }, signal) => {
      if (
        typeof name !== 'string' ||
        name.trim().length > MAX_NAME_LENGTH ||
        typeof revision !== 'string'
      ) {
        throw new SeedPluginError('invalid_preferences', this.i18n.t('errors.invalidPreferences'));
      }
      signal.throwIfAborted();
      // The page passes the revision it read. A stale page must not overwrite newer data.
      const saved = await this.app.settings.save('preferences', { name: name.trim() }, revision);
      signal.throwIfAborted();
      return saved;
    });

    this.registerMethod('greet', async (_args, signal) => {
      const { value } = await this.readPreferences(signal);
      return {
        message: this.i18n.t('greeting.message', {
          name: value.name || this.i18n.t('greeting.anonymous'),
        }),
        time: new Date().toISOString(),
      };
    });
  }

  private async readPreferences(signal: AbortSignal): Promise<PreferencesSnapshot> {
    signal.throwIfAborted();
    const snapshot = await this.app.settings.snapshot('preferences');
    signal.throwIfAborted();
    if (snapshot.value !== null && !isPreferences(snapshot.value)) {
      throw new SeedPluginError(
        'invalid_saved_preferences',
        this.i18n.t('errors.invalidSavedPreferences'),
      );
    }
    return { revision: snapshot.revision, value: snapshot.value ?? { name: '' } };
  }
}
