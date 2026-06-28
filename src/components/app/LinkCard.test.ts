import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import LinkCard from './LinkCard.svelte';
import type { Link } from './lib/store';

const link: Link = { id: '1', name: 'Test', url: 'https://x.com', cat: 'cook', updatedAt: 1 };

describe('LinkCard', () => {
  it('shows the name as title and the pretty host', () => {
    const { getByText } = render(LinkCard, { props: { link } });
    expect(getByText('Test')).toBeTruthy();
    expect(getByText('x.com')).toBeTruthy();
  });

  it('emits open when Otvori is clicked', async () => {
    const { getByLabelText, component } = render(LinkCard, { props: { link } });
    const handler = vi.fn();
    component.$on('open', handler);
    await fireEvent.click(getByLabelText('Otvori: Test'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('emits delete when Obriši is clicked', async () => {
    const { getByLabelText, component } = render(LinkCard, { props: { link } });
    const handler = vi.fn();
    component.$on('delete', handler);
    await fireEvent.click(getByLabelText('Obriši: Test'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('emits qr when QR is clicked', async () => {
    const { getByLabelText, component } = render(LinkCard, { props: { link } });
    const handler = vi.fn();
    component.$on('qr', handler);
    await fireEvent.click(getByLabelText('QR kod: Test'));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
