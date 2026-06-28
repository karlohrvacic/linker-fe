<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { locale, t, type Locale } from './lib/i18n';
  import { theme, fontScale } from './lib/appearance';

  export let open = false;

  const dispatch = createEventDispatcher<{
    close: void;
    export: void;
    import: File;
  }>();

  let sheetEl: HTMLElement;
  let fileInput: HTMLInputElement;

  // Move focus into the sheet on open so the section's Esc/Tab handlers fire
  // (the gear that opened it is blurred when `.app` becomes inert) and a11y is correct.
  let prevOpen = false;
  $: if (open !== prevOpen) {
    prevOpen = open;
    if (open) handleOpen();
  }

  async function handleOpen() {
    await tick();
    setTimeout(() => sheetEl?.querySelector<HTMLElement>('button')?.focus(), 60);
  }

  function close() { dispatch('close'); }

  function pickLang(l: Locale) { locale.set(l); }

  function onFile(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) { dispatch('import', file); close(); }
    input.value = '';
  }

  function onSheetKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const f = [...sheetEl.querySelectorAll<HTMLElement>('button, input, a[href], [tabindex]:not([tabindex="-1"])')]
      .filter((el) => !(el as HTMLButtonElement).disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="scrim" class:open on:click={close} role="presentation"></div>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<section
  class="sheet"
  class:open
  role="dialog"
  aria-modal="true"
  aria-label={$t('settings.title')}
  inert={!open}
  bind:this={sheetEl}
  on:keydown={onSheetKeydown}
>
  <div class="grip"></div>
  <h2>{$t('settings.title')}</h2>

  <span class="field-label">{$t('settings.theme')}</span>
  <div class="segmented three" role="group" aria-label={$t('settings.theme')}>
    <button class="seg" aria-pressed={$theme === 'system'} on:click={() => theme.set('system')}>{$t('settings.themeSystem')}</button>
    <button class="seg" aria-pressed={$theme === 'light'} on:click={() => theme.set('light')}>{$t('settings.themeLight')}</button>
    <button class="seg" aria-pressed={$theme === 'dark'} on:click={() => theme.set('dark')}>{$t('settings.themeDark')}</button>
  </div>

  <span class="field-label">{$t('settings.textSize')}</span>
  <div class="segmented three" role="group" aria-label={$t('settings.textSize')}>
    <button class="seg size-s" aria-pressed={$fontScale === 'normal'} on:click={() => fontScale.set('normal')}>{$t('settings.textNormal')}</button>
    <button class="seg size-m" aria-pressed={$fontScale === 'large'} on:click={() => fontScale.set('large')}>{$t('settings.textLarge')}</button>
    <button class="seg size-l" aria-pressed={$fontScale === 'larger'} on:click={() => fontScale.set('larger')}>{$t('settings.textLarger')}</button>
  </div>

  <span class="field-label">{$t('settings.language')}</span>
  <div class="segmented" role="group" aria-label={$t('settings.language')}>
    <button
      class="seg"
      aria-pressed={$locale === 'hr'}
      on:click={() => pickLang('hr')}
    >{$t('settings.langHr')}</button>
    <button
      class="seg"
      aria-pressed={$locale === 'en'}
      on:click={() => pickLang('en')}
    >{$t('settings.langEn')}</button>
  </div>

  <div class="backup">
    <span class="field-label">{$t('settings.backup')}</span>
    <div class="backup-btns">
      <button class="backup-btn" on:click={() => { dispatch('export'); close(); }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 19h14"/></svg>
        {$t('settings.export')}
      </button>
      <button class="backup-btn" on:click={() => fileInput.click()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 19h14"/></svg>
        {$t('settings.import')}
      </button>
    </div>
    <input type="file" accept="application/json,.json" bind:this={fileInput} on:change={onFile} hidden />
  </div>

  <nav class="pages" aria-label={$t('settings.pages')}>
    <span class="field-label">{$t('settings.pages')}</span>
    <a class="page-link" href={$locale === 'en' ? '/en/?home' : '/?home'}>
      <svg class="page-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
      {$t('settings.home')}
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
    </a>
    <a class="page-link" href={$locale === 'en' ? '/en/landing' : '/landing'}>
      <svg class="page-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>
      {$t('settings.howItWorks')}
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
    </a>
  </nav>

  <div class="sheet-actions">
    <button class="btn-cancel" on:click={close}>{$t('action.close')}</button>
  </div>
</section>

<style>
  .scrim {
    position: fixed; inset: 0; z-index: 40;
    background: rgba(18,28,22,.42);
    opacity: 0; pointer-events: none;
    transition: opacity .22s;
  }
  .scrim.open { opacity: 1; pointer-events: auto; }
  .sheet {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 41;
    max-width: 460px; margin-inline: auto;
    background: var(--surface);
    border-radius: var(--r-sheet) var(--r-sheet) 0 0;
    padding: 8px 20px 20px;
    padding-bottom: max(20px, env(safe-area-inset-bottom));
    transform: translateY(110%);
    transition: transform .26s cubic-bezier(.22,.61,.36,1);
    box-shadow: var(--shadow-sheet);
    max-height: 92dvh; overflow-y: auto;
  }
  .sheet.open { transform: translateY(0); }
  .grip { width: 42px; height: 5px; border-radius: 999px; background: var(--border); margin: 0 auto 14px; }
  .sheet h2 { margin: 0 0 14px; font-size: 1.3125rem; font-weight: var(--w-bold); letter-spacing: -0.01em; }

  .field-label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--muted); margin-bottom: 8px; }

  .segmented {
    display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
    padding: 4px;
    background: color-mix(in srgb, var(--fg) 5%, var(--surface));
    border: 1.5px solid var(--border); border-radius: var(--radius);
    margin-bottom: 18px;
  }
  .seg {
    min-height: var(--tap-sm);
    display: inline-flex; align-items: center; justify-content: center;
    border: 0; border-radius: var(--r-sm); background: none;
    color: var(--fg); font: inherit; font-size: 0.9375rem; font-weight: var(--w-semibold); cursor: pointer;
    transition: background .15s, color .15s;
  }
  .seg[aria-pressed="true"] {
    background: var(--surface);
    color: var(--accent-dk);
    box-shadow: 0 1px 2px rgba(20,40,30,.12);
  }
  .segmented.three { grid-template-columns: repeat(3, 1fr); }
  /* Preview the effect: each text-size option renders at a representative size. */
  .size-s { font-size: 0.875rem; }
  .size-m { font-size: 1rem; }
  .size-l { font-size: 1.1875rem; }

  .backup { margin-top: 4px; padding-top: 16px; border-top: 1px solid var(--border); }
  .backup-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .backup-btn {
    min-height: var(--tap-sm);
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border: 1.5px solid var(--border); border-radius: var(--radius);
    background: var(--surface); color: var(--fg);
    font: inherit; font-size: 0.9375rem; font-weight: 600; cursor: pointer;
  }
  .backup-btn svg { width: 17px; height: 17px; color: var(--muted); }
  .backup-btn:hover { border-color: color-mix(in srgb, var(--accent) 40%, var(--border)); color: var(--accent-dk); }

  .pages { margin-top: 4px; padding-top: 16px; border-top: 1px solid var(--border); }
  .page-link {
    display: flex; align-items: center; gap: 10px;
    min-height: var(--tap-sm); padding: 0 12px; margin-top: 6px;
    border: 1.5px solid var(--border); border-radius: var(--radius);
    background: var(--surface); color: var(--fg);
    font-size: 0.9375rem; font-weight: 600; text-decoration: none;
  }
  .page-link:hover { border-color: color-mix(in srgb, var(--accent) 40%, var(--border)); color: var(--accent-dk); }
  .page-ic { width: 18px; height: 18px; color: var(--muted); flex: none; }
  .page-link .chev { width: 17px; height: 17px; margin-left: auto; color: var(--muted); flex: none; }
  .page-link:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }

  .sheet-actions { margin-top: 18px; display: grid; grid-template-columns: 1fr; gap: 10px; }
  .btn-cancel {
    min-height: var(--tap); background: var(--surface); color: var(--fg);
    border: 1.5px solid var(--border); border-radius: var(--radius);
    font: inherit; font-size: 1.0625rem; font-weight: var(--w-semibold); cursor: pointer;
  }

  .seg:focus-visible, .backup-btn:focus-visible, .btn-cancel:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) { .sheet, .scrim, .seg { transition: none; } }
</style>
