/* JWT decoder: copy (EN, PL), the tool panel and the reference below it. Client: app.mjs + jwt.mjs. */
import { esc, inline } from '../../src/html.mjs';
import { toolPage, privateNote, i18nScript } from '../../src/shell.mjs';

export const ID = 'jwt-decoder';

const C = {
  en: {
    title: 'JWT Decoder: Decode and Verify a JSON Web Token Online',
    metaDescription: 'Paste a JWT to read its header, claims and expiry in your time zone, and verify the signature. Decoded in your browser, never sent anywhere.',
    crumb: 'JWT decoder',
    h1: 'JWT decoder: read and verify a token without sending it anywhere',
    lead: 'Paste a JSON Web Token. You get the header and payload as readable JSON, every claim explained, when it expires in your time zone, and a signature check with your secret or public key. All of it happens in this browser tab.',
    przemo: 'I decode JWTs most weeks. An API answers 401, a login loops, or a token from a client’s identity provider is missing the role it should carry. The fastest way to find out is to read the token. The popular decoder sites want you to paste it into their page, and a token works like a password for as long as it lives.\n\nSo this one does it all in your browser: it decodes, shows the expiry in your own time zone, and checks the signature with a secret or a public key. The token is never sent, saved or put in the address bar.',
    ui: {
      token: 'Token', sample: 'Try a sample', paste: 'Paste', clear: 'Clear', placeholder: 'Paste a token: eyJhbGciOi…',
      header: 'Header', payload: 'Payload', signature: 'Signature', copy: 'Copy', copied: 'Copied',
      claims: 'Claims', claim: 'Claim', value: 'Value', meaning: 'Meaning',
      valid: 'Valid', expired: 'Expired', notYet: 'Not valid yet', noExp: 'No expiry',
      expiresIn: 'expires {when} ({rel})', expiredAgo: 'expired {when} ({rel})', startsIn: 'becomes valid {when} ({rel})', never: 'the token has no exp claim, so it never expires by itself',
      in: 'in {t}', ago: '{t} ago', now: 'just now', units: { d: 'd', h: 'h', m: 'min', s: 's' },
      warn: {
        'alg-none': 'alg is “none”: the token is not signed. A server must never accept it.',
        'no-exp': 'No exp claim: if this token leaks, it works forever unless the server checks something else.',
        'not-yet-valid': 'nbf is in the future: servers will reject the token until then.',
        'iat-future': 'iat (issued at) is in the future. Check the clock of the server that issued it.',
        'long-lived': 'Valid for more than a year. Long-lived tokens are risky if they leak.'
      },
      verify: 'Verify the signature', alg: 'Algorithm', secret: 'Secret', publicKey: 'Public key (PEM, JWK or JWKS)',
      secretPh: 'The secret the token was signed with', keyPh: '-----BEGIN PUBLIC KEY-----\n…\n-----END PUBLIC KEY-----\nor {"kty":"RSA",…} or a JWKS',
      b64secret: 'The secret is Base64-encoded', ok: 'Signature verified', bad: 'Signature does not match', unsupported: 'This algorithm cannot be verified here.',
      sampleNote: 'Sample token, signed with the secret “ciunkos-sample-secret”.', means: { iss: 'issuer', sub: 'subject (who the token is about)', aud: 'audience (who should accept it)', exp: 'expires', nbf: 'not valid before', iat: 'issued at', jti: 'token ID', azp: 'authorized party', scope: 'scopes', scp: 'scopes', roles: 'roles', groups: 'groups', email: 'email', email_verified: 'email verified', name: 'name', given_name: 'given name', family_name: 'family name', preferred_username: 'username', sid: 'session ID', tid: 'tenant ID', oid: 'object ID', nonce: 'nonce', auth_time: 'signed in at', acr: 'authentication level', amr: 'authentication methods', client_id: 'client ID' },
      errors: {}
    },
    partsH: 'What is inside a JWT',
    partsP: 'A JWT is three Base64url parts joined by dots: **header.payload.signature**. The header says how the token is signed (`alg`) and sometimes which key (`kid`). The payload carries the claims: who the token is about, who issued it, for whom and until when. The signature is computed over the first two parts with a secret or a private key, so any change to them breaks it.',
    partsP2: 'The header and payload are only encoded, not encrypted. Anyone who holds the token can read them, which is exactly what this page does. Never put a password or a secret in a JWT payload.',
    claimsH: 'Registered claims',
    claimsHead: ['Claim', 'Name', 'What it means'],
    claimsRows: [
      ['iss', 'Issuer', 'Who created and signed the token, usually the URL of the identity provider.'],
      ['sub', 'Subject', 'Who the token is about, usually a user ID.'],
      ['aud', 'Audience', 'Which API or app should accept it. A server should reject tokens meant for someone else.'],
      ['exp', 'Expiration time', 'Seconds since 1 January 1970 (UTC) after which the token is no longer valid.'],
      ['nbf', 'Not before', 'The token is not valid before this time.'],
      ['iat', 'Issued at', 'When the token was created.'],
      ['jti', 'JWT ID', 'A unique ID, used to stop the same token from being used twice.']
    ],
    safeH: 'Decoding is not verifying',
    safe: [
      'Anyone can decode a JWT. Only a signature check with the right key tells you the token is genuine and unchanged. Your server must verify every token, and never trust the payload on its own.',
      'Reject `alg: none`, and do not let the token choose the algorithm. Pin the algorithms your server expects; mixing HS256 and RS256 with one key is a classic attack.',
      'Check `exp`, `nbf`, `iss` and `aud` on the server, with a little clock leeway (a minute is common).',
      'Treat a token like a password. Do not paste live production tokens into sites you do not trust; this page never sends them anywhere, and you can check that in your browser’s network panel.'
    ],
    faq: [
      { q: 'Is it safe to paste my token here?', a: 'The token is decoded and verified in your browser with JavaScript and WebCrypto. It is not sent to any server, not saved, and not put in the URL. The page loads no third-party scripts that could read it. You can confirm it in the network panel of your browser’s developer tools.' },
      { q: 'Is a JWT encrypted?', a: 'No. A normal JWT (a JWS, three parts) is signed, not encrypted: the header and payload are Base64url, which anyone can decode. An encrypted token (a JWE) has five parts, and only the holder of the private key can read its payload; this page tells you when you paste one.' },
      { q: 'Why does it say my token is expired?', a: 'The `exp` claim is in seconds since 1970 in UTC, and the page compares it with your computer’s clock. If the time shown looks wrong, check your computer’s clock and time zone, or the clock of the server that issued the token.' },
      { q: 'Which algorithms can it verify?', a: 'HS256, HS384 and HS512 with a secret; RS256, RS384, RS512, PS256, PS384 and PS512 with an RSA public key; ES256, ES384 and ES512 with an EC public key; and EdDSA (Ed25519). The key can be a PEM `BEGIN PUBLIC KEY` block, a JWK, or a whole JWKS, in which case the key with the token’s `kid` is used.' },
      { q: 'Where do I find the public key?', a: 'Most identity providers publish their keys as a JWKS. Look for `jwks_uri` in `https://<issuer>/.well-known/openid-configuration`, open that address, and paste the JSON here. Auth0, Okta, Microsoft Entra ID, Google and Keycloak all work this way.' },
      { q: 'Can I edit a token or create a new one?', a: 'Not here, on purpose. A token you sign in a web page needs your secret or private key in that page. Create tokens with your server’s JWT library, where the key already lives.' },
      { q: 'Can I paste the whole Authorization header?', a: 'Yes. A leading `Bearer ` and any spaces or line breaks are removed before decoding.' },
      { q: 'Does it work offline?', a: 'Yes. Once the page has loaded, decoding and verifying need no connection.' }
    ]
  },
  pl: {
    title: 'Dekoder JWT: odczytaj i zweryfikuj token JWT online',
    metaDescription: 'Wklej token JWT i odczytaj nagłówek, claimy i datę wygaśnięcia w Twojej strefie czasowej oraz sprawdź podpis. Wszystko w przeglądarce, nic nie jest wysyłane.',
    crumb: 'Dekoder JWT',
    h1: 'Dekoder JWT: odczytaj i sprawdź token, nie wysyłając go nigdzie',
    lead: 'Wklej token JSON Web Token. Dostaniesz nagłówek i payload jako czytelny JSON, objaśnienie każdego claimu, datę wygaśnięcia w Twojej strefie czasowej i sprawdzenie podpisu sekretem albo kluczem publicznym. Wszystko dzieje się w tej karcie przeglądarki.',
    przemo: 'Dekoduję JWT prawie co tydzień. API odpowiada 401, logowanie się zapętla albo token od dostawcy tożsamości klienta nie ma roli, którą powinien mieć. Najszybciej dowiem się, o co chodzi, czytając token. Popularne dekodery każą wkleić go na swoją stronę, a token działa jak hasło, dopóki nie wygaśnie.\n\nTen robi wszystko w Twojej przeglądarce: dekoduje, pokazuje wygaśnięcie w Twojej strefie czasowej i sprawdza podpis sekretem albo kluczem publicznym. Token nie jest nigdzie wysyłany, zapisywany ani wstawiany do paska adresu.',
    ui: {
      token: 'Token', sample: 'Wypróbuj przykład', paste: 'Wklej', clear: 'Wyczyść', placeholder: 'Wklej token: eyJhbGciOi…',
      header: 'Nagłówek', payload: 'Payload', signature: 'Podpis', copy: 'Kopiuj', copied: 'Skopiowano',
      claims: 'Claimy', claim: 'Claim', value: 'Wartość', meaning: 'Znaczenie',
      valid: 'Ważny', expired: 'Wygasł', notYet: 'Jeszcze nieważny', noExp: 'Bez daty wygaśnięcia',
      expiresIn: 'wygasa {when} ({rel})', expiredAgo: 'wygasł {when} ({rel})', startsIn: 'będzie ważny od {when} ({rel})', never: 'token nie ma claimu exp, więc sam nigdy nie wygaśnie',
      in: 'za {t}', ago: '{t} temu', now: 'przed chwilą', units: { d: 'd', h: 'h', m: 'min', s: 's' },
      warn: {
        'alg-none': 'alg to „none”: token nie jest podpisany. Serwer nigdy nie powinien go przyjąć.',
        'no-exp': 'Brak claimu exp: jeśli token wycieknie, zadziała zawsze, chyba że serwer sprawdza coś innego.',
        'not-yet-valid': 'nbf jest w przyszłości: serwery odrzucą token do tego czasu.',
        'iat-future': 'iat (czas wydania) jest w przyszłości. Sprawdź zegar serwera, który go wydał.',
        'long-lived': 'Ważny dłużej niż rok. Długo żyjące tokeny są ryzykowne, gdy wyciekną.'
      },
      verify: 'Sprawdź podpis', alg: 'Algorytm', secret: 'Sekret', publicKey: 'Klucz publiczny (PEM, JWK albo JWKS)',
      secretPh: 'Sekret, którym podpisano token', keyPh: '-----BEGIN PUBLIC KEY-----\n…\n-----END PUBLIC KEY-----\nalbo {"kty":"RSA",…} albo JWKS',
      b64secret: 'Sekret jest zakodowany w Base64', ok: 'Podpis zgodny', bad: 'Podpis się nie zgadza', unsupported: 'Tego algorytmu nie da się tu sprawdzić.',
      sampleNote: 'Przykładowy token podpisany sekretem „ciunkos-sample-secret”.', means: { iss: 'wystawca', sub: 'podmiot (kogo dotyczy token)', aud: 'odbiorca (kto ma go przyjąć)', exp: 'wygasa', nbf: 'nieważny przed', iat: 'wydany', jti: 'ID tokena', azp: 'strona upoważniona', scope: 'zakresy', scp: 'zakresy', roles: 'role', groups: 'grupy', email: 'e-mail', email_verified: 'e-mail potwierdzony', name: 'imię i nazwisko', given_name: 'imię', family_name: 'nazwisko', preferred_username: 'nazwa użytkownika', sid: 'ID sesji', tid: 'ID dzierżawy', oid: 'ID obiektu', nonce: 'nonce', auth_time: 'zalogowano', acr: 'poziom uwierzytelnienia', amr: 'metody uwierzytelnienia', client_id: 'ID klienta' },
      errors: {
        'The token is empty.': 'Token jest pusty.',
        'This is an encrypted token (JWE, 5 parts). Its payload can only be read with the private key.': 'To token szyfrowany (JWE, 5 części). Jego payload odczyta tylko posiadacz klucza prywatnego.',
        'The header is not JSON.': 'Nagłówek nie jest JSON-em.', 'The payload is not JSON.': 'Payload nie jest JSON-em.',
        'The header is not UTF-8 text.': 'Nagłówek nie jest tekstem UTF-8.', 'The payload is not UTF-8 text.': 'Payload nie jest tekstem UTF-8.'
      }
    },
    partsH: 'Co jest w środku JWT',
    partsP: 'JWT to trzy części w Base64url połączone kropkami: **nagłówek.payload.podpis**. Nagłówek mówi, jak token jest podpisany (`alg`), a czasem którym kluczem (`kid`). Payload niesie claimy: kogo dotyczy token, kto go wydał, dla kogo i do kiedy. Podpis liczy się z dwóch pierwszych części sekretem albo kluczem prywatnym, więc każda ich zmiana go psuje.',
    partsP2: 'Nagłówek i payload są tylko zakodowane, nie zaszyfrowane. Każdy, kto ma token, może je przeczytać, i dokładnie to robi ta strona. Nigdy nie wkładaj hasła ani sekretu do payloadu JWT.',
    claimsH: 'Zarejestrowane claimy',
    claimsHead: ['Claim', 'Nazwa', 'Co znaczy'],
    claimsRows: [
      ['iss', 'Wystawca', 'Kto utworzył i podpisał token, zwykle adres dostawcy tożsamości.'],
      ['sub', 'Podmiot', 'Kogo dotyczy token, zwykle ID użytkownika.'],
      ['aud', 'Odbiorca', 'Które API albo aplikacja ma go przyjąć. Serwer powinien odrzucać tokeny przeznaczone dla kogoś innego.'],
      ['exp', 'Wygaśnięcie', 'Sekundy od 1 stycznia 1970 (UTC), po których token przestaje być ważny.'],
      ['nbf', 'Nie wcześniej niż', 'Przed tym czasem token nie jest ważny.'],
      ['iat', 'Wydany', 'Kiedy token utworzono.'],
      ['jti', 'ID tokena', 'Unikalny identyfikator, który pozwala nie przyjąć tego samego tokena dwa razy.']
    ],
    safeH: 'Dekodowanie to nie weryfikacja',
    safe: [
      'Każdy może zdekodować JWT. Dopiero sprawdzenie podpisu właściwym kluczem mówi, że token jest prawdziwy i niezmieniony. Twój serwer musi weryfikować każdy token i nigdy nie ufać samemu payloadowi.',
      'Odrzucaj `alg: none` i nie pozwalaj, żeby to token wybierał algorytm. Ustal na serwerze, jakich algorytmów oczekujesz; mieszanie HS256 i RS256 z jednym kluczem to klasyczny atak.',
      'Sprawdzaj na serwerze `exp`, `nbf`, `iss` i `aud`, z małym zapasem na różnicę zegarów (często minuta).',
      'Traktuj token jak hasło. Nie wklejaj produkcyjnych tokenów na strony, którym nie ufasz; ta strona nigdzie ich nie wysyła, co sprawdzisz w panelu sieci w przeglądarce.'
    ],
    faq: [
      { q: 'Czy mogę bezpiecznie wkleić tu swój token?', a: 'Token jest dekodowany i weryfikowany w Twojej przeglądarce, JavaScriptem i WebCrypto. Nie trafia na żaden serwer, nie jest zapisywany ani wstawiany do adresu. Strona nie ładuje skryptów firm trzecich, które mogłyby go odczytać. Sprawdzisz to w panelu sieci w narzędziach deweloperskich przeglądarki.' },
      { q: 'Czy JWT jest zaszyfrowany?', a: 'Nie. Zwykły JWT (JWS, trzy części) jest podpisany, nie zaszyfrowany: nagłówek i payload to Base64url, który każdy zdekoduje. Token szyfrowany (JWE) ma pięć części i jego payload odczyta tylko posiadacz klucza prywatnego; strona powie Ci, gdy taki wkleisz.' },
      { q: 'Dlaczego pisze, że token wygasł?', a: 'Claim `exp` to sekundy od 1970 roku w UTC, a strona porównuje go z zegarem Twojego komputera. Jeśli czas wygląda źle, sprawdź zegar i strefę czasową komputera albo zegar serwera, który wydał token.' },
      { q: 'Jakie algorytmy da się zweryfikować?', a: 'HS256, HS384 i HS512 sekretem; RS256, RS384, RS512, PS256, PS384 i PS512 kluczem publicznym RSA; ES256, ES384 i ES512 kluczem EC; oraz EdDSA (Ed25519). Klucz może być blokiem PEM `BEGIN PUBLIC KEY`, JWK albo całym JWKS; wtedy użyty zostanie klucz z `kid` tokena.' },
      { q: 'Gdzie znajdę klucz publiczny?', a: 'Większość dostawców tożsamości publikuje klucze jako JWKS. Znajdź `jwks_uri` w `https://<wystawca>/.well-known/openid-configuration`, otwórz ten adres i wklej tu JSON. Tak działają Auth0, Okta, Microsoft Entra ID, Google i Keycloak.' },
      { q: 'Czy mogę edytować token albo utworzyć nowy?', a: 'Nie tutaj, celowo. Token podpisany na stronie wymaga Twojego sekretu albo klucza prywatnego na tej stronie. Twórz tokeny biblioteką JWT na serwerze, tam, gdzie klucz już jest.' },
      { q: 'Czy mogę wkleić cały nagłówek Authorization?', a: 'Tak. Początkowe `Bearer ` oraz spacje i podziały linii są usuwane przed dekodowaniem.' },
      { q: 'Czy działa bez internetu?', a: 'Tak. Po załadowaniu strony dekodowanie i weryfikacja nie potrzebują połączenia.' }
    ]
  }
};
export const COPY = C;

