<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from './lib/i18n';

  // 'launcher' = pill used on the static launcher; 'app' = inline button in the appbar.
  export let variant: 'app' | 'launcher' = 'app';

  interface BipEvent extends Event { prompt: () => void; userChoice: Promise<unknown>; }

  let deferred: BipEvent | null = null;
  let canInstall = false;

  onMount(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      deferred = e as BipEvent;
      canInstall = true;
    };
    const onInstalled = () => {
      canInstall = false;
      deferred = null;
      try { delete (window as unknown as { __ladicaBip?: unknown }).__ladicaBip; } catch { /* ignore */ }
    };
    // Fallback: on the marketing pages the event can fire before this component
    // hydrates (client:visible). Base.astro captures it early into window.__ladicaBip,
    // so pick it up here in addition to listening for any future event.
    const pre = (window as unknown as { __ladicaBip?: BipEvent }).__ladicaBip;
    if (pre) {
      deferred = pre;
      canInstall = true;
    }
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  });

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch { /* dismissed */ }
    deferred = null;
    canInstall = false;
  }
</script>

{#if canInstall}
  <button class="install {variant}" on:click={install}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/></svg>
    <span class="lbl">{$t('install.label')}</span>
  </button>
{/if}

<style>
  .install {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border: 1.5px solid var(--accent); background: var(--surface); color: var(--accent-dk);
    font: inherit; font-weight: 700; cursor: pointer;
    transition: background .15s, transform .05s;
  }
  .install svg { width: 18px; height: 18px; }
  .install:hover { background: color-mix(in srgb, var(--accent) 8%, var(--surface)); }
  .install:active { transform: translateY(1px); }
  .install:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }

  .install.app { min-height: 44px; padding: 0 13px; border-radius: 999px; font-size: 0.875rem; }
  .install.launcher { min-height: 48px; padding: 0 18px; border-radius: var(--r-md); font-size: 1rem; }
  /* Narrow phones: collapse the app-variant install pill to an icon-only button
     (mirrors SyncStatus hiding its label) so the appbar can't overflow. */
  @media (max-width: 430px) {
    .install.app .lbl { display: none; }
    .install.app { width: 44px; padding: 0; gap: 0; }
  }
  @media (prefers-reduced-motion: reduce) { .install { transition: none; } }
</style>
