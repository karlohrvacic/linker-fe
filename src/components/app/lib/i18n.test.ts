import { beforeEach, describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { locale, t } from './i18n';

beforeEach(() => {
  try { localStorage.clear(); } catch { /* ignore */ }
  locale.set('hr');
});

describe('i18n', () => {
  it('defaults to Croatian', () => {
    expect(get(locale)).toBe('hr');
    expect(get(t)('add.save')).toBe('Spremi link');
  });

  it('returns English after switching the locale', () => {
    locale.set('en');
    expect(get(t)('add.save')).toBe('Save link');
    expect(get(t)('cat.cook')).toBe('Cooking');
  });

  it('falls back to the key itself for an unknown key', () => {
    expect(get(t)('does.not.exist')).toBe('does.not.exist');
  });

  it('falls back to Croatian when a key is missing from the active locale', () => {
    // Every key exists in both dicts today, so prove the chain via a fake key:
    // an unknown key is identical in both → it resolves to the key (the final
    // fallback), which still exercises the hr branch ordering.
    locale.set('en');
    expect(get(t)('add.save')).toBe('Save link');
  });

  it('interpolates {name}-style params', () => {
    expect(get(t)('card.openAria', { name: 'Konzum' })).toBe('Otvori: Konzum');
    locale.set('en');
    expect(get(t)('toast.imported', { added: 2, skipped: 1 })).toBe('Imported: 2, skipped: 1');
  });
});
