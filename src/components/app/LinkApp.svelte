<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { registerSW } from 'virtual:pwa-register';
  import { get } from 'svelte/store';
  import { createLinkStore, type Link } from './lib/store';
  import { localStorageAdapter } from './lib/storage';
  import { normUrl, prettyHost, firstUrl } from './lib/url';
  import { exportLinks, mergeImport } from './lib/io';
  import { CATS, ICON, type CatId } from './lib/categories';
  import { isSignedIn, signOut } from './lib/auth';
  import { pull, scheduleSync } from './lib/sync';
  import { pullLinks, pushLinks, AuthError } from './lib/api';
  import { t, locale } from './lib/i18n';
  import FilterBar from './FilterBar.svelte';
  import LinkCard from './LinkCard.svelte';
  import AddSheet from './AddSheet.svelte';
  import Snackbar from './Snackbar.svelte';
  import QrDialog from './QrDialog.svelte';
  import InstallButton from './InstallButton.svelte';
  import AuthButton from './AuthButton.svelte';
  import SyncStatus from './SyncStatus.svelte';
  import SignInSheet from './SignInSheet.svelte';
  import Settings from './Settings.svelte';

  const store = createLinkStore(localStorageAdapter);
  const { links, add, remove, restore, replaceAll } = store;

  // Sync is opportunistic and only runs while signed in — signed-out the app is
  // byte-for-byte the local-first experience (no network).
  const deps = { pullLinks, pushLinks };

  function handleAuthExpired() {
    // Shared sign-out path for BOTH a foreground pull and a background push that
    // hit an expired token. signOut() flips the shared `isSignedIn` store, so the
    // avatar/SyncStatus react without a reload.
    signOut();
    snackbar.show(get(t)('toast.authExpired'));
  }

  const { triggerPush, dispose } = scheduleSync(store, deps, handleAuthExpired);

  // In-flight lock: the initial pull, the 60s interval and the visibility handler
  // can otherwise overlap.
  let pulling = false;
  async function safePull() {
    if (pulling) return;
    pulling = true;
    try {
      await pull(store, deps);
    } catch (e) {
      // AuthError ⇒ the token is dead: sign out + tell the user. Anything else
      // (offline/server) is already reflected in syncStatus — stay quiet.
      if (e instanceof AuthError) handleAuthExpired();
    } finally {
      pulling = false;
    }
  }

  let activeFilter = 'all';
  let sheetOpen = false;
  let qrUrl: string | null = null;
  let snackbar: Snackbar;
  let prefillUrl = '';
  let prefillName = '';
  let signInOpen = false;
  let settingsOpen = false;
  let searchQuery = '';

  $: visible = $links.filter((l) => !l.deleted);
  $: counts = (() => {
    const c: Record<string, number> = { all: visible.length };
    for (const cat of CATS) c[cat.id] = visible.filter((l) => l.cat === cat.id).length;
    return c;
  })();
  $: searchQ = searchQuery.trim().toLowerCase();
  $: items = visible
    .filter((l) => activeFilter === 'all' || l.cat === activeFilter)
    .filter((l) => !searchQ || `${l.name} ${l.url}`.toLowerCase().includes(searchQ));
  $: defaultCat = (activeFilter !== 'all' ? activeFilter : 'cook') as CatId;
  $: overlayOpen = sheetOpen || qrUrl !== null || signInOpen || settingsOpen;

  onMount(() => {
    try { localStorage.setItem('ladica-seen', '1'); } catch { /* ignore */ }
    // The i18n module initialises the locale from localStorage on import and keeps
    // <html lang> in sync; reflect the resolved value here too on first paint.
    try { document.documentElement.lang = get(locale); } catch { /* ignore */ }
    document.getElementById('ladica-boot')?.remove(); // drop the pre-hydration placeholder

    // Web Share Target: opened from another app's share sheet → /app?url=&text=&title=
    const params = new URLSearchParams(location.search);
    if (params.has('url') || params.has('text') || params.has('title')) {
      const text = params.get('text') || '';
      const shared = params.get('url') || firstUrl(text) || text.trim();
      history.replaceState({}, '', '/app'); // clean the address bar
      if (shared) {
        prefillUrl = shared;
        prefillName = params.get('title') || '';
        sheetOpen = true;
      }
    }

    const updateSW = registerSW({
      onNeedRefresh() {
        snackbar.show(get(t)('toast.updateAvailable'), {
          actionLabel: get(t)('action.refresh'),
          action: () => updateSW(true),
          duration: 0,
        });
      },
    });

    // Signed-out: no network, behaviour unchanged. Drop any lingering tombstones
    // (a never-signed-in user would otherwise accumulate them forever) and bail
    // before any sync wiring.
    if (!get(isSignedIn)) {
      store.purgeDeleted();
      return;
    }

    void safePull();

    // Near-real-time without a server push channel: poll on a short interval while
    // the tab is visible (paused when hidden to save battery/data), and pull
    // immediately whenever the app wakes — regaining focus or visibility, coming
    // back online, or restoring from bfcache. So a change made on another device
    // shows up within ~10s while you're watching, and instantly when you return.
    const POLL_MS = 10_000;
    let interval: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => { if (interval == null) interval = setInterval(() => void safePull(), POLL_MS); };
    const stopPolling = () => { if (interval != null) { clearInterval(interval); interval = null; } };
    const onVisible = () => {
      if (document.visibilityState === 'visible') { void safePull(); startPolling(); }
      else stopPolling();
    };
    const onWake = () => void safePull();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onWake);
    window.addEventListener('online', onWake);
    window.addEventListener('pageshow', onWake);
    if (document.visibilityState === 'visible') startPolling();
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onWake);
      window.removeEventListener('online', onWake);
      window.removeEventListener('pageshow', onWake);
    };
  });

  onDestroy(() => dispose());

  function openLink(l: Link) {
    window.open(normUrl(l.url), '_blank', 'noopener,noreferrer');
  }
  async function copyLink(l: Link) {
    try { await navigator.clipboard.writeText(normUrl(l.url)); snackbar.show(get(t)('toast.copied')); }
    catch { snackbar.show(get(t)('toast.copyFailed')); }
  }
  async function shareLink(l: Link) {
    const url = normUrl(l.url);
    const title = (l.name && l.name.trim()) || prettyHost(url);
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url); snackbar.show(get(t)('toast.shareUnavailableCopied')); }
      catch { snackbar.show(get(t)('toast.shareUnavailable')); }
    }
  }
  function deleteLink(l: Link) {
    const removed = remove(l.id);
    if (!removed) return;
    triggerPush();
    snackbar.show(get(t)('toast.deleted'), {
      actionLabel: get(t)('action.undo'),
      action: () => { restore(removed.item, removed.index); triggerPush(); },
    });
  }

  // Focus return for the overlays. We capture the trigger here (synchronously, in
  // the click/event handler) rather than inside each sheet: the sheets only see
  // `open=true` after `.app` has already been marked inert, which blurs the
  // opener to <body> — so a capture inside them would record the wrong element.
  let opener: HTMLElement | null = null;
  function captureOpener() { opener = (document.activeElement as HTMLElement) ?? null; }
  function restoreOpener() {
    const el = opener;
    opener = null;
    // Defer past the flush that removes `inert` from `.app`, or focus() is a no-op.
    if (el) setTimeout(() => el.focus(), 0);
  }

  function openSheet() { captureOpener(); sheetOpen = true; }
  function closeSheet() { sheetOpen = false; prefillUrl = ''; prefillName = ''; restoreOpener(); }
  function onSave(e: CustomEvent<{ url: string; name: string; cat: CatId }>) {
    add(e.detail);
    triggerPush();
    activeFilter = 'all';
    closeSheet();
    snackbar.show(get(t)('toast.saved'));
  }

  function onExport() {
    const json = exportLinks(visible, new Date().toISOString());
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ladica-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    snackbar.show(get(t)('toast.exported'));
  }
  async function onImport(e: CustomEvent<File>) {
    try {
      const parsed = JSON.parse(await e.detail.text());
      const { merged, added, skipped } = mergeImport($links, parsed);
      replaceAll(merged);
      triggerPush();
      activeFilter = 'all';
      snackbar.show(get(t)('toast.imported', { added, skipped }));
    } catch {
      snackbar.show(get(t)('toast.importFailed'));
    }
  }

  $: emptyWhere = activeFilter === 'all' ? '' : $t('empty.where');
