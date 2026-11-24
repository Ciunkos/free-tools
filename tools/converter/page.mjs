/* File converter: the directory page (/free-tools/file-converter) and one page per x-to-y pair. The first screen is the
   tool, White-screen simple: one line, one big button, drop anywhere. Copy per pair comes from pairs.mjs and formats.mjs. */
import { esc, inline } from '../../src/html.mjs';
import { BAZA, HUB, HUB_NAME, TOOLS, sciezka } from '../../src/meta.mjs';
import { shell, faqLd, webApp, i18nScript } from '../../src/shell.mjs';
import { FORMATS, TARGETS, fmtName } from './formats.mjs';
import { PAIRS, PAIR, GROUPS, slugOf } from './pairs.mjs';

export const ID = 'converter';
/* English article as format names are read aloud: an MP3, an SVG, a MOV, a HEIC. */
const AN = new Set(['MP3', 'MP4', 'MKV', 'M4A', 'AVIF', 'SVG', 'OGG', 'AAC']);
const art = (name) => (AN.has(name) ? 'an' : 'a');
const ACCEPT = 'video/*,audio/*,image/*,.heic,.heif,.mkv,.flac,.ogg,.opus,.aac,.m4a,.avif,.svg';

const UI = {
  en: {
    pairH1: (f, t) => `${f} to ${t} converter`, pairTitle: (f, t) => `${f} to ${t} Converter: Free, No Upload, in Your Browser`,
    pairDesc: (f, t, hook) => `Convert ${f} to ${t} for free, right in your browser. ${hook} Your files are never uploaded.`,
    big: (f, t) => `Drop ${art(f)} ${f === 'Video' ? 'video' : f} file, get ${art(t)} ${t}.`,
    dirH1: 'File converter', dirBig: 'Drop any file to convert it.', choose: 'Choose a file', chooseMore: 'Choose files',
    hint: 'or drop it anywhere · converted on your computer, never uploaded', to: 'Convert to', more: 'How it works ↓',
    pickTarget: 'Convert to:', converting: 'Converting…', reading: 'Reading the file…', loading: 'Loading the converter…',
    download: 'Download', downloadAll: 'Download all', another: 'Convert another', cancel: 'Cancel', retry: 'Try again', options: 'Options',
    done: 'Done', left: 'about {t} left', canceled: 'Canceled.', sizes: '{a} → {b}',
    err: {
      unsupported: 'This file type is not supported yet.', 'no-target': 'This file cannot be converted to {to}. Pick another format above.',
      'no-audio': 'This video has no sound to save.', 'no-video': 'This file has no video picture.', 'no-webcodecs': 'Your browser cannot convert video or audio. Please use a recent Chrome, Edge, Safari or Firefox.',
      'no-encoder': 'Your browser cannot save {to} files. Try Chrome or Firefox, or pick another format.', heic: 'This HEIC file could not be read.', generic: 'Something went wrong while converting: {msg}'
    },
    notice: { 'no-h264': 'Your browser cannot make MP4 video, so you got WebM instead. Chrome, Edge and Safari can make MP4.', 'gif-limited': 'The GIF covers the first {s} seconds. Set a start and end in Options for another part.' },
    o: { quality: 'Sound quality', kbps: 'kbps', size: 'Size', original: 'Original', width: 'Width', fps: 'Frames per second', start: 'Start', end: 'End', startPh: '0:00', endPh: 'end', imgQuality: 'Quality', scale: 'Scale' },
    dirTitle: 'File Converter: MOV to GIF, MP4 to MP3, HEIC to JPG, No Upload',
    dirDesc: 'Free file converter in your browser: video to MP3 or GIF, MOV to MP4, HEIC and WebP to JPG or PNG, audio to MP3. Files are never uploaded.',
    dirLead: 'Video, audio and images, converted right here on your computer. Pick a conversion below, or drop any file above and choose the format.',
    howH: (f, t) => `How to convert ${f} to ${t}`,
    steps: (f, t) => [['Drop the file', `Drop your ${f} file on the page, or press “Choose a file”. Several files at once work too.`], ['Wait a moment', `It converts to ${t} straight away, on your computer. Big videos take a while; the bar shows how long.`], ['Download', `Press “Download” to save the ${t}. Want another quality or size? Open “Options” and it converts again.`]],
    vsH: (f, t) => `${f} vs ${t}`, rows: [['what', 'What it is'], ['from', 'Where it comes from'], ['good', 'Good at'], ['limit', 'Watch out for']],
    otherH: 'Other conversions', allLink: 'All conversions',
    przemo: 'I convert files every week: an iPhone video someone needs as an MP4, a screen recording that should be a GIF in a ticket, the sound of a talk as an MP3, HEIC photos for a form that wants JPG. The converter sites I used upload your files to their servers and hide the real button between three fake ones.\n\nThis one does it on your own computer with the codecs your browser already has. Drop a file, get the file, done.',
    faq: [
      { q: 'Is it free?', a: 'Yes. No account, no watermark, no daily limit and no ads. I built it for myself and keep it up for everyone.' },
      { q: 'Are my files uploaded anywhere?', a: 'No. Conversion runs in your browser, on your computer, with the WebCodecs API and WebAssembly. Files never leave your device, which you can check in the network panel of your browser’s developer tools. That is also why it works for private or confidential files.' },
      { q: 'How big can a file be?', a: 'Videos up to about 2 GB, read in chunks so they do not fill your memory. The result is built in memory, so on phones keep videos under a few hundred megabytes.' },
      { q: 'Which browsers work?', a: 'Recent Chrome, Edge, Safari and Firefox. Video and audio need WebCodecs (Safari 16.4 or newer, Firefox 130 or newer). Firefox cannot make H.264 video, so MP4 output there comes out as WebM. Images work in every modern browser.' },
      { q: 'Does it work offline?', a: 'Yes, once the page and the converter have loaded. Nothing else is downloaded while converting.' }
    ],
    yt: { q: 'Can it download a video from YouTube?', a: 'No. YouTube’s terms do not allow downloading, and browsers cannot read YouTube’s video files anyway. For offline viewing use YouTube Premium; for your own uploads, YouTube Studio has a download button. Once you have a file of your own, this page converts it.' }
  },
  pl: {
    pairH1: (f, t) => `Konwerter ${f} na ${t}`, pairTitle: (f, t) => `Konwerter ${f} na ${t}: za darmo, bez wysyłania plików`,
    pairDesc: (f, t, hook) => `Zamień ${f} na ${t} za darmo, w przeglądarce. ${hook} Pliki nigdy nie są nigdzie wysyłane.`,
    big: (f, t) => `Upuść plik ${f}, dostaniesz ${t}.`,
    dirH1: 'Konwerter plików', dirBig: 'Upuść dowolny plik, żeby go przekonwertować.', choose: 'Wybierz plik', chooseMore: 'Wybierz pliki',
    hint: 'albo upuść go w dowolnym miejscu · konwersja na Twoim komputerze, bez wysyłania', to: 'Zamień na', more: 'Jak to działa ↓',
    pickTarget: 'Zamień na:', converting: 'Konwertuję…', reading: 'Czytam plik…', loading: 'Ładuję konwerter…',
    download: 'Pobierz', downloadAll: 'Pobierz wszystkie', another: 'Konwertuj kolejny', cancel: 'Anuluj', retry: 'Spróbuj ponownie', options: 'Opcje',
    done: 'Gotowe', left: 'zostało około {t}', canceled: 'Anulowano.', sizes: '{a} → {b}',
    err: {
      unsupported: 'Ten typ pliku nie jest jeszcze obsługiwany.', 'no-target': 'Tego pliku nie da się zamienić na {to}. Wybierz inny format u góry.',
      'no-audio': 'Ten film nie ma dźwięku do zapisania.', 'no-video': 'Ten plik nie ma obrazu wideo.', 'no-webcodecs': 'Twoja przeglądarka nie umie konwertować wideo ani audio. Użyj aktualnego Chrome’a, Edge’a, Safari albo Firefoxa.',
      'no-encoder': 'Twoja przeglądarka nie umie zapisywać plików {to}. Spróbuj w Chrome albo Firefoksie albo wybierz inny format.', heic: 'Nie udało się odczytać tego pliku HEIC.', generic: 'Coś poszło nie tak podczas konwersji: {msg}'
    },
    notice: { 'no-h264': 'Twoja przeglądarka nie umie zrobić wideo MP4, więc dostajesz WebM. MP4 zrobią Chrome, Edge i Safari.', 'gif-limited': 'GIF obejmuje pierwsze {s} sekund. Ustaw początek i koniec w Opcjach, żeby wybrać inny fragment.' },
    o: { quality: 'Jakość dźwięku', kbps: 'kb/s', size: 'Rozmiar', original: 'Oryginalny', width: 'Szerokość', fps: 'Klatki na sekundę', start: 'Początek', end: 'Koniec', startPh: '0:00', endPh: 'koniec', imgQuality: 'Jakość', scale: 'Skala' },
    dirTitle: 'Konwerter plików: MOV na GIF, MP4 na MP3, HEIC na JPG',
    dirDesc: 'Darmowy konwerter plików w przeglądarce: wideo na MP3 albo GIF, MOV na MP4, HEIC i WebP na JPG albo PNG, audio na MP3. Bez wysyłania plików.',
    dirLead: 'Wideo, audio i obrazy konwertowane tutaj, na Twoim komputerze. Wybierz konwersję poniżej albo upuść dowolny plik wyżej i wybierz format.',
    howH: (f, t) => `Jak zamienić ${f} na ${t}`,
    steps: (f, t) => [['Upuść plik', `Upuść plik ${f} na stronę albo naciśnij „Wybierz plik”. Kilka plików naraz też działa.`], ['Chwilę poczekaj', `Plik od razu zamienia się na ${t}, na Twoim komputerze. Duże filmy trwają dłużej; pasek pokazuje ile.`], ['Pobierz', `Naciśnij „Pobierz”, żeby zapisać ${t}. Chcesz inną jakość albo rozmiar? Otwórz „Opcje”, a plik przekonwertuje się ponownie.`]],
    vsH: (f, t) => `${f} czy ${t}`, rows: [['what', 'Co to jest'], ['from', 'Skąd się bierze'], ['good', 'Do czego dobry'], ['limit', 'Na co uważać']],
    otherH: 'Inne konwersje', allLink: 'Wszystkie konwersje',
    przemo: 'Konwertuję pliki co tydzień: film z iPhone’a, który ktoś potrzebuje jako MP4, nagranie ekranu, które ma być GIF-em w zgłoszeniu, dźwięk z wykładu jako MP3, zdjęcia HEIC do formularza, który chce JPG. Strony z konwerterami, których używałem, wysyłają pliki na swoje serwery i chowają prawdziwy przycisk między trzema fałszywymi.\n\nTen robi to na Twoim komputerze, kodekami, które Twoja przeglądarka już ma. Upuszczasz plik, dostajesz plik, gotowe.',
    faq: [
      { q: 'Czy to jest darmowe?', a: 'Tak. Bez konta, bez znaku wodnego, bez dziennego limitu i bez reklam. Zrobiłem to dla siebie i trzymam dla wszystkich.' },
      { q: 'Czy moje pliki są gdzieś wysyłane?', a: 'Nie. Konwersja działa w Twojej przeglądarce, na Twoim komputerze, przez WebCodecs i WebAssembly. Pliki nie opuszczają urządzenia, co sprawdzisz w panelu sieci w narzędziach deweloperskich przeglądarki. Dlatego nadaje się też do prywatnych i poufnych plików.' },
      { q: 'Jak duży może być plik?', a: 'Filmy do około 2 GB, czytane po kawałku, żeby nie zapchać pamięci. Wynik powstaje w pamięci, więc na telefonie trzymaj filmy poniżej kilkuset megabajtów.' },
      { q: 'Jakie przeglądarki działają?', a: 'Aktualne Chrome, Edge, Safari i Firefox. Wideo i audio wymagają WebCodecs (Safari 16.4 lub nowsze, Firefox 130 lub nowszy). Firefox nie umie zrobić wideo H.264, więc MP4 wychodzi tam jako WebM. Obrazy działają w każdej nowoczesnej przeglądarce.' },
      { q: 'Czy działa bez internetu?', a: 'Tak, po załadowaniu strony i konwertera. Podczas konwersji nic więcej nie jest pobierane.' }
    ],
    yt: { q: 'Czy pobierze film z YouTube?', a: 'Nie. Regulamin YouTube nie pozwala na pobieranie, a przeglądarka i tak nie może czytać plików wideo YouTube. Do oglądania offline służy YouTube Premium; własne filmy pobierzesz przyciskiem w YouTube Studio. Gdy masz już własny plik, ta strona go przekonwertuje.' }
  }
};

