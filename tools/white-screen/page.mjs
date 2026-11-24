/* White screen: copy (EN, PL), the first-viewport surface and the content below it. Client: screen.mjs, png.mjs. */
import { esc, inline } from '../../src/html.mjs';
import { BAZA, ASSETY, TOOLS, sciezka } from '../../src/meta.mjs';
import { shell, faqLd, webApp, ui, PERSON_ID } from '../../src/shell.mjs';
import { PRESETS, fileName } from './png.mjs';

export const ID = 'white-screen';

export const TINTS = [
  { id: 'white', hex: '#ffffff', en: 'Pure white', pl: 'Czysta biel' },
  { id: 'warm', hex: '#fff3e0', en: 'Warm white', pl: 'Ciepła biel' },
  { id: 'cool', hex: '#eef4ff', en: 'Cool white', pl: 'Chłodna biel' },
  { id: 'dim', hex: '#c8c8c8', en: 'Dimmed', pl: 'Przygaszona' }
];

/* Our own 10-hour pure white video (scripts/videos.mjs). Played in the page, downloadable, and on iPhone it is the
   only way to true full screen (Safari lets only videos go full screen). */
export { VIDEOS } from '../../scripts/videos.mjs';
import { VIDEOS } from '../../scripts/videos.mjs';
const VIDEO_PUBLISHED = '2026-11-24';
const mb = (b) => (b / 1048576).toFixed(1);
import { statSync } from 'node:fs';
const videoFiles = () => VIDEOS.map((v) => ({ ...v, bytes: statSync('public/a/video/' + v.file).size }));

