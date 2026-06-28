/** URL helpers — ported verbatim from the original app.html. */

/** Normalize raw user input into an absolute https URL (or '' when empty). */
export function normUrl(raw: string): string {
  let u = (raw || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u.replace(/^\/+/, '');
  return u;
}

/** Pull the first URL out of arbitrary shared text (e.g. "Pogledaj ovo https://..."). */
export function firstUrl(text: string): string {
  const withScheme = (text || '').match(/https?:\/\/[^\s]+/i);
  if (withScheme) return withScheme[0];
  const trimmed = (text || '').trim();
  return trimmed && /\./.test(trimmed) && !/\s/.test(trimmed) ? trimmed : '';
}

/** A short, human-friendly host (+ path) for display: drops scheme, www, trailing root slash. */
export function prettyHost(url: string): string {
  try {
    const h = new URL(normUrl(url));
    return (h.hostname + (h.pathname !== '/' ? h.pathname : '')).replace(/^www\./, '');
  } catch {
    return url;
  }
}