function tool(lang, T) {
  const U = T.ui;
  return `${i18nScript({ lang, ...U })}
<div class="wb jwt" id="jwt">
  <div class="wb-head"><label class="wb-label" for="jwt-in">${esc(U.token)}</label>
    <div class="wb-actions"><button type="button" class="btn btn-sm" id="jwt-sample" data-track="jwt_sample">${esc(U.sample)}</button><button type="button" class="btn btn-sm" id="jwt-paste">${esc(U.paste)}</button><button type="button" class="btn btn-sm" id="jwt-clear">${esc(U.clear)}</button></div></div>
  <textarea class="wb-area mono" id="jwt-in" rows="5" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="${esc(U.placeholder)}"></textarea>
  <p class="wb-error" id="jwt-error" role="alert" hidden></p>
  <div class="jwt-out" id="jwt-out" hidden>
    <div class="jwt-status" id="jwt-status" role="status"></div>
    <ul class="jwt-warn" id="jwt-warn"></ul>
    <div class="jwt-grid">
      <section class="jwt-card" aria-labelledby="jwt-h-h"><div class="jwt-card-head"><h2 class="wb-h" id="jwt-h-h"><i class="dot dot-h" aria-hidden="true"></i>${esc(U.header)}</h2><button type="button" class="btn btn-sm" data-copy="header">${esc(U.copy)}</button></div><pre class="code json" id="jwt-header"></pre></section>
      <section class="jwt-card" aria-labelledby="jwt-p-h"><div class="jwt-card-head"><h2 class="wb-h" id="jwt-p-h"><i class="dot dot-p" aria-hidden="true"></i>${esc(U.payload)}</h2><button type="button" class="btn btn-sm" data-copy="payload">${esc(U.copy)}</button></div><pre class="code json" id="jwt-payload"></pre></section>
    </div>
    <div class="table-wrap jwt-claims-wrap" role="region" aria-label="${esc(U.claims)}" tabindex="0"><table class="ref jwt-claims"><thead><tr><th scope="col">${esc(U.claim)}</th><th scope="col">${esc(U.value)}</th><th scope="col">${esc(U.meaning)}</th></tr></thead><tbody id="jwt-claims"></tbody></table></div>
    <details class="jwt-verify" id="jwt-verify"><summary><i class="dot dot-s" aria-hidden="true"></i>${esc(U.verify)} <span class="jwt-alg" id="jwt-alg"></span> <span class="jwt-vres" id="jwt-vres-short"></span></summary>
      <div class="jwt-verify-in">
        <label class="wb-label" for="jwt-key" id="jwt-key-label">${esc(U.secret)}</label>
        <textarea class="wb-area mono jwt-key" id="jwt-key" rows="3" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>
        <label class="check" id="jwt-b64-wrap"><input type="checkbox" id="jwt-b64"> ${esc(U.b64secret)}</label>
        <p class="jwt-vres" id="jwt-vres" role="status"></p>
      </div>
    </details>
  </div>
  <div class="wb-foot">${privateNote(lang)}<span id="jwt-note"></span></div>
</div>`;
}

