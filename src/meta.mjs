/* meta.mjs: the registry of free tools. One entry per tool; routes, sitemap, llms.txt, the hub, "More free tools",
   tests and the production smoke test all read it. A new tool = a folder in tools/<id>/ plus an entry here.
   Each tool's own copy and markup lives in tools/<id>/page.mjs (also the git source of its dateModified). */
export const BAZA = 'https://ciunkos.com';
export const APEX = 'ciunkos.com';
export const LANGS = ['en', 'pl'];
export const innyLang = (lang) => (lang === 'en' ? 'pl' : 'en');

/* The directory (hub) itself. Its slugs are the path prefixes every tool lives under (and the wrangler routes). */
export const HUB = { en: 'free-tools', pl: 'darmowe-narzedzia' };
export const HUB_NAME = { en: 'Free tools', pl: 'Darmowe narzędzia' };

/* Assets, API, sitemap and llms.txt live under the EN prefix. */
export const ASSETY = '/' + HUB.en + '/a';
export const API = '/' + HUB.en + '/api';

/* status 'live' tools are routed, listed and linked. Add 'soon' entries only when you want them on the hub without a link. */
export const TOOLS = {
  'white-screen': {
    status: 'live',
    layout: 'surface',
    slug: { en: 'white-screen', pl: 'bialy-ekran' },
    name: { en: 'White screen', pl: 'Biały ekran' },
    pain: {
      en: 'See every speck of dust while you clean your monitor, check for dead pixels, or light your face on a call.',
      pl: 'Zobacz każdy pyłek, gdy czyścisz monitor, sprawdź martwe piksele albo doświetl twarz na rozmowie.'
    },
    color: '#ffffff',
    category: 'UtilitiesApplication'
  },
  /* Next up: shown on the hub as "coming next", never linked until status is 'live'. */
  'jwt-decoder': { status: 'soon', name: { en: 'JWT decoder', pl: 'Dekoder JWT' }, pain: { en: 'Read a token’s header, claims and expiry without pasting it into someone else’s server.', pl: 'Odczytaj nagłówek, claimy i ważność tokena bez wklejania go na cudzy serwer.' }, color: '#8fb0ff' },
  'character-counter': { status: 'soon', name: { en: 'Character counter', pl: 'Licznik znaków' }, pain: { en: 'Characters, words and lines as you type, with the limits of the places you post to.', pl: 'Znaki, słowa i linie na bieżąco, z limitami miejsc, w których publikujesz.' }, color: '#d7f34b' },
  base64: { status: 'soon', name: { en: 'Base64 encode and decode', pl: 'Base64: kodowanie i dekodowanie' }, pain: { en: 'Text and files to Base64 and back, Unicode-safe, in your browser.', pl: 'Tekst i pliki do Base64 i z powrotem, z polskimi znakami, w przeglądarce.' }, color: '#e9e3ff' }
};

export const SOON = Object.entries(TOOLS).filter(([, t]) => t.status === 'soon').map(([id]) => id);
export const LIVE = Object.entries(TOOLS).filter(([, t]) => t.status === 'live').map(([id]) => id);

/** Path of a tool page (no leading slash), e.g. 'free-tools/white-screen'. */
export const sciezka = (id, lang) => HUB[lang] + '/' + TOOLS[id].slug[lang];

/** Every routed HTML page: hub plus live tools, both languages. */
export const STRONY = [
  { id: 'hub', path: { en: HUB.en, pl: HUB.pl } },
  ...LIVE.map((id) => ({ id, path: { en: sciezka(id, 'en'), pl: sciezka(id, 'pl') } }))
];

export const LINKI = {
  hub: { en: BAZA + '/hire-me', pl: BAZA + '/zatrudnij-mnie' },
  calendar: 'https://cal.com/przemyslaw-zalewski-ciunkos/30min'
};
