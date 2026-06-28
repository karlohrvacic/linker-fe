/**
 * Storage seam. Today the only implementation is localStorage; later a cloud
 * adapter (Cloudflare Function + D1/KV, or an external API) can implement the
 * same interface and be swapped in to add server sync — no call-site changes.
 */
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
}

export const KEY = 'ladica-links-v1';
/** Pre-rename Croatian key; migrated once on first load (see createLinkStore). */
export const LEGACY_KEY = 'moji-linkovi-v1';

export const localStorageAdapter: StorageAdapter = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full / unavailable — non-fatal, matches original tolerance */
    }
  },
};
