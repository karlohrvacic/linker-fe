import { describe, it, expect } from 'vitest';
import { CATS, catById } from './categories';

describe('categories', () => {
  it('has six categories', () => {
    expect(CATS).toHaveLength(6);
  });
  it('catById finds cook', () => {
    expect(catById('cook').labelKey).toBe('cat.cook');
  });
  it('catById finds the added Posao and Učenje', () => {
    expect(catById('posao').labelKey).toBe('cat.posao');
    expect(catById('ucenje').labelKey).toBe('cat.ucenje');
  });
  it('catById defaults to other for unknown id', () => {
    expect(catById('nope').id).toBe('other');
  });
});
