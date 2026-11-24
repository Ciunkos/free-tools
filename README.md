# Free tools ([ciunkos.com/free-tools](https://ciunkos.com/free-tools))

Small, fast, private browser tools. Each one solves a problem I had myself, and each page says so in a "Przemo says"
callout. Polish versions live under [/darmowe-narzedzia](https://ciunkos.com/darmowe-narzedzia).

| Tool | EN | PL |
| --- | --- | --- |
| White screen | [/free-tools/white-screen](https://ciunkos.com/free-tools/white-screen) | [/darmowe-narzedzia/bialy-ekran](https://ciunkos.com/darmowe-narzedzia/bialy-ekran) |
| JWT decoder | [/free-tools/jwt-decoder](https://ciunkos.com/free-tools/jwt-decoder) | [/darmowe-narzedzia/dekoder-jwt](https://ciunkos.com/darmowe-narzedzia/dekoder-jwt) |
| Character counter | [/free-tools/character-counter](https://ciunkos.com/free-tools/character-counter) | [/darmowe-narzedzia/licznik-znakow](https://ciunkos.com/darmowe-narzedzia/licznik-znakow) |
| Base64 | [/free-tools/base64-encode-decode](https://ciunkos.com/free-tools/base64-encode-decode) | [/darmowe-narzedzia/base64-koduj-dekoduj](https://ciunkos.com/darmowe-narzedzia/base64-koduj-dekoduj) |
| File converter (34 x-to-y pages) | [/free-tools/converter](https://ciunkos.com/free-tools/converter) | [/darmowe-narzedzia/konwerter](https://ciunkos.com/darmowe-narzedzia/konwerter) |

## How it is built

A Cloudflare Worker on the ciunkos.com routes `/free-tools*` and `/darmowe-narzedzia*` serves static HTML rendered by
`build.mjs`. Tools run entirely in the browser; the Worker only serves files, the health check and the PostHog proxy.

```
src/meta.mjs            registry of tools (slugs, names, the pain each solves, status live/soon)
src/shell.mjs           page frame: head, "Przemo says", FAQ, More free tools, author card, shared footer
src/hub.mjs             the /free-tools directory page
src/shared/*            byte copies kept in sync from ~/hire and ciunkos.com (footer, schema-ld, daty, PostHog SDK)
tools/<id>/page.mjs     copy (EN, PL), markup and JSON-LD of one tool; its git history is the page's dateModified
tools/<id>/*.mjs|.css   client code, copied to public/free-tools/<slug>/ by the build (served at /free-tools/<slug>/<file>)
```

### Adding a tool

1. Write down the pain it solves, in my words, for the `przemo` copy (EN and native PL). The build fails without it.
2. Add `tools/<id>/page.mjs` exporting `render({ lang, wersja, updated })`, plus client files.
3. Add the entry to `TOOLS` in `src/meta.mjs` with `status: 'live'`. Routes, sitemap, llms.txt, the hub and links follow.
4. Unit-test the pure logic in `tests/<id>.test.mjs`; add page checks to `tests/pages.spec.js`.
5. Run `npm run images` to make its icon and OG cards.

## Commands

```sh
npm run build        # pages, sitemap, llms.txt, lint (CSP, titles, JSON-LD, "Przemo says"); encodes the white videos if missing (needs ffmpeg)
npm run test:unit    # node --test
npm test             # build + Playwright (desktop and iPhone, axe)
npm run dev          # wrangler dev on :8798
npm run deploy       # hamulec gate, build, unit tests, deploy, prod smoke test, IndexNow
```

### File converter

One engine, many pages: `tools/converter/pairs.mjs` lists the x-to-y pages under one root (EN `/free-tools/converter/mov-to-gif`, PL `/darmowe-narzedzia/konwerter/mov-na-gif`), one line
each. Every page accepts any supported file. Engines load only when needed: mediabunny (WebCodecs) for audio and video,
gifenc and gifuct-js for GIF, the browser's own decoders for images, libheif (wasm) for HEIC where the browser cannot.
The libraries are vendored in `tools/converter/vendor/` by `node scripts/vendor.mjs` (esbuild, pinned versions, licences
alongside). Converter pages get a wider CSP (wasm, workers, blob media) from the registry; other pages keep the strict one.
Test fixtures: `bash tests/fixtures/make.sh`. Real conversions run in installed Google Chrome (`--project=chrome`),
because Playwright's own Chromium has no H.264 or AAC.
