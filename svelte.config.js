import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Shared by @astrojs/svelte (build) and @sveltejs/vite-plugin-svelte (vitest).
// vitePreprocess enables <script lang="ts"> inside .svelte components.
export default {
  preprocess: vitePreprocess(),
};
