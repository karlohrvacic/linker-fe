import { writable, get, type Writable } from 'svelte/store';
import type { StorageAdapter } from './storage';
import { KEY, LEGACY_KEY } from './storage';
import { normUrl } from './url';
import type { CatId } from './categories';

export interface Link {
  id: string;
  name: string;
  url: string;
  cat: CatId;
  /** Epoch-ms of the last change — drives last-write-wins reconciliation. */
  updatedAt: number;
  /** Soft-delete tombstone: kept in the array so the delete can propagate on sync. */
  deleted?: boolean;
}

let uidCounter = 0;
function makeUid(): string {
  uidCounter += 1;
  return 'l' + uidCounter.toString(36) + Math.floor(performance.now()).toString(36);
}

function now(): number {
  return Date.now();
}

/** Backfill sync fields on links loaded from older (pre-sync) storage. */
function normalize(arr: Link[]): Link[] {
  return arr.map((l) => ({
    ...l,
    updatedAt: typeof l.updatedAt === 'number' ? l.updatedAt : 0,
    deleted: !!l.deleted,
  }));
}

export interface LinkStore {
  links: Writable<Link[]>;
  add: (input: { url: string; name?: string; cat: CatId }) => Link;
  remove: (id: string) => { item: Link; index: number } | null;
  restore: (item: Link, index: number) => void;
  replaceAll: (next: Link[]) => void;
  /** Last-write-wins upsert (by id) of remote links; persists. */
  applyRemote: (remote: Link[]) => void;
  /** Raw array including tombstones — what sync uploads. */
  allIncludingDeleted: () => Link[];
  /** Drop tombstones for good (used when signed out). */
  purgeDeleted: () => void;
}

export function createLinkStore(adapter: StorageAdapter): LinkStore {
  // One-time migration from the pre-rename Croatian storage key.
  if (adapter.get<Link[]>(KEY) === null) {
    const legacy = adapter.get<Link[]>(LEGACY_KEY);
    if (legacy) adapter.set(KEY, legacy);
  }
  // The app starts empty — users add their own links.
  const links: Writable<Link[]> = writable(normalize(adapter.get<Link[]>(KEY) ?? []));

  const persist = (arr: Link[]) => adapter.set(KEY, arr);

  function add(input: { url: string; name?: string; cat: CatId }): Link {
    const link: Link = {
      id: makeUid(),
      name: input.name ?? '',
      url: normUrl(input.url),
      cat: input.cat,
      updatedAt: now(),
      deleted: false,
    };
    links.update((arr) => {
      const next = [link, ...arr];
      persist(next);
      return next;
    });
    return link;
  }

  function remove(id: string): { item: Link; index: number } | null {
    const arr = get(links);
    const index = arr.findIndex((l) => l.id === id);
    if (index < 0) return null;
    const item: Link = { ...arr[index], deleted: true, updatedAt: now() };
    const next = arr.slice();
    next[index] = item;
    links.set(next);
    persist(next);
    return { item, index };
  }

  function restore(item: Link, index: number) {
    links.update((arr) => {
      const i = arr.findIndex((l) => l.id === item.id);
      const next = arr.slice();
      if (i >= 0) {
        next[i] = { ...arr[i], deleted: false, updatedAt: now() };
      } else {
        next.splice(Math.min(index, next.length), 0, { ...item, deleted: false, updatedAt: now() });
      }
      persist(next);
      return next;
    });
  }

  function replaceAll(next: Link[]) {
    const stamped = next.map((l) => ({
      ...l,
      updatedAt: typeof l.updatedAt === 'number' ? l.updatedAt : now(),
      deleted: !!l.deleted,
    }));
    links.set(stamped);
    persist(stamped);
  }

  function applyRemote(remote: Link[]) {
    links.update((arr) => {
      const next = arr.slice();
      const indexById = new Map(next.map((l, i) => [l.id, i] as const));
      for (const r of remote) {
        const incoming: Link = { ...r, deleted: !!r.deleted };
        const i = indexById.get(r.id);
        if (i === undefined) {
          indexById.set(r.id, next.length);
          next.push(incoming);
        } else if (r.updatedAt >= next[i].updatedAt) {
          next[i] = incoming;
        }
      }
      persist(next);
      return next;
    });
  }

  function allIncludingDeleted(): Link[] {
    return get(links);
  }

  function purgeDeleted() {
    links.update((arr) => {
      const next = arr.filter((l) => !l.deleted);
      persist(next);
      return next;
    });
  }

  return { links, add, remove, restore, replaceAll, applyRemote, allIncludingDeleted, purgeDeleted };
}
