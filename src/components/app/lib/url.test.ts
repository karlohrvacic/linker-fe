import { describe, it, expect } from 'vitest';
import { normUrl, prettyHost, firstUrl } from './url';

describe('firstUrl', () => {
  it('extracts a url embedded in shared text', () => {
    expect(firstUrl('Pogledaj ovo https://konzum.hr/akcije danas')).toBe('https://konzum.hr/akcije');
  });
  it('returns a bare domain when the whole text is one', () => {
    expect(firstUrl('konzum.hr')).toBe('konzum.hr');
  });
  it('returns empty when there is no url', () => {
    expect(firstUrl('samo neki tekst')).toBe('');
  });
});

describe('normUrl', () => {
  it('adds https:// when missing', () => {
    expect(normUrl('coolinarika.com')).toBe('https://coolinarika.com');
  });
  it('keeps existing scheme', () => {
    expect(normUrl('http://x.com')).toBe('http://x.com');
  });
  it('trims and strips leading slashes', () => {
    expect(normUrl('  //x.com ')).toBe('https://x.com');
  });
  it('returns empty for empty', () => {
    expect(normUrl('')).toBe('');
  });
});

describe('prettyHost', () => {
  it('drops www and trailing root slash', () => {
    expect(prettyHost('https://www.konzum.hr')).toBe('konzum.hr');
  });
  it('keeps a path', () => {
    expect(prettyHost('https://www.coolinarika.com/recepti')).toBe('coolinarika.com/recepti');
  });
});
