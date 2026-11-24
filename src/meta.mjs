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

import { PAIRS, slugOf } from '../tools/converter/pairs.mjs';

/* Static files sit flat under the EN hub: /free-tools/app.css, /free-tools/icons/…, /free-tools/<tool>/<file>.
   On disk they live in public/free-tools/ (PUB), next to the generated pages. */
export const ASSETY = '/' + HUB.en;
export const PUB = 'public' + ASSETY;
export const HEALTH = ASSETY + '/health';
/* Names under /free-tools/ that are files or folders, so no tool slug may take them. */
export const ZAREZERWOWANE = ['app.css', 'app.mjs', 'site-footer.css', 'icons', 'og', 'img', 'video', 'ph', 'health', 'sitemap.xml', 'llms.txt', 'przemo-160.webp', 'przemo-face.webp', 'kit.mjs', 'file-converter-vendor'];

/* status 'live' tools are routed, listed and linked. Add 'soon' entries only when you want them on the hub without a link. */
/* Each tool: status ('live' is routed and linked), layout, slugs, name, the pain it solves (hub and cards), and an icon:
   a rounded square in the tool's colour with a white line symbol on a 24-unit grid (favicons, cards, OG). */
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
    icon: { bg: '#3b4048', d: "<rect x='3' y='4' width='18' height='12' rx='2' fill='white'/><path d='M9 20h6M12 16v4'/>" },
    category: 'UtilitiesApplication'
  },
  'jwt-decoder': {
    status: 'live',
    layout: 'workbench',
    slug: { en: 'jwt-decoder', pl: 'dekoder-jwt' },
    name: { en: 'JWT decoder', pl: 'Dekoder JWT' },
    pain: { en: 'Read a token’s header, claims and expiry, and verify its signature, without pasting it into someone else’s server.', pl: 'Odczytaj nagłówek, claimy i ważność tokena oraz sprawdź podpis bez wklejania go na cudzy serwer.' },
    color: '#7c3aed',
    icon: { bg: '#7c3aed', d: "<circle cx='8' cy='15' r='4'/><path d='M10.8 12.2 20 3M16 7l3 3M13.5 9.5l2 2'/>" },
    category: 'DeveloperApplication'
  },
  'character-counter': {
    status: 'live',
    layout: 'workbench',
    slug: { en: 'character-counter', pl: 'licznik-znakow' },
    name: { en: 'Character counter', pl: 'Licznik znaków' },
    pain: { en: 'Characters with and without spaces, words and lines as you type, against the limits of the places you post to.', pl: 'Znaki ze spacjami i bez, słowa i linie na bieżąco, z limitami miejsc, w których publikujesz.' },
    color: '#15803d',
    icon: { bg: '#15803d', d: "<path d='M10 3 8 21M16 3l-2 18M4 8.5h16M3.5 15.5h16'/>" },
    category: 'UtilitiesApplication'
  },
  converter: {
    status: 'live',
    layout: 'drop',
    slug: { en: 'file-converter', pl: 'konwerter-plikow' },
    name: { en: 'File converter', pl: 'Konwerter plików' },
    pain: { en: 'MOV to GIF, MP4 to MP3, HEIC to JPG and 30 more, converted on your own computer. Nothing is uploaded.', pl: 'MOV na GIF, MP4 na MP3, HEIC na JPG i 30 innych, konwertowane na Twoim komputerze. Nic nie jest wysyłane.' },
    color: '#0e7490',
    icon: { bg: '#0e7490', d: "<path d='M6 3h7l5 5v4M13 3v5h5M6 3v18h6'/><path d='M15 15h6m-2.5-2.5L21 15l-2.5 2.5M21 20h-6m2.5 2.5L15 20l2.5-2.5'/>" },
    category: 'MultimediaApplication',
    /* WebCodecs encoders, MP3 and HEIC wasm, their workers and blob previews. Added to this tool's pages only. */
    csp: { 'script-src': ["'wasm-unsafe-eval'"], 'worker-src': ["'self'", 'blob:'], 'media-src': ["'self'", 'blob:'], 'img-src': ['blob:'] }
  },
  base64: {
    status: 'live',
    layout: 'workbench',
    slug: { en: 'base64-encode-decode', pl: 'base64-koduj-dekoduj' },
    name: { en: 'Base64 encode and decode', pl: 'Base64: kodowanie i dekodowanie' },
    pain: { en: 'Text and files to Base64 and back as you type, with Polish letters and emoji intact, in your browser.', pl: 'Tekst i pliki do Base64 i z powrotem na bieżąco, z polskimi znakami i emoji, w Twojej przeglądarce.' },
    color: '#c2410c',
    icon: { bg: '#c2410c', d: "<path d='M4 8h15l-3.5-3.5M20 16H5l3.5 3.5'/>" },
    category: 'DeveloperApplication'
  }
};

/** Icon as SVG markup (size in px), shared by cards, favicons and OG cards. */
export const iconSvg = (id, size = 64) => {
  const { bg, d } = TOOLS[id].icon;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${bg}"/><g transform="translate(5 5) scale(0.9167)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</g></svg>`;
};

export const SOON = Object.entries(TOOLS).filter(([, t]) => t.status === 'soon').map(([id]) => id);
export const LIVE = Object.entries(TOOLS).filter(([, t]) => t.status === 'live').map(([id]) => id);

/** Path of a tool page (no leading slash), e.g. 'free-tools/white-screen'. */
export const sciezka = (id, lang) => HUB[lang] + '/' + TOOLS[id].slug[lang];

/** Every routed HTML page: hub, live tools and the converter's x-to-y pages, both languages. */
export const STRONY = [
  { id: 'hub', path: { en: HUB.en, pl: HUB.pl } },
  ...LIVE.map((id) => ({ id, path: { en: sciezka(id, 'en'), pl: sciezka(id, 'pl') }, csp: TOOLS[id].csp })),
  ...PAIRS.map((p) => ({ id: 'converter', pair: p.id, path: { en: HUB.en + '/' + slugOf(p, 'en'), pl: HUB.pl + '/' + slugOf(p, 'pl') }, csp: TOOLS.converter.csp }))
];

export const LINKI = {
  hub: { en: BAZA + '/hire-me', pl: BAZA + '/zatrudnij-mnie' },
  calendar: 'https://cal.com/przemyslaw-zalewski-ciunkos/30min'
};
