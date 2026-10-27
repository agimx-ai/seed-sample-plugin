# Seed sample plugin

[简体中文](README.zh-CN.md)

The official starter template for developing MotusAI Seed plugins with the public SDK. It demonstrates SDK settings controls, calls to a separate backend service, saved preferences with conflict detection, and English/Chinese translations.

The project installs `@motus-ai/seed-sdk` from npm. It does not need a Seed source checkout, a local SDK build, or a globally installed CLI.

## Requirements

- Node.js 24 or newer and npm. Node.js 24 LTS is recommended; `.nvmrc` records this major version.
- MotusAI Seed 0.3.11 or newer for running the plugin. This sample pins SDK 0.3.11.

**Live preview requires a Seed client with Plugin development mode enabled in Plugin settings.** This needs a client release that includes the switch; SDK installation alone cannot enable it in an older installed client. Building and testing this project require no client source or running client. The switch is off by default; turning it off restores authorized installed plugins and keeps their data.

Clients started from source and installed releases use the same switch and plugin loading logic. Starting from source does not enable plugin development automatically.

## Get started

Choose **Use this template** on [agimx-ai/seed-sample-plugin](https://github.com/agimx-ai/seed-sample-plugin) to create your own repository, or copy its files into a new project. Run from that project's root:

```sh
npm install
npm run check
```

`check` runs formatting checks, TypeScript checks, service tests, and the plugin build. Subsequent clean installs and CI can use `npm ci` with the committed lockfile. These steps require no client source or running client.

For live preview, open a compatible Seed client, enable **Plugin development mode** in **Plugin settings**, then run:

```sh
npm run dev
```

Open **Sample Plugin** in Seed, enter a display name, choose **Save**, and choose **Show greeting**. Change `src/main.ts` or a translation file to try rebuilding. A successful sync is not proof of loading: also check the plugin page and Seed's activity/error records.

The CLI writes to the current user's development plugin directory:

| Platform | Directory                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Windows  | `%APPDATA%/MotusAI Seed/plugins/development/com.example.seed.sample`                                   |
| macOS    | `~/Library/Application Support/MotusAI Seed/plugins/development/com.example.seed.sample`               |
| Linux    | `$XDG_CONFIG_HOME/MotusAI Seed/plugins/development/com.example.seed.sample`, defaulting to `~/.config` |

To test synchronization without touching a real Seed profile:

```sh
npm run dev -- --directory "path/to/an/isolated/development-directory"
```

This changes only the CLI's output directory; it does not make a client watch that directory. Stop with Ctrl+C; the CLI removes the development output it owns. A failed rebuild preserves the last valid output.

## Make it your plugin

1. Replace `com.example.seed.sample` in both `package.json` and `manifest.json` with your plugin ID. Keep the two IDs and versions consistent.
2. Set the author in `manifest.json`; update the name and description in both `locales/` files.
3. Replace the example behavior in `src/main.ts` and `src/service.ts`.
4. Update both user introductions under `docs/plugin/`. They are copied into the build as `README.md` and `README.zh-CN.md`; this developer README is not distributed with the plugin.
5. Keep `minAppVersion` consistent with the actual SDK APIs you use. Declare any extra dependencies in this project's own `package.json`.

Changing the plugin ID creates a different plugin and a different data namespace. Development builds with the same ID use that plugin's existing preferences; use an isolated test profile when necessary.

## Project layout

```text
src/main.ts               Settings page and frontend lifecycle
src/service.ts            Private backend methods and preference storage
src/preferences.ts        Shared data types and validation
locales/                  English and Chinese text
docs/plugin/              User introductions included in the plugin
tests/service.test.ts     Tests using the SDK's service fixture
manifest.json             Plugin identity and minimum client version
build.mjs                 Build using the public SDK
.github/workflows/check.yml
```

The default service runtime is `sandboxed-web`. The example requests no additional OS permissions and uses no external service. Frontend code must not import the backend implementation or Node.js modules.

## Commands

| Command                | Purpose                                                                           |
| ---------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`          | Build, sync and watch source changes                                              |
| `npm run typecheck`    | Check TypeScript without emitting files                                           |
| `npm run format`       | Format source, JSON, Markdown and workflows                                       |
| `npm run format:check` | Check formatting without changing files                                           |
| `npm test`             | Exercise preference persistence, conflicts, input validation and lifecycle        |
| `npm run build`        | Generate `dist/` with `main.js`, manifest, styles and declared resources          |
| `npm run check`        | Run formatting checks, type checking, tests and build                             |
| `npm run pack`         | Build and create a `.seedpkg` ZIP under `artifacts/`; does not install or publish |

CI runs installation and `check` on Windows, macOS and Linux. It does not install plugins, create packages or publish releases.

If Windows reports that `seed-plugin` or `tsc` cannot be found, verify that Node.js meets the requirement and run `npm ci --include=dev --include=optional --bin-links=true`. Do not copy `node_modules` between operating systems.

## References

- [MotusAI Seed](https://github.com/agimx-ai/motusai-seed)
- [Seed SDK on npm](https://www.npmjs.com/package/@motus-ai/seed-sdk)
- [Plugin development documentation](https://motusseed.com/docs/plugins)

This project is licensed under [MIT](LICENSE).