const C = {
  en: {
    title: 'White Screen: Totally White Full-Screen Page, Free',
    ogTitle: 'White screen: a totally white page, full screen in one click',
    metaDescription: 'A totally white screen in one click. Clean your monitor and see every speck, check for dead pixels, or use it as a light. White PNGs up to 16K too.',
    crumb: 'White screen',
    h1: 'White screen: a totally white page, full screen in one click',
    lead: 'The area above this text is pure white (**#FFFFFF**). Press **Full screen** or the **F** key and your monitor, laptop, phone or TV turns white from edge to edge, so dust, fingerprints and streaks have nowhere to hide. Press **Esc** to come back. Free, no sign-up, nothing to install.',
    przemo: 'I was cleaning my monitor with screen wipes and kept missing the streaks. On a dark desktop you can’t see them. On white, every smear and speck shows. I typed “totally white screen” into Google and got pages buried under cookie banners, share buttons and ads.\n\nSo I built the page I wanted. It is white the moment it opens, one click makes it full screen, and Esc takes you back. Bookmark it, and send it to your parents next time they ask how to clean the TV.',
    stage: 'White screen', controls: 'White screen controls', fs: 'Full screen', fsExit: 'Exit full screen',
    hint: 'Click anywhere or press <kbd>F</kbd> for full screen. <kbd>Esc</kbd> exits.', hintTouch: 'Tap the white area or the button for full screen.', shade: 'Shade', download: 'Download image', more: 'Tips, downloads and questions',
    toastDesk: 'Press Esc or double-click to exit', toastTouch: 'Tap the screen, then Exit full screen',
    iosTip: 'On iPhone, Safari keeps a thin bar at the edges. For true edge-to-edge white, tap Share, then Add to Home Screen, and open it from there.',
    howH: 'How to clean your screen and actually see the dirt',
    howIntro: 'Clean with the screen off, inspect with the screen white. Six steps, about five minutes.',
    howTotal: 'PT5M',
    steps: [
      ['Turn the screen off and let it cool', 'A warm panel dries the liquid too fast and leaves streaks. A dark screen also stops you from clicking things while you wipe.'],
      ['Dust it dry first', 'Brush the screen with a dry microfibre cloth in light, straight strokes. Grit dragged around by a wet wipe is what scratches coatings.'],
      ['Wipe with a screen wipe or a barely damp cloth', 'Use a wipe made for screens, or a microfibre cloth lightly damp with distilled water. Never spray liquid onto the screen, and skip household glass cleaner, ammonia and strong alcohol on coated or matte screens.'],
      ['Buff it dry', 'Go over it with a second, dry microfibre cloth in straight lines, top to bottom.'],
      ['Turn the screen on and open the white screen', 'Raise brightness, press Full screen, and look at the screen from an angle and from a step back. Leftover smears show up as grey or rainbow patches, dust as tiny dark dots.'],
      ['Spot-clean and check again', 'Touch up only what you see, buff, and look once more. Press Esc when it is spotless.']
    ],
    usesH: 'What people use a white screen for',
    uses: [
      ['Cleaning a screen', 'Dust, fingerprints and wipe streaks blend into a busy desktop. On even white they cast a shadow you cannot miss.'],
      ['Dead and stuck pixel check', 'On white, a dead pixel shows as a black dot and a stuck one as a red, green or blue dot. Run it on a new monitor while you can still return it.'],
      ['Backlight and uniformity', 'Yellow corners, darker edges, pressure marks and a pink or green tint all show on a full white field.'],
      ['Light for video calls', 'Put the white screen on a second monitor or a tablet next to the camera. Warm white is kinder to skin than the cold glow of a laptop.'],
      ['Make-up and selfie light', 'A phone or tablet in full screen is a soft, even light source you always have with you.'],
      ['Light box for tracing', 'Lay thin paper over a tablet at full brightness and trace drawings, lettering or sewing patterns.'],
      ['A gentle light in the dark', 'Dimmed white on a phone finds the keyhole or the cat without the glare of a torch.'],
      ['Projector and TV setup', 'Check focus, keystone, hot spots and colour cast on a projector or a new TV.']
    ],
    dlH: 'Download a white image (PNG)',
    dlIntro: 'Need a white picture instead of a white page? For a wallpaper, a placeholder, a video background or a blank page to print. Pick a size and download a pure white PNG. It is generated in your browser, so it works for any size up to 16,384 pixels a side, even on a phone.',
    dlSize: 'Size', dlCustom: 'Custom size', dlW: 'Width', dlH2: 'Height', dlPx: 'px', dlGo: 'Download',
    dlGroups: { screen: 'Screens', device: 'Phone and tablet', print: 'Print', social: 'Social' },
    dlReady: 'Ready-made files', dlReadyIntro: 'The most common sizes, as plain files you can link to or save with a right-click:',
    dlMade: 'Saved', dlErr: 'Enter a width and a height from 1 to 16,384 pixels.',
    vidH: 'White screen video: 10 hours, free MP4',
    vidIntro: 'Some screens cannot open a web page in full screen: smart TVs without a browser, digital photo frames, projectors with a USB port, presentation and video-editing apps. A video works on all of them. This is my own 10-hour pure white video. Play it here (it loops), or download the MP4 and play it from a USB stick, a TV app or any video player.',
    vidName: 'White screen, 10 hours (pure white video)', vidFs: 'Play full screen', vidDl: 'Download MP4',
    vidNote: 'Encoded at one frame per second, so ten hours of white weigh only a few megabytes. The white is exact: video white (Y 235), which players show as RGB 255, 255, 255. Use it anywhere, no credit needed (CC0).',
    vidDesc: 'A 10-hour video of a pure white screen (RGB 255, 255, 255), for cleaning screens, testing displays, or as a light on TVs and projectors without a web browser. Free MP4 in 1080p and 4K, CC0.',
    cmpH: 'White screen page, white image or white video?',
    cmpHead: ['', 'This page', 'White image (PNG)', 'White video (MP4)'],
    cmp: [
      ['Gets you full screen', 'One click or F', 'In a photo viewer', 'In any video player'],
      ['Exact #FFFFFF', 'Yes', 'Yes', 'Yes'],
      ['Works offline', 'Once loaded', 'Yes', 'Once downloaded'],
      ['On a TV', 'TV browser or casting', 'USB stick or photo app', 'USB stick or TV media player'],
      ['Keeps the screen awake', 'Yes, in most browsers', 'No', 'Yes']
    ],
    faq: [
      { q: 'How do I make my whole screen white?', a: 'Open this page and press **Full screen** (or the **F** key, or click anywhere on the white area). The browser hides its tabs and bars and the whole display turns white. Press **Esc** to go back.' },
      { q: 'How do I exit the white screen?', a: 'Press **Esc** on a keyboard, or double-click. On a phone or tablet, tap the screen once to bring back the controls, then tap **Exit full screen**.' },
      { q: 'Does it work on iPhone?', a: 'Yes. Safari on iPhone lets only videos go truly full screen, so on an iPhone the **Full screen** button plays this page’s own white video full screen, edge to edge. With the warm, cool or dimmed shade the page fills the screen instead and Safari keeps a thin bar; for those, tap **Share**, then **Add to Home Screen**, and open the white screen from there. iPad and Android phones support real full screen for every shade.' },
      { q: 'How do I put a white screen on my TV?', a: 'Open this page in the TV’s web browser, cast the browser tab from your phone or laptop, or connect a laptop with HDMI and press F. Without a browser, download the 10-hour white MP4 below and play it from a USB stick or the TV’s media player.' },
      { q: 'Can a white screen damage my display?', a: 'No. A few minutes of white is ordinary use for LCD and OLED alike. Burn-in on OLED comes from the same picture, such as a logo or a taskbar, staying on screen for hundreds of hours. A plain white field has no shape to burn in. If you use an OLED as a light for hours every day, lower the brightness a little.' },
      { q: 'Should I clean my screen while it is on?', a: 'Clean it while it is off, then turn it on and check it on white. A dark panel hides nothing while you wipe, it is cooler so the liquid dries without streaks, and you will not click anything by accident.' },
      { q: 'Why does my white look yellow, blue or not bright enough?', a: 'A web page cannot change your screen’s brightness or colour. Turn brightness up and switch off auto-brightness, Night Shift, True Tone, Night Light or Eye Comfort mode for the most neutral white. The **Warm** and **Cool** shades are there on purpose, for lighting.' },
      { q: 'Will my screen go to sleep?', a: 'In full screen the page asks the browser to keep the display awake (the Screen Wake Lock API, supported by Chrome, Edge, Safari and Firefox). If yours does not support it, change the sleep setting or use the 10-hour video.' },
      { q: 'Is it really pure white?', a: 'Yes. The page and the PNG files are exactly **#FFFFFF**, that is RGB 255, 255, 255 in sRGB, and the video decodes to the same white. The PNGs carry an sRGB tag so apps do not reinterpret the colour.' },
      { q: 'Are there keyboard shortcuts?', a: '**F** toggles full screen, **Esc** exits, **1** to **4** switch between pure, warm, cool and dimmed white, and a double-click toggles full screen too.' },
      { q: 'Does it work offline?', a: 'Once the page has loaded, full screen, the shades and the image downloads keep working without internet. The video streams from this site; download the MP4 to watch it offline.' },
      { q: 'Is it free?', a: 'Yes. No account, no ads, no paywall. I made it for myself and keep it up for everyone.' }
    ]
  },
  pl: {
    title: 'Biały ekran: cały ekran na biało jednym kliknięciem',
    ogTitle: 'Biały ekran: cały ekran na biało jednym kliknięciem',
    metaDescription: 'Całkowicie biały ekran jednym kliknięciem. Wyczyść monitor i zobacz każdy pyłek, sprawdź martwe piksele albo zrób z ekranu lampę. Białe PNG do 16K.',
    crumb: 'Biały ekran',
    h1: 'Biały ekran: cały ekran na biało jednym kliknięciem',
    lead: 'Pole nad tym tekstem jest idealnie białe (**#FFFFFF**). Naciśnij **Pełny ekran** albo klawisz **F**, a monitor, laptop, telefon czy telewizor zrobi się biały od krawędzi do krawędzi i kurz, odciski palców i smugi nie mają się gdzie schować. **Esc** wraca. Za darmo, bez rejestracji, nic do instalowania.',
    przemo: 'Czyściłem monitor nawilżanymi chusteczkami do ekranów i ciągle przegapiałem smugi. Na ciemnej tapecie ich nie widać, na białym tle wychodzi każdy zaciek i pyłek. Wpisałem w Google „totally white screen” i dostałem strony zawalone banerami cookies, przyciskami do udostępniania i reklamami.\n\nZrobiłem więc stronę, jakiej sam chciałem. Jest biała od razu po otwarciu, jedno kliknięcie daje pełny ekran, a Esc wraca. Dodaj ją do zakładek i wyślij rodzicom, gdy następnym razem zapytają, jak wyczyścić telewizor.',
    stage: 'Biały ekran', controls: 'Sterowanie białym ekranem', fs: 'Pełny ekran', fsExit: 'Zamknij pełny ekran',
    hint: 'Kliknij w dowolnym miejscu albo naciśnij <kbd>F</kbd>, żeby włączyć pełny ekran. <kbd>Esc</kbd> wychodzi.', hintTouch: 'Stuknij w białe pole albo w przycisk, żeby włączyć pełny ekran.', shade: 'Odcień', download: 'Pobierz obraz', more: 'Porady, pliki i pytania',
    toastDesk: 'Esc albo podwójne kliknięcie, żeby wyjść', toastTouch: 'Dotknij ekranu, potem Zamknij pełny ekran',
    iosTip: 'Na iPhonie Safari zostawia cienki pasek przy krawędziach. Żeby biel była od krawędzi do krawędzi, stuknij Udostępnij, potem Do ekranu początkowego, i otwórz stronę stamtąd.',
    howH: 'Jak wyczyścić ekran i naprawdę zobaczyć brud',
    howIntro: 'Czyść przy wyłączonym ekranie, sprawdzaj na białym. Sześć kroków, około pięciu minut.',
    howTotal: 'PT5M',
    steps: [
      ['Wyłącz ekran i poczekaj, aż ostygnie', 'Na ciepłej matrycy płyn schnie za szybko i zostawia smugi. Wyłączony ekran nie kliknie też niczego, gdy go przecierasz.'],
      ['Najpierw odkurz na sucho', 'Przetrzyj ekran suchą ściereczką z mikrofibry lekkimi, prostymi ruchami. Ekran rysują ziarenka kurzu przeciągane mokrą chusteczką.'],
      ['Przetrzyj chusteczką do ekranów albo lekko wilgotną ściereczką', 'Użyj chusteczki przeznaczonej do ekranów albo mikrofibry lekko zwilżonej wodą destylowaną. Nigdy nie pryskaj płynem na ekran i nie używaj płynu do szyb, amoniaku ani mocnego alkoholu na ekranach matowych i z powłoką.'],
      ['Wypoleruj do sucha', 'Przejedź drugą, suchą ściereczką z mikrofibry prostymi ruchami, z góry na dół.'],
      ['Włącz ekran i otwórz biały ekran', 'Podkręć jasność, naciśnij Pełny ekran i popatrz na ekran pod kątem i z kroku wstecz. Resztki smug wyglądają jak szare albo tęczowe plamy, kurz jak drobne ciemne kropki.'],
      ['Popraw punktowo i sprawdź jeszcze raz', 'Przetrzyj tylko to, co widzisz, wypoleruj i spójrz jeszcze raz. Esc, gdy jest czysto.']
    ],
    usesH: 'Do czego ludzie używają białego ekranu',
    uses: [
      ['Czyszczenie ekranu', 'Kurz, odciski palców i smugi po chusteczkach giną na kolorowej tapecie. Na równej bieli rzucają cień, którego nie przegapisz.'],
      ['Test martwych pikseli', 'Na bieli martwy piksel to czarna kropka, a zablokowany to kropka czerwona, zielona albo niebieska. Sprawdź nowy monitor, póki możesz go zwrócić.'],
      ['Podświetlenie i równomierność', 'Żółte rogi, ciemniejsze krawędzie, ślady nacisku i różowy albo zielony odcień widać na całej białej powierzchni.'],
      ['Światło do wideorozmów', 'Włącz biały ekran na drugim monitorze albo tablecie obok kamery. Ciepła biel jest łaskawsza dla cery niż zimna poświata laptopa.'],
      ['Światło do makijażu i selfie', 'Telefon albo tablet na pełnym ekranie to miękkie, równe światło, które zawsze masz przy sobie.'],
      ['Podświetlany stół do kalkowania', 'Połóż cienki papier na tablecie z pełną jasnością i odrysuj rysunek, liternictwo albo wykrój.'],
      ['Łagodne światło w ciemności', 'Przygaszona biel na telefonie znajdzie dziurkę od klucza albo kota bez oślepiającej latarki.'],
      ['Ustawienie projektora i telewizora', 'Sprawdź ostrość, korekcję trapezu, jaśniejsze plamy i przebarwienia na projektorze albo nowym telewizorze.']
    ],
    dlH: 'Pobierz biały obraz (PNG)',
    dlIntro: 'Potrzebujesz białego obrazka zamiast białej strony? Na tapetę, zaślepkę, tło do filmu albo pustą kartkę do druku. Wybierz rozmiar i pobierz idealnie biały PNG. Powstaje w Twojej przeglądarce, więc działa dla każdego rozmiaru do 16 384 pikseli na bok, także na telefonie.',
    dlSize: 'Rozmiar', dlCustom: 'Własny rozmiar', dlW: 'Szerokość', dlH2: 'Wysokość', dlPx: 'px', dlGo: 'Pobierz',
    dlGroups: { screen: 'Ekrany', device: 'Telefon i tablet', print: 'Druk', social: 'Media społecznościowe' },
    dlReady: 'Gotowe pliki', dlReadyIntro: 'Najczęstsze rozmiary jako zwykłe pliki, które możesz podlinkować albo zapisać prawym przyciskiem:',
    dlMade: 'Zapisano', dlErr: 'Podaj szerokość i wysokość od 1 do 16 384 pikseli.',
    vidH: 'Biały ekran jako wideo: 10 godzin, darmowe MP4',
    vidIntro: 'Nie każdy ekran otworzy stronę na pełnym ekranie: telewizory bez przeglądarki, cyfrowe ramki na zdjęcia, projektory z portem USB, programy do prezentacji i montażu. Wideo działa wszędzie. To moje własne, 10-godzinne, idealnie białe wideo. Odtwórz je tutaj (zapętla się) albo pobierz MP4 i włącz z pendrive’a, w aplikacji telewizora lub w dowolnym odtwarzaczu.',
    vidName: 'Biały ekran, 10 godzin (idealnie białe wideo)', vidFs: 'Odtwórz na pełnym ekranie', vidDl: 'Pobierz MP4',
    vidNote: 'Zakodowane z jedną klatką na sekundę, więc dziesięć godzin bieli waży tylko kilka megabajtów. Biel jest dokładna: biel wideo (Y 235), którą odtwarzacze pokazują jako RGB 255, 255, 255. Używaj go, gdzie chcesz, bez podawania autora (CC0).',
    vidDesc: 'Dziesięciogodzinne wideo z idealnie białym ekranem (RGB 255, 255, 255) do czyszczenia ekranu, testowania wyświetlacza albo jako światło na telewizorze i projektorze bez przeglądarki. Darmowe MP4 w 1080p i 4K, CC0.',
    cmpH: 'Biała strona, biały obraz czy białe wideo?',
    cmpHead: ['', 'Ta strona', 'Biały obraz (PNG)', 'Białe wideo (MP4)'],
    cmp: [
      ['Pełny ekran', 'Jedno kliknięcie albo F', 'W przeglądarce zdjęć', 'W każdym odtwarzaczu'],
      ['Dokładne #FFFFFF', 'Tak', 'Tak', 'Tak'],
      ['Działa bez internetu', 'Po załadowaniu', 'Tak', 'Po pobraniu'],
      ['Na telewizorze', 'Przeglądarka TV albo przesyłanie', 'Pendrive albo aplikacja zdjęć', 'Pendrive albo odtwarzacz w telewizorze'],
      ['Ekran nie gaśnie', 'Tak, w większości przeglądarek', 'Nie', 'Tak']
    ],
    faq: [
      { q: 'Jak zrobić cały ekran na biało?', a: 'Otwórz tę stronę i naciśnij **Pełny ekran** (albo klawisz **F**, albo kliknij w dowolnym miejscu białego pola). Przeglądarka schowa karty i paski, a cały ekran zrobi się biały. **Esc** wraca.' },
      { q: 'Jak wyjść z białego ekranu?', a: 'Naciśnij **Esc** na klawiaturze albo kliknij dwukrotnie. Na telefonie lub tablecie dotknij ekranu, żeby pokazać przyciski, i stuknij **Zamknij pełny ekran**.' },
      { q: 'Czy działa na iPhonie?', a: 'Tak. Safari na iPhonie pozwala przejść na prawdziwy pełny ekran tylko filmom, więc na iPhonie przycisk **Pełny ekran** odtwarza na pełnym ekranie własne białe wideo tej strony, od krawędzi do krawędzi. Przy ciepłym, chłodnym albo przygaszonym odcieniu strona wypełnia ekran, a Safari zostawia cienki pasek; wtedy stuknij **Udostępnij**, potem **Do ekranu początkowego**, i otwórz biały ekran stamtąd. iPad i telefony z Androidem obsługują prawdziwy pełny ekran dla każdego odcienia.' },
      { q: 'Jak włączyć biały ekran na telewizorze?', a: 'Otwórz tę stronę w przeglądarce telewizora, prześlij kartę przeglądarki z telefonu albo laptopa, albo podłącz laptop przez HDMI i naciśnij F. Bez przeglądarki pobierz poniżej 10-godzinne białe MP4 i odtwórz je z pendrive’a albo w odtwarzaczu telewizora.' },
      { q: 'Czy biały ekran może uszkodzić wyświetlacz?', a: 'Nie. Kilka minut bieli to zwykłe użycie, zarówno dla LCD, jak i OLED. Wypalenie na OLED-ach bierze się z tego samego obrazu, na przykład logo albo paska zadań, wyświetlanego przez setki godzin. Jednolita biel nie ma kształtu, który mógłby się wypalić. Jeśli codziennie przez kilka godzin używasz OLED-a jako lampy, zmniejsz trochę jasność.' },
      { q: 'Czy czyścić ekran, gdy jest włączony?', a: 'Czyść, gdy jest wyłączony, a potem włącz go i sprawdź na bieli. Wyłączona matryca jest chłodniejsza, więc płyn schnie bez smug, i nic przypadkiem nie klikniesz.' },
      { q: 'Dlaczego biel jest żółtawa, niebieskawa albo za ciemna?', a: 'Strona nie może zmienić jasności ani kolorów ekranu. Podkręć jasność i wyłącz automatyczną jasność, Night Shift, True Tone, Światło nocne albo tryb ochrony oczu, a biel będzie najbardziej neutralna. Odcienie **Ciepła** i **Chłodna** są tu celowo, do oświetlenia.' },
      { q: 'Czy ekran nie zgaśnie?', a: 'Na pełnym ekranie strona prosi przeglądarkę, żeby nie wygaszała ekranu (Screen Wake Lock API, obsługują je Chrome, Edge, Safari i Firefox). Jeśli Twoja przeglądarka tego nie potrafi, zmień czas wygaszania albo użyj 10-godzinnego filmu.' },
      { q: 'Czy to naprawdę czysta biel?', a: 'Tak. Strona i pliki PNG mają dokładnie **#FFFFFF**, czyli RGB 255, 255, 255 w sRGB, a wideo dekoduje się do tej samej bieli. Pliki PNG mają znacznik sRGB, więc programy nie przeliczają koloru.' },
      { q: 'Są skróty klawiszowe?', a: '**F** włącza i wyłącza pełny ekran, **Esc** wychodzi, **1** do **4** przełączają czystą, ciepłą, chłodną i przygaszoną biel, a podwójne kliknięcie też przełącza pełny ekran.' },
      { q: 'Czy działa bez internetu?', a: 'Po załadowaniu strony pełny ekran, odcienie i pobieranie obrazów działają bez internetu. Wideo płynie z tej strony; pobierz MP4, żeby oglądać je bez internetu.' },
      { q: 'Czy to jest darmowe?', a: 'Tak. Bez konta, bez reklam, bez płatnej wersji. Zrobiłem to dla siebie i trzymam dla wszystkich.' }
    ]
  }
};
export const COPY = C;

