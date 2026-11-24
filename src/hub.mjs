/* hub.mjs: /free-tools and /darmowe-narzedzia, the directory of free tools. Built from TOOLS in meta.mjs. */
import { esc } from './html.mjs';
import { BAZA, HUB, HUB_NAME, TOOLS, LIVE, SOON, sciezka, iconSvg } from './meta.mjs';
import { shell, faqLd, toolCard } from './shell.mjs';

const C = {
  en: {
    title: 'Free Tools by Przemysław Zalewski: Small, Fast, Private',
    metaDescription: 'Small free tools I built for my own problems: white screen, JWT decoder, character counter, Base64. No sign-up, nothing leaves your browser.',
    h1: 'Free tools',
    lead: 'Small tools for everyday jobs. Each one does one thing, opens instantly, works on a phone, and keeps what you do in your browser.',
    przemo: 'Every tool here started with me getting annoyed. I needed something simple, searched for it, and found pages full of ads, pop-ups and sign-up walls. So I build the version I wanted to find, use it myself, and put it here for you.\n\nThe ones I reach for every week are here: a JWT decoder, a character counter, and Base64. More will come as things annoy me.',
    listH: 'Tools', open: 'Open', soonH: 'Coming next', soon: 'Coming soon',
    faq: [
      { q: 'Are these tools really free?', a: 'Yes. No account, no ads, no paid tier. I use them myself and keep them up for everyone.' },
      { q: 'Is my data sent anywhere?', a: 'No. The tools run in your browser. Anonymous page analytics count visits and clicks, never what you type or generate, and you can switch them off on the [privacy page](https://ciunkos.com/privacy).' },
      { q: 'Can you build a tool like this for my company?', a: 'Yes, that is my job. Internal tools, calculators and small apps, built with your data staying yours. See [hire me](https://ciunkos.com/hire-me).' }
    ]
  },
  pl: {
    title: 'Darmowe narzędzia Przemysława Zalewskiego: małe, szybkie, prywatne',
    metaDescription: 'Darmowe narzędzia na moje własne problemy: biały ekran, dekoder JWT, licznik znaków, Base64. Bez rejestracji, wszystko zostaje w przeglądarce.',
    h1: 'Darmowe narzędzia',
    lead: 'Małe narzędzia do codziennych spraw. Każde robi jedną rzecz, otwiera się od razu, działa na telefonie i zostawia to, co robisz, w Twojej przeglądarce.',
    przemo: 'Każde narzędzie tutaj zaczęło się od tego, że coś mnie zirytowało. Potrzebowałem czegoś prostego, szukałem i trafiałem na strony pełne reklam, wyskakujących okienek i ścian z rejestracją. Robię więc wersję, którą sam chciałem znaleźć, używam jej i wrzucam tutaj dla Ciebie.\n\nSą tu te, po które sięgam co tydzień: dekoder JWT, licznik znaków i Base64. Kolejne dojdą, gdy coś znowu mnie zirytuje.',
    listH: 'Narzędzia', open: 'Otwórz', soonH: 'W kolejce', soon: 'Wkrótce',
    faq: [
      { q: 'Czy te narzędzia są naprawdę darmowe?', a: 'Tak. Bez konta, bez reklam, bez płatnej wersji. Sam ich używam i trzymam je dla wszystkich.' },
      { q: 'Czy moje dane gdzieś trafiają?', a: 'Nie. Narzędzia działają w Twojej przeglądarce. Anonimowa analityka liczy wejścia i kliknięcia, nigdy to, co wpisujesz albo generujesz, i możesz ją wyłączyć na [stronie prywatności](https://ciunkos.com/prywatnosc).' },
      { q: 'Zrobisz takie narzędzie dla mojej firmy?', a: 'Tak, to moja praca. Narzędzia wewnętrzne, kalkulatory i małe aplikacje, z danymi, które zostają Twoje. Zobacz [zatrudnij mnie](https://ciunkos.com/zatrudnij-mnie).' }
    ]
  }
};
export const HUB_COPY = C;

export function renderHub({ lang, wersja, updated }) {
  const T = { ...C[lang], crumb: HUB_NAME[lang] };
  const path = { en: HUB.en, pl: HUB.pl };
  const url = BAZA + '/' + path[lang];
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url, name: HUB_NAME[lang], description: T.metaDescription, inLanguage: lang,
      mainEntity: { '@type': 'ItemList', itemListElement: LIVE.map((id, i) => ({ '@type': 'ListItem', position: i + 1, url: BAZA + '/' + sciezka(id, lang), name: TOOLS[id].name[lang] })) } },
    faqLd(T.faq)
  ];
  const body = `<section aria-labelledby="tools"><h2 id="tools">${esc(T.listH)}</h2>
  <ul class="tool-grid tool-grid-lg">${LIVE.map((id) => toolCard(id, lang, T.open)).join('')}</ul>
</section>
${SOON.length ? `<section aria-labelledby="soon"><h2 id="soon">${esc(T.soonH)}</h2>
  <ul class="tool-grid tool-grid-lg">${SOON.map((id) => { const t = TOOLS[id]; return `<li><div class="tool-card is-soon"><span class="tool-icon" aria-hidden="true">${iconSvg(id, 40)}</span><strong>${esc(t.name[lang])}</strong><span>${esc(t.pain[lang])}</span><span class="tool-open">${esc(T.soon)}</span></div></li>`; }).join('')}</ul>
</section>` : ''}`;
  return shell({ id: 'hub', layout: 'hub', lang, wersja, path, C: T, ld, body, updated, themeColor: '#f6f6f3' });
}
