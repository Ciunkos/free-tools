/* count.mjs: what a writer needs to know about a text. Characters are user-perceived characters (grapheme clusters),
   so an emoji, a flag or “ą” typed as a + ogonek count as one, like a person would count them. Also the counts other
   tools disagree on (UTF-16 units, bytes), an X post weight, SMS segments, standard pages and top words. */

const seg = (granularity, lang) => new Intl.Segmenter(lang || undefined, { granularity });
const SPACE = /^\s+$/u;

export function stats(text, lang = 'en') {
  const t = String(text ?? '');
  let chars = 0, noSpaces = 0;
  for (const { segment } of seg('grapheme', lang).segment(t)) { chars++; if (!SPACE.test(segment)) noSpaces++; }
  let words = 0;
  for (const s of seg('word', lang).segment(t)) if (s.isWordLike) words++;
  let sentences = 0;
  for (const { segment } of seg('sentence', lang).segment(t)) if (/[\p{L}\p{N}]/u.test(segment)) sentences++;
  const paragraphs = t.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const lines = t ? t.split(/\r\n|\r|\n/).length : 0;
  return {
    chars, noSpaces, words, sentences, paragraphs, lines,
    bytes: new TextEncoder().encode(t).length,
    utf16: t.length,
    codePoints: [...t].length,
    spaces: chars - noSpaces,
    /* Rules of thumb, labelled as such on the page: 238 words a minute silent reading (Brysbaert 2019), 140 spoken. */
    readingSeconds: Math.round((words / 238) * 60),
    speakingSeconds: Math.round((words / 140) * 60),
    /* Standard page (strona znormalizowana, Normseite): 1,800 characters with spaces. */
    pages: chars / 1800
  };
}

/* X (Twitter) weighting, from twitter-text v3: code points in these ranges weigh 1, everything else 2,
   an emoji sequence 2, and every link 23 (t.co). Limit 280 for a standard account. */
const LIGHT = [[0, 4351], [8192, 8205], [8208, 8223], [8242, 8247]];
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"]+/giu;
export function xWeight(text) {
  const t = String(text ?? '');
  let weight = 0;
  const rest = t.replace(URL_RE, () => { weight += 23; return ''; });
  for (const { segment } of seg('grapheme').segment(rest)) {
    if (/\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u.test(segment)) { weight += 2; continue; }
    for (const ch of segment) { const c = ch.codePointAt(0); weight += LIGHT.some(([a, b]) => c >= a && c <= b) ? 1 : 2; }
  }
  return weight;
}

/* SMS: GSM 03.38 basic set (1 unit) and extension table (2 units: escape + char). Anything else forces UCS-2,
   where every UTF-16 unit counts. One message holds 160 GSM units or 70 UCS-2; joined messages 153 or 67 each. */
const GSM = new Set('@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà');
const GSM_EXT = new Set('^{}\\[~]|€\f');
export function sms(text) {
  const t = String(text ?? '');
  let units = 0, gsm = true;
  for (const ch of t) { if (GSM.has(ch)) units += 1; else if (GSM_EXT.has(ch)) units += 2; else { gsm = false; break; } }
  if (!gsm) units = t.length;
  const single = gsm ? 160 : 70, multi = gsm ? 153 : 67;
  const segments = units === 0 ? 0 : units <= single ? 1 : Math.ceil(units / multi);
  const nonGsm = gsm ? [] : [...new Set([...t].filter((c) => !GSM.has(c) && !GSM_EXT.has(c)))].slice(0, 8);
  return { encoding: gsm ? 'GSM-7' : 'UCS-2', units, segments, perSegment: segments > 1 ? multi : single, nonGsm };
}

/** Limits of the places people paste text into. `count` picks the counter; `soft` marks a guideline, not a hard cut. */
export const LIMITS = [
  { id: 'x', count: 'x', limit: 280 },
  { id: 'linkedin', count: 'chars', limit: 3000 },
  { id: 'instagram', count: 'chars', limit: 2200 },
  { id: 'threads', count: 'chars', limit: 500 },
  { id: 'bluesky', count: 'chars', limit: 300 },
  { id: 'yt-title', count: 'chars', limit: 100 },
  { id: 'yt-desc', count: 'chars', limit: 5000 },
  { id: 'seo-title', count: 'chars', limit: 60, soft: true },
  { id: 'meta-desc', count: 'chars', limit: 160, soft: true }
];
export function limitValue(l, s, text) { return l.count === 'x' ? xWeight(text) : s[l.count]; }

const STOP = {
  en: new Set('the a an and or but if of to in on at for with from by as is are was were be been being it its this that these those i you he she we they me my your our their not no so do does did have has had will would can could should there here what which who whom when where why how all any each just than then too very also into out up down over about'.split(' ')),
  pl: new Set('i w we z ze na do od o u a ale lub albo czy że to ten ta te tego tej tym jest są był była było być się nie tak jak co kto gdy gdzie by aby już też tylko jego jej ich mnie mi go po przez dla przy pod nad bez oraz który która które także można jako więc może tu tam'.split(' '))
};
/** Most used words, without stop words, case-insensitive. */
export function topWords(text, n = 10, lang = 'en') {
  const stop = STOP[lang] || STOP.en, m = new Map();
  for (const s of seg('word', lang).segment(String(text ?? ''))) {
    if (!s.isWordLike) continue;
    const w = s.segment.toLocaleLowerCase(lang);
    if (w.length < 3 || stop.has(w) || /^\d+$/.test(w)) continue;
    m.set(w, (m.get(w) || 0) + 1);
  }
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], lang)).slice(0, n);
}
