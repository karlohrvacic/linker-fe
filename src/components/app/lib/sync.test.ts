import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { createLinkStore } from './store';
import { localStorageAdapter } from './storage';
import { prettyHost } from './url';
import { pull, push, firstSignInMerge, dedupeKey, fromDto } from './sync';

const CURSOR_KEY = 'ladica-sync-cursor';

beforeEach(() => localStorage.clear());

describe('syncEngine', () => {
  it('pull applies remote dtos and advances the cursor', async () => {
    localStorage.clear();
    const store = createLinkStore(localStorageAdapter);
    const deps = {
      pullLinks: async (_s: number) => ({ links: [{ clientId: 'r1', url: 'https://z.com', name: 'Z', cat: 'other', updatedAt: 5, deleted: false }], cursor: 9 }),
      pushLinks: async () => ({ cursor: 9 }),
    };
    await pull(store, deps);
    expect(get(store.links).find((l) => l.id === 'r1')?.name).toBe('Z');
    expect(localStorage.getItem('ladica-sync-cursor')).toBe('9');
  });

  it('firstSignInMerge dedupes local vs cloud by normalized url', async () => {
    localStorage.clear();
    const store = createLinkStore(localStorageAdapter);
    store.add({ url: 'konzum.hr', name: 'Local', cat: 'shop' }); // normUrl → https://konzum.hr
    let pushed: any[] = [];
    const deps = {
      pullLinks: async () => ({ links: [{ clientId: 'cloud1', url: 'https://www.konzum.hr', name: 'Cloud', cat: 'shop', updatedAt: 9_999_999_999_999, deleted: false }], cursor: 3 }),
      pushLinks: async (links: any[]) => { pushed = links; return { cursor: 4 }; },
    };
    await firstSignInMerge(store, deps);
    const visible = get(store.links).filter((l) => !l.deleted);
    expect(visible.filter((l) => prettyHost(l.url) === 'konzum.hr')).toHaveLength(1); // no dup
    expect(pushed.length).toBeGreaterThan(0);
  });

  it('push sends all links including tombstones', async () => {
    localStorage.clear();
    const store = createLinkStore(localStorageAdapter);
    const l = store.add({ url: 'a.com', cat: 'other' });
    store.remove(l.id);
    let sent: any[] = [];
    await push(store, { pullLinks: async () => ({ links: [], cursor: 0 }), pushLinks: async (x: any[]) => { sent = x; return { cursor: 1 }; } });
    expect(sent.some((d) => d.clientId === l.id && d.deleted === true)).toBe(true);
  });

  // DATA-LOSS guard: the POST response seq is global-per-user and can jump past a
  // concurrent device's write, so the cursor must move ONLY on pull.
  it('push does NOT advance the cursor; only pull does', async () => {
    localStorage.clear();
    const store = createLinkStore(localStorageAdapter);
    store.add({ url: 'a.com', cat: 'other' });
    await push(store, { pullLinks: async () => ({ links: [], cursor: 0 }), pushLinks: async () => ({ cursor: 99 }) });
    expect(localStorage.getItem(CURSOR_KEY)).toBeNull(); // push wrote nothing
    await pull(store, { pullLinks: async () => ({ links: [], cursor: 7 }), pushLinks: async () => ({ cursor: 0 }) });
    expect(localStorage.getItem(CURSOR_KEY)).toBe('7');
  });

  it('cursor never regresses', async () => {
    localStorage.clear();
    localStorage.setItem(CURSOR_KEY, '20');
    const store = createLinkStore(localStorageAdapter);
    await pull(store, { pullLinks: async () => ({ links: [], cursor: 5 }), pushLinks: async () => ({ cursor: 0 }) });
    expect(localStorage.getItem(CURSOR_KEY)).toBe('20'); // Math.max guard
  });

  it('firstSignInMerge sets the cursor from the FINAL pull, never the push', async () => {
    localStorage.clear();
    const store = createLinkStore(localStorageAdapter);
    let pulls = 0;
    const deps = {
      pullLinks: async () => { pulls += 1; return { links: [], cursor: pulls === 1 ? 3 : 12 }; },
      pushLinks: async () => ({ cursor: 999 }), // must be ignored
    };
    await firstSignInMerge(store, deps);
    expect(pulls).toBe(2); // pull → push → pull
    expect(localStorage.getItem(CURSOR_KEY)).toBe('12');
  });
});

describe('dedupeKey (byte-match to backend UrlNormalizer)', () => {
  it('strips a single trailing slash from the path, before the query', () => {
    expect(dedupeKey('https://x.com/a/?q=1')).toBe('x.com/a?q=1');
    expect(dedupeKey('https://x.com/a?q=1')).toBe('x.com/a?q=1');
    expect(dedupeKey('https://x.com/a/?q=1')).toBe(dedupeKey('https://x.com/a?q=1'));
  });

  it('strips scheme + leading www and lowercases the host only', () => {
    expect(dedupeKey('http://www.x.com/a')).toBe('x.com/a');
    expect(dedupeKey('HTTPS://X.COM/a')).toBe('x.com/a');
    expect(dedupeKey('http://www.x.com/a')).toBe(dedupeKey('https://x.com/a'));
    expect(dedupeKey('https://x.com/Path')).toBe('x.com/Path'); // path case preserved
  });

  it('keeps a differing query string distinct', () => {
    expect(dedupeKey('https://x.com/a?id=1')).not.toBe(dedupeKey('https://x.com/a?id=2'));
  });
});

describe('fromDto', () => {
  it('falls back to "other" for an unknown category, keeps valid ones', () => {
    const mk = (cat: string) => ({ clientId: 'x', url: 'https://a.com', name: 'A', cat, updatedAt: 1, deleted: false });
    expect(fromDto(mk('bogus')).cat).toBe('other');
    expect(fromDto(mk('cook')).cat).toBe('cook');
  });
});
