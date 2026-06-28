<script lang="ts">
  // Toast with an optional action button. Used for transient messages, the
  // delete+undo flow, and the "new version" update prompt.
  let visible = false;
  let text = '';
  let actionLabel: string | null = null;
  let action: (() => void) | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  export function show(
    msg: string,
    opts: { actionLabel?: string; action?: () => void; duration?: number } = {},
  ) {
    text = msg;
    actionLabel = opts.actionLabel ?? null;
    action = opts.action ?? null;
    visible = true;
    if (timer) clearTimeout(timer);
    const duration = opts.duration ?? (actionLabel ? 6000 : 2400);
    if (duration > 0) timer = setTimeout(() => { visible = false; }, duration);
  }

  export function hide() {
    visible = false;
    if (timer) clearTimeout(timer);
  }

  function onClick() {
    const a = action;
    hide();
    a?.();
  }
</script>

<div class="snackbar" class:show={visible} role="status" aria-live="polite">
  <span>{text}</span>
  {#if actionLabel}<button on:click={onClick}>{actionLabel}</button>{/if}
</div>

<style>
  .snackbar {
    position: fixed; left: 50%; bottom: calc(84px + env(safe-area-inset-bottom)); z-index: 50;
    translate: -50% 0;
    width: min(420px, calc(100% - 32px));
    background: #20302a; color: #fff;
    border-radius: var(--r-md);
    padding: 13px 16px;
    display: none; align-items: center; justify-content: space-between; gap: 12px;
    font-size: 0.9375rem; box-shadow: 0 8px 30px rgba(20,40,30,.3);
  }
  .snackbar.show { display: flex; animation: snackIn .22s ease; }
  @keyframes snackIn { from { opacity: 0; transform: translateY(10px); translate: -50% 10px; } }
  .snackbar button {
    color: #7ee2a8; font-weight: var(--w-bold); font-size: 0.9375rem;
    padding: 6px 6px; white-space: nowrap;
    border: 0; background: none; cursor: pointer; font: inherit;
  }
  .snackbar button:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .snackbar.show { animation: none; } }
</style>
