import { describe, it, expect, beforeEach } from 'vitest';
import { localStorageAdapter as s, KEY } from './storage';

beforeEach(() => localStorage.clear());

describe('localStorageAdapter', () => {
  it('round-trips JSON', () => {
    s.set(KEY, [{ id: 'a' }]);
    expect(s.get(KEY)).toEqual([{ id: 'a' }]);
  });
  it('returns null for a missing key', () => {
    expect(s.get('nope')).toBeNull();
  });
  it('returns null on corrupt JSON', () => {
    localStorage.setItem(KEY, '{bad');
    expect(s.get(KEY)).toBeNull();
  });
});