const ICON_FS = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" class="i-enter"><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" class="i-exit"><path d="M9 4v4a1 1 0 0 1-1 1H4M20 9h-4a1 1 0 0 1-1-1V4M15 20v-4a1 1 0 0 1 1-1h4M4 15h4a1 1 0 0 1 1 1v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
const ICON_DL = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function surface(lang, T, paths) {
  const inny = lang === 'en' ? 'pl' : 'en';
  return `<section class="stage" id="stage" data-tint="white" aria-label="${esc(T.stage)}">
  <div class="stage-top ui"><a href="/${paths.hub}" class="stage-crumb">ciunkos.com<span aria-hidden="true"> / </span>${esc(lang === 'pl' ? 'Darmowe narzędzia' : 'Free tools')}</a><a class="stage-lang" href="/${paths[inny]}" hreflang="${inny}" lang="${inny}" data-track="lang_switched" data-to="${inny}">${inny === 'pl' ? 'Polski' : 'English'}</a></div>
  <div class="dock ui" role="group" aria-label="${esc(T.controls)}">
    <p class="dock-hint" id="dock-hint"><span class="hint-desk">${T.hint}</span><span class="hint-touch">${esc(T.hintTouch)}</span></p>
    <div class="dock-bar">
      <button class="fs-btn" id="fs-btn" type="button" aria-describedby="dock-hint" data-label-enter="${esc(T.fs)}" data-label-exit="${esc(T.fsExit)}">${ICON_FS}<span class="fs-label">${esc(T.fs)}</span></button>
      <div class="tints" role="radiogroup" aria-label="${esc(T.shade)}">${TINTS.map((t, i) => `<button type="button" role="radio" class="tint" data-tint="${t.id}" aria-checked="${i === 0}" aria-label="${esc(t[lang])}" title="${esc(t[lang])} (${i + 1})" style="--c:${t.hex}"></button>`).join('')}</div>
      <a class="dock-dl" href="#download" data-track="dock_download_clicked">${ICON_DL}<span>${esc(T.download)}</span></a>
    </div>
  </div>
  <a class="stage-more ui" href="#content">${esc(T.more)} <span aria-hidden="true">↓</span></a>
  <p class="stage-toast" id="stage-toast" role="status" aria-live="polite" data-desk="${esc(T.toastDesk)}" data-touch="${esc(T.toastTouch)}" data-ios="${esc(T.iosTip)}"></p>
</section>`;
}

