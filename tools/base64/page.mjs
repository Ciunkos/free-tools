/* Base64: copy (EN, PL), the two-pane tool and the reference below it. Client: app.mjs + b64.mjs. */
import { esc, inline } from '../../src/html.mjs';
import { toolPage, privateNote, i18nScript } from '../../src/shell.mjs';

export const ID = 'base64';

const C = {
  en: {
    title: 'Base64 Encode and Decode Online: Text and Files, UTF-8',
    metaDescription: 'Encode text or files to Base64 and decode Base64 back as you type. UTF-8 safe, URL-safe Base64, data URIs and file previews. Runs in your browser.',
    crumb: 'Base64',
    h1: 'Base64 encode and decode, both ways as you type',
    lead: 'Type on the left to encode, or paste Base64 on the right to decode. Polish letters and emoji stay intact, URL-safe Base64 and data URIs just work, and files convert too. Nothing leaves your browser.',
    przemo: 'Base64 turns up in my work every week: a value in a Kubernetes secret, an image inlined in an email signature, an API that wants a file as a string, a token I want to peek into. The online converters I tried turned Polish letters into garbage, choked on URL-safe input, or uploaded my file to their server.\n\nSo this one converts both ways as you type, keeps ą, ę and emoji intact, handles files, and never sends anything anywhere.',
    ui: {
      text: 'Text', code: 'Base64', copy: 'Copy', clear: 'Clear', copied: 'Copied', paste: 'Paste',
      textPh: 'Type or paste text to encode…', codePh: 'Paste Base64 to decode…',
      url: 'URL-safe (- and _)', pad: 'Padding (=)', wrap: 'Line breaks every 76 (MIME)',
      file: 'Encode a file', drop: 'or drop a file anywhere on this panel', dataUri: 'Copy as data URI',
      encodedFile: '{name} · {size} encoded', binary: 'Binary data, {size}, looks like {type}.', download: 'Download file',
      chars: '{n} characters', bytes: '{n} bytes', tooBig: 'Files up to 50 MB, please; bigger ones slow the browser down.',
      invalid: 'Not valid Base64: {why}.', dirEncode: 'Encoding text to Base64', dirDecode: 'Decoding Base64 to text'
    },
    useH: 'How to use it',
    use: [
      '**Encode:** type or paste text in the left box. The Base64 appears on the right as you type.',
      '**Decode:** paste Base64 in the right box. The text appears on the left. If it is not text, you get a preview (for images) and a download button.',
      '**Files:** press **Encode a file** or drop one on the panel. Copy the Base64, or copy it as a data URI ready for HTML, CSS or an email signature.'
    ],
    variantsH: 'Standard, URL-safe and MIME Base64',
    variantsHead: ['Variant', 'Characters', 'Where you meet it'],
    variants: [
      ['Standard (RFC 4648)', '`A–Z a–z 0–9 + /` and `=` padding', 'APIs, JSON, data URIs, most tools'],
      ['URL-safe (base64url)', '`- _` instead of `+ /`, padding often dropped', 'JWTs, URLs and file names'],
      ['MIME', 'Standard, with a line break every 76 characters', 'Email attachments, PEM keys and certificates']
    ],
    variantsP: 'The decoder accepts all three: it ignores line breaks and spaces, adds missing padding and understands URL-safe characters.',
    notH: 'Base64 is not encryption',
    notP: 'Base64 only changes how bytes are written, so they survive places made for text. Anyone can decode it, in one click, as this page shows. Never use it to hide a password or a secret. It also makes data about a third bigger: every 3 bytes become 4 characters.',
    faq: [
      { q: 'Why does my decoded text show strange characters like Ã³?', a: 'The Base64 holds UTF-8 bytes, but the tool that decoded it read them as Latin-1 or Windows-1250. This page always decodes as UTF-8, so ó, ł, ą and emoji come back correctly. If text was encoded in an old code page, it was never UTF-8 to begin with.' },
      { q: 'Why is Base64 longer than the original?', a: 'Base64 writes every 3 bytes as 4 characters, so the result is about 33% longer, plus up to two `=` signs of padding. Line breaks in MIME add a little more.' },
      { q: 'What is URL-safe Base64 (base64url)?', a: 'The same encoding with `-` and `_` instead of `+` and `/`, which have special meaning in URLs and file names. JWTs use it, usually without padding. Tick URL-safe to produce it; the decoder reads it either way.' },
      { q: 'Do I need the = padding?', a: 'Most decoders, including this one, work without it. Some strict ones need it. Keep it unless the place you paste into says otherwise, as JWTs and many URLs do.' },
      { q: 'How do I make a data URI for an image?', a: 'Press Encode a file, pick the image, then Copy as data URI. You get `data:image/png;base64,…`, ready for an `<img src>` in HTML or a `url()` in CSS. Keep data URIs for small images; large ones make pages heavy.' },
      { q: 'Is my file uploaded anywhere?', a: 'No. The file is read and encoded by your browser. Nothing is uploaded, saved or put in the URL. You can confirm it in the network panel of your browser’s developer tools.' },
      { q: 'How big can a file be?', a: 'Up to 50 MB. Larger files work in principle but make the browser slow, because the Base64 text is a third bigger than the file and has to sit in the page.' },
      { q: 'Does it work offline?', a: 'Yes. Once the page has loaded, encoding and decoding need no connection.' }
    ]
  },
  pl: {
    title: 'Base64: kodowanie i dekodowanie online, tekst i pliki',
    metaDescription: 'Zakoduj tekst albo plik do Base64 i zdekoduj Base64 z powrotem na bieżąco. Polskie znaki, Base64 URL-safe, data URI i podgląd plików, wszystko w przeglądarce.',
    crumb: 'Base64',
    h1: 'Base64: koduj i dekoduj na bieżąco, w obie strony',
    lead: 'Pisz po lewej, żeby zakodować, albo wklej Base64 po prawej, żeby zdekodować. Polskie znaki i emoji zostają nienaruszone, Base64 URL-safe i data URI po prostu działają, pliki też. Nic nie opuszcza Twojej przeglądarki.',
    przemo: 'Base64 pojawia się w mojej pracy co tydzień: wartość w sekrecie Kubernetesa, obrazek wklejony w stopkę maila, API, które chce plik jako tekst, token, do którego chcę zajrzeć. Konwertery online, które sprawdziłem, zamieniały polskie litery w krzaki, wykładały się na Base64 URL-safe albo wysyłały mój plik na swój serwer.\n\nTen konwertuje w obie strony na bieżąco, zachowuje ą, ę i emoji, obsługuje pliki i niczego nigdzie nie wysyła.',
    ui: {
      text: 'Tekst', code: 'Base64', copy: 'Kopiuj', clear: 'Wyczyść', copied: 'Skopiowano', paste: 'Wklej',
      textPh: 'Wpisz albo wklej tekst do zakodowania…', codePh: 'Wklej Base64 do zdekodowania…',
      url: 'URL-safe (- i _)', pad: 'Dopełnienie (=)', wrap: 'Nowa linia co 76 znaków (MIME)',
      file: 'Zakoduj plik', drop: 'albo upuść plik w dowolnym miejscu panelu', dataUri: 'Kopiuj jako data URI',
      encodedFile: '{name} · {size} zakodowany', binary: 'Dane binarne, {size}, wygląda na {type}.', download: 'Pobierz plik',
      chars: '{n} znaków', bytes: '{n} bajtów', tooBig: 'Pliki do 50 MB; większe spowalniają przeglądarkę.',
      invalid: 'To nie jest poprawne Base64: {why}.', dirEncode: 'Kodowanie tekstu do Base64', dirDecode: 'Dekodowanie Base64 do tekstu'
    },
    useH: 'Jak używać',
    use: [
      '**Kodowanie:** wpisz albo wklej tekst w lewe pole. Base64 pojawia się po prawej w trakcie pisania.',
      '**Dekodowanie:** wklej Base64 w prawe pole. Tekst pojawia się po lewej. Jeśli to nie tekst, dostaniesz podgląd (dla obrazków) i przycisk pobierania.',
      '**Pliki:** naciśnij **Zakoduj plik** albo upuść plik na panel. Skopiuj Base64 albo skopiuj go jako data URI, gotowe do HTML-a, CSS-a albo stopki maila.'
    ],
    variantsH: 'Base64 standardowe, URL-safe i MIME',
    variantsHead: ['Wariant', 'Znaki', 'Gdzie go spotkasz'],
    variants: [
      ['Standardowe (RFC 4648)', '`A–Z a–z 0–9 + /` i dopełnienie `=`', 'API, JSON, data URI, większość narzędzi'],
      ['URL-safe (base64url)', '`- _` zamiast `+ /`, dopełnienie często pominięte', 'JWT, adresy URL i nazwy plików'],
      ['MIME', 'Standardowe, z nową linią co 76 znaków', 'Załączniki e-mail, klucze i certyfikaty PEM']
    ],
    variantsP: 'Dekoder przyjmuje wszystkie trzy: pomija nowe linie i spacje, dodaje brakujące dopełnienie i rozumie znaki URL-safe.',
    notH: 'Base64 to nie szyfrowanie',
    notP: 'Base64 zmienia tylko sposób zapisu bajtów, żeby przetrwały w miejscach przeznaczonych na tekst. Każdy zdekoduje go jednym kliknięciem, jak pokazuje ta strona. Nigdy nie ukrywaj nim hasła ani sekretu. Dane rosną też o około jedną trzecią: każde 3 bajty to 4 znaki.',
    faq: [
      { q: 'Dlaczego zdekodowany tekst ma krzaki typu Ã³ zamiast ó?', a: 'Base64 zawiera bajty UTF-8, ale narzędzie, które je zdekodowało, odczytało je jako Latin-1 albo Windows-1250. Ta strona zawsze dekoduje jako UTF-8, więc ó, ł, ą i emoji wracają poprawnie. Jeśli tekst zakodowano w starej stronie kodowej, od początku nie był w UTF-8.' },
      { q: 'Dlaczego Base64 jest dłuższe od oryginału?', a: 'Base64 zapisuje każde 3 bajty jako 4 znaki, więc wynik jest o około 33% dłuższy, plus do dwóch znaków `=` dopełnienia. Nowe linie w MIME dokładają jeszcze trochę.' },
      { q: 'Co to jest Base64 URL-safe (base64url)?', a: 'To samo kodowanie z `-` i `_` zamiast `+` i `/`, które mają specjalne znaczenie w adresach URL i nazwach plików. Używają go tokeny JWT, zwykle bez dopełnienia. Zaznacz URL-safe, żeby je wygenerować; dekoder odczyta oba warianty.' },
      { q: 'Czy potrzebuję dopełnienia =?', a: 'Większość dekoderów, łącznie z tym, działa bez niego. Niektóre restrykcyjne go wymagają. Zostaw je, chyba że miejsce docelowe mówi inaczej, jak JWT i wiele adresów URL.' },
      { q: 'Jak zrobić data URI z obrazka?', a: 'Naciśnij Zakoduj plik, wybierz obrazek, a potem Kopiuj jako data URI. Dostaniesz `data:image/png;base64,…`, gotowe do `<img src>` w HTML-u albo `url()` w CSS-ie. Data URI zostaw dla małych obrazków; duże obciążają strony.' },
      { q: 'Czy mój plik jest gdzieś wysyłany?', a: 'Nie. Plik czyta i koduje Twoja przeglądarka. Nic nie jest wysyłane, zapisywane ani wstawiane do adresu. Sprawdzisz to w panelu sieci w narzędziach deweloperskich przeglądarki.' },
      { q: 'Jak duży może być plik?', a: 'Do 50 MB. Większe w zasadzie działają, ale spowalniają przeglądarkę, bo tekst Base64 jest o jedną trzecią większy od pliku i musi zmieścić się na stronie.' },
      { q: 'Czy działa bez internetu?', a: 'Tak. Po załadowaniu strony kodowanie i dekodowanie nie potrzebują połączenia.' }
    ]
  }
};
export const COPY = C;

