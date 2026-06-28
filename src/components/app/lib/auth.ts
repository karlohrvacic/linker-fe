/**
 * Auth module — token storage + sign-in redirects.
 *
 * Tokens live in localStorage (functional, not tracking). Both Google OAuth and
 * the email magic-link land the browser on `/auth/callback?token=…`, which calls
 * `setToken`. All sync is opportunistic: signed-out the app is byte-for-byte the
 * local-first experience.
 */

import { writable } from 'svelte/store';

export const API_BASE: string =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) ?? 'https://ladica-api.hrva.cc';

export const TOKEN_KEY = 'ladica-token';
export const SYNC_CURSOR_KEY = 'ladica-sync-cursor';

function hasToken(): boolean {
  try {
    return !!localStorage.getItem(TOKEN_KEY);
  } catch {
    return false;
  }
}

/**
 * Shared reactive sign-in flag. `setToken`/`clearToken` keep it in sync so every
 * component (AuthButton, SyncStatus, LinkApp) reacts to a sign-out — including an
 * expiry-triggered `signOut()` — without a manual reload.
 */
export const isSignedIn = writable<boolean>(hasToken());

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable — non-fatal */
  }
  isSignedIn.set(hasToken());
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  isSignedIn.set(hasToken());
}

/** Hand the browser off to the backend's Google OAuth start endpoint. */
export function signInGoogle(): void {
  location.href = API_BASE + '/oauth2/authorization/google';
}

/** Ask the backend to email a magic sign-in link. Throws on a non-OK response. */
export async function requestMagicLink(email: string): Promise<void> {
  const res = await fetch(API_BASE + '/api/v1/auth/magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(`magic-link request failed: HTTP ${res.status}`);
}

/** Sign out: drop the token and the sync cursor so a later sign-in re-pulls fresh. */
export function signOut(): void {
  clearToken();
  try {
    localStorage.removeItem(SYNC_CURSOR_KEY);
  } catch {
    /* ignore */
  }
}
