/* indexnow.mjs — po deployu zgłasza Bingowi i reszcie sieci IndexNow (Yandex, Seznam, Naver; z indeksu Binga
   biorą też Copilot i wyszukiwarka ChatGPT) strony tego narzędzia, które się zmieniły. Wzór: ~/translate/scripts/indexnow.mjs.

   Adresy z public/free-tools/sitemap.xml. Zmianę poznajemy po odcisku: hash pliku public/<ścieżka>.html (strona
   statyczna), a gdy go nie ma, wersja assetów. Stan poprzedniego zgłoszenia w indexnow-stan.json (poza repo
   i serwerem); bez niego pierwszy przebieg zgłasza wszystko.

   Klucz jest publiczny z założenia i wspólny dla wszystkich narzędzi: plik <klucz>.txt w katalogu głównym
   ciunkos.com (repo ~/ciunkos.com, src/www), więc obejmuje oba prefiksy (EN i PL) każdego narzędzia.

   Uruchamia go npm po deployu (postdeploy). Błąd sieci nie wywraca deployu: strona już jest na produkcji,
   a stan zapisujemy dopiero po przyjęciu, więc następny deploy zgłosi te same adresy jeszcze raz.

   Użycie: node scripts/indexnow.mjs [--dry]                                                                  */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const KLUCZ = '08dbbbbe0e3f16209c702ea9070b6a44';
const HOST = 'ciunkos.com';
const STAN = new URL('../indexnow-stan.json', import.meta.url);
const dry = process.argv.includes('--dry');
const hash = (b) => createHash('sha1').update(b).digest('hex').slice(0, 12);

const mapa = readFileSync(new URL('../public/free-tools/sitemap.xml', import.meta.url), 'utf8');
const adresy = [...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => new URL(u).host === HOST);
const wersja = existsSync(new URL('../src/wersja.mjs', import.meta.url)) ? readFileSync(new URL('../src/wersja.mjs', import.meta.url), 'utf8') : String(Date.now());
const teraz = {};
for (const u of adresy) {
  const plik = new URL('../public' + new URL(u).pathname + '.html', import.meta.url);
  teraz[u] = existsSync(plik) ? hash(readFileSync(plik)) : hash(wersja);
}

let bylo = {};
try { if (existsSync(STAN)) bylo = JSON.parse(readFileSync(STAN, 'utf8')); } catch { bylo = {}; }
const zmienione = Object.keys(teraz).filter((u) => bylo[u] !== teraz[u]);
if (!zmienione.length) { console.log('IndexNow: nic nowego do zgłoszenia.'); process.exit(0); }
if (dry) { console.log('IndexNow (--dry): zgłosiłbym ' + zmienione.length + ' adresów, m.in.\n  ' + zmienione.slice(0, 5).join('\n  ')); process.exit(0); }

try {
  const odp = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KLUCZ, keyLocation: 'https://' + HOST + '/' + KLUCZ + '.txt', urlList: zmienione })
  });
  /* 200 = przyjęte, 202 = przyjęte, klucz jeszcze w weryfikacji. */
  if (odp.status !== 200 && odp.status !== 202) {
    console.warn('IndexNow: odmowa ' + odp.status + ' ' + (await odp.text()).slice(0, 200) + ' (stan bez zmian, następny deploy spróbuje znowu).');
    process.exit(0);
  }
  writeFileSync(STAN, JSON.stringify({ ...bylo, ...Object.fromEntries(zmienione.map((u) => [u, teraz[u]])) }));
  console.log('IndexNow: zgłoszono ' + zmienione.length + ' adresów (HTTP ' + odp.status + ').');
} catch (e) {
  console.warn('IndexNow: nie doszło (' + e.message + '), stan bez zmian, następny deploy spróbuje znowu.');
}
