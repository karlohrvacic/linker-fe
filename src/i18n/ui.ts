/**
 * Static-page (marketing + legal) i18n dictionaries.
 *
 * Croatian is the DEFAULT and the source of truth: `hr` carries the exact
 * strings the static pages shipped with; `en` is a faithful translation
 * (the privacy/terms page is legal text — translated carefully, "not legal
 * advice" intent preserved). The interactive app (/app) has its own runtime
 * i18n in `src/components/app/lib/i18n.ts`; this file only serves the static
 * Astro pages.
 *
 * Values may contain inline HTML (links / <strong> / <em> / <br>); those keys
 * are rendered with `set:html` in the components. Internal page links that
 * differ per locale (e.g. the privacy link) are built in the components from
 * the `lang` prop, NOT hard-coded here.
 */

export type Lang = 'hr' | 'en';

export const LANG_KEY = 'ladica-lang';

const hr: Record<string, string> = {
  // ── Shared footer pieces ────────────────────────────────────────────────
  'foot.contact': 'Kontakt:',
  'foot.privacy': 'Privatnost i uvjeti',
  'foot.legal':
    '© 2026 <a href="https://ladica.hrva.cc">ladica.hrva.cc</a> · A <a href="https://hrvalabs.net">HrvaLabs.net</a> project · All rights reserved',
  'brand.by': 'HrvaLabs',

  // ── Shared demo / preview content (phone mock-ups) ──────────────────────
  'demo.all': 'Sve',
  'demo.cook': 'Kuhanje',
  'demo.shop': 'Kupovina',
  'demo.open': 'Otvori',
  'demo.cardCook': 'Recept za sarmu',
  'demo.cardCookUrl': 'coolinarika.com/recepti',
  'demo.cardShop': 'Konzum web trgovina',
  'demo.cardShopUrl': 'konzum.hr',
  'demo.add': 'Dodaj link',

  // ── Launcher (index) ────────────────────────────────────────────────────
  'index.title': 'Ladica · spremi linkove, otvori jednim dodirom',
  'index.description':
    'Spremi linkove iz bilo koje aplikacije i otvori ih jednim dodirom. Bez prijave sve ostaje na uređaju i radi bez interneta; sinkronizacija po želji.',
  'index.tagline': 'Spremi linkove. Otvori jednim dodirom.',
  'index.appTileAria': 'Otvori Ladicu — aplikaciju za spremanje linkova',
  'index.appLabel': 'Aplikacija',
  'index.savedOnDevice': 'Spremljeno na uređaju',
  'index.tileCta': 'Otvori Ladicu',
  'index.howTitle': 'Kako radi',
  'index.howSub': 'Kratak pregled u tri koraka.',
  'index.qrAlt': 'QR kod za ladica.hrva.cc',
  'index.qrTitle': 'Otvori na mobitelu',
  'index.qrSub': 'Skeniraj kod kamerom telefona — ',
  'index.footNote':
    'Bez prijave linkovi ostaju na uređaju · sinkronizaciju uključuješ samo ako želiš',

  // ── Landing ─────────────────────────────────────────────────────────────
  'landing.title': 'Ladica · spremi i otvori jednim dodirom',
  'landing.description':
    'Ladica drži tvoje linkove na okupu — recepti, kupovina, putovanja, posao — posloženo po kategorijama. Bez prijave sve ostaje na uređaju i radi bez interneta; sinkronizaciju uključuješ samo ako želiš.',
  'landing.navOpen': 'Otvori aplikaciju',
  'landing.eyebrow': 'Tvoji linkovi, uvijek pri ruci',
  'landing.h1': 'Spremi linkove.<br>Otvori jednim dodirom.',
  'landing.lead':
    'Ladica drži tvoje linkove na okupu — recepti, kupovina, putovanja, posao — lijepo posloženo po kategorijama. Bez registracije i bez gnjavaže.',
  'landing.ctaOpen': 'Otvori aplikaciju',
  'landing.ctaHow': 'Kako radi',
  'landing.note':
    'Bez prijave sve ostaje na tvom uređaju — sinkronizaciju uključuješ samo ako želiš.',
  'landing.phoneTitle': 'Ladica',
  'landing.phoneSub': 'Spremi link i otvori ga jednim dodirom.',
  'landing.feat.title': 'Bez kompliciranja',
  'landing.feat.sub': 'Velike tipke, jasni nazivi i ništa suvišno na ekranu.',
  'landing.feat.1.h': 'Otvori jednim dodirom',
  'landing.feat.1.p':
    'Velika zelena tipka „Otvori” na svakom linku — bez traženja i prepisivanja adrese.',
  'landing.feat.2.h': 'Posloženo po kategorijama',
  'landing.feat.2.p':
    'Kuhanje, Kupovina, Putovanja, Posao, Učenje i Ostalo — svaka u svojoj boji pa se brzo snađeš.',
  'landing.feat.3.h': 'Spremi u par sekundi',
  'landing.feat.3.p':
    'Iz bilo koje aplikacije: Podijeli → Ladica i adresa je već upisana. Ili u Ladici dodirneš „Dodaj link” pa zalijepiš adresu.',
  'landing.how.title': 'Kako radi',
  'landing.how.sub': 'U tri koraka i link ti je pri ruci.',
  'landing.step.1.h': 'Podijeli u Ladicu',
  'landing.step.1.p': 'U bilo kojoj aplikaciji dodirni Podijeli → Ladica i adresa se sama upiše. Ili u Ladici dodirni „Dodaj link” pa je zalijepi ili upiši.',
  'landing.step.2.h': 'Odaberi kategoriju',
  'landing.step.2.p': 'Razvrstaj link u Kuhanje, Posao, Putovanja ili neku drugu kategoriju i spremi ga.',
  'landing.step.3.h': 'Otvori kad zatreba',
  'landing.step.3.p': 'Pronađi ga pretragom ili filterom po kategoriji i otvori jednim dodirom.',
  'landing.faq.title': 'Česta pitanja',
  'landing.faq.1.q': 'Je li Ladica besplatna?',
  'landing.faq.1.a': 'Da, u potpunosti. Nema registracije ni oglasa.',
  'landing.faq.2.q': 'Gdje se spremaju moji linkovi?',
  'landing.faq.2.a':
    'Bez prijave spremaju se lokalno na tvom uređaju, u pregledniku, i rade i bez interneta. Ako se prijaviš, mogu se sinkronizirati na sve tvoje uređaje — no to je posve neobavezno.',
  'landing.faq.3.q': 'Moram li napraviti račun?',
  'landing.faq.3.a':
    'Ne moraš. Otvoriš Ladicu i odmah spremaš linkove. Prijava služi samo za sinkronizaciju i posve je neobavezna.',
  'landing.faq.4.q': 'Mogu li koristiti Ladicu kao aplikaciju na telefonu?',
  'landing.faq.4.a':
    'Da. Dodaj je na početni zaslon i otvara se kao prava aplikacija — preko cijelog ekrana i bez interneta.',
  'landing.faq.5.q': 'Kako prenijeti linkove na novi telefon?',
  'landing.faq.5.a':
    'Najlakše se prijaviš pa se linkovi sami sinkroniziraju. Ako ne želiš prijavu, u postavkama izvezi sigurnosnu kopiju (.json) i uvezi je na novom uređaju.',
  'landing.cta.h': 'Da spremimo prvi link?',
  'landing.cta.p': 'Bez prijave i bez čekanja — prvi link spremiš u par sekundi.',
  'landing.cta.btn': 'Otvori aplikaciju',
  'landing.footTagline':
    'Ladica — tvoja ladica za linkove. Radi bez interneta i ne prati te.',

  // ── Privacy & terms ─────────────────────────────────────────────────────
  'privacy.title': 'Privatnost i uvjeti korištenja · Ladica',
  'privacy.description':
    'Kako Ladica postupa s podacima i uvjeti korištenja. Bez prijave linkovi ostaju na vašem uređaju; sinkronizaciju (i pohranu na poslužitelju) uključujete samo ako se prijavite.',
  'privacy.topbarBack': 'Natrag na aplikaciju',
  'privacy.h1': 'Privatnost i uvjeti korištenja',
  'privacy.updatedLabel': 'Zadnja izmjena:',
  'privacy.updated': '26. lipnja 2026.',
  'privacy.tldr':
    '<strong>Ukratko:</strong> Bez prijave Ladica ne traži registraciju, ne koristi kolačiće, ne prikuplja osobne podatke i ne prati korisnike — vaši linkovi spremaju se isključivo na vašem uređaju (u pregledniku). Nema analitike, nema oglasa, nema profiliranja. Sinkronizacija je neobavezna: ako se prijavite, vaša e-pošta i linkovi čuvaju se na našem poslužitelju kako bi bili dostupni na svim uređajima (vidi „Kad se prijavite”).',
  'privacy.h.who': 'Tko stoji iza Ladice',
  'privacy.p.who':
    'Ladica (<a href="https://ladica.hrva.cc">ladica.hrva.cc</a>) besplatan je hobi-projekt platforme <a href="https://hrvalabs.net">HrvaLabs.net</a>, koja je ujedno voditelj obrade podataka u smislu članka 4. stavka 7. Opće uredbe o zaštiti podataka (GDPR). Kontakt: <a href="mailto:ladica@hrvalabs.net">ladica@hrvalabs.net</a>.',
  'privacy.h.where': 'Gdje se spremaju vaši linkovi',
  'privacy.p.where':
    'Dok niste prijavljeni, linkovi koje spremite čuvaju se lokalno u vašem pregledniku (<em>localStorage</em>, stavka „ladica-links-v1”). Taj podatak ostaje isključivo na vašem uređaju i ne šalje se na poslužitelj niti ga itko drugi može vidjeti. Ako obrišete podatke preglednika ili promijenite uređaj, linkovi se mogu izgubiti — zato postoji izvoz sigurnosne kopije (vidi niže), a od nedavno i neobavezna sinkronizacija opisana u sljedećem odjeljku.',
  'privacy.h.signin': 'Kad se prijavite (sinkronizacija)',
  'privacy.p.signin':
    'Prijava je posve neobavezna. Ako se prijavite — putem Googlea ili poveznice za prijavu poslane e-poštom — uključujete sinkronizaciju. Tada Ladica čuva vašu <strong>e-poštu</strong>, vaše <strong>spremljene linkove</strong> i pripadajuće <strong>vremenske oznake</strong> na poslužitelju platforme HrvaLabs, kako bi vaši linkovi bili dostupni na svim vašim uređajima. Poslužitelj se nalazi kod pružatelja Oracle Cloud (Docker), u Njemačkoj.',
  'privacy.p.signinLegal':
    '<strong>Pravna osnova.</strong> Ove podatke obrađujemo radi izvršenja ugovora o usluzi sinkronizacije koju ste zatražili prijavom (članak 6. stavak 1. točka (b) GDPR-a).',
  'privacy.p.signinEmail':
    '<strong>E-pošta.</strong> Za prijavu poveznicom transakcijsku e-poštu šaljemo preko pružatelja usluge SendPulse. Pritom se obrađuje samo vaša adresa e-pošte i to isključivo radi isporuke poruke za prijavu.',
  'privacy.p.signinTokens':
    '<strong>Tokeni za prijavu.</strong> Poveznica za prijavu i token (JWT) koji vas drži prijavljenima tehnički su nužni za rad sinkronizacije i ne koriste se za praćenje.',
  'privacy.p.signinDelete':
    '<strong>Brisanje računa.</strong> U svakom trenutku u aplikaciji možete odabrati <em>„Obriši račun”</em> — time se vaš račun i svi linkovi pohranjeni u oblaku trajno brišu s poslužitelja. Linkovi spremljeni lokalno na uređaju pritom ostaju kod vas.',
  'privacy.h.cookies': 'Kolačići i praćenje',
  'privacy.p.cookies':
    'Ladica ne koristi kolačiće, ne koristi analitiku (npr. Google Analytics), ne učitava vanjske skripte i ne prati vaše ponašanje. Fontovi su sistemski (oni koje vaš uređaj već ima), pa se ništa ne dohvaća s vanjskih poslužitelja fontova.',
  'privacy.h.technical': 'Tehnički nužni podaci',
  'privacy.p.technical':
    'Kao i svaka web-stranica, Ladica se poslužuje preko pružatelja usluge hostinga (Cloudflare Pages). Pri svakom posjetu pružatelj može, u tehničke svrhe (sigurnost i isporuka sadržaja), privremeno zabilježiti podatke poput IP adrese. To je nužno za rad svake internetske stranice, ne koristi se za praćenje i mi ga ne pohranjujemo.',
  'privacy.h.backup': 'Sigurnosna kopija (izvoz i uvoz)',
  'privacy.p.backup':
    'U aplikaciji možete izvesti sve svoje linkove u datoteku (.json) i kasnije ih uvesti — primjerice na novom telefonu. Te datoteke ostaju na vašem uređaju; mi ih ne primamo niti vidimo.',
  'privacy.h.share': 'Dijeljenje i QR kodovi',
  'privacy.p.share':
    'QR kodovi izrađuju se lokalno u vašem pregledniku — adresa linka ne šalje se nijednoj vanjskoj usluzi. Kad podijelite link, dijeljenje obavlja vaš uređaj odnosno operativni sustav.',
  'privacy.h.rights': 'Vaša prava',
  'privacy.p.rights':
    'Bez prijave ne prikupljamo niti pohranjujemo vaše osobne podatke, pa vašim podacima upravljate sami, izravno na uređaju. Ako uključite sinkronizaciju, prema GDPR-u imate pravo na pristup, ispravak, brisanje, ograničenje i prigovor — brisanje možete provesti odmah putem <em>„Obriši račun”</em>, a za ostala se prava javite na <a href="mailto:ladica@hrvalabs.net">ladica@hrvalabs.net</a>. U svakom slučaju imate pravo na pritužbu Agenciji za zaštitu osobnih podataka (AZOP, <a href="https://azop.hr">azop.hr</a>).',
  'privacy.h.terms': 'Uvjeti korištenja („kakva jest”)',
  'privacy.p.terms':
    'Ladica je besplatan hobi-projekt koji se pruža „kakva jest” i „kako je dostupna”, bez ikakvih jamstava — izričitih ili prešutnih. Ne jamčimo neprekidan rad, trajnost spremljenih linkova niti dostupnost usluge. Usluga se može promijeniti, prestati raditi ili biti ugašena u bilo kojem trenutku bez prethodne najave. Stranicu koristite na vlastitu odgovornost i sami ste odgovorni za linkove koje spremate.',
  'privacy.h.liability': 'Ograničenje odgovornosti',
  'privacy.p.liability':
    'U najvećoj mjeri dopuštenoj propisima, autor ne odgovara za bilo kakvu štetu nastalu korištenjem ili nemogućnošću korištenja Ladice, uključujući gubitak spremljenih linkova. Na ove se uvjete primjenjuje pravo Republike Hrvatske.',
  'privacy.h.changes': 'Izmjene',
  'privacy.p.changes':
    'Ovaj dokument možemo povremeno ažurirati. Datum zadnje izmjene naveden je na vrhu stranice.',
  'privacy.h.contact': 'Kontakt',
  'privacy.p.contact':
    'Za sva pitanja javite se na <a href="mailto:ladica@hrvalabs.net">ladica@hrvalabs.net</a>.',
  'privacy.note': 'Ovaj je tekst informativne naravi.',

  // ── Language switcher ───────────────────────────────────────────────────
  'lang.switchAria': 'Jezik',
  'lang.hr': 'HR',
  'lang.en': 'EN',
  'lang.toHrAria': 'Prebaci na hrvatski',
  'lang.toEnAria': 'Switch to English',
};

