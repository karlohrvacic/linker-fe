import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import AddSheet from './AddSheet.svelte';

describe('AddSheet', () => {
  it('does not save an invalid url and shows a hint', async () => {
    const { getByLabelText, getByText, component } = render(AddSheet, { props: { open: true, defaultCat: 'cook' } });
    const save = vi.fn();
    component.$on('save', save);

    await fireEvent.input(getByLabelText('Adresa (link)'), { target: { value: 'not a url' } });
    await fireEvent.click(getByText('Spremi link'));

    expect(save).not.toHaveBeenCalled();
    expect(getByText('Upiši ili zalijepi ispravan link.')).toBeTruthy();
  });

  it('saves a valid url, normalized, with the picked category', async () => {
    const { getByLabelText, getByText, component } = render(AddSheet, { props: { open: true, defaultCat: 'cook' } });
    const detail = vi.fn();
    component.$on('save', (e) => detail((e as CustomEvent).detail));

    await fireEvent.input(getByLabelText('Adresa (link)'), { target: { value: 'konzum.hr' } });
    await fireEvent.click(getByText('Spremi link'));

    expect(detail).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://konzum.hr', cat: 'cook' }));
  });
});