const hooks = {
  en: { image: 'Same size in pixels, good quality.', 'video-audio': 'Keep just the sound.', gif: 'Light, looping, ready for chat.', video: 'Plays on every phone and TV.', audio: 'Plays on every device.' },
  pl: { image: 'Ten sam rozmiar w pikselach, dobra jakość.', 'video-audio': 'Zostaw sam dźwięk.', gif: 'Lekki, zapętlony, gotowy na czat.', video: 'Zagra na każdym telefonie i telewizorze.', audio: 'Zagra na każdym urządzeniu.' }
};

const UPLOAD = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 16V4m0 0-5 5m5-5 5 5M4 20h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function surface(lang, U, { from, to, h1, big, paths }) {
  const inny = lang === 'en' ? 'pl' : 'en';
  const kind = from ? FORMATS[from].kind : null;
  const targets = kind ? TARGETS[kind] : [];
  const o = U.o;
  return `${i18nScript({ lang, ...U, steps: undefined, pairH1: undefined, pairTitle: undefined, pairDesc: undefined, big: undefined, howH: undefined, vsH: undefined, faq: undefined, yt: undefined, przemo: undefined, pairs: Object.fromEntries(PAIRS.map((p) => [p.from + '>' + p.to, '/' + (lang === 'pl' ? HUB.pl : HUB.en) + '/' + slugOf(p, lang)])), names: Object.fromEntries(Object.keys(FORMATS).map((k) => [k, fmtName(k, lang)])), targets: TARGETS })}
<section class="drop" id="drop" data-from="${from || ''}" data-to="${to || ''}" aria-labelledby="drop-h">
  <div class="drop-top"><a href="/${paths.hub}" class="drop-crumb">ciunkos.com<span aria-hidden="true"> / </span>${esc(HUB_NAME[lang])}</a><a class="drop-lang" href="/${paths[inny]}" hreflang="${inny}" lang="${inny}" data-track="lang_switched" data-to="${inny}">${inny === 'pl' ? 'Polski' : 'English'}</a></div>
  <div class="drop-center">
    ${from ? `<div class="pill"><span class="pill-from" id="pill-from">${esc(fmtName(from, lang))}</span><span class="pill-arrow" aria-hidden="true">→</span><label class="sr" for="to">${esc(U.to)}</label><select id="to" class="pill-select">${targets.map((t) => `<option value="${t}"${t === to ? ' selected' : ''}>${esc(fmtName(t, lang))}</option>`).join('')}</select></div>` : `<div class="pill" hidden><span class="pill-from" id="pill-from"></span><span class="pill-arrow" aria-hidden="true">→</span><label class="sr" for="to">${esc(U.to)}</label><select id="to" class="pill-select"></select></div>`}
    <h1 class="drop-h" id="drop-h">${esc(h1)}</h1>
    <p class="drop-big" id="drop-big">${esc(big)}</p>
    <div class="drop-idle" id="idle">
      <label class="drop-btn" for="file">${UPLOAD}<span>${esc(U.choose)}</span></label><input type="file" id="file" class="sr" multiple accept="${ACCEPT}">
      <p class="drop-hint">${esc(U.hint)}</p>
    </div>
    <div class="drop-pick" id="pick-target" hidden><p>${esc(U.pickTarget)}</p><div class="drop-targets" id="targets"></div></div>
    <ul class="jobs" id="jobs" aria-live="polite"></ul>
    <div class="drop-after" id="after" hidden><button type="button" class="drop-btn drop-btn-sm" id="all" hidden>${esc(U.downloadAll)}</button><button type="button" class="link-btn" id="another">${esc(U.another)}</button></div>
    <details class="opts" id="opts"${to ? '' : ' hidden'}><summary>${esc(U.options)}</summary><div class="opts-in">
      <label data-for="mp3 m4a">${esc(o.quality)} <select name="bitrate"><option value="128">128 ${o.kbps}</option><option value="192" selected>192 ${o.kbps}</option><option value="320">320 ${o.kbps}</option></select></label>
      <label data-for="mp4 webm">${esc(o.size)} <select name="height"><option value="0" selected>${esc(o.original)}</option><option value="1080">1080p</option><option value="720">720p</option><option value="480">480p</option></select></label>
      <label data-for="gif">${esc(o.width)} <select name="width"><option value="320">320 px</option><option value="480" selected>480 px</option><option value="640">640 px</option><option value="800">800 px</option></select></label>
      <label data-for="gif">${esc(o.fps)} <select name="fps"><option>8</option><option>10</option><option selected>12</option><option>15</option><option>20</option></select></label>
      <label data-for="mp3 m4a wav mp4 webm gif">${esc(o.start)} <input name="start" inputmode="decimal" placeholder="${o.startPh}" size="7"></label>
      <label data-for="mp3 m4a wav mp4 webm gif">${esc(o.end)} <input name="end" inputmode="decimal" placeholder="${o.endPh}" size="7"></label>
      <label data-for="jpg webp">${esc(o.imgQuality)} <select name="quality"><option value="0.75">75%</option><option value="0.85">85%</option><option value="0.9" selected>90%</option><option value="1">100%</option></select></label>
      <label data-for="png" data-from="svg">${esc(o.scale)} <select name="scale"><option value="1">1×</option><option value="2" selected>2×</option><option value="4">4×</option></select></label>
    </div></details>
  </div>
  <a class="drop-more" href="#content">${esc(U.more)}</a>
</section>`;
}

