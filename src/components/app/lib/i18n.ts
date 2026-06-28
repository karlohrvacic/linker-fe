/**
 * i18n — Croatian (default) + English.
 *
 * Croatian is the source of truth: `hr` carries the exact strings the app shipped
 * with; `en` is a faithful translation. The active locale lives in a writable store
 * persisted to localStorage; `t` is a derived lookup with `{name}`-style interpolation
 * and a hr → key fallback chain.
 */

import { writable, derived } from 'svelte/store';

export type Locale = 'hr' | 'en';

export const LANG_KEY = 'ladica-lang';

type Dict = Record<string, string>;

export const hr: Dict = {
  // App shell
  'app.subtitle': 'Spremi link i otvori ga jednim dodirom.',
  'app.add': 'Dodaj link',
  'footer.privacy': 'Privatnost',
  'footer.credit': 'projekt platforme HrvaLabs.net',
  'empty.heading': 'Još nema linkova{where}',
  'empty.where': ' u ovoj kategoriji',
  'empty.bodyPre': 'Dodirni ',
  'empty.bodyAction': '„Dodaj link”',
  'empty.bodyPost': ' dolje pa zalijepi adresu — ili je podijeli iz druge aplikacije.',
  'empty.noResults': 'Nema rezultata za „{query}”',
  'search.placeholder': 'Pretraži linkove…',
  'search.clear': 'Očisti pretragu',

  // Snackbar / toasts
  'toast.copied': 'Link kopiran',
  'toast.copyFailed': 'Kopiranje nije uspjelo',
  'toast.shareUnavailableCopied': 'Dijeljenje nije dostupno — link kopiran',
  'toast.shareUnavailable': 'Dijeljenje nije dostupno',
  'toast.deleted': 'Link obrisan',
  'toast.saved': 'Link spremljen',
  'toast.exported': 'Sigurnosna kopija spremljena',
  'toast.imported': 'Uvezeno: {added}, preskočeno: {skipped}',
  'toast.importFailed': 'Uvoz nije uspio — provjeri datoteku.',
  'toast.authExpired': 'Prijava je istekla',
  'toast.updateAvailable': 'Dostupna je nova verzija',
  'action.refresh': 'Osvježi',
  'action.undo': 'Poništi',

  // Common actions
  'action.cancel': 'Odustani',
  'action.ok': 'U redu',
  'action.close': 'Zatvori',

  // Categories
  'cat.cook': 'Kuhanje',
  'cat.shop': 'Kupovina',
  'cat.travel': 'Putovanja',
  'cat.posao': 'Posao',
  'cat.ucenje': 'Učenje',
  'cat.other': 'Ostalo',

  // FilterBar
  'filter.all': 'Sve',
  'filter.groupAria': 'Kategorije',

  // AddSheet
  'add.sheetAria': 'Dodaj novi link',
  'add.heading': 'Novi link',
  'add.paste': 'Zalijepi iz međuspremnika',
  'add.urlLabel': 'Adresa (link)',
  'add.nameLabel': 'Naziv (po želji)',
  'add.namePlaceholder': 'npr. Recept za sarmu',
  'add.category': 'Kategorija',
  'add.save': 'Spremi link',
  'add.invalidUrl': 'Upiši ili zalijepi ispravan link.',
  'add.pasted': 'Zalijepljeno ✓',
  'add.clipboardEmpty': 'Međuspremnik je prazan.',
  'add.clipboardFail': 'Ne mogu pročitati međuspremnik — drži prst na polju pa „Zalijepi”.',

  // LinkCard
  'card.open': 'Otvori',
  'card.copy': 'Kopiraj',
  'card.share': 'Podijeli',
  'card.qr': 'QR',
  'card.delete': 'Obriši',
  'card.openAria': 'Otvori: {name}',
  'card.copyAria': 'Kopiraj link: {name}',
  'card.shareAria': 'Podijeli: {name}',
  'card.qrAria': 'QR kod: {name}',
  'card.deleteAria': 'Obriši: {name}',

  // QrDialog
  'qr.dialogAria': 'QR kod za link',
  'qr.heading': 'Skeniraj QR kod',
  'qr.sub': 'Otvori ovaj link na drugom uređaju.',
  'qr.imgAlt': 'QR kod za {host}',

  // SignInSheet
  'signin.title': 'Prijava',
  'signin.checkEmail': 'Provjeri e-poštu',
  'signin.checkEmailBody': 'Poslali smo ti link za prijavu — otvori ga na ovom uređaju.',
  'signin.intro': 'Prijavi se i linkovi ti se sinkroniziraju na svim uređajima. Bez prijave sve ostaje samo na ovom uređaju.',
  'signin.google': 'Nastavi s Googleom',
  'signin.or': 'ili',
  'signin.emailLabel': 'Adresa e-pošte',
  'signin.emailPlaceholder': 'ti@primjer.hr',
  'signin.invalidEmail': 'Upiši ispravnu adresu e-pošte.',
  'signin.sendFailed': 'Slanje nije uspjelo — provjeri vezu pa pokušaj ponovno.',
  'signin.sending': 'Šaljem…',
  'signin.send': 'Pošalji link za prijavu',

  // AuthButton
  'auth.account': 'Račun',
  'auth.signedIn': 'Prijavljen',
  'auth.signOut': 'Odjava',
  'auth.deleteConfirm': 'Sigurno obrisati račun i sve linkove iz oblaka?',
  'auth.deleteFailed': 'Brisanje nije uspjelo. Provjeri vezu i pokušaj ponovno.',
  'auth.deleting': 'Brišem…',
  'auth.delete': 'Obriši',
  'auth.deleteAccount': 'Obriši račun',
  'auth.signIn': 'Prijava',

  // SyncStatus
  'sync.syncing': 'Sinkroniziram…',
  'sync.synced': 'Sinkronizirano',
  'sync.offline': 'Izvanmrežno',
  'sync.error': 'Greška',

  // InstallButton
  'install.label': 'Instaliraj',

  // AuthCallback
  'callback.failed': 'Prijava nije uspjela. Pokušaj ponovno.',
  'callback.missingToken': 'Nedostaje token za prijavu.',
  'callback.failedHeading': 'Prijava nije uspjela',
  'callback.back': 'Natrag u Ladicu',
  'callback.loading': 'Prijavljujem…',

  // Settings
  'settings.title': 'Postavke',
  'settings.theme': 'Tema',
  'settings.themeSystem': 'Sustav',
  'settings.themeLight': 'Svijetlo',
  'settings.themeDark': 'Tamno',
  'settings.textSize': 'Veličina teksta',
  'settings.textNormal': 'Normalno',
  'settings.textLarge': 'Veliko',
  'settings.textLarger': 'Najveće',
  'settings.language': 'Jezik',
  'settings.langHr': 'Hrvatski',
  'settings.langEn': 'English',
  'settings.backup': 'Sigurnosna kopija',
  'settings.export': 'Izvezi',
  'settings.import': 'Uvezi',
  'settings.pages': 'Stranice',
  'settings.home': 'Početna',
  'settings.howItWorks': 'Kako radi',
};

