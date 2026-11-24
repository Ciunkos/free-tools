/* shell.mjs: the page frame shared by every free tool and the hub. <head> (canonical, hreflang, OG, icons),
   a slim content header, the "Przemo says" callout, the FAQ, "More free tools", the author card and the shared ciunkos.com footer.
   Layouts: 'surface' (the first viewport IS the tool, e.g. white screen), 'workbench' (H1 + tool panel up top, e.g. text tools),
   'hub' (the directory). Zero inline scripts (CSP); JSON-LD blocks are merged into one @graph by ulepszLd in build.mjs. */
import { esc, jsonLd, inline } from './html.mjs';
import { BAZA, ASSETY, HUB, HUB_NAME, TOOLS, LIVE, LINKI, innyLang, sciezka, iconSvg } from './meta.mjs';
import { PERSON_ID } from './shared/schema-ld.mjs';
import { siteFooter } from './shared/site-footer.mjs';

const UI = {
  en: {
    przemo: 'Przemo says', faq: 'Questions people ask', more: 'More free tools', all: 'All free tools',
    lang: 'Polski', langTitle: 'Polska wersja', home: 'ciunkos.com',
    authorH: 'Made by one person, for real problems',
    author: 'I’m Przemysław Zalewski, a software engineer from Wrocław with 15+ years of shipping software. I build these tools when something annoys me, and I keep them free, fast and private. When your company needs a tool like this built properly, that is my day job.',
    hire: 'Hire me', call: 'Book a free 30-min call', note: 'Built with AI help (Claude). Free, no sign-up, nothing you do here leaves your browser.',
    skip: 'Skip to content'
  },
  pl: {
    przemo: 'Przemo mówi', faq: 'Pytania, które ludzie zadają', more: 'Więcej darmowych narzędzi', all: 'Wszystkie darmowe narzędzia',
    lang: 'English', langTitle: 'English version', home: 'ciunkos.com',
    authorH: 'Zrobione przez jedną osobę, na prawdziwe problemy',
    author: 'Jestem Przemysław Zalewski, programista z Wrocławia, od ponad 15 lat dowożę oprogramowanie. Takie narzędzia robię, gdy coś mnie irytuje, i zostawiam je darmowe, szybkie i prywatne. Gdy Twoja firma potrzebuje porządnie zrobionego narzędzia, to moja codzienna praca.',
    hire: 'Zatrudnij mnie', call: 'Umów darmowe 30 minut', note: 'Zrobione z pomocą AI (Claude). Za darmo, bez rejestracji, nic z tej strony nie wychodzi z Twojej przeglądarki.',
    skip: 'Przejdź do treści'
  }
};
export const ui = (lang) => UI[lang];

/** "Przemo says": the author's own story of the pain behind the tool. Required on every tool page (lint.mjs checks it). */
export function przemoSays(lang, text) {
  const U = UI[lang];
  return `<aside class="przemo" aria-label="${esc(U.przemo)}">
  <a class="przemo-face" href="${LINKI.hub[lang]}" data-track="przemo_face_clicked" tabindex="-1" aria-hidden="true"><img src="${ASSETY}/przemo-face.webp" alt="" width="64" height="64" loading="lazy" decoding="async"></a>
  <div class="przemo-bubble"><p class="przemo-label">${esc(U.przemo)}</p>${String(text).split(/\n\s*\n/).map((p) => `<p>${inline(p.trim())}</p>`).join('')}</div>
</aside>`;
}

export function faqHtml(lang, faq) {
  return `<section class="ft-faq" aria-labelledby="faq"><h2 id="faq">${esc(UI[lang].faq)}</h2>
  ${faq.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><div class="faq-a">${String(f.a).split(/\n\s*\n/).map((p) => `<p>${inline(p.trim())}</p>`).join('')}</div></details>`).join('\n  ')}
</section>`;
}
export const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: String(f.a).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*|`/g, '') } })) });

/** One tool card: icon, name, the pain it solves. `open` adds the call to action line (hub). */
export function toolCard(id, lang, open = '') {
  const t = TOOLS[id];
  return `<li><a class="tool-card" href="/${sciezka(id, lang)}" data-track="tool_link_clicked" data-to="${id}"><span class="tool-icon" aria-hidden="true">${iconSvg(id, 40)}</span><strong>${esc(t.name[lang])}</strong><span>${esc(t.pain[lang])}</span>${open ? `<span class="tool-open">${esc(open)} →</span>` : ''}</a></li>`;
}