const ARROW = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const UPLOAD = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function tool(lang, T) {
  const U = T.ui;
  const pane = (id, label, ph, mono) => `<div class="pane" id="pane-${id}">
      <div class="pane-head"><label class="wb-label" for="b64-${id}">${esc(label)}</label><div class="wb-actions"><button type="button" class="btn btn-sm" data-paste="${id}">${esc(U.paste)}</button><button type="button" class="btn btn-sm" data-copy="${id}">${esc(U.copy)}</button><button type="button" class="btn btn-sm" data-clear="${id}">${esc(U.clear)}</button></div></div>
      <textarea class="wb-area${mono ? ' mono' : ''}" id="b64-${id}" rows="9" spellcheck="${mono ? 'false' : 'true'}" autocomplete="off" autocapitalize="off" placeholder="${esc(ph)}"></textarea>
      <div class="pane-foot" id="b64-${id}-foot"></div>
    </div>`;
  return `${i18nScript({ lang, ...U })}
<div class="wb b64" id="b64">
  <div class="b64-panes">
    ${pane('text', U.text, U.textPh, false)}
    <div class="b64-dir" id="b64-dir" role="img" aria-label="${esc(U.dirEncode)}">${ARROW}</div>
    ${pane('code', U.code, U.codePh, true)}
  </div>
  <p class="wb-error" id="b64-error" role="alert" hidden></p>
  <div class="b64-file" id="b64-bin" hidden><img id="b64-preview" alt="" hidden><p id="b64-bin-text"></p><button type="button" class="btn btn-sm" id="b64-download">${esc(U.download)}</button></div>
  <div class="b64-opts">
    <label class="check"><input type="checkbox" id="b64-url"> ${esc(U.url)}</label>
    <label class="check"><input type="checkbox" id="b64-pad" checked> ${esc(U.pad)}</label>
    <label class="check"><input type="checkbox" id="b64-wrap"> ${esc(U.wrap)}</label>
    <span class="b64-filebox"><label class="btn btn-sm" for="b64-file">${UPLOAD}<span>${esc(U.file)}</span></label><input type="file" id="b64-file" class="sr"> <small>${esc(U.drop)}</small></span>
    <button type="button" class="btn btn-sm" id="b64-datauri" hidden>${esc(U.dataUri)}</button>
  </div>
  <div class="wb-foot">${privateNote(lang)}<span id="b64-note"></span></div>
</div>`;
}

function body(lang, T) {
  return `
<section aria-labelledby="use"><h2 id="use">${esc(T.useH)}</h2>
  <ol class="bullets">${T.use.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>
</section>
<section aria-labelledby="variants"><h2 id="variants">${esc(T.variantsH)}</h2>
  <div class="table-wrap" role="region" aria-label="${esc((lang === 'pl' ? 'Tabela: ' : 'Table: ') + T.variantsH)}" tabindex="0"><table class="ref">
    <thead><tr>${T.variantsHead.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${T.variants.map(([a, b, c]) => `<tr><th scope="row">${esc(a)}</th><td>${inline(b)}</td><td>${esc(c)}</td></tr>`).join('')}</tbody>
  </table></div>
  <p>${esc(T.variantsP)}</p>
</section>
<section aria-labelledby="not"><h2 id="not">${esc(T.notH)}</h2>
  <p>${esc(T.notP)}</p>
</section>`;
}

export function render({ lang, wersja, updated }) {
  const T = C[lang];
  return toolPage({ id: ID, lang, wersja, updated, C: T, tool: tool(lang, T), body: body(lang, T), about: 'Base64' });
}
