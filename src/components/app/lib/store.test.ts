import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { createLinkStore } from './store';
import { localStorageAdapter, KEY } from './storage';

beforeEach(() => localStorage.clear());

describe('createLinkStore', () => {
  it('starts empty when storage is empty', () => {
    const a = createLinkStore(localStorageAdapter);
    expect(get(a.links)).toHaveLength(0);
  });

  it('loads existing links from storage', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'x', name: 'X', url: 'https://x.com', cat: 'other' }]));
    const a = createLinkStore(localStorageAdapter);
    expect(get(a.links)).toHaveLength(1);
  });

  it('add prepends and persists', () => {
    const a = createLinkStore(localStorageAdapter);
    a.add({ url: 'x.com', name: 'X', cat: 'other' });
    expect(get(a.links)[0].url).toBe('https://x.com');

    const b = createLinkStore(localStorageAdapter);
    expect(get(b.links)[0].name).toBe('X');
  });

  it('add stamps updatedAt and not-deleted', () => {
    const a = createLinkStore(localStorageAdapter);
    const l = a.add({ url: 'x.com', name: 'X', cat: 'other' });
    expect(l.updatedAt).toBeGreaterThan(0);
    expect(l.deleted).toBe(false);
  });

  it('remove tombstones (keeps row, marks deleted) and restore revives it', () => {
    const a = createLinkStore(localStorageAdapter);
    const l = a.add({ url: 'a.com', name: 'A', cat: 'other' });
    const removed = a.remove(l.id)!;
    expect(get(a.links).find((x) => x.id === l.id)?.deleted).toBe(true);
    a.restore(removed.item, removed.index);
    expect(get(a.links).find((x) => x.id === l.id)?.deleted).toBe(false);
  });

  it('applyRemote LWW: newer remote wins, older remote ignored, tombstone applied', () => {
    const a = createLinkStore(localStorageAdapter);
    const l = a.add({ url: 'a.com', name: 'A', cat: 'other' }); // updatedAt = t
    a.applyRemote([{ id: l.id, url: 'https://a.com', name: 'A2', cat: 'shop', updatedAt: l.updatedAt + 10, deleted: false }]);
    expect(get(a.links).find((x) => x.id === l.id)?.name).toBe('A2');
    a.applyRemote([{ id: l.id, url: 'https://a.com', name: 'STALE', cat: 'shop', updatedAt: l.updatedAt - 10, deleted: false }]);
    expect(get(a.links).find((x) => x.id === l.id)?.name).toBe('A2'); // ignored
    a.applyRemote([{ id: l.id, url: 'https://a.com', name: 'A2', cat: 'shop', updatedAt: l.updatedAt + 20, deleted: true }]);
    expect(get(a.links).find((x) => x.id === l.id)?.deleted).toBe(true);
  });

  it('applyRemote inserts unknown remote links', () => {
    const a = createLinkStore(localStorageAdapter);
    a.applyRemote([{ id: 'r1', url: 'https://z.com', name: 'Z', cat: 'other', updatedAt: 5, deleted: false }]);
    expect(get(a.links).find((x) => x.id === 'r1')?.name).toBe('Z');
  });

  it('purgeDeleted drops tombstones', () => {
    const a = createLinkStore(localStorageAdapter);
    const l = a.add({ url: 'a.com', cat: 'other' });
    a.remove(l.id);
    a.purgeDeleted();
    expect(get(a.links).find((x) => x.id === l.id)).toBeUndefined();
  });
});
