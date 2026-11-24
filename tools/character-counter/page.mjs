/* Character counter: copy (EN, PL), the tool panel and the reference below it. Client: app.mjs + count.mjs. */
import { esc, inline } from '../../src/html.mjs';
import { toolPage, privateNote, i18nScript } from '../../src/shell.mjs';
import { LIMITS } from './count.mjs';

export const ID = 'character-counter';

const LIMIT_NAMES = {
  en: { x: 'X (Twitter) post', linkedin: 'LinkedIn post', instagram: 'Instagram caption', threads: 'Threads post', bluesky: 'Bluesky post', 'yt-title': 'YouTube title', 'yt-desc': 'YouTube description', 'seo-title': 'Page title in Google', 'meta-desc': 'Meta description in Google' },
  pl: { x: 'Post na X (Twitterze)', linkedin: 'Post na LinkedInie', instagram: 'Opis na Instagramie', threads: 'Post na Threads', bluesky: 'Post na Bluesky', 'yt-title': 'Tytuł na YouTube', 'yt-desc': 'Opis na YouTube', 'seo-title': 'Tytuł strony w Google', 'meta-desc': 'Meta description w Google' }
};

const C = {
  en: {
    title: 'Character Counter: Characters, Words and Limits as You Type',
    metaDescription: 'Count characters with and without spaces, words, sentences and lines as you type, and see what fits on X, LinkedIn, Instagram, SMS and Google.',
    crumb: 'Character counter',
    h1: 'Character counter: characters, words and limits, live',
    lead: 'Type or paste your text. You see characters with and without spaces, words, sentences, lines and reading time at once, and how much room is left on X, LinkedIn, Instagram, in an SMS or in a Google result.',
    przemo: 'I count characters all the time: a meta description that has to fit in 160, a LinkedIn post, an SMS to a client, a translation billed per 1,800 characters. The counters I found either counted an emoji as two or four, disagreed with each other without saying why, or hid the number between ads.\n\nThis one counts what you see on the screen, shows the numbers other tools use next to it, and keeps your text in your browser.',
    ui: {
      text: 'Your text', paste: 'Paste', copy: 'Copy', clear: 'Clear', copied: 'Copied', placeholder: 'Type or paste your text here…',
      chars: 'characters', noSpaces: 'without spaces', words: 'words', sentences: 'sentences', paragraphs: 'paragraphs', lines: 'lines',
      reading: 'reading time', speaking: 'speaking time', pages: 'standard pages (1,800)', bytes: 'bytes (UTF-8)',
      other: 'Other counts: {utf16} UTF-16 units (what JavaScript and some sites count), {cp} code points, {spaces} spaces.',
      limits: 'Where it fits', left: '{n} left', over: '{n} over', guideline: 'guideline',
      sms: 'SMS', smsLine: '{units} {enc} units · {seg} {msgs}', msg1: 'message', msgN: 'messages', smsUcs: 'These characters switch the SMS to Unicode (70 per message): {chars}',
      top: 'Most used words', none: 'No words yet.', remember: 'Keep my text in this browser', minS: '{m} min {s} s', secS: '{s} s'
    },
    howH: 'How characters are counted',
    howP: 'A character here is what a person sees as one character. An emoji, a flag, a family emoji built from several people, or a letter with an accent typed as two codes all count as one. Many tools count something else, which is why their numbers disagree:',
    howHead: ['Text', 'Characters here', 'UTF-16 units', 'UTF-8 bytes'],
    howRows: [['a', '1', '1', '1'], ['ą', '1', '1', '2'], ['€', '1', '1', '3'], ['👍', '1', '2', '4'], ['🇵🇱', '1', '4', '8'], ['👨‍👩‍👧', '1', '8', '18']],
    howP2: 'X counts differently again: most Latin letters weigh 1, Chinese, Japanese and Korean characters and emoji weigh 2, and every link counts as 23, whatever its length. The X row in the tool uses those rules.',
    limitsH: 'Character limits worth knowing',
    limitsHead: ['Where', 'Limit', 'Notes'],
    limitNotes: { x: 'Standard accounts; links count as 23, CJK and emoji as 2.', linkedin: 'A post; the feed shows about the first 210 before “see more”.', instagram: 'A caption; the feed shows about the first 125.', threads: 'A post.', bluesky: 'A post.', 'yt-title': 'A video title.', 'yt-desc': 'A video description.', 'seo-title': 'Google cuts titles by width, roughly 50 to 60 characters.', 'meta-desc': 'Google shows roughly 155 to 160 characters on desktop, fewer on phones.' },
    pageH: 'Standard page: 1,800 characters',
    pageP: 'Translators, editors and publishers in Poland, Germany and elsewhere price text by the standard page (strona znormalizowana, Normseite): 1,800 characters including spaces, about 250 to 300 English words. The tool shows how many standard pages your text is, to two decimal places.',
    faq: [
      { q: 'Do spaces count as characters?', a: 'Yes, in the main count, like on X, LinkedIn and in Google. The second number, without spaces, leaves out spaces, tabs and line breaks. Translation and copywriting quotes usually use characters with spaces.' },
      { q: 'Does an emoji count as one character?', a: 'Here, yes: you see one symbol, so it is one character. Behind it an emoji is 2 to 11 UTF-16 units and 4 to 25 bytes, which is why some tools and some sites count it as 2 or more. X counts every emoji as 2.' },
      { q: 'How many characters fit in one SMS?', a: '160 when the text uses only the basic GSM alphabet, and 70 as soon as one other character appears: a Polish letter like ą or ł, an emoji, or curly quotes. Longer texts are split into parts of 153 or 67 characters. The SMS row shows which characters force the shorter limit.' },
      { q: 'Why does X show a different number?', a: 'X weighs characters: links always count as 23, and Chinese, Japanese and Korean characters and emoji count as 2. The X row uses those rules, so it should match the counter in the X composer.' },
      { q: 'How many words is a page?', a: 'A standard page of 1,800 characters with spaces is about 250 to 300 English words, or 230 to 260 Polish words. A double-spaced manuscript page is usually counted as 250 words.' },
      { q: 'How is reading time calculated?', a: 'Words divided by 238 a minute for silent reading, the average adult rate found by a 2019 review of 190 studies (Brysbaert), and by 140 a minute for speaking aloud. Treat both as rough guides.' },
      { q: 'Is my text saved or sent anywhere?', a: 'It is never sent. Counting happens in your browser. Only if you tick “Keep my text in this browser” is it stored, in this browser’s local storage, so it is still there after a reload; untick it to delete it.' },
      { q: 'Does it work offline?', a: 'Yes. Once the page has loaded, counting works without a connection.' }
    ]
  },
  pl: {
    title: 'Licznik znaków: ze spacjami i bez, słowa, limity na żywo',
    metaDescription: 'Policz znaki ze spacjami i bez, słowa, zdania i linie na bieżąco. Sprawdź, czy tekst zmieści się na X, LinkedInie, Instagramie, w SMS-ie i w Google.',
    crumb: 'Licznik znaków',
    h1: 'Licznik znaków: ze spacjami, bez spacji, słowa i limity',
    lead: 'Wpisz albo wklej tekst. Od razu widzisz znaki ze spacjami i bez, słowa, zdania, linie i czas czytania, a także ile miejsca zostało na X, LinkedInie, Instagramie, w SMS-ie i w wyniku Google.',
    przemo: 'Liczę znaki cały czas: meta description, które musi się zmieścić w 160, post na LinkedInie, SMS do klienta, tłumaczenie rozliczane za 1800 znaków. Liczniki, które znalazłem, albo liczyły emoji jako dwa czy cztery znaki, albo podawały różne wyniki bez wyjaśnienia, albo chowały liczbę między reklamami.\n\nTen liczy to, co widzisz na ekranie, obok pokazuje liczby, których używają inne narzędzia, a Twój tekst zostaje w Twojej przeglądarce.',
    ui: {
      text: 'Twój tekst', paste: 'Wklej', copy: 'Kopiuj', clear: 'Wyczyść', copied: 'Skopiowano', placeholder: 'Wpisz albo wklej tekst…',
      chars: 'znaki ze spacjami', noSpaces: 'bez spacji', words: 'słowa', sentences: 'zdania', paragraphs: 'akapity', lines: 'linie',
      reading: 'czas czytania', speaking: 'czas mówienia', pages: 'strony (1800 znaków)', bytes: 'bajty (UTF-8)',
      other: 'Inne liczby: {utf16} jednostek UTF-16 (tak liczy JavaScript i część stron), {cp} punktów kodowych, {spaces} spacji.',
      limits: 'Gdzie się zmieści', left: 'zostało {n}', over: '{n} za dużo', guideline: 'wskazówka',
      sms: 'SMS', smsLine: '{units} jednostek {enc} · {seg} {msgs}', msg1: 'wiadomość', msgN: 'wiadomości', smsUcs: 'Te znaki przełączają SMS na Unicode (70 na wiadomość): {chars}',
      top: 'Najczęstsze słowa', none: 'Na razie brak słów.', remember: 'Zachowaj tekst w tej przeglądarce', minS: '{m} min {s} s', secS: '{s} s'
    },
    howH: 'Jak liczone są znaki',
    howP: 'Znak to tutaj to, co człowiek widzi jako jeden znak. Emoji, flaga, emoji rodziny złożone z kilku osób albo litera z ogonkiem wpisana jako dwa kody liczą się jako jeden. Wiele narzędzi liczy coś innego i dlatego ich wyniki się różnią:',
    howHead: ['Tekst', 'Znaki tutaj', 'Jednostki UTF-16', 'Bajty UTF-8'],
    howRows: [['a', '1', '1', '1'], ['ą', '1', '1', '2'], ['€', '1', '1', '3'], ['👍', '1', '2', '4'], ['🇵🇱', '1', '4', '8'], ['👨‍👩‍👧', '1', '8', '18']],
    howP2: 'X liczy jeszcze inaczej: większość liter łacińskich waży 1, znaki chińskie, japońskie, koreańskie i emoji ważą 2, a każdy link liczy się jako 23 bez względu na długość. Wiersz X w narzędziu stosuje te zasady.',
    limitsH: 'Limity znaków, które warto znać',
    limitsHead: ['Gdzie', 'Limit', 'Uwagi'],
    limitNotes: { x: 'Zwykłe konta; linki liczą się jako 23, znaki CJK i emoji jako 2.', linkedin: 'Post; w feedzie widać około 210 pierwszych znaków przed „zobacz więcej”.', instagram: 'Opis posta; w feedzie widać około 125 pierwszych znaków.', threads: 'Post.', bluesky: 'Post.', 'yt-title': 'Tytuł filmu.', 'yt-desc': 'Opis filmu.', 'seo-title': 'Google ucina tytuły według szerokości, około 50 do 60 znaków.', 'meta-desc': 'Google pokazuje około 155 do 160 znaków na komputerze, mniej na telefonie.' },
    pageH: 'Strona znormalizowana: 1800 znaków',
    pageP: 'Tłumacze, redaktorzy i wydawcy rozliczają tekst stronami znormalizowanymi (stronami maszynopisu): 1800 znaków ze spacjami, czyli około 230 do 260 polskich słów. Arkusz wydawniczy to 40 000 znaków, czyli około 22 stron. Narzędzie pokazuje, ile stron ma Twój tekst, z dokładnością do dwóch miejsc po przecinku.',
    faq: [
      { q: 'Czy spacje liczą się jako znaki?', a: 'Tak, w głównej liczbie, tak jak na X, LinkedInie i w Google. Druga liczba, bez spacji, pomija spacje, tabulatory i podziały linii. Wyceny tłumaczeń i copywritingu zwykle opierają się na znakach ze spacjami.' },
      { q: 'Ile znaków ma strona A4 (strona maszynopisu)?', a: 'Strona znormalizowana to 1800 znaków ze spacjami, czyli 30 wierszy po 60 znaków. To około 230 do 260 polskich słów. Arkusz wydawniczy to 40 000 znaków ze spacjami.' },
      { q: 'Czy emoji liczy się jako jeden znak?', a: 'Tutaj tak: widzisz jeden symbol, więc to jeden znak. Pod spodem emoji to od 2 do 11 jednostek UTF-16 i od 4 do 25 bajtów, dlatego niektóre narzędzia i strony liczą je jako 2 albo więcej. X liczy każde emoji jako 2.' },
      { q: 'Ile znaków zmieści się w jednym SMS-ie?', a: '160, gdy tekst używa tylko podstawowego alfabetu GSM, i 70, gdy pojawi się choć jeden inny znak: polska litera jak ą czy ł, emoji albo cudzysłów drukarski. Dłuższe teksty dzielą się na części po 153 albo 67 znaków. Wiersz SMS pokazuje, które znaki wymuszają krótszy limit.' },
      { q: 'Dlaczego X pokazuje inną liczbę?', a: 'X waży znaki: linki zawsze liczą się jako 23, a znaki chińskie, japońskie, koreańskie i emoji jako 2. Wiersz X stosuje te zasady, więc powinien zgadzać się z licznikiem w okienku X.' },
      { q: 'Jak liczony jest czas czytania?', a: 'Liczba słów dzielona przez 238 na minutę przy czytaniu po cichu, czyli średnią dorosłego czytelnika z przeglądu 190 badań z 2019 roku (Brysbaert), i przez 140 na minutę przy mówieniu na głos. Traktuj oba wyniki orientacyjnie.' },
      { q: 'Czy mój tekst jest gdzieś zapisywany albo wysyłany?', a: 'Nigdy nie jest wysyłany. Liczenie dzieje się w Twojej przeglądarce. Tylko gdy zaznaczysz „Zachowaj tekst w tej przeglądarce”, jest zapisywany w pamięci lokalnej tej przeglądarki, żeby został po odświeżeniu; odznacz, żeby go usunąć.' },
      { q: 'Czy działa bez internetu?', a: 'Tak. Po załadowaniu strony liczenie działa bez połączenia.' }
    ]
  }
};
export const COPY = C;

