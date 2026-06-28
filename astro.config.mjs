import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://ladica.hrva.cc',

  // Croatian is the default and stays unprefixed (/, /landing, /privacy);
  // English is the alternate and lives under /en (/en/, /en/landing, /en/privacy).
  i18n: {
    defaultLocale: 'hr',
    locales: ['hr', 'en'],
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    svelte(),
    // Keep the app shell and the transient auth callback out of the sitemap —
    // they're noindex (no crawlable content), so the sitemap lists only the
    // marketing + legal pages that should rank.
    sitemap({ filter: (page) => !/\/(app|auth)\//.test(page) }),
    AstroPWA({
      registerType: 'prompt',
      // We register + prompt for updates ourselves in LinkApp via virtual:pwa-register.
      injectRegister: false,
      manifest: {
        name: 'Ladica',
        short_name: 'Ladica',
        description: 'Spremi linkove i otvori ih jednim dodirom. Spremljeno na uređaju.',
        lang: 'hr',
        start_url: '/app',
        scope: '/',
        display: 'standalone',
        theme_color: '#15803d',
        background_color: '#eef2ef',
        icons: [
          { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/assets/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Android share sheet: "Share → Ladica" lands on /app with the link as query params.
        share_target: {
          action: '/app',
          method: 'GET',
          enctype: 'application/x-www-form-urlencoded',
          params: { title: 'title', text: 'text', url: 'url' },
        },
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],

  output: "hybrid",
  adapter: cloudflare()
});