/** Cards for the other live tools (and the hub link). Only tools that exist are linked. */
export function moreTools(lang, current) {
  const others = LIVE.filter((id) => id !== current);
  const card = (id) => toolCard(id, lang);
  return `<section class="ft-more" aria-labelledby="more-tools"><h2 id="more-tools">${esc(UI[lang].more)}</h2>
  ${others.length ? `<ul class="tool-grid">${others.map(card).join('')}</ul>` : ''}
  <p><a class="arrow-link" href="/${HUB[lang]}" data-track="tool_link_clicked" data-to="hub">${esc(UI[lang].all)} →</a></p>
</section>`;
}

function authorCard(lang, where) {
  const U = UI[lang];
  return `<section class="ft-author" aria-labelledby="author-h"><div class="ft-author-in">
  <img src="${ASSETY}/przemo-160.webp" alt="Przemysław Zalewski" width="80" height="80" loading="lazy" decoding="async">
  <div><h2 id="author-h">${esc(U.authorH)}</h2><p>${esc(U.author)}</p>
  <p class="cta-row"><a class="btn btn-primary" href="${LINKI.hub[lang]}" data-track="cta_hire_clicked" data-where="${where}">${esc(U.hire)}</a><a class="btn" href="${LINKI.calendar}" rel="noopener" data-track="cta_call_clicked" data-where="${where}">${esc(U.call)}</a></p></div>
</div></section>`;
}

