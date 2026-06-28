<script lang="ts">
  import { syncStatus, type SyncState } from './lib/sync';
  import { t } from './lib/i18n';

  /** Hidden entirely while signed out (sync is off). */
  export let signedIn = false;

  const LABEL_KEY: Record<SyncState, string> = {
    idle: '',
    syncing: 'sync.syncing',
    synced: 'sync.synced',
    offline: 'sync.offline',
    error: 'sync.error',
  };

  $: state = $syncStatus;
  $: visible = signedIn && state !== 'idle';
  $: label = LABEL_KEY[state] ? $t(LABEL_KEY[state]) : '';
</script>

{#if visible}
  <span class="sync {state}" role="status" aria-live="polite" title={label}>
    <span class="dot" aria-hidden="true"></span>
    <span class="lbl">{label}</span>
  </span>
{/if}

<style>
  .sync {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.8125rem; font-weight: 600; color: var(--muted);
    white-space: nowrap;
  }
  .dot { width: 8px; height: 8px; border-radius: 999px; background: var(--muted); flex: none; }
  .sync.synced .dot { background: var(--accent); }
  .sync.syncing .dot { background: var(--accent); animation: pulse 1s ease-in-out infinite; }
  .sync.error { color: var(--danger); }
  .sync.error .dot { background: var(--danger); }
  .lbl { white-space: nowrap; }
  /* On narrow screens keep just the dot to save appbar space. */
  @media (max-width: 380px) { .lbl { display: none; } }
  @keyframes pulse { 50% { opacity: .35; } }
  @media (prefers-reduced-motion: reduce) { .sync.syncing .dot { animation: none; } }
</style>
