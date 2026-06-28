import type { Link } from './store';
import { normUrl } from './url';
import type { CatId } from './categories';

const VALID_CATS: readonly string[] = ['cook', 'shop', 'travel', 'posao', 'ucenje', 'other'];

/**
 * A device-unique id for an imported entry that has none of its own. MUST NOT be
 * a positional counter (`imp0`, `imp1`, …): identical counters across devices
 * collide as `clientId`s and cross-device overwrite each other on sync.
 */
function makeImportId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through to the random-suffixed fallback */
  }
  return `imp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Serialize all links to a backup JSON document. */
export function exportLinks(links: Link[], exportedAt: string): string {
  return JSON.stringify({ version: 1, exportedAt, links }, null, 2);
}

export interface MergeResult {
  merged: Link[];
  added: number;
  skipped: number;
}

/**
 * Merge an imported backup into the existing links, skipping entries whose
 * normalized URL already exists. Throws on a structurally invalid document.
 */
export function mergeImport(existing: Link[], incoming: unknown): MergeResult {
  if (!incoming || typeof incoming !== 'object') throw new Error('Invalid backup file.');
  const raw = (incoming as { links?: unknown }).links;
  if (!Array.isArray(raw)) throw new Error('Invalid backup file.');

  // Dedupe against ALIVE links only — a tombstoned (deleted) link must not block
  // re-importing the same URL, or a previously-deleted link could never come back.
  const seen = new Set(existing.filter((l) => !l.deleted).map((l) => normUrl(l.url)));
  const merged = existing.slice();
  let added = 0;
  let skipped = 0;

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') { skipped++; continue; }
    const e = entry as Record<string, unknown>;
    if (typeof e.url !== 'string' || !e.url.trim()) { skipped++; continue; }
    const url = normUrl(e.url);
    if (seen.has(url)) { skipped++; continue; }

    const cat = (typeof e.cat === 'string' && VALID_CATS.includes(e.cat)) ? (e.cat as CatId) : 'other';
    const name = typeof e.name === 'string' ? e.name : '';
    const id = (typeof e.id === 'string' && e.id) ? e.id : makeImportId();
    const updatedAt = typeof e.updatedAt === 'number' ? e.updatedAt : Date.now();

    merged.push({ id, name, url, cat, updatedAt, deleted: false });
    seen.add(url);
    added++;
  }

  return { merged, added, skipped };
}
