<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { signInGoogle, requestMagicLink } from './lib/auth';
  import { t } from './lib/i18n';

  export let open = false;

  const dispatch = createEventDispatcher<{ close: void }>();

  let emailValue = '';
  let hint = '';
  let sent = false;
  let sending = false;

  let emailInput: HTMLInputElement;
  let sheetEl: HTMLElement;

  let prevOpen = false;
  $: if (open !== prevOpen) {
    prevOpen = open;
    if (open) handleOpen();
  }

  async function handleOpen() {
    emailValue = '';
    hint = '';
    sent = false;
    sending = false;
    await tick();
    setTimeout(() => emailInput?.focus(), 260);
  }

  function close() { dispatch('close'); }

  function google() { signInGoogle(); }

  async function sendLink() {
    const email = emailValue.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      hint = get(t)('signin.invalidEmail');
      emailInput?.focus();
      return;
    }
    sending = true;
    hint = '';
    try {
      await requestMagicLink(email);
      sent = true;
    } catch {
      hint = get(t)('signin.sendFailed');
    } finally {
      sending = false;
    }
  }

  function onFieldKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); sendLink(); }
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
  aria-label={$t('signin.title')}
  inert={!open}
  bind:this={sheetEl}
  on:keydown={onSheetKeydown}
>
  <div class="grip"></div>

  {#if sent}
    <h2>{$t('signin.checkEmail')}</h2>
    <div class="done">
      <span class="done-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16v12H4z" opacity=".0"/><path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
      </span>
      <p>{$t('signin.checkEmailBody')}</p>
    </div>
    <div class="sheet-actions one">
      <button class="btn-save" on:click={close}>{$t('action.ok')}</button>
    </div>
  {:else}
    <h2>{$t('signin.title')}</h2>
    <p class="intro">{$t('signin.intro')}</p>

    <button class="google-btn" on:click={google}>
      <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
      </svg>
      {$t('signin.google')}
    </button>

    <div class="or"><span>{$t('signin.or')}</span></div>

    <div class="field">
      <label for="emailInput">{$t('signin.emailLabel')}</label>
      <input id="emailInput" type="email" inputmode="email" autocomplete="email" placeholder={$t('signin.emailPlaceholder')}
        bind:value={emailValue} bind:this={emailInput} on:keydown={onFieldKeydown} />
    </div>

    <p class="hint">{hint}</p>

    <div class="sheet-actions">
      <button class="btn-cancel" on:click={close}>{$t('action.cancel')}</button>
      <button class="btn-save" on:click={sendLink} disabled={sending}>
        {sending ? $t('signin.sending') : $t('signin.send')}
      </button>
    </div>
  {/if}
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
  .intro { margin: -6px 0 16px; color: var(--muted); font-size: 0.9062rem; line-height: 1.5; }

  .google-btn {
    width: 100%; min-height: var(--tap);
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    border: 1.5px solid var(--border); border-radius: var(--radius);
    background: var(--surface); color: var(--fg);
    font: inherit; font-size: 1rem; font-weight: var(--w-semibold); cursor: pointer;
  }
  .google-btn:hover { background: color-mix(in srgb, var(--accent) 6%, var(--surface)); }
  .google-btn:active { transform: translateY(1px); }

  .or {
    display: flex; align-items: center; gap: 12px;
    color: var(--muted); font-size: 0.8125rem; font-weight: 600;
    margin: 16px 0;
  }
  .or::before, .or::after { content: ""; flex: 1; height: 1px; background: var(--border); }

  .field { margin-bottom: 8px; }
  .field label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
  .field input {
    width: 100%; min-height: var(--tap);
    padding: 0 15px;
    border: 1.5px solid var(--border); border-radius: var(--radius);
    background: var(--surface); color: var(--fg);
    font: inherit; font-size: 1rem;
  }
  .field input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }

  .hint { color: var(--danger); font-size: 0.875rem; font-weight: 600; min-height: 20px; margin: 4px 0 10px; }

  .sheet-actions { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; }
  .sheet-actions.one { grid-template-columns: 1fr; }
  .btn-save {
    min-height: var(--tap); background: var(--accent); color: #fff;
    border: 0; border-radius: var(--radius); font: inherit; font-size: 1.0625rem; font-weight: var(--w-bold); cursor: pointer;
  }
  .btn-save:hover { background: var(--accent-dk); }
  .btn-save:disabled { opacity: .6; cursor: default; }
  .btn-cancel {
    min-height: var(--tap); background: var(--surface); color: var(--fg);
    border: 1.5px solid var(--border); border-radius: var(--radius);
    font: inherit; font-size: 1.0625rem; font-weight: var(--w-semibold); cursor: pointer;
  }

  .done { display: flex; align-items: center; gap: 14px; margin: 6px 0 18px; }
  .done-mark {
    width: 46px; height: 46px; flex: none; border-radius: var(--r-md);
    display: grid; place-items: center;
    background: color-mix(in srgb, var(--accent) 12%, var(--surface));
    color: var(--accent);
  }
  .done-mark svg { width: 24px; height: 24px; }
  .done p { margin: 0; font-size: 0.9688rem; line-height: 1.5; color: var(--fg); }

  .google-btn:focus-visible, .btn-save:focus-visible, .btn-cancel:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) { .sheet, .scrim { transition: none; } }
</style>