function body(lang, T) {
  const VIDEOS = videoFiles();
  const L = (v) => (typeof v === 'object' ? v[lang] : v);
  const groups = [...new Set(PRESETS.map((p) => p.group))];
  const prebuilt = PRESETS.filter((p) => p.prebuilt);
  return `
<section aria-labelledby="how"><h2 id="how">${esc(T.howH)}</h2>
  <p>${esc(T.howIntro)}</p>
  <ol class="steps">${T.steps.map(([h, t]) => `<li><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('')}</ol>
  <p><a class="btn btn-primary" href="#stage" data-fs-jump data-track="fullscreen_from_steps">${esc(T.fs)} ↑</a></p>
</section>

<section aria-labelledby="uses"><h2 id="uses">${esc(T.usesH)}</h2>
  <ul class="uses">${T.uses.map(([h, t]) => `<li><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('')}</ul>
</section>

<section aria-labelledby="download" class="dl-sec"><h2 id="download">${esc(T.dlH)}</h2>
  <p>${esc(T.dlIntro)}</p>
  <form class="dl" id="dl" novalidate>
    <fieldset class="dl-presets"><legend>${esc(T.dlSize)}</legend>
      ${groups.map((g) => `<div class="dl-group"><p class="dl-gname">${esc(T.dlGroups[g])}</p><div class="chips">${PRESETS.filter((p) => p.group === g).map((p) => `<label class="chip"><input type="radio" name="size" value="${p.id}" data-w="${p.w}" data-h="${p.h}"${p.id === 'fhd' ? ' checked' : ''}><span><strong>${esc(L(p.label))}</strong><small>${p.w}×${p.h}</small></span></label>`).join('')}</div></div>`).join('\n      ')}
      <div class="dl-group"><p class="dl-gname">${esc(T.dlCustom)}</p><div class="dl-custom">
        <label><span>${esc(T.dlW)}</span><input type="number" id="dl-w" inputmode="numeric" min="1" max="16384" step="1" value="1920"></label>
        <span class="dl-x" aria-hidden="true">×</span>
        <label><span>${esc(T.dlH2)}</span><input type="number" id="dl-h" inputmode="numeric" min="1" max="16384" step="1" value="1080"></label>
      </div></div>
    </fieldset>
    <div class="dl-go"><div class="dl-preview" id="dl-preview" aria-hidden="true"><span></span></div>
      <button class="btn btn-primary btn-lg" type="submit" id="dl-btn">${ICON_DL}<span>${esc(T.dlGo)} <span id="dl-name">${fileName(1920, 1080)}</span></span></button>
      <p class="dl-note" id="dl-note" role="status" aria-live="polite" data-made="${esc(T.dlMade)}" data-err="${esc(T.dlErr)}"></p></div>
  </form>
  <h3>${esc(T.dlReady)}</h3>
  <p>${esc(T.dlReadyIntro)}</p>
  <ul class="ready">${prebuilt.map((p) => `<li><a href="${ASSETY}/img/${fileName(p.w, p.h)}" download data-track="image_downloaded" data-size="${p.w}x${p.h}" data-how="ready"><span class="ready-frame" style="aspect-ratio:${p.w}/${p.h}"><img src="${ASSETY}/img/${fileName(p.w, p.h)}" width="${p.w}" height="${p.h}" loading="lazy" decoding="async" alt="${esc(lang === 'pl' ? `Biały obraz ${p.w}×${p.h} px, kolor #FFFFFF` : `Pure white image, ${p.w}×${p.h} px, #FFFFFF`)}"></span><span class="ready-cap"><strong>${esc(L(p.label))}</strong> ${p.w}×${p.h} PNG</span></a></li>`).join('')}</ul>
</section>

<section aria-labelledby="video"><h2 id="video">${esc(T.vidH)}</h2>
  <p>${esc(T.vidIntro)}</p>
  <div class="video" id="video-box"><video id="ws-video" src="${ASSETY}/video/${VIDEOS[0].file}" poster="${ASSETY}/img/${fileName(1920, 1080)}" width="1920" height="1080" preload="none" controls loop muted playsinline disablepictureinpicture title="${esc(T.vidName)}"></video><span class="video-len" aria-hidden="true">10:00:00</span></div>
  <div class="video-actions">
    <button type="button" class="btn btn-primary btn-lg" id="video-fs" data-track="video_fullscreen">${ICON_PLAY}<span>${esc(T.vidFs)}</span></button>
    ${VIDEOS.map((v) => `<a class="btn" href="${ASSETY}/video/${v.file}" download data-track="video_downloaded" data-size="${v.id}">${ICON_DL}<span>${esc(T.vidDl)} ${v.id === '4k' ? '4K' : v.id} <small>(${mb(v.bytes)} MB)</small></span></a>`).join('\n    ')}
  </div>
  <p class="small muted">${esc(T.vidNote)}</p>
</section>

<section aria-labelledby="compare"><h2 id="compare">${esc(T.cmpH)}</h2>
  <div class="table-wrap" role="region" aria-label="${esc(lang === 'pl' ? 'Tabela porównania' : 'Comparison table')}" tabindex="0"><table class="cmp">
    <thead><tr>${T.cmpHead.map((h, i) => (i ? `<th scope="col">${esc(h)}</th>` : `<td></td>`)).join('')}</tr></thead>
    <tbody>${T.cmp.map(([h, ...c]) => `<tr><th scope="row">${esc(h)}</th>${c.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>
</section>`;
}

export function render({ lang, wersja, updated }) {
  const T = C[lang];
  const path = { en: sciezka(ID, 'en'), pl: sciezka(ID, 'pl') };
  const url = BAZA + '/' + path[lang];
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: T.title, description: T.metaDescription, inLanguage: lang, mainEntity: { '@id': url + '#app' }, about: { '@type': 'Thing', name: lang === 'pl' ? 'Biały ekran' : 'White screen' }, primaryImageOfPage: { '@id': url + '#image-fhd' }, video: { '@id': url + '#video' } },
    webApp({ id: ID, lang, url, C: T }),
    { '@context': 'https://schema.org', '@type': 'HowTo', '@id': url + '#how', name: T.howH, description: T.howIntro, totalTime: T.howTotal, inLanguage: lang,
      supply: (lang === 'pl' ? ['Dwie ściereczki z mikrofibry', 'Chusteczki do ekranów albo woda destylowana'] : ['Two microfibre cloths', 'Screen wipes or distilled water']).map((name) => ({ '@type': 'HowToSupply', name })),
      tool: { '@type': 'HowToTool', name: TOOLS[ID].name[lang], url },
      step: T.steps.map(([name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text, url: url + '#how' })) },
    { '@context': 'https://schema.org', '@type': 'VideoObject', '@id': url + '#video', name: T.vidName, description: T.vidDesc, inLanguage: lang,
      thumbnailUrl: [BAZA + ASSETY + '/og/white-screen-' + lang + '.jpg', BAZA + ASSETY + '/img/' + fileName(1920, 1080)], uploadDate: VIDEO_PUBLISHED, duration: 'PT10H',
      contentUrl: BAZA + ASSETY + '/video/' + VIDEOS[0].file, encodingFormat: 'video/mp4', width: 1920, height: 1080, isFamilyFriendly: true, isAccessibleForFree: true,
      creator: { '@id': PERSON_ID }, license: 'https://creativecommons.org/publicdomain/zero/1.0/', url: url + '#video' },
    ...PRESETS.filter((p) => p.prebuilt).map((p) => ({ '@context': 'https://schema.org', '@type': 'ImageObject', '@id': url + '#image-' + p.id, contentUrl: BAZA + ASSETY + '/img/' + fileName(p.w, p.h), name: (lang === 'pl' ? 'Biały obraz ' : 'White image ') + `${p.w}×${p.h}`, description: lang === 'pl' ? `Idealnie biały PNG ${p.w}×${p.h} pikseli (#FFFFFF), do pobrania za darmo.` : `A pure white ${p.w}×${p.h} pixel PNG (#FFFFFF), free to download.`, width: { '@type': 'QuantitativeValue', value: p.w, unitCode: 'E37' }, height: { '@type': 'QuantitativeValue', value: p.h, unitCode: 'E37' }, encodingFormat: 'image/png', creator: { '@id': PERSON_ID }, creditText: 'Przemysław Zalewski', copyrightNotice: 'Public domain (CC0)', license: 'https://creativecommons.org/publicdomain/zero/1.0/', acquireLicensePage: url + '#download' })),
    faqLd(T.faq)
  ];
  const paths = { ...path, hub: lang === 'pl' ? 'darmowe-narzedzia' : 'free-tools' };
  return shell({
    id: ID, layout: 'surface', lang, wersja, path, C: T, ld, updated,
    surface: surface(lang, T, paths), body: body(lang, T),
    styles: ['t/white-screen/screen.css'], scripts: ['t/white-screen/screen.mjs'],
    headExtra: `<link rel="manifest" href="${ASSETY}/t/white-screen/manifest-${lang}.webmanifest">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="${esc(TOOLS[ID].name[lang])}">`
  });
}

/** Web app manifest per language: opened from the home screen, the page runs edge to edge (iPhone's only true full screen). */
export const manifest = (lang) => JSON.stringify({
  name: TOOLS[ID].name[lang] + ' · ciunkos.com', short_name: TOOLS[ID].name[lang], lang,
  start_url: '/' + sciezka(ID, lang) + '?source=homescreen', scope: '/' + sciezka(ID, lang), id: '/' + sciezka(ID, lang),
  display: 'fullscreen', display_override: ['fullscreen', 'standalone'], background_color: '#ffffff', theme_color: '#ffffff',
  icons: [{ src: ASSETY + '/icons/white-screen-192.png', sizes: '192x192', type: 'image/png' }, { src: ASSETY + '/icons/white-screen-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }]
}, null, 2);

export const llms = (lang) => `${TOOLS[ID].name[lang]}: ${BAZA}/${sciezka(ID, lang)}`;
export { inline };
