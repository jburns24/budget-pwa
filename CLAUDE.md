# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server with hot reload (SW enabled via devOptions)
npm run build     # tsc type-check + vite build (outputs dist/)
npm run preview   # serve dist/ locally — use this to test PWA installability
npm run lint      # oxlint (React + TypeScript rules)
```

There is no test suite yet.

## Architecture

Single-page React 19 app built with Vite 8. The PWA layer is handled entirely by `vite-plugin-pwa` — no hand-written service worker code exists.

**Key wiring:**

- `vite.config.ts` — `VitePWA` plugin uses `generateSW` strategy with `registerType: 'autoUpdate'`. Workbox precaches all built assets automatically. `devOptions.enabled: true` means the SW also registers during `npm run dev`.
- `public/` — icons (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`) and static assets. The web manifest is generated at build time into `dist/manifest.webmanifest`; do not create one manually in `public/`.
- `index.html` — includes `theme-color` meta and `apple-touch-icon` link required for installability.
- `tsconfig.app.json` — includes `"vite-plugin-pwa/client"` in `types` for virtual module types (`virtual:pwa-register`).

**Linter:** Oxlint (not ESLint). Config is in `.oxlintrc.json`. React hooks and component export rules are enforced.

## PWA validation

After `npm run build && npm run preview`, open Chrome DevTools → Application:
- **Manifest** panel: confirms installability (name, icons, `display: standalone`)
- **Service Workers** panel: confirms SW is registered and activated
- **Network → Offline** then reload: app must still load (Workbox precache)

The legacy Lighthouse PWA audit category is deprecated — use the Manifest panel's installability verdict instead.

## Committing

Commit via the `/commit` skill (`.claude/skills/commit/`), not bare `git commit` — it checks the diff for knowledge worth adding to a CLAUDE.md first.
