<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { isSignedIn, signOut } from './lib/auth';
  import { getAccount, deleteAccount, AuthError } from './lib/api';
  import { t } from './lib/i18n';
  import type { LinkStore } from './lib/store';

  /** The app's store — so signing out can drop tombstones (no longer needed offline). */
  export let store: LinkStore;

  // The sign-in sheet is rendered at the app root (LinkApp), not here — a
  // position:fixed sheet under the appbar's backdrop-filter ancestor would be
  // clipped to the header. We just ask LinkApp to open it.
  const dispatch = createEventDispatcher<{ signin: void }>();

  let email = '';
  let menuOpen = false;
  let acctEl: HTMLElement;
  /** Two-step delete: first click asks for confirmation, second one deletes. */
  let confirmDelete = false;
  let deleting = false;
  let deleteError = '';

  $: initial = (email.trim()[0] || '').toUpperCase();

  onMount(() => {
    if ($isSignedIn) {
      // Best-effort: label the menu with the account email. A dead token (AuthError)
      // ⇒ sign out so we don't show a logged-in avatar; offline/transient → stay.
      getAccount()
        .then((a) => { email = a.email ?? ''; })
        .catch((e) => { if (e instanceof AuthError) signOut(); /* else offline / transient */ });
    }
    const onDocClick = (e: MouseEvent) => {
      if (menuOpen && acctEl && !acctEl.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  });

  function closeMenu() { menuOpen = false; confirmDelete = false; deleteError = ''; }
  function toggleMenu() { if (menuOpen) closeMenu(); else menuOpen = true; }

  function doSignOut() {
    signOut();
    try { store?.purgeDeleted(); } catch { /* ignore */ }
    location.reload();
  }

  /** Deletes the cloud account only; local links stay on the device. */
  async function doDeleteAccount() {
    if (deleting) return;
    deleting = true;
    deleteError = '';
    try {
      await deleteAccount();
    } catch (e) {
      if (!(e instanceof AuthError)) {
        // Network/server error → let the user retry; the account still exists.
        deleting = false;
        deleteError = get(t)('auth.deleteFailed');
        return;
      }
      // AuthError → token already invalid; the cloud account is unreachable, so
      // fall through to a clean local sign-out.
    }
    signOut();
    try { store?.purgeDeleted(); } catch { /* ignore */ }
    location.reload();
  }
</script>

{#if $isSignedIn}
  <div class="acct" bind:this={acctEl}>
    <button
      class="avatar"
      on:click|stopPropagation={toggleMenu}
      aria-haspopup="true"
      aria-expanded={menuOpen}
      aria-label={$t('auth.account')}
    >
      {#if initial}
        {initial}
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>
      {/if}
    </button>
    {#if menuOpen}
      <div class="menu">
        <p class="menu-email" title={email}>{email || $t('auth.signedIn')}</p>
        <button class="menu-item" on:click={doSignOut}>{$t('auth.signOut')}</button>
        {#if confirmDelete}
          <p class="confirm-q">{$t('auth.deleteConfirm')}</p>
          {#if deleteError}<p class="confirm-err">{deleteError}</p>{/if}
          <div class="confirm-row">
            <button class="confirm-cancel" on:click={() => { confirmDelete = false; deleteError = ''; }} disabled={deleting}>{$t('action.cancel')}</button>
            <button class="confirm-del" on:click={doDeleteAccount} disabled={deleting}>{deleting ? $t('auth.deleting') : $t('auth.delete')}</button>
          </div>
        {:else}
          <button class="menu-item danger" on:click={() => { confirmDelete = true; }}>{$t('auth.deleteAccount')}</button>
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <button class="signin" on:click={() => dispatch('signin')}>{$t('auth.signIn')}</button>
{/if}

<style>
  .acct { position: relative; }

  .signin {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 44px; padding: 0 15px; border-radius: 999px;
    border: 1.5px solid var(--accent); background: var(--surface); color: var(--accent-dk);
    font: inherit; font-size: 0.875rem; font-weight: 700; cursor: pointer;
    transition: background .15s, transform .05s;
  }
  .signin:hover { background: color-mix(in srgb, var(--accent) 8%, var(--surface)); }
  .signin:active { transform: translateY(1px); }

  .avatar {
    width: 44px; height: 44px; border-radius: 999px; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    border: 0; background: var(--accent); color: #fff;
    font: inherit; font-size: 1rem; font-weight: var(--w-bold); cursor: pointer;
    transition: background .15s, transform .05s;
  }
  .avatar svg { width: 19px; height: 19px; }
  .avatar:hover { background: var(--accent-dk); }
  .avatar:active { transform: translateY(1px); }

  .menu {
    position: absolute; top: calc(100% + 8px); right: 0; z-index: 50;
    min-width: 200px; max-width: 260px;
    background: var(--surface);
    border: 1px solid var(--border); border-radius: var(--r-md);
    box-shadow: var(--shadow-md);
    padding: 6px; overflow: hidden;
  }
  .menu-email {
    margin: 0; padding: 8px 10px 10px;
    font-size: 0.8438rem; font-weight: 600; color: var(--muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    border-bottom: 1px solid var(--border);
  }
  .menu-item {
    width: 100%; text-align: left; min-height: 44px; margin-top: 4px;
    padding: 0 10px; border: 0; border-radius: var(--r-sm);
    background: none; color: var(--fg);
    font: inherit; font-size: 0.9375rem; font-weight: var(--w-semibold); cursor: pointer;
  }
  .menu-item:hover { background: color-mix(in srgb, var(--accent) 8%, var(--surface)); }
  .menu-item.danger { color: var(--danger); }
  .menu-item.danger:hover { background: color-mix(in srgb, var(--danger) 10%, var(--surface)); }

  .confirm-q {
    margin: 10px 4px 6px; padding: 0 6px;
    font-size: 0.8125rem; line-height: 1.45; color: var(--fg); font-weight: 600;
  }
  .confirm-err { margin: 0 4px 6px; padding: 0 6px; font-size: 0.7812rem; line-height: 1.4; color: var(--danger); }
  .confirm-row { display: flex; gap: 6px; padding: 2px 4px 4px; }
  .confirm-cancel, .confirm-del {
    flex: 1; min-height: 44px; border-radius: var(--r-sm);
    font: inherit; font-size: 0.875rem; font-weight: 700; cursor: pointer;
  }
  .confirm-cancel { border: 1px solid var(--border); background: var(--surface); color: var(--fg); }
  .confirm-cancel:hover { background: color-mix(in srgb, var(--fg) 5%, var(--surface)); }
  .confirm-del { border: 0; background: var(--danger); color: #fff; }
  .confirm-del:hover { background: color-mix(in srgb, var(--danger) 86%, #000); }
  .confirm-cancel:disabled, .confirm-del:disabled { opacity: .6; cursor: default; }

  .signin:focus-visible, .avatar:focus-visible, .menu-item:focus-visible,
  .confirm-cancel:focus-visible, .confirm-del:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) { .signin, .avatar { transition: none; } }
</style>