export const en: Dict = {
  // App shell
  'app.subtitle': 'Save a link and open it with one tap.',
  'app.add': 'Add link',
  'footer.privacy': 'Privacy',
  'footer.credit': 'A HrvaLabs.net project',
  'empty.heading': 'No links yet{where}',
  'empty.where': ' in this category',
  'empty.bodyPre': 'Tap ',
  'empty.bodyAction': '“Add link”',
  'empty.bodyPost': ' below, then paste the address — or share one from another app.',
  'empty.noResults': 'No results for “{query}”',
  'search.placeholder': 'Search links…',
  'search.clear': 'Clear search',

  // Snackbar / toasts
  'toast.copied': 'Link copied',
  'toast.copyFailed': 'Copy failed',
  'toast.shareUnavailableCopied': 'Sharing unavailable — link copied',
  'toast.shareUnavailable': 'Sharing unavailable',
  'toast.deleted': 'Link deleted',
  'toast.saved': 'Link saved',
  'toast.exported': 'Backup saved',
  'toast.imported': 'Imported: {added}, skipped: {skipped}',
  'toast.importFailed': 'Import failed — check the file.',
  'toast.authExpired': 'Your session has expired',
  'toast.updateAvailable': 'A new version is available',
  'action.refresh': 'Refresh',
  'action.undo': 'Undo',

  // Common actions
  'action.cancel': 'Cancel',
  'action.ok': 'OK',
  'action.close': 'Close',

  // Categories
  'cat.cook': 'Cooking',
  'cat.shop': 'Shopping',
  'cat.travel': 'Travel',
  'cat.posao': 'Work',
  'cat.ucenje': 'Study',
  'cat.other': 'Other',

  // FilterBar
  'filter.all': 'All',
  'filter.groupAria': 'Categories',

  // AddSheet
  'add.sheetAria': 'Add a new link',
  'add.heading': 'New link',
  'add.paste': 'Paste from clipboard',
  'add.urlLabel': 'Address (link)',
  'add.nameLabel': 'Name (optional)',
  'add.namePlaceholder': 'e.g. Sarma recipe',
  'add.category': 'Category',
  'add.save': 'Save link',
  'add.invalidUrl': 'Type or paste a valid link.',
  'add.pasted': 'Pasted ✓',
  'add.clipboardEmpty': 'The clipboard is empty.',
  'add.clipboardFail': 'Can’t read the clipboard — long-press the field, then “Paste”.',

  // LinkCard
  'card.open': 'Open',
  'card.copy': 'Copy',
  'card.share': 'Share',
  'card.qr': 'QR',
  'card.delete': 'Delete',
  'card.openAria': 'Open: {name}',
  'card.copyAria': 'Copy link: {name}',
  'card.shareAria': 'Share: {name}',
  'card.qrAria': 'QR code: {name}',
  'card.deleteAria': 'Delete: {name}',

  // QrDialog
  'qr.dialogAria': 'QR code for the link',
  'qr.heading': 'Scan the QR code',
  'qr.sub': 'Open this link on another device.',
  'qr.imgAlt': 'QR code for {host}',

  // SignInSheet
  'signin.title': 'Sign in',
  'signin.checkEmail': 'Check your email',
  'signin.checkEmailBody': 'We sent you a sign-in link — open it on this device.',
  'signin.intro': 'Sign in and your links sync across all your devices. Without signing in, everything stays only on this device.',
  'signin.google': 'Continue with Google',
  'signin.or': 'or',
  'signin.emailLabel': 'Email address',
  'signin.emailPlaceholder': 'you@example.com',
  'signin.invalidEmail': 'Enter a valid email address.',
  'signin.sendFailed': 'Sending failed — check your connection and try again.',
  'signin.sending': 'Sending…',
  'signin.send': 'Send sign-in link',

  // AuthButton
  'auth.account': 'Account',
  'auth.signedIn': 'Signed in',
  'auth.signOut': 'Sign out',
  'auth.deleteConfirm': 'Really delete your account and all links from the cloud?',
  'auth.deleteFailed': 'Deletion failed. Check your connection and try again.',
  'auth.deleting': 'Deleting…',
  'auth.delete': 'Delete',
  'auth.deleteAccount': 'Delete account',
  'auth.signIn': 'Sign in',

  // SyncStatus
  'sync.syncing': 'Syncing…',
  'sync.synced': 'Synced',
  'sync.offline': 'Offline',
  'sync.error': 'Error',

  // InstallButton
  'install.label': 'Install',

  // AuthCallback
  'callback.failed': 'Sign-in failed. Please try again.',
  'callback.missingToken': 'The sign-in token is missing.',
  'callback.failedHeading': 'Sign-in failed',
  'callback.back': 'Back to Ladica',
  'callback.loading': 'Signing in…',

  // Settings
  'settings.title': 'Settings',
  'settings.theme': 'Theme',
  'settings.themeSystem': 'System',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'settings.textSize': 'Text size',
  'settings.textNormal': 'Normal',
  'settings.textLarge': 'Large',
  'settings.textLarger': 'Larger',
  'settings.language': 'Language',
  'settings.langHr': 'Hrvatski',
  'settings.langEn': 'English',
  'settings.backup': 'Backup',
  'settings.export': 'Export',
  'settings.import': 'Import',
  'settings.pages': 'Pages',
  'settings.home': 'Home',
  'settings.howItWorks': 'How it works',
};

const dicts: Record<Locale, Dict> = { hr, en };

function readLocale(): Locale {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'hr' || v === 'en') return v;
  } catch {
    /* SSR / storage unavailable */
  }
  return 'hr';
}

export const locale = writable<Locale>(readLocale());

// Persist + reflect on <html lang> on every change (incl. the initial value).
locale.subscribe((l) => {
  try {
    localStorage.setItem(LANG_KEY, l);
  } catch {
    /* storage unavailable — non-fatal */
  }
  try {
    if (typeof document !== 'undefined') document.documentElement.lang = l;
  } catch {
    /* no document (SSR) */
  }
});

function interpolate(s: string, params?: Record<string, string | number>): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, key) => (key in params ? String(params[key]) : m));
}

/**
 * Translator: `$t('key')` or `$t('key', { name })`. Looks up the active locale,
 * falls back to Croatian, then to the raw key so a missing string is at least
 * visible rather than blank.
 */
export const t = derived(locale, ($l) => {
  return (key: string, params?: Record<string, string | number>): string => {
    const value = dicts[$l][key] ?? hr[key] ?? key;
    return interpolate(value, params);
  };
});