function body(lang, T) {
  return `
<section aria-labelledby="parts"><h2 id="parts">${esc(T.partsH)}</h2>
  <p class="jwt-anatomy" aria-hidden="true"><span class="seg-h">eyJhbGciOiJIUzI1NiJ9</span>.<span class="seg-p">eyJzdWIiOiI0MiJ9</span>.<span class="seg-s">dBjftJeZ4CVP…</span></p>
  <p>${inline(T.partsP)}</p>
  <p>${inline(T.partsP2)}</p>
</section>
<section aria-labelledby="claims-ref"><h2 id="claims-ref">${esc(T.claimsH)}</h2>
  <div class="table-wrap" role="region" aria-label="${esc((lang === 'pl' ? 'Tabela: ' : 'Table: ') + T.claimsH)}" tabindex="0"><table class="ref">
    <thead><tr>${T.claimsHead.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${T.claimsRows.map(([c, n, m]) => `<tr><th scope="row"><code>${c}</code></th><td>${esc(n)}</td><td>${esc(m)}</td></tr>`).join('')}</tbody>
  </table></div>
</section>
<section aria-labelledby="safe"><h2 id="safe">${esc(T.safeH)}</h2>
  <ul class="bullets">${T.safe.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>
</section>`;
}

export function render({ lang, wersja, updated }) {
  const T = C[lang];
  return toolPage({ id: ID, lang, wersja, updated, C: T, tool: tool(lang, T), body: body(lang, T), about: 'JSON Web Token' });
}
