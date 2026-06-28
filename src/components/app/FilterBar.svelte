<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { CATS } from './lib/categories';
  import { t } from './lib/i18n';

  export let counts: Record<string, number> = {};
  export let active = 'all';

  const dispatch = createEventDispatcher<{ select: string }>();

  $: chips = [
    { id: 'all', label: $t('filter.all'), color: 'var(--accent)', dot: null as string | null },
    ...CATS.map((c) => ({ id: c.id, label: $t(c.labelKey), color: c.color, dot: c.color as string | null })),
  ];
</script>

<div class="filters" role="group" aria-label={$t('filter.groupAria')}>
  {#each chips as c (c.id)}
    <button
      class="chip"
      aria-pressed={active === c.id}
      style="--c:{c.color}"
      on:click={() => dispatch('select', c.id)}
    >
      {#if c.dot}<span class="dot" style="background:{c.dot}"></span>{/if}
      {c.label}<span class="cnt">{counts[c.id] ?? 0}</span>
    </button>
  {/each}
</div>

<style>
  .filters {
    display: flex; gap: 8px;
    padding: 14px 18px 6px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .filters::-webkit-scrollbar { display: none; }
  /* Match the 24px appbar/grid gutter on desktop so the chips line up. On desktop
     there's vertical room, so wrap the chips instead of hiding them in a scroll
     row — at large text sizes nothing ends up off-screen on the right. */
  @media (min-width: 760px) {
    .filters { padding-left: 24px; padding-right: 24px; flex-wrap: wrap; overflow-x: visible; }
  }
  .chip {
    flex: none;
    display: inline-flex; align-items: center; gap: 7px;
    min-height: 42px;
    padding: 0 15px;
    border-radius: 999px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    color: var(--fg);
    font: inherit; font-size: 0.9375rem; font-weight: 600;
    cursor: pointer;
    transition: border-color .15s, background .15s, color .15s;
  }
  .chip .dot { width: 9px; height: 9px; border-radius: 999px; flex: none; }
  .chip .cnt { color: var(--muted); font-weight: 600; font-variant-numeric: tabular-nums; }
  .chip[aria-pressed="true"] {
    border-color: var(--c, var(--accent));
    background: color-mix(in srgb, var(--c, var(--accent)) 12%, var(--surface));
    color: color-mix(in srgb, var(--c, var(--accent)) 72%, var(--fg));
  }
  .chip[aria-pressed="true"] .cnt { color: inherit; }
  .chip:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .chip { transition: none; } }
</style>