function pairBody(lang, U, p) {
  const f = fmtName(p.from, lang), t = fmtName(p.to, lang);
  const F = FORMATS[p.from][lang], T = FORMATS[p.to][lang];
  const others = PAIRS.filter((x) => x.group === p.group && x.id !== p.id);
  return `
<section aria-labelledby="how"><h2 id="how">${esc(U.howH(f, t))}</h2>
  <ol class="steps">${U.steps(f, t).map(([h, x]) => `<li><h3>${esc(h)}</h3><p>${esc(x)}</p></li>`).join('')}</ol>
</section>
<section aria-labelledby="vs"><h2 id="vs">${esc(U.vsH(f, t))}</h2>
  <div class="table-wrap" role="region" aria-label="${esc((lang === 'pl' ? 'Tabela: ' : 'Table: ') + U.vsH(f, t))}" tabindex="0"><table class="ref">
    <thead><tr><td></td><th scope="col">${esc(f)}</th><th scope="col">${esc(t)}</th></tr></thead>
    <tbody>${U.rows.map(([k, label]) => `<tr><th scope="row">${esc(label)}</th><td>${esc(F[k])}</td><td>${esc(T[k])}</td></tr>`).join('')}</tbody>
  </table></div>
</section>
<section aria-labelledby="other"><h2 id="other">${esc(U.otherH)}</h2>
  <ul class="pair-links">${others.map((x) => `<li><a href="/${lang === 'pl' ? HUB.pl : HUB.en}/${slugOf(x, lang)}" data-track="tool_link_clicked" data-to="${x.id}">${esc(fmtName(x.from, lang))} → ${esc(fmtName(x.to, lang))}</a></li>`).join('')}<li><a class="arrow-link" href="/${sciezka(ID, lang)}">${esc(U.allLink)} →</a></li></ul>
</section>`;
}

