import { describe, it, expect } from 'vitest';
import { exportLinks, mergeImport } from './io';
import type { Link } from './store';

const base: Link[] = [{ id: '1', name: 'A', url: 'https://a.com', cat: 'other', updatedAt: 1 }];

describe('exportLinks', () => {
  it('wraps with version + links', () => {
    const json = JSON.parse(exportLinks(base, '2026-01-01T00:00:00Z'));
    expect(json.version).toBe(1);
    expect(json.exportedAt).toBe('2026-01-01T00:00:00Z');
    expect(json.links).toHaveLength(1);
  });
});

describe('mergeImport', () => {
  it('skips duplicate normalized urls and adds new ones', () => {
    const incoming = {
      version: 1,
      links: [
        { id: '9', name: 'A dup', url: 'a.com', cat: 'other' },   // dup of https://a.com
        { id: '8', name: 'C', url: 'https://c.com', cat: 'shop' },
      ],
    };
    const r = mergeImport(base, incoming);
    expect(r.added).toBe(1);
    expect(r.skipped).toBe(1);
    expect(r.merged).toHaveLength(2);
  });

  it('coerces unknown category to other and missing name to empty', () => {
    const r = mergeImport([], { links: [{ url: 'https://d.com', cat: 'bogus' }] });
    expect(r.merged[0].cat).toBe('other');
    expect(r.merged[0].name).toBe('');
  });

  it('throws on a malformed document', () => {
    expect(() => mergeImport(base, { nope: true })).toThrow();
  });

  it('gives id-less imports unique ids (no cross-device clientId collision)', () => {
    const r = mergeImport([], { links: [{ url: 'https://e.com' }, { url: 'https://f.com' }] });
    expect(r.added).toBe(2);
    expect(r.merged[0].id).not.toBe(r.merged[1].id);
    // NOT the old positional scheme (imp0, imp1, …) that collided across devices.
    expect(r.merged[0].id).not.toMatch(/^imp\d+$/);
    expect(r.merged[1].id).not.toMatch(/^imp\d+$/);
  });

  it('re-imports a previously deleted (tombstoned) link instead of skipping it', () => {
    const existing: Link[] = [
      { id: '1', name: 'Gone', url: 'https://g.com', cat: 'other', updatedAt: 1, deleted: true },
    ];
    const r = mergeImport(existing, { links: [{ url: 'https://g.com', name: 'Back' }] });
    expect(r.added).toBe(1);
    expect(r.skipped).toBe(0);
  });
});