const en: Record<string, string> = {
  // ── Shared footer pieces ────────────────────────────────────────────────
  'foot.contact': 'Contact:',
  'foot.privacy': 'Privacy & terms',
  'foot.legal':
    '© 2026 <a href="https://ladica.hrva.cc">ladica.hrva.cc</a> · A <a href="https://hrvalabs.net">HrvaLabs.net</a> project · All rights reserved',
  'brand.by': 'HrvaLabs',

  // ── Shared demo / preview content (phone mock-ups) ──────────────────────
  'demo.all': 'All',
  'demo.cook': 'Cooking',
  'demo.shop': 'Shopping',
  'demo.open': 'Open',
  'demo.cardCook': 'Sarma recipe',
  'demo.cardCookUrl': 'coolinarika.com/recepti',
  'demo.cardShop': 'Konzum online store',
  'demo.cardShopUrl': 'konzum.hr',
  'demo.add': 'Add link',

  // ── Launcher (index) ────────────────────────────────────────────────────
  'index.title': 'Ladica · save links, open with one tap',
  'index.description':
    'Save links from any app and open them with one tap. Without signing in, everything stays on your device and works offline; sync is optional.',
  'index.tagline': 'Save links. Open with one tap.',
  'index.appTileAria': 'Open Ladica — the app for saving links',
  'index.appLabel': 'App',
  'index.savedOnDevice': 'Saved on your device',
  'index.tileCta': 'Open Ladica',
  'index.howTitle': 'How it works',
  'index.howSub': 'A quick three-step overview.',
  'index.qrAlt': 'QR code for ladica.hrva.cc',
  'index.qrTitle': 'Open on your phone',
  'index.qrSub': 'Scan the code with your phone camera — ',
  'index.footNote':
    'Without signing in your links stay on your device · you enable sync only if you want',

  // ── Landing ─────────────────────────────────────────────────────────────
  'landing.title': 'Ladica · save and open with one tap',
  'landing.description':
    'Ladica keeps your links together — recipes, shopping, travel, work — sorted by category. Without signing in everything stays on your device and works offline; you turn on sync only if you want.',
  'landing.navOpen': 'Open the app',
  'landing.eyebrow': 'Your links, always at hand',
  'landing.h1': 'Save links.<br>Open with one tap.',
  'landing.lead':
    'Ladica keeps your links together — recipes, shopping, travel, work — neatly sorted by category. No sign-up, no fuss.',
  'landing.ctaOpen': 'Open the app',
  'landing.ctaHow': 'How it works',
  'landing.note':
    'Without signing in everything stays on your device — you turn on sync only if you want.',
  'landing.phoneTitle': 'Ladica',
  'landing.phoneSub': 'Save a link and open it with one tap.',
  'landing.feat.title': 'No fuss',
  'landing.feat.sub': 'Big buttons, clear names, nothing extra on screen.',
  'landing.feat.1.h': 'Open with one tap',
  'landing.feat.1.p':
    'A big green “Open” on every link — no searching, no retyping addresses.',
  'landing.feat.2.h': 'Sorted by category',
  'landing.feat.2.p':
    'Cooking, Shopping, Travel, Work, Study and Other — each in its own colour, so you find things fast.',
  'landing.feat.3.h': 'Saved in seconds',
  'landing.feat.3.p':
    'From any app: Share → Ladica and the address is already filled in. Or tap “Add link” in Ladica and paste it.',
  'landing.how.title': 'How it works',
  'landing.how.sub': 'Three steps and your link is at hand.',
  'landing.step.1.h': 'Share to Ladica',
  'landing.step.1.p': 'In any app, tap Share → Ladica and the address fills itself in. Or, in Ladica, tap “Add link” and paste or type it.',
  'landing.step.2.h': 'Pick a category',
  'landing.step.2.p': 'Sort the link into Cooking, Work, Travel or another category and save it.',
  'landing.step.3.h': 'Open when you need it',
  'landing.step.3.p': 'Find it via search or the category filter and open it with one tap.',
  'landing.faq.title': 'Common questions',
  'landing.faq.1.q': 'Is Ladica free?',
  'landing.faq.1.a': 'Yes, completely. No registration, no ads.',
  'landing.faq.2.q': 'Where are my links stored?',
  'landing.faq.2.a':
    'Without signing in, they are stored locally on your device, in your browser, and work offline too. If you sign in, they can sync across all your devices — but that is entirely optional.',
  'landing.faq.3.q': 'Do I have to create an account?',
  'landing.faq.3.a':
    'You don’t. Open Ladica and start saving links right away. Signing in is only for sync and is completely optional.',
  'landing.faq.4.q': 'Can I use Ladica as an app on my phone?',
  'landing.faq.4.a':
    'Yes. Add it to your home screen and it opens like a real app — full-screen and offline.',
  'landing.faq.5.q': 'How do I move my links to a new phone?',
  'landing.faq.5.a':
    'Easiest is to sign in and your links sync automatically. If you’d rather not, export a backup (.json) in settings and import it on the new device.',
  'landing.cta.h': 'Ready to save your first link?',
  'landing.cta.p': 'No sign-in and no waiting — save your first link in a couple of seconds.',
  'landing.cta.btn': 'Open the app',
  'landing.footTagline':
    'Ladica — your drawer for links. Works offline, never tracks you.',

  // ── Privacy & terms ─────────────────────────────────────────────────────
  'privacy.title': 'Privacy & Terms of Use · Ladica',
  'privacy.description':
    'How Ladica handles data and the terms of use. Without signing in, your links stay on your device; sync (and server-side storage) is enabled only if you sign in.',
  'privacy.topbarBack': 'Back to the app',
  'privacy.h1': 'Privacy & Terms of Use',
  'privacy.updatedLabel': 'Last updated:',
  'privacy.updated': 'June 26, 2026',
  'privacy.tldr':
    '<strong>In short:</strong> Without signing in, Ladica requires no registration, uses no cookies, collects no personal data and does not track users — your links are stored exclusively on your device (in your browser). No analytics, no ads, no profiling. Sync is optional: if you sign in, your email and links are kept on our server so they are available on all your devices (see “When you sign in”).',
  'privacy.h.who': 'Who is behind Ladica',
  'privacy.p.who':
    'Ladica (<a href="https://ladica.hrva.cc">ladica.hrva.cc</a>) is a free hobby project of the <a href="https://hrvalabs.net">HrvaLabs.net</a> platform, which is also the data controller within the meaning of Article 4(7) of the General Data Protection Regulation (GDPR). Contact: <a href="mailto:ladica@hrvalabs.net">ladica@hrvalabs.net</a>.',
  'privacy.h.where': 'Where your links are stored',
  'privacy.p.where':
    'While you are not signed in, the links you save are stored locally in your browser (<em>localStorage</em>, item “ladica-links-v1”). This data stays solely on your device and is not sent to any server, nor can anyone else see it. If you clear your browser data or change devices, the links may be lost — which is why there is a backup export (see below) and, more recently, the optional sync described in the next section.',
  'privacy.h.signin': 'When you sign in (sync)',
  'privacy.p.signin':
    'Signing in is entirely optional. If you sign in — via Google or a sign-in link sent by email — you enable sync. Ladica then stores your <strong>email</strong>, your <strong>saved links</strong> and their <strong>timestamps</strong> on the HrvaLabs platform server so that your links are available on all your devices. The server is hosted on Oracle Cloud (Docker), in Germany.',
  'privacy.p.signinLegal':
    '<strong>Legal basis.</strong> We process this data to perform the sync service contract you requested by signing in (Article 6(1)(b) GDPR).',
  'privacy.p.signinEmail':
    '<strong>Email.</strong> For link-based sign-in we send the transactional email through the service provider SendPulse. Only your email address is processed, and solely to deliver the sign-in message.',
  'privacy.p.signinTokens':
    '<strong>Sign-in tokens.</strong> The sign-in link and the token (JWT) that keeps you signed in are technically necessary for sync to work and are not used for tracking.',
  'privacy.p.signinDelete':
    '<strong>Account deletion.</strong> At any time you can choose <em>“Delete account”</em> in the app — this permanently deletes your account and all links stored in the cloud from the server. Links saved locally on your device remain with you.',
  'privacy.h.cookies': 'Cookies and tracking',
  'privacy.p.cookies':
    'Ladica uses no cookies, no analytics (e.g. Google Analytics), loads no external scripts and does not track your behaviour. Fonts are system fonts (the ones your device already has), so nothing is fetched from external font servers.',
  'privacy.h.technical': 'Technically necessary data',
  'privacy.p.technical':
    'Like every website, Ladica is served through a hosting provider (Cloudflare Pages). On each visit the provider may, for technical purposes (security and content delivery), temporarily log data such as your IP address. This is necessary for any website to work, is not used for tracking, and we do not store it.',
  'privacy.h.backup': 'Backup (export and import)',
  'privacy.p.backup':
    'In the app you can export all your links to a file (.json) and import them later — for example on a new phone. These files stay on your device; we never receive or see them.',
  'privacy.h.share': 'Sharing and QR codes',
  'privacy.p.share':
    'QR codes are generated locally in your browser — the link address is not sent to any external service. When you share a link, the sharing is handled by your device or operating system.',
  'privacy.h.rights': 'Your rights',
  'privacy.p.rights':
    'Without signing in we neither collect nor store your personal data, so you manage your data yourself, directly on your device. If you enable sync, under the GDPR you have the right of access, rectification, erasure, restriction and objection — you can carry out erasure immediately via <em>“Delete account”</em>, and for the other rights contact <a href="mailto:ladica@hrvalabs.net">ladica@hrvalabs.net</a>. In any case you have the right to lodge a complaint with the Croatian Personal Data Protection Agency (AZOP, <a href="https://azop.hr">azop.hr</a>).',
  'privacy.h.terms': 'Terms of use (“as is”)',
  'privacy.p.terms':
    'Ladica is a free hobby project provided “as is” and “as available”, without any warranties — express or implied. We do not guarantee uninterrupted operation, the durability of saved links, or the availability of the service. The service may change, stop working or be shut down at any time without prior notice. You use the site at your own risk and are solely responsible for the links you save.',
  'privacy.h.liability': 'Limitation of liability',
  'privacy.p.liability':
    'To the maximum extent permitted by law, the author is not liable for any damage arising from the use of, or inability to use, Ladica, including the loss of saved links. These terms are governed by the law of the Republic of Croatia.',
  'privacy.h.changes': 'Changes',
  'privacy.p.changes':
    'We may update this document from time to time. The date of the last change is shown at the top of the page.',
  'privacy.h.contact': 'Contact',
  'privacy.p.contact':
    'For any questions, contact <a href="mailto:ladica@hrvalabs.net">ladica@hrvalabs.net</a>.',
  'privacy.note': 'This text is for information only and is not legal advice.',

  // ── Language switcher ───────────────────────────────────────────────────
  'lang.switchAria': 'Language',
  'lang.hr': 'HR',
  'lang.en': 'EN',
  'lang.toHrAria': 'Prebaci na hrvatski',
  'lang.toEnAria': 'Switch to English',
};

export const ui: Record<Lang, Record<string, string>> = { hr, en };

/**
 * Static-page translator. Looks up the active language, falls back to Croatian
 * (the default), then to the raw key so a missing string is at least visible.
 */
export function tt(lang: Lang, key: string): string {
  return ui[lang]?.[key] ?? ui.hr[key] ?? key;
}
