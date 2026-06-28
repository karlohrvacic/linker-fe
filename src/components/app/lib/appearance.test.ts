import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.fontSize = '';
});

describe('appearance', () => {
  it('defaults to system theme + normal size and persists changes', async () => {
    const { theme, fontScale, THEME_KEY, FONT_KEY } = await import('./appearance');
    expect(get(theme)).toBe('system');
    expect(get(fontScale)).toBe('normal');

    theme.set('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    theme.set('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);

    fontScale.set('larger');
    expect(localStorage.getItem(FONT_KEY)).toBe('larger');
    expect(document.documentElement.style.fontSize).toBe('20px'); // 16 * 1.25
  });
});
