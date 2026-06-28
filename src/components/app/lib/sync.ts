/**
 * Sync engine — reconciles the local-first localStorage copy with the backend.
 *
 * Conflict rule: last-write-wins on `Link.updatedAt`; deletes are tombstones.
 * Identity is the client-generated `Link.id` (== `LinkDto.clientId`); ids are
 * never regenerated. `pullLinks`/`pushLinks` are injected so the engine is
 * testable without the network.
 */

import { writable } from 'svelte/store';
import type { Link, LinkStore } from './store';
import type { LinkDto } from './api';
import { AuthError, NetworkError } from './api';
import { catById } from './categories';
import { normUrl } from './url';
import { getToken, SYNC_CURSOR_KEY } from './auth';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export const syncStatus = writable<SyncState>('idle');

export interface SyncDeps {
  pullLinks: (since: number) => Promise<{ links: LinkDto[]; cursor: number }>;
  pushLinks: (links: LinkDto[]) => Promise<{ cursor: number }>;
}

export function toDto(l: Link): LinkDto {
  return { clientId: l.id, url: l.url, name: l.name, cat: l.cat, updatedAt: l.updatedAt, deleted: !!l.deleted };
}

export function fromDto(d: LinkDto): Link {
  // Unknown/garbage categories fall back to 'other' (catById's fallback) so the
  // UI never renders an undefined category coming off the wire.
  return { id: d.clientId, url: d.url, name: d.name, cat: catById(d.cat).id, updatedAt: d.updatedAt, deleted: d.deleted };
}

/**
 * Drop a single trailing slash, mirroring the backend's `UrlNormalizer`:
 * `"/"`/`""` → `""`, otherwise strip only the last `/` (NOT all of them).
 */
function stripTrailingSlash(path: string): string {
  if (path === '/' || path === '') return '';
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * Cross-device dedupe key — byte-identical to the backend `UrlNormalizer.normalize`
 * (the server is the source of truth for dedupe identity). Mirrors it exactly:
 * lowercase host only, strip scheme + a single leading `www.`, strip ONE trailing
 * slash from the PATH, keep path case and the raw query verbatim (no port, no
 * re-encoding, no sorting). (Not `prettyHost`/`normUrl`, which are display helpers.)
 */
export function dedupeKey(url: string): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return '';
  try {
    // `normUrl` mirrors the backend's `ensureScheme`; the URL parser lowercases the
    // host (the backend lowercases host only), drops the port (backend uses getHost),
    // and preserves path case + the raw query string.
    const u = new URL(normUrl(trimmed));
    const host = u.hostname.replace(/^www\./, '');
    return host + stripTrailingSlash(u.pathname) + u.search;
  } catch {
    return trimmed;
  }
}

function readCursor(): number {
  try {
    return Number(localStorage.getItem(SYNC_CURSOR_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Persist the watermark, never regressing it (overlapping pulls can race). */
function writeCursor(cursor: number): void {
  try {
    localStorage.setItem(SYNC_CURSOR_KEY, String(Math.max(readCursor(), cursor)));
  } catch {
    /* ignore */
  }
}

async function withStatus(run: () => Promise<void>): Promise<void> {
  syncStatus.set('syncing');
  try {
    await run();
    syncStatus.set('synced');
  } catch (e) {
    syncStatus.set(e instanceof NetworkError ? 'offline' : 'error');
    throw e; // let callers react (e.g. sign out on AuthError)
  }
}

/** Pull everything changed since the stored cursor and merge it in (LWW). */
export function pull(store: LinkStore, deps: SyncDeps): Promise<void> {
  return withStatus(async () => {
    const since = readCursor();
    const { links, cursor } = await deps.pullLinks(since);
    store.applyRemote(links.map(fromDto));
    writeCursor(cursor);
  });
}

/**
 * Push the full local set (including tombstones).
 *
 * DELIBERATELY does NOT touch the sync cursor: `POST /api/v1/links` returns the
 * user's current global-max `serverSeq`, which can jump past a concurrent device's
 * change. Advancing the watermark from it would make this client skip that change
 * forever (data loss). The cursor advances ONLY from `pull` responses — callers
 * must follow every push with a pull.
 */
export function push(store: LinkStore, deps: SyncDeps): Promise<void> {
  return withStatus(async () => {
    await deps.pushLinks(store.allIncludingDeleted().map(toDto));
  });
}

/**
 * One-time merge when an account is first attached on this device. Flow is
 * pull → dedupe → push → **pull**: pull the cloud set, dedupe local vs cloud by
 * `dedupeKey` (newest `updatedAt` survives, the loser becomes a tombstone so the
 * duplicate propagates as deleted), push the reconciled set, then pull once more.
 * Only `pull` advances the cursor (see `push`), so the FINAL pull sets the
 * authoritative watermark — picking up anything a concurrent device wrote.
 */
export function firstSignInMerge(store: LinkStore, deps: SyncDeps): Promise<void> {
  return withStatus(async () => {
    const { links: cloudDtos, cursor } = await deps.pullLinks(readCursor());
    store.applyRemote(cloudDtos.map(fromDto));
    writeCursor(cursor);

    // Group alive links by normalized url; collisions keep the newest clientId.
    const byKey = new Map<string, Link[]>();
    for (const l of store.allIncludingDeleted()) {
      if (l.deleted) continue;
      const key = dedupeKey(l.url);
      const group = byKey.get(key);
      if (group) group.push(l);
      else byKey.set(key, [l]);
    }

    const tombstones: Link[] = [];
    for (const group of byKey.values()) {
      if (group.length <= 1) continue;
      let winner = group[0];
      for (const l of group) if (l.updatedAt > winner.updatedAt) winner = l;
      for (const l of group) {
        if (l.id === winner.id) continue;
        tombstones.push({ ...l, deleted: true, updatedAt: Math.max(winner.updatedAt, l.updatedAt) + 1 });
      }
    }
    if (tombstones.length) store.applyRemote(tombstones);

    await deps.pushLinks(store.allIncludingDeleted().map(toDto));

    // Final pull sets the cursor (push responses must never advance it).
    const { links: finalDtos, cursor: finalCursor } = await deps.pullLinks(readCursor());
    store.applyRemote(finalDtos.map(fromDto));
    writeCursor(finalCursor);
  });
}

/**
 * Debounced background sync. Returns `triggerPush()` for store mutations to call;
 * it no-ops while signed out and coalesces rapid edits into one round trip.
 *
 * The debounced action is push-then-pull (the pull is what advances the cursor;
 * see `push`). An `AuthError` (expired token) is routed to `onAuthError` so the
 * caller can sign out + notify — exactly like the foreground pull path; it must
 * not be swallowed. Returns `dispose()` to clear the pending timer on teardown.
 */
export function scheduleSync(
  store: LinkStore,
  deps: SyncDeps,
  onAuthError?: () => void,
  delayMs = 1000,
): { triggerPush: () => void; dispose: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  function triggerPush(): void {
    if (!getToken()) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void (async () => {
        try {
          await push(store, deps);
          await pull(store, deps);
        } catch (e) {
          // AuthError ⇒ expired token: route it to the shared sign-out handler.
          // Anything else is already reflected in syncStatus — retry on next edit.
          if (e instanceof AuthError) onAuthError?.();
        }
      })();
    }, delayMs);
  }
  function dispose(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  return { triggerPush, dispose };
}
