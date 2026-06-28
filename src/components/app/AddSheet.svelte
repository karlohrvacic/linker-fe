<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { CATS, type CatId } from './lib/categories';
  import { normUrl } from './lib/url';
  import { t } from './lib/i18n';

  export let open = false;
  export let defaultCat: CatId = 'cook';
  // Optional prefill (used by the Web Share Target flow).
  export let initialUrl = '';
  export let initialName = '';

  const dispatch = createEventDispatcher<{
    save: { url: string; name: string; cat: CatId };
    close: void;
  }>();

  let urlValue = '';
  let nameValue = '';
  let pickedCat: CatId = 'cook';
  let hint = '';
  let hintColor = 'var(--danger)';

  let urlInput: HTMLInputElement;
  let sheetEl: HTMLElement;

  let prevOpen = false;
  $: if (open !== prevOpen) {
    prevOpen = open;
    if (open) handleOpen();
  }

  async function handleOpen() {
    urlValue = initialUrl;
    nameValue = initialName;
    hint = '';
    pickedCat = defaultCat;
    await tick();
    setTimeout(() => urlInput?.focus(), 260);
  }

  function notice(msg: string) {
    hintColor = 'var(--danger)';
    hint = msg;
  }

  function close() { dispatch('close'); }

  function save() {
    const url = normUrl(urlValue);
    if (!url || !/\./.test(url.replace(/^https?:\/\//, ''))) {
      notice(get(t)('add.invalidUrl'));
      urlInput?.focus();
      return;
    }
    dispatch('save', { url, name: nameValue, cat: pickedCat });
  }

  async function paste() {
    hint = '';
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        urlValue = text.trim();
        hintColor = 'var(--accent)';
        const pasted = get(t)('add.pasted');
        hint = pasted;
        setTimeout(() => { if (hint === pasted) { hint = ''; hintColor = 'var(--danger)'; } }, 1800);
      } else {
        notice(get(t)('add.clipboardEmpty'));
      }
    } catch {
      notice(get(t)('add.clipboardFail'));
      urlInput?.focus();
    }
  }

  function onFieldKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
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
  aria-label={$t('add.sheetAria')}
  inert={!open}
  bind:this={sheetEl}
  on:keydown={onSheetKeydown}
>
  <div class="grip"></div>
  <h2>{$t('add.heading')}</h2>

  <button class="paste-btn" on:click={paste}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="4" rx="1.2"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg>
    {$t('add.paste')}
  </button>

  <div class="field">
    <label for="urlInput">{$t('add.urlLabel')}</label>
    <input id="urlInput" type="url" inputmode="url" autocomplete="off" placeholder="https://..."
      bind:value={urlValue} bind:this={urlInput} on:keydown={onFieldKeydown} />
  </div>
  <div class="field">
    <label for="nameInput">{$t('add.nameLabel')}</label>
    <input id="nameInput" type="text" autocomplete="off" placeholder={$t('add.namePlaceholder')}
      bind:value={nameValue} on:keydown={onFieldKeydown} />
  </div>

  <span class="field-label">{$t('add.category')}</span>
  <div class="catpick">
    {#each CATS as c (c.id)}
      <button aria-pressed={pickedCat === c.id} style="--c:{c.color}" on:click={() => (pickedCat = c.id)}>
        {@html c.icon}{$t(c.labelKey)}
      </button>
    {/each}
  </div>

  <p class="hint" style="color:{hintColor}">{hint}</p>

  <div class="sheet-actions">
    <button class="btn-cancel" on:click={close}>{$t('action.cancel')}</button>
    <button class="btn-save" on:click={save}>{$t('add.save')}</button>
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

  .paste-btn {
    width: 100%; min-height: var(--tap);
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    border: 1.5px dashed color-mix(in srgb, var(--accent) 55%, var(--border));
    background: color-mix(in srgb, var(--accent) 7%, var(--surface));
    color: var(--accent-dk);
    border-radius: var(--radius);
    font: inherit; font-size: 1rem; font-weight: 700;
    margin-bottom: 14px; cursor: pointer;
  }
  .paste-btn svg { width: 19px; height: 19px; }
  .paste-btn:hover { background: color-mix(in srgb, var(--accent) 13%, var(--surface)); }
  .paste-btn:active { transform: translateY(1px); }

  .field { margin-bottom: 13px; }
  .field label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
  .field input {
    width: 100%; min-height: var(--tap);
    padding: 0 15px;
    border: 1.5px solid var(--border); border-radius: var(--radius);
    background: var(--surface); color: var(--fg);
    font: inherit; font-size: 1rem;
  }
  .field input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }

  .field-label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--muted); margin-bottom: 8px; }

  .catpick { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
  .catpick button {
    flex: 1 1 auto; min-width: calc(50% - 4px); min-height: var(--tap-sm);
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border: 1.5px solid var(--border); border-radius: var(--radius);
    background: var(--surface); color: var(--fg);
    font: inherit; font-size: 0.9375rem; font-weight: var(--w-semibold); cursor: pointer;
  }
  .catpick button :global(svg) { width: 17px; height: 17px; color: var(--c); }
  .catpick button[aria-pressed="true"] {
    border-color: var(--c); background: color-mix(in srgb, var(--c) 12%, var(--surface));
    color: color-mix(in srgb, var(--c) 70%, var(--fg));
  }

  .hint { font-size: 0.875rem; font-weight: 600; min-height: 20px; margin: -4px 0 10px; }

  .sheet-actions { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; }
  .btn-save {
    min-height: var(--tap); background: var(--accent); color: #fff;
    border: 0; border-radius: var(--radius); font: inherit; font-size: 1.0625rem; font-weight: var(--w-bold); cursor: pointer;
  }
  .btn-save:hover { background: var(--accent-dk); }
  .btn-cancel {
    min-height: var(--tap); background: var(--surface); color: var(--fg);
    border: 1.5px solid var(--border); border-radius: var(--radius);
    font: inherit; font-size: 1.0625rem; font-weight: var(--w-semibold); cursor: pointer;
  }

  .paste-btn:focus-visible, .btn-save:focus-visible, .btn-cancel:focus-visible,
  .catpick button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) { .sheet, .scrim { transition: none; } }
</style>
