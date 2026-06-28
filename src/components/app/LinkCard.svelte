<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { catById, ICON } from './lib/categories';
  import { prettyHost } from './lib/url';
  import { t } from './lib/i18n';
  import type { Link } from './lib/store';

  export let link: Link;

  const dispatch = createEventDispatcher<{
    open: void; copy: void; share: void; qr: void; delete: void;
  }>();

  $: cat = catById(link.cat);
  $: title = link.name && link.name.trim() ? link.name.trim() : prettyHost(link.url);
</script>

<article class="card" style="--c:{cat.color}">
  <span class="catline">{@html cat.icon}{$t(cat.labelKey)}</span>
  <h2 class="title">{title}</h2>
  <div class="url">{prettyHost(link.url)}</div>

  <button class="open-btn" on:click={() => dispatch('open')} aria-label={$t('card.openAria', { name: title })}>
    {@html ICON.open}{$t('card.open')}
  </button>

  <div class="subactions">
    <button class="sub" on:click={() => dispatch('copy')} aria-label={$t('card.copyAria', { name: title })}>{@html ICON.copy}{$t('card.copy')}</button>
    <button class="sub" on:click={() => dispatch('share')} aria-label={$t('card.shareAria', { name: title })}>{@html ICON.share}{$t('card.share')}</button>
    <button class="sub" on:click={() => dispatch('qr')} aria-label={$t('card.qrAria', { name: title })}>{@html ICON.qr}{$t('card.qr')}</button>
    <button class="sub danger" on:click={() => dispatch('delete')} aria-label={$t('card.deleteAria', { name: title })}>{@html ICON.trash}{$t('card.delete')}</button>
  </div>
</article>

<style>
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: 16px 16px 14px;
  }
  .catline {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 0.8125rem; font-weight: 700; letter-spacing: .01em;
    color: color-mix(in srgb, var(--c, var(--cat-other)) 70%, var(--fg));
    margin-bottom: 8px;
  }
  .catline :global(svg) { width: 15px; height: 15px; }
  .title {
    margin: 0;
    font-size: 1.125rem; font-weight: 700; letter-spacing: -0.01em;
    line-height: 1.25;
    word-break: break-word;
  }
  .url {
    margin-top: 3px;
    color: var(--muted); font-size: 0.875rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .open-btn {
    margin-top: 13px; width: 100%;
    min-height: var(--tap);
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    background: var(--accent); color: #fff;
    border: 0; border-radius: var(--radius);
    font: inherit; font-size: 1.0625rem; font-weight: var(--w-bold); letter-spacing: -0.01em;
    cursor: pointer;
    transition: transform .05s, background .15s;
  }
  .open-btn :global(svg) { width: 19px; height: 19px; }
  .open-btn:hover { background: var(--accent-dk); }
  .open-btn:active { transform: translateY(1px); }

  .subactions {
    margin-top: 8px;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
  }
  .sub {
    min-height: 44px;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    border: 0; border-radius: var(--r-sm); background: none;
    color: var(--muted); font: inherit; font-size: 0.8438rem; font-weight: 600;
    cursor: pointer;
    transition: background .15s, color .15s;
  }
  .sub :global(svg) { width: 17px; height: 17px; flex: none; }
  .sub:hover { background: color-mix(in srgb, var(--fg) 5%, transparent); color: var(--fg); }
  .sub.danger:hover { background: color-mix(in srgb, var(--danger) 12%, transparent); color: var(--danger); }
  .sub:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }
  .sub.danger:focus-visible { outline-color: color-mix(in srgb, var(--danger) 60%, transparent); }
  .open-btn:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .open-btn, .sub { transition: none; } }
</style>