function dirBody(lang, U) {
  return Object.entries(GROUPS).map(([g, name]) => `
<section aria-labelledby="g-${g}"><h2 id="g-${g}">${esc(name[lang])}</h2>
  <ul class="pair-links">${PAIRS.filter((p) => p.group === g).map((x) => `<li><a href="/${lang === 'pl' ? HUB.pl : HUB.en}/${slugOf(x, lang)}" data-track="tool_link_clicked" data-to="${x.id}">${esc(fmtName(x.from, lang))} → ${esc(fmtName(x.to, lang))}</a></li>`).join('')}</ul>
</section>`).join('');
}

export function render({ lang, wersja, updated, pair }) {
  const U = UI[lang];
  const p = pair ? PAIR[pair] : null;
  const path = p ? { en: HUB.en + '/' + slugOf(p, 'en'), pl: HUB.pl + '/' + slugOf(p, 'pl') } : { en: sciezka(ID, 'en'), pl: sciezka(ID, 'pl') };
  const url = BAZA + '/' + path[lang];
  const f = p && fmtName(p.from, lang), t = p && fmtName(p.to, lang);
  const faq = p ? [...p.faq[lang], ...U.faq.slice(0, 2), ...(p.group === 'video-audio' || p.group === 'video' || p.group === 'gif' ? [U.yt] : []), ...U.faq.slice(2)] : [...U.faq, U.yt];
  const C = p
    ? { title: U.pairTitle(f, t), metaDescription: U.pairDesc(f, t, hooks[lang][p.group]), crumb: U.pairH1(f, t), h1: U.pairH1(f, t), lead: p.note[lang], przemo: U.przemo, faq, ogTitle: U.pairH1(f, t) }
    : { title: U.dirTitle, metaDescription: U.dirDesc, crumb: U.dirH1, h1: U.dirH1, lead: U.dirLead, przemo: U.przemo, faq };
  const app = { ...webApp({ id: ID, lang, url, C }), name: C.h1 };
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: C.title, description: C.metaDescription, inLanguage: lang, mainEntity: { '@id': url + '#app' } },
    app,
    ...(p ? [{ '@context': 'https://schema.org', '@type': 'HowTo', '@id': url + '#how', name: U.howH(f, t), inLanguage: lang, tool: { '@type': 'HowToTool', name: C.h1, url }, step: U.steps(f, t).map(([name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text, url: url + '#how' })) }] : []),
    faqLd(faq)
  ];
  const paths = { ...path, hub: lang === 'pl' ? HUB.pl : HUB.en };
  const og = p ? `pair-${p.from}-${p.to}` : ID;
  return shell({
    id: ID, layout: 'drop', lang, wersja, path, C, ld, updated, ogId: og,
    surface: surface(lang, U, { from: p ? p.from : null, to: p ? p.to : null, h1: C.h1, big: p ? U.big(f, t) : U.dirBig, paths }),
    body: p ? pairBody(lang, U, p) : dirBody(lang, U),
    styles: ['file-converter/style.css'], scripts: ['file-converter/app.mjs'], themeColor: TOOLS[ID].icon.bg
  });
}
