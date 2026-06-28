/** Categories + inline icons — ported verbatim from the original app.html. */

export type CatId = 'cook' | 'shop' | 'travel' | 'posao' | 'ucenje' | 'other';

export interface Category {
  id: CatId;
  /** i18n key for the display label, e.g. 'cat.cook'. Resolve via `$t(labelKey)`. */
  labelKey: string;
  /** CSS color token reference, e.g. 'var(--cat-cook)'. */
  color: string;
  /** Inline SVG markup string. */
  icon: string;
}

export const ICON = {
  cook:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11h14l-1 9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><path d="M12 11V7a3 3 0 0 1 6 0"/><path d="M4 11h16"/></svg>',
  shop:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.78L21 8H6"/></svg>',
  travel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 13.5 3 12l1-2.5 5.5 .8 4.5-5.3a2 2 0 0 1 3 2.6L17 12l3.8 1.4a1 1 0 0 1 .2 1.8l-2 1-3.2-1-2 4 .4 2-1.6.8z"/></svg>',
  other:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z"/></svg>',
  posao:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>',
  ucenje: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 10v6"/></svg>',
  open:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  copy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  share:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.4"/><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="19" r="2.4"/><path d="M8.1 10.9 15.9 6.1M8.1 13.1l7.8 4.8"/></svg>',
  trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>',
  qr:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h3v.01M21 18v3"/></svg>',
} as const;

export const CATS: Category[] = [
  { id: 'cook',   labelKey: 'cat.cook',   color: 'var(--cat-cook)',   icon: ICON.cook },
  { id: 'shop',   labelKey: 'cat.shop',   color: 'var(--cat-shop)',   icon: ICON.shop },
  { id: 'travel', labelKey: 'cat.travel', color: 'var(--cat-travel)', icon: ICON.travel },
  { id: 'posao',  labelKey: 'cat.posao',  color: 'var(--cat-posao)',  icon: ICON.posao },
  { id: 'ucenje', labelKey: 'cat.ucenje', color: 'var(--cat-ucenje)', icon: ICON.ucenje },
  { id: 'other',  labelKey: 'cat.other',  color: 'var(--cat-other)',  icon: ICON.other },
];

const FALLBACK = CATS[CATS.length - 1]; // 'other'

export function catById(id: string): Category {
  return CATS.find((c) => c.id === id) || FALLBACK;
}
