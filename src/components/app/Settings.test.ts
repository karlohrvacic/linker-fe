import { render, fireEvent } from '@testing-library/svelte';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { get } from 'svelte/store';
import Settings from './Settings.svelte';
import { locale } from './lib/i18n';

beforeEach(() => {
  try { localStorage.clear(); } catch { /* ignore */ }
  locale.set('hr');
});

describe('Settings', () => {
  it('emits export when Izvezi is clicked', async () => {
    const { getByText, component } = render(Settings, { props: { open: true } });
    const handler = vi.fn();
    component.$on('export', handler);
    await fireEvent.click(getByText('Izvezi'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('switches the locale via the language picker', async () => {
    const { getByText } = render(Settings, { props: { open: true } });
    expect(get(locale)).toBe('hr');
    await fireEvent.click(getByText('English'));
    expect(get(locale)).toBe('en');
    // Strings re-render in English (the export button label changes).
    expect(getByText('Export')).toBeTruthy();
  });
});