function tool(lang, T) {
  const U = T.ui;
  const stat = (id, label, hero = false) => `<div class="stat${hero ? ' hero' : ''}"><b id="cc-${id}">0</b><span>${esc(label)}</span></div>`;
  return `${i18nScript({ lang, ...U, limitNames: LIMIT_NAMES[lang] })}
<div class="wb cc" id="cc">
  <div class="wb-head"><label class="wb-label" for="cc-in">${esc(U.text)}</label>
    <div class="wb-actions"><button type="button" class="btn btn-sm" id="cc-paste">${esc(U.paste)}</button><button type="button" class="btn btn-sm" id="cc-copy">${esc(U.copy)}</button><button type="button" class="btn btn-sm" id="cc-clear">${esc(U.clear)}</button></div></div>
  <textarea class="wb-area" id="cc-in" rows="9" placeholder="${esc(U.placeholder)}"></textarea>
  <div class="stats" aria-live="polite">${stat('chars', U.chars)}${stat('noSpaces', U.noSpaces)}${stat('words', U.words)}${stat('sentences', U.sentences)}${stat('paragraphs', U.paragraphs)}${stat('lines', U.lines)}${stat('reading', U.reading)}${stat('speaking', U.speaking)}${stat('pages', U.pages)}${stat('bytes', U.bytes)}</div>
  <p class="cc-other" id="cc-other"></p>
  <div class="cc-cols">
    <section class="cc-limits" aria-labelledby="cc-lim-h"><h2 class="wb-h" id="cc-lim-h">${esc(U.limits)}</h2>
      <ul id="cc-limits">${LIMITS.map((l) => `<li data-id="${l.id}"><div class="lim-top"><span>${esc(LIMIT_NAMES[lang][l.id])}${l.soft ? ` <small>(${esc(U.guideline)})</small>` : ''}</span><span class="lim-n"><b>0</b> / ${l.limit.toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-US')}</span></div><div class="bar"><i></i></div></li>`).join('')}
        <li data-id="sms" class="lim-sms"><div class="lim-top"><span>${esc(U.sms)}</span><span class="lim-n" id="cc-sms"></span></div><p class="lim-note" id="cc-sms-note"></p></li></ul>
    </section>
    <section class="cc-top" aria-labelledby="cc-top-h"><h2 class="wb-h" id="cc-top-h">${esc(U.top)}</h2><ol id="cc-top"></ol></section>
  </div>
  <div class="wb-foot">${privateNote(lang, lang === 'pl' ? 'Liczenie dzieje się w Twojej przeglądarce. Tekst nie jest nigdzie wysyłany.' : 'Counting happens in your browser. Your text is never sent.')}<label class="check"><input type="checkbox" id="cc-remember"> ${esc(U.remember)}</label></div>
</div>`;
}

function body(lang, T) {
  const U = T.ui;
  return `
<section aria-labelledby="how"><h2 id="how">${esc(T.howH)}</h2>
  <p>${esc(T.howP)}</p>
  <div class="table-wrap" role="region" aria-label="${esc((lang === 'pl' ? 'Tabela: ' : 'Table: ') + T.howH)}" tabindex="0"><table class="ref">
    <thead><tr>${T.howHead.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${T.howRows.map(([t, ...n]) => `<tr><th scope="row" class="cc-sample">${t}</th>${n.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>
  <p>${esc(T.howP2)}</p>
</section>
<section aria-labelledby="limits-ref"><h2 id="limits-ref">${esc(T.limitsH)}</h2>
  <div class="table-wrap" role="region" aria-label="${esc((lang === 'pl' ? 'Tabela: ' : 'Table: ') + T.limitsH)}" tabindex="0"><table class="ref">
    <thead><tr>${T.limitsHead.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${LIMITS.map((l) => `<tr><th scope="row">${esc(LIMIT_NAMES[lang][l.id])}</th><td>${l.limit.toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-US')}</td><td>${esc(T.limitNotes[l.id])}</td></tr>`).join('')}
      <tr><th scope="row">SMS</th><td>160 / 70</td><td>${esc(lang === 'pl' ? 'GSM-7 albo Unicode; dłuższe wiadomości po 153 albo 67.' : 'GSM-7 or Unicode; longer messages in parts of 153 or 67.')}</td></tr></tbody>
  </table></div>
</section>
<section aria-labelledby="page-ref"><h2 id="page-ref">${esc(T.pageH)}</h2>
  <p>${inline(T.pageP)}</p>
</section>`;
}

export function render({ lang, wersja, updated }) {
  const T = C[lang];
  return toolPage({ id: ID, lang, wersja, updated, C: T, tool: tool(lang, T), body: body(lang, T), about: lang === 'pl' ? 'Liczba znaków' : 'Character count' });
}
