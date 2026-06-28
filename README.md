# Ladica

Dead-simple link saver — **spremi linkove, otvori jednim dodirom**. Croatian,
mobile-first, local-first PWA. A [HrvaLabs.net](https://hrvalabs.net) project at
[ladica.hrva.cc](https://ladica.hrva.cc).

Signed out, links live only in the browser (`localStorage`) — no accounts, no
analytics, no external scripts, nothing leaves the device. Sign-in is optional:
it turns on cross-device sync against the Ladica Sync backend (see
[Sinkronizacija (opcionalno)](#sinkronizacija-opcionalno)).

## Stack

- **Astro** (static output) — launcher (`/`) and landing (`/landing`) are plain HTML for SEO.
- **Svelte island** — the app (`/app`) is an interactive component (`client:only`).
- **@vite-pwa/astro** (Workbox) — installable, offline-capable PWA.

> **On versions:** This is intentionally on Astro 4 + Svelte 4. `@astrojs/sitemap` is
> pinned to `3.2.1` — the last release compatible with Astro 4 (newer 3.7.x requires an
> Astro 5+ build hook). Astro 7 isn't an option yet because `@vite-pwa/astro` supports
> Astro ≤5. The Svelte advisories flagged by `npm audit` are **SSR-only** XSS issues;
> this app never server-renders Svelte (the island is `client:only`), so they don't
> apply to the shipped site. Revisit when `@vite-pwa/astro` gains Astro 7 support or when
> server sync is added.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # Vitest (logic + components)
```

## Build

```bash
npm run build      # → dist/  (static)
npm run preview    # serve the production build locally
```

The PWA service worker is only active in the production build (`build` + `preview`),
not in `dev`.

## Sinkronizacija (opcionalno)

The app is local-first and works fully signed-out. Signing in (Google or e-mail
magic-link) is opt-in and turns on cross-device sync against the **Ladica Sync
backend** (the `linker-be` service). Without a reachable backend, sync simply
stays idle — the local experience is unchanged.

The backend base URL comes from `PUBLIC_API_BASE` (an Astro `PUBLIC_*` env, so it
is read at build time and exposed to the client). Copy `.env.example` to `.env`
and adjust it, or pass it inline. `.env` files are git-ignored.

```bash
# Default — production backend
PUBLIC_API_BASE=https://ladica-api.hrva.cc

# Run the dev server against a local backend instead
PUBLIC_API_BASE=http://localhost:8080 npm run dev
```

Using sync requires the `linker-be` backend to be deployed (or running locally at
`http://localhost:8080`). See `docs/superpowers/plans/2026-06-26-ladica-sync-backend.md`.

## Icons

PWA icons are generated from `src/assets-src/*.svg`:

```bash
npm run gen:icons  # writes public/assets/icon-{192,512,512-maskable}.png
```

## Deploy — Cloudflare Pages

1. Push this repo to your Git host and connect it in the Cloudflare Pages dashboard.
2. Build command: `npm run build` · Output directory: `dist`.
3. Add the custom domain `ladica.hrva.cc` (HTTPS is automatic — required for the
   service worker).

Cache headers for the SW, manifest, and assets are in `public/_headers`.

## Project layout

```
src/
  layouts/Base.astro            # shared <head>: SEO, OG, JSON-LD, PWA meta
  components/
    BrandMark.astro
    app/                        # the Svelte island
      LinkApp.svelte            # root; FilterBar / LinkCard / AddSheet / Snackbar / QrDialog / InstallButton
      lib/                      # url, categories, storage (sync seam), store, io (import/export)
  pages/  index.astro  landing.astro  app.astro
  styles/tokens.css             # design tokens (single source of truth)
public/                         # icons, robots.txt, _headers, favicon, og
docs/design-export/             # the original Open Design export (reference)
docs/superpowers/               # spec + implementation plan
```

## Server sync

Storage is behind a small adapter interface (`src/components/app/lib/storage.ts`),
which keeps the on-device working copy local-first. On top of it, optional cloud
sync is implemented in `src/components/app/lib/{auth,api,sync}.ts`: it reconciles
localStorage with the Ladica Sync backend (last-write-wins on `updatedAt`, with
soft-delete tombstones). See [Sinkronizacija (opcionalno)](#sinkronizacija-opcionalno)
to point it at a backend.
