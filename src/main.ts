import { Plugin, PluginSettingTab, Setting, type TextComponent } from '@motus-ai/seed-sdk';
import { MAX_NAME_LENGTH, type Greeting, type PreferencesSnapshot } from './preferences.ts';

class SampleSettingsTab extends PluginSettingTab {
  // Keep the draft and its revision when the page is hidden and shown again.
  private snapshot?: PreferencesSnapshot;
  private draft = '';

  override async display() {
    const t = (key: string) => this.app.i18n.t(key);
    const locale = this.app.locale;
    // DOM text needs a refresh when the language changes; this listener belongs to the page.
    this.registerEvent(
      this.app.events.on('appearance-change', () => {
        if (this.app.locale !== locale) return this.update();
      }),
    );
    this.addChild(
      new Setting(this.containerEl)
        .setName(t('settings.title'))
        .setDesc(t('settings.intro'))
        .setHeading(),
    );

    const nameRow = this.addChild(
      new Setting(this.containerEl).setName(t('settings.name')).setDesc(t('settings.nameHelp')),
    );
    const statusRow = this.addChild(
      new Setting(this.containerEl)
        .setName(t('settings.savedPreferences'))
        .setDesc(t('settings.ready')),
    );
    const greetingRow = this.addChild(
      new Setting(this.containerEl)
        .setName(t('settings.greeting'))
        .setDesc(t('settings.greetingHelp')),
    );
    const signal = nameRow.signal;
    let input!: TextComponent;

    const run = async (work: () => Promise<void>) => {
      nameRow.setDisabled(true);
      statusRow.setDisabled(true);
      greetingRow.setDisabled(true);
      try {
        await work();
      } catch (error) {
        if (!signal.aborted) {
          const message = error instanceof Error ? error.message : String(error);
          statusRow.setDesc(
            message.includes('plugin_settings_conflict') ? t('errors.conflict') : message,
          );
        }
      } finally {
        if (!signal.aborted) {
          nameRow.setDisabled(!this.snapshot);
          statusRow.setDisabled(false);
          greetingRow.setDisabled(!this.snapshot);
        }
      }
    };

    const read = async () => {
      const snapshot = await this.app.service.call<PreferencesSnapshot>(
        'readPreferences',
        {},
        signal,
      );
      if (signal.aborted) return;
      this.snapshot = snapshot;
      this.draft = snapshot.value.name;
      input.setValue(this.draft);
      statusRow.setDesc(t('settings.ready'));
    };

    nameRow
      .addText((text) => {
        input = text.setValue(this.draft).setPlaceholder(t('settings.namePlaceholder'));
        text.inputEl.maxLength = MAX_NAME_LENGTH;
        this.registerDomEvent(text.inputEl, 'input', () => {
          this.draft = text.getValue();
        });
      })
      .addButton((button) =>
        button
          .setButtonText(t('settings.save'))
          .setCta()
          .onClick(() =>
            run(async () => {
              if (!this.snapshot) return;
              const saved = await this.app.service.call<PreferencesSnapshot>(
                'savePreferences',
                {
                  name: input.getValue(),
                  revision: this.snapshot.revision,
                },
                signal,
              );
              if (signal.aborted) return;
              this.snapshot = saved;
              this.draft = saved.value.name;
              input.setValue(this.draft);
              statusRow.setDesc(t('settings.saved'));
            }),
          ),
      );

    statusRow.addButton((button) =>
      button
        .setButtonText(t('settings.reload'))
        .setTooltip(t('settings.reloadHelp'))
        .onClick(() => run(read)),
    );
    greetingRow.addButton((button) =>
      button.setButtonText(t('settings.showGreeting')).onClick(() =>
        run(async () => {
          const greeting = await this.app.service.call<Greeting>('greet', {}, signal);
          if (!signal.aborted)
            greetingRow.setDesc(
              `${greeting.message} ${new Date(greeting.time).toLocaleString(this.app.locale)}`,
            );
        }),
      ),
    );

    if (!this.snapshot) await run(read);
  }
}

export default class SamplePlugin extends Plugin {
  override onload() {
    this.addSettingTab(new SampleSettingsTab(this.app, this));
  }
}
