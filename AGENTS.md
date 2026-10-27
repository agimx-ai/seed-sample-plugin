# Seed sample plugin

This is an independent Plugin API v2 project. Use the published `@motus-ai/seed-sdk` package and its public exports only. Do not add client source imports, sibling checkout paths, local SDK workspaces, or a second runtime protocol.

- Keep `package.json` name/version and `manifest.json` id/version consistent. Update both locale files when changing visible text.
- Frontend code belongs in `src/main.ts`; backend methods and storage belong in `src/service.ts`. Frontend code must not import Node.js modules or the service implementation.
- Use SDK controls and lifecycle ownership. Keep drafts on page hide, propagate cancellation, and surface revision conflicts instead of silently overwriting saved preferences.
- Root READMEs are bilingual developer documentation. `docs/plugin/README.md` and `README.zh-CN.md` are user introductions copied into the built plugin; keep implementation and development instructions out of those introductions.
- Run `npm run check`. For development sync checks use an isolated directory, stop processes you start, and distinguish file sync from loading in a real client.
- Live preview needs a client release that includes Plugin development mode, explicitly enabled in Plugin settings. Older installed clients cannot gain that feature from an SDK update alone. Do not claim a source implementation has been released.
- Do not commit, push, create packages, install into a user profile or publish without user authorization. Preserve unrelated changes. End text files with one newline.
