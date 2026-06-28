<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { createLinkStore } from './lib/store';
  import { localStorageAdapter } from './lib/storage';
  import { setToken } from './lib/auth';
  import { firstSignInMerge } from './lib/sync';
  import { pullLinks, pushLinks } from './lib/api';
  import { t } from './lib/i18n';

  let errorMsg = '';

  onMount(async () => {
    document.getElementById('auth-boot')?.remove(); // drop the pre-hydration spinner

    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const token = params.get('token');

    if (error || !token) {
      const tr = get(t);
      errorMsg = error
        ? tr('callback.failed')
        : tr('callback.missingToken');
      return;
    }

    setToken(token);
    // Strip the token from the address bar BEFORE the async merge, so it never
    // lingers in the URL (history/referrer leak) while the merge is in flight.
    history.replaceState({}, '', '/auth/callback');
    const store = createLinkStore(localStorageAdapter);
    try {
      await firstSignInMerge(store, { pullLinks, pushLinks });
    } catch {
      // Sign-in itself succeeded; the merge can retry on the next app load.
      // The local copy is untouched, so just continue into the app.
    }
    location.replace('/app');
  });
</script>

{#if errorMsg}
  <div class="card" role="alert">
    <span class="mark err" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.01"/></svg>
    </span>
    <h1>{$t('callback.failedHeading')}</h1>
    <p>{errorMsg}</p>
    <a class="btn" href="/app">{$t('callback.back')}</a>
  </div>
{:else}
  <div class="card" aria-live="polite">
    <span class="spinner" aria-hidden="true"></span>
    <p class="loading">{$t('callback.loading')}</p>
  </div>
{/if}

<style>
  .card {
    max-width: 340px; margin-inline: auto; padding: 0 20px;
    text-align: center; color: var(--fg);
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .mark {
    width: 56px; height: 56px; border-radius: 16px;
    display: grid; place-items: center;
  }
  .mark.err { background: color-mix(in srgb, var(--danger) 12%, var(--surface)); color: var(--danger); }
  .mark svg { width: 30px; height: 30px; }
  .card h1 { margin: 0; font-size: 1.3125rem; font-weight: var(--w-bold); letter-spacing: -0.01em; }
  .card p { margin: 0; color: var(--muted); font-size: 0.9375rem; line-height: 1.5; }
  .loading { color: var(--muted); font-size: 1rem; font-weight: 600; }

  .btn {
    margin-top: 4px;
    display: inline-flex; align-items: center; justify-content: center;
    min-height: var(--tap); padding: 0 22px; border-radius: var(--radius);
    background: var(--accent); color: #fff;
    font: inherit; font-size: 1.0625rem; font-weight: var(--w-bold);
  }
  .btn:hover { background: var(--accent-dk); }
  .btn:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }

  .spinner {
    width: 38px; height: 38px; border-radius: 999px;
    border: 4px solid color-mix(in srgb, var(--accent) 22%, var(--border));
    border-top-color: var(--accent);
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
</style>