</script>

<div class="app" inert={overlayOpen}>
  <header class="appbar">
    <div class="bar-top">
      <h1>
        <span class="brandmark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5l5-5"/><path d="M7.5 10.5l-2 2a3.5 3.5 0 0 0 5 5l2-2"/><path d="M16.5 13.5l2-2a3.5 3.5 0 0 0-5-5l-2 2"/></svg>
        </span>
        Ladica
      </h1>
      <div class="bar-actions">
        <SyncStatus signedIn={$isSignedIn} />
        <InstallButton variant="app" />
        <button class="iconbtn" on:click={() => { captureOpener(); settingsOpen = true; }} aria-label={$t('settings.title')} title={$t('settings.title')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
        <AuthButton {store} on:signin={() => { captureOpener(); signInOpen = true; }} />
      </div>
    </div>
    <p>{$t('app.subtitle')}</p>
    <div class="searchbar">
      <svg class="search-ic" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input type="search" class="search-input" placeholder={$t('search.placeholder')} aria-label={$t('search.placeholder')} bind:value={searchQuery} />
      {#if searchQuery}<button class="search-clear" on:click={() => (searchQuery = '')} aria-label={$t('search.clear')}>×</button>{/if}
    </div>
  </header>

  <FilterBar {counts} active={activeFilter} on:select={(e) => { activeFilter = e.detail; }} />

  <main class="list" class:is-empty={!items.length}>
    {#if items.length}
      {#each items as l (l.id)}
        <LinkCard
          link={l}
          on:open={() => openLink(l)}
          on:copy={() => copyLink(l)}
          on:share={() => shareLink(l)}
          on:qr={() => { captureOpener(); qrUrl = normUrl(l.url); }}
          on:delete={() => deleteLink(l)}
        />
      {/each}
    {:else if searchQ}
      <div class="empty">
        <div class="ill">{@html ICON.other}</div>
        <h2>{$t('empty.noResults', { query: searchQuery.trim() })}</h2>
      </div>
    {:else}
      <div class="empty">
        <div class="ill">{@html ICON.other}</div>
        <h2>{$t('empty.heading', { where: emptyWhere })}</h2>
        <p>{$t('empty.bodyPre')}<strong>{$t('empty.bodyAction')}</strong>{$t('empty.bodyPost')}</p>
      </div>
    {/if}
  </main>

  <footer class="credit">© 2026 <a href="https://ladica.hrva.cc">ladica.hrva.cc</a> · <a href="https://hrvalabs.net">{$t('footer.credit')}</a><br><a href="mailto:ladica@hrvalabs.net">ladica@hrvalabs.net</a> · <a href={$locale === 'en' ? '/en/privacy' : '/privacy'}>{$t('footer.privacy')}</a></footer>

  <div class="addbar">
    <button class="add-btn" on:click={openSheet}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      {$t('app.add')}
    </button>
  </div>
</div>

<AddSheet open={sheetOpen} {defaultCat} initialUrl={prefillUrl} initialName={prefillName} on:save={onSave} on:close={closeSheet} />
<SignInSheet open={signInOpen} on:close={() => { signInOpen = false; restoreOpener(); }} />
<Settings open={settingsOpen} on:close={() => { settingsOpen = false; restoreOpener(); }} on:export={onExport} on:import={onImport} />
<QrDialog url={qrUrl} on:close={() => { qrUrl = null; restoreOpener(); }} />
<Snackbar bind:this={snackbar} />

<style>
  .app {
    max-width: 460px;
    min-height: 100dvh;
    margin-inline: auto;
    background: var(--app-bg);
    display: flex; flex-direction: column;
    position: relative;
    box-shadow: 0 0 0 1px var(--border);
    /* Safety net against horizontal overflow from the appbar cluster. `clip`
       (not `hidden`) so overflow-y stays `visible` and the sticky appbar/addbar
       keep working — `hidden` would force overflow-y to `auto` and break them. */
    overflow-x: clip;
  }

  .appbar {
    position: sticky; top: 0; z-index: 20;
    background: color-mix(in srgb, var(--app-bg) 88%, transparent);
    backdrop-filter: blur(10px);
    padding: 18px 18px 12px;
    padding-top: max(18px, env(safe-area-inset-top));
    border-bottom: 1px solid var(--border);
  }
  .bar-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .bar-actions { display: flex; align-items: center; gap: 8px; }
  .iconbtn {
    width: 44px; height: 44px; border-radius: 999px; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    border: 1.5px solid var(--border); background: var(--surface); color: var(--fg);
    cursor: pointer; transition: background .15s, border-color .15s, transform .05s;
  }
  .iconbtn svg { width: 19px; height: 19px; }
  .iconbtn:hover { background: color-mix(in srgb, var(--accent) 8%, var(--surface)); border-color: color-mix(in srgb, var(--accent) 40%, var(--border)); color: var(--accent-dk); }
  .iconbtn:active { transform: translateY(1px); }
  .iconbtn:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .iconbtn { transition: none; } }
  .appbar h1 {
    margin: 0; min-width: 0;
    font-size: 1.5rem; font-weight: var(--w-bold); letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 9px;
  }
  .appbar .brandmark {
    width: 30px; height: 30px; border-radius: 9px;
    background: var(--accent);
    display: grid; place-items: center; color: #fff; flex: none;
  }
  .appbar .brandmark svg { width: 18px; height: 18px; }
  .appbar p { margin: 4px 0 0 39px; color: var(--muted); font-size: 0.875rem; }

  .searchbar { position: relative; margin-top: 12px; }
  .search-ic {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    width: 18px; height: 18px; color: var(--muted); pointer-events: none;
  }
  .search-input {
    width: 100%; min-height: 44px;
    padding: 0 40px;
    border: 1.5px solid var(--border); border-radius: 999px;
    background: var(--surface); color: var(--fg);
    font: inherit; font-size: 0.9375rem;
  }
  .search-input::-webkit-search-cancel-button { display: none; }
  .search-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }
  .search-clear {
    position: absolute; right: 7px; top: 50%; transform: translateY(-50%);
    width: 30px; height: 30px; border: 0; border-radius: 999px;
    background: none; color: var(--muted); font-size: 1.3125rem; line-height: 1; cursor: pointer;
    display: grid; place-items: center;
  }
  .search-clear:hover { color: var(--fg); background: color-mix(in srgb, var(--fg) 6%, transparent); }
  .search-input:focus-visible, .search-clear:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }

  .list {
    flex: 1;
    padding: 10px 18px calc(var(--tap) + 64px);
    display: flex; flex-direction: column; gap: 14px;
  }

  .empty { margin: 36px auto 0; max-width: 280px; text-align: center; color: var(--muted); }
  .empty .ill {
    width: 76px; height: 76px; margin: 0 auto 16px;
    border-radius: 22px;
    background: color-mix(in srgb, var(--accent) 10%, var(--surface));
    display: grid; place-items: center; color: var(--accent);
  }
  .empty .ill :global(svg) { width: 36px; height: 36px; }
  .empty h2 { margin: 0 0 6px; font-size: 1.125rem; color: var(--fg); }
  .empty p { margin: 0; font-size: 0.9375rem; }

  /* Empty list: center the message in the available space, footer stays at the bottom. */
  .list.is-empty { display: flex; flex-direction: column; }
  .list.is-empty .empty { margin-block: auto; }

  .credit { text-align: center; color: var(--muted); font-size: 0.7812rem; line-height: 1.5; padding: 22px 8px 6px; }
  .credit a { color: var(--muted); text-decoration: underline; text-underline-offset: 2px; }

  .addbar {
    position: sticky; bottom: 0; z-index: 20;
    padding: 12px 18px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    background: color-mix(in srgb, var(--app-bg) 90%, transparent);
    backdrop-filter: blur(10px);
    border-top: 1px solid var(--border);
    box-shadow: var(--shadow-up);
  }
  .add-btn {
    width: 100%; min-height: var(--tap);
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    background: var(--accent); color: #fff;
    border: 0; border-radius: var(--radius);
    font: inherit; font-size: 1.0625rem; font-weight: var(--w-bold); letter-spacing: -0.01em;
    cursor: pointer;
    transition: transform .05s, background .15s;
  }
  .add-btn svg { width: 22px; height: 22px; }
  .add-btn:hover { background: var(--accent-dk); }
  .add-btn:active { transform: translateY(1px); }
  .add-btn:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }
  .credit a:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }

  /* Desktop / tablet: widen the shell and lay links out in a responsive grid
     instead of a single phone-width column. */
  @media (min-width: 760px) {
    .app { max-width: 1080px; }
    .appbar, .addbar { padding-left: 24px; padding-right: 24px; }
    .list {
      display: grid;
      /* rem so cards widen with the text-size setting (roomier at larger sizes);
         min(100%, …) so a column never exceeds the container → no horizontal overflow. */
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
      align-content: start;   /* pack rows at the top so the footer doesn't float mid-list */
      align-items: start;
      gap: 16px;
      padding: 16px 24px calc(var(--tap) + 64px);
    }
    .empty { grid-column: 1 / -1; }
    .empty { max-width: 360px; }
    .empty .ill { width: 92px; height: 92px; border-radius: 26px; }
    .empty .ill :global(svg) { width: 44px; height: 44px; }
    .empty h2 { font-size: 1.375rem; }
    .empty p { font-size: 1rem; }
    .addbar { display: flex; justify-content: center; }  /* center the add button (margin-auto can't center an inline-flex) */
    .add-btn { max-width: 460px; }
  }
  @media (prefers-reduced-motion: reduce) { .add-btn { transition: none; } }
</style>