/** Content header: breadcrumbs and the language switch. Sits at the top of the content (below the surface on 'surface'). */
function contentHeader(lang, crumbs, alt) {
  const U = UI[lang], inny = innyLang(lang);
  return `<header class="ft-head"><nav class="ft-crumbs" aria-label="${lang === 'pl' ? 'Okruszki' : 'Breadcrumb'}"><ol>${crumbs.map(([n, u], i) => i === crumbs.length - 1 ? `<li><span aria-current="page">${esc(n)}</span></li>` : `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ol></nav>
  <a class="ft-lang" href="/${alt[inny]}" hreflang="${inny}" lang="${inny}" title="${esc(U.langTitle)}" data-track="lang_switched" data-to="${inny}">${esc(U.lang)}</a></header>`;
}

/**
 * Full page.
 * @param {object} o
 * @param {string} o.id  tool id or 'hub'
 * @param {'surface'|'workbench'|'hub'} o.layout
 * @param {{en:string,pl:string}} o.path  page paths without the leading slash
 * @param {object} o.C  copy: title, metaDescription, h1, lead, crumb, faq?, przemo?, ogImage?
 */
export function shell({ id, layout, lang, wersja, path, C, ld = [], surface = '', tool = '', body = '', styles = [], scripts = [], updated, headExtra = '', themeColor = '#ffffff' }) {
  const U = UI[lang], adres = BAZA + '/' + path[lang];
  const crumbs = [[U.home, BAZA + '/'], [HUB_NAME[lang], '/' + HUB[lang]]];
  if (id !== 'hub') crumbs.push([C.crumb, '/' + path[lang]]);
  const crumbLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: u.startsWith('http') ? u : BAZA + u })) };
  const og = BAZA + ASSETY + '/og/' + id + '-' + lang + '.jpg?v=' + wersja.slice(-7);
  const v = '?v=' + wersja;
  const intro = `<h1>${esc(C.h1)}</h1>
  <p class="ft-lead">${inline(C.lead)}</p>
  ${C.przemo ? przemoSays(lang, C.przemo) : ''}`;
  return `<!doctype html>
<html lang="${lang}" data-page="${id}" data-layout="${layout}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="format-detection" content="telephone=no">
<title>${esc(C.title)}</title>
<meta name="description" content="${esc(C.metaDescription)}">
<meta name="author" content="Przemysław Zalewski">
<meta name="theme-color" content="${themeColor}">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
<link rel="canonical" href="${adres}">
<link rel="alternate" hreflang="en" href="${BAZA}/${path.en}">
<link rel="alternate" hreflang="pl" href="${BAZA}/${path.pl}">
<link rel="alternate" hreflang="x-default" href="${BAZA}/${path.en}">
<link rel="icon" href="${ASSETY}/icons/${id}.svg${v}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${ASSETY}/icons/${id}-180.png${v}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ciunkos.com">
<meta property="og:locale" content="${lang === 'pl' ? 'pl_PL' : 'en_US'}">
<meta property="og:locale:alternate" content="${lang === 'pl' ? 'en_US' : 'pl_PL'}">
<meta property="og:title" content="${esc(C.ogTitle || C.title)}">
<meta property="og:description" content="${esc(C.metaDescription)}">
<meta property="og:url" content="${adres}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(C.ogTitle || C.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@Ciunkos">
<meta name="twitter:creator" content="@Ciunkos">
<link rel="stylesheet" href="${ASSETY}/app.css${v}">
${styles.map((s) => `<link rel="stylesheet" href="${ASSETY}/${s}${v}">`).join('\n')}
<link rel="stylesheet" href="${ASSETY}/site-footer.css${v}">
${headExtra}
${[...ld, crumbLd].map((x) => `<script type="application/ld+json">${jsonLd(x)}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#content">${esc(U.skip)}</a>
${layout === 'surface' ? surface : ''}
<main id="content" class="ft-main" tabindex="-1">
${contentHeader(lang, crumbs, path)}
<article class="ft-article">
  ${layout === 'workbench' ? `<h1>${esc(C.h1)}</h1>\n  <p class="ft-lead">${inline(C.lead)}</p>\n  ${tool}\n  ${C.przemo ? przemoSays(lang, C.przemo) : ''}` : intro}
  ${body}
  ${C.faq ? faqHtml(lang, C.faq) : ''}
</article>
${id === 'hub' ? '' : moreTools(lang, id)}
${authorCard(lang, id)}
</main>
${siteFooter({ lang, updated, current: '/' + path[lang], alternate: { en: '/' + path.en, pl: '/' + path.pl }, note: U.note })}
<script data-posthog-config="" src="${ASSETY}/app.mjs${v}" type="module"></script>
${scripts.map((s) => `<script src="${ASSETY}/${s}${v}" type="module"></script>`).join('\n')}
</body>
</html>
`;
}

export const webApp = ({ id, lang, url, C }) => ({
  '@context': 'https://schema.org', '@type': 'WebApplication', '@id': url + '#app', name: TOOLS[id].name[lang], url, description: C.metaDescription,
  applicationCategory: TOOLS[id].category || 'UtilitiesApplication', operatingSystem: 'Any (web browser)', browserRequirements: 'Requires JavaScript',
  inLanguage: lang, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, author: { '@id': PERSON_ID }
});
export { PERSON_ID };

const LOCK = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
/** "Runs in your browser" note for the workbench footer. */
export const privateNote = (lang, text) => `<span class="private">${LOCK}${esc(text || (lang === 'pl' ? 'Wszystko dzieje się w Twojej przeglądarce. Nic nie jest wysyłane ani zapisywane.' : 'Everything happens in your browser. Nothing is sent or saved.'))}</span>`;
/** Strings for the client script, as a JSON data block (not executed, so the CSP allows it). */
export const i18nScript = (obj) => `<script type="application/json" id="i18n">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

/** A workbench tool page: WebPage + WebApplication + FAQ (+ extra LD), its client script and stylesheet. */
export function toolPage({ id, lang, wersja, updated, C, tool, body, ld = [], about }) {
  const path = { en: sciezka(id, 'en'), pl: sciezka(id, 'pl') };
  const url = BAZA + '/' + path[lang];
  const slug = TOOLS[id].slug.en;
  const graph = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: C.title, description: C.metaDescription, inLanguage: lang, mainEntity: { '@id': url + '#app' }, ...(about ? { about: { '@type': 'Thing', name: about } } : {}) },
    webApp({ id, lang, url, C }),
    ...ld.map((x) => (typeof x === 'function' ? x(url) : x)),
    faqLd(C.faq)
  ];
  return shell({ id, layout: 'workbench', lang, wersja, path, C, ld: graph, tool, body, updated, styles: [`${slug}/style.css`], scripts: [`${slug}/app.mjs`], themeColor: TOOLS[id].icon.bg });
}
