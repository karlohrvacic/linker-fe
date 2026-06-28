<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import QRCode from 'qrcode';
  import { prettyHost } from './lib/url';
  import { t } from './lib/i18n';

  // When `url` is a string the dialog is open; null = closed.
  export let url: string | null = null;

  const dispatch = createEventDispatcher<{ close: void }>();

  let dataUrl = '';
  let dialogEl: HTMLElement;

  $: if (url) {
    dataUrl = ''; // clear the previous link's QR so it can't flash before the new one renders
    QRCode.toDataURL(url, { width: 256, margin: 1, color: { dark: '#1c2320', light: '#ffffff' } })
      .then((d) => { dataUrl = d; })
      .catch(() => { dataUrl = ''; });
    focusSoon();
  }

  async function focusSoon() {
    await tick();
    dialogEl?.querySelector<HTMLElement>('button')?.focus();
  }

  function close() { dispatch('close'); }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const f = [...dialogEl.querySelectorAll<HTMLElement>('button, a[href]')].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="scrim" class:open={!!url} on:click={close} role="presentation"></div>

{#if url}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="qrbox"
    role="dialog"
    aria-modal="true"
    aria-label={$t('qr.dialogAria')}
    bind:this={dialogEl}
    on:keydown={onKeydown}
  >
    <h2>{$t('qr.heading')}</h2>
    <p class="sub">{$t('qr.sub')}</p>
    <div class="qrimg">
      {#if dataUrl}<img src={dataUrl} alt={$t('qr.imgAlt', { host: prettyHost(url) })} width="256" height="256" />{/if}
    </div>
    <p class="host">{prettyHost(url)}</p>
    <button class="close" on:click={close}>{$t('action.close')}</button>
  </div>
{/if}

<style>
  .scrim {
    position: fixed; inset: 0; z-index: 40;
    background: rgba(18,28,22,.42);
    opacity: 0; pointer-events: none;
    transition: opacity .22s;
  }
  .scrim.open { opacity: 1; pointer-events: auto; }
  .qrbox {
    position: fixed; left: 50%; top: 50%; z-index: 41;
    transform: translate(-50%, -50%);
    width: min(340px, calc(100% - 40px));
    background: var(--surface);
    border-radius: var(--r-sheet);
    padding: 22px 22px 20px;
    text-align: center;
    box-shadow: var(--shadow-lg);
  }
  .qrbox h2 { margin: 0; font-size: 1.3125rem; font-weight: var(--w-bold); letter-spacing: -0.01em; }
  .qrbox .sub { margin: 6px 0 16px; color: var(--muted); font-size: 0.875rem; }
  .qrimg {
    width: 256px; max-width: 100%; aspect-ratio: 1; margin: 0 auto;
    display: grid; place-items: center;
    background: #fff; border: 1px solid var(--border); border-radius: var(--r-md);
  }
  .qrimg img { width: 100%; height: auto; border-radius: 8px; }
  .host { margin: 14px 0 16px; color: var(--accent-dk); font-weight: 700; font-size: 0.875rem; word-break: break-all; }
  .close {
    width: 100%; min-height: var(--tap);
    background: var(--accent); color: #fff;
    border: 0; border-radius: var(--radius);
    font: inherit; font-size: 1.0625rem; font-weight: var(--w-bold); cursor: pointer;
  }
  .close:hover { background: var(--accent-dk); }
  .close:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .scrim { transition: none; } }
</style>
