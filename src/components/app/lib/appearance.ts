/**
 * Appearance: theme (system/light/dark) + text size. Both persist to localStorage
 * and apply to <html>. The pre-paint application also happens in an inline head
 * script (Base.astro) to avoid a flash; these stores keep things in sync and react
 * to the in-app Settings controls.
 */
import { writable } from 'svelte/store';

export type Theme = 'system' | 'light' | 'dark';
export type FontScale = 'normal' | 'large' | 'larger';

export const THEME_KEY = 'ladica-theme';
export const FONT_KEY = 'ladica-font-scale';

export const FONT_FACTORS: Record<FontScale, number> = {
  normal: 1,
  large: 1.125,
  larger: 1.25,
};

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v && (allowed as readonly string[]).includes(v)) return v as T;
  } catch {
    /* SSR / storage unavailable */
  }
  return fallback;
}

function applyTheme(t: Theme): void {
  try {
    const el = document.documentElement;
    if (t === 'system') el.removeAttribute('data-theme');
    else el.dataset.theme = t;
  } catch {
    /* no document */
  }
}

function applyFontScale(s: FontScale): void {
  try {
    document.documentElement.style.fontSize = `${16 * FONT_FACTORS[s]}px`;
  } catch {
    /* no document */
  }
}

export const theme = writable<Theme>(read(THEME_KEY, ['system', 'light', 'dark'] as const, 'system'));
theme.subscribe((t) => {
  try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  applyTheme(t);
});

export const fontScale = writable<FontScale>(read(FONT_KEY, ['normal', 'large', 'larger'] as const, 'normal'));
fontScale.subscribe((s) => {
  try { localStorage.setItem(FONT_KEY, s); } catch { /* ignore */ }
  applyFontScale(s);
});
