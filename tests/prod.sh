#!/bin/sh
# Production smoke test after deploy: every page 200 in both languages, hreflang header, 301 for a trailing slash and www,
# health, assets, images, sitemap and llms.txt, PostHog config and SDK, and the proxy never serving PostHog JS.
bad=0
B=https://ciunkos.com
st() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$@"; }
PAGES=$(node -e "import('./src/meta.mjs').then(m=>console.log(m.STRONY.flatMap(s=>[s.path.en,s.path.pl]).join(' ')))")
for s in $PAGES; do r=$(st "$B/$s"); [ "${r%% *}" = 200 ] || { echo "FAIL: /$s → $r"; bad=1; }; done
curl -sI $B/darmowe-narzedzia/bialy-ekran | grep -qi 'hreflang="en"' || { echo "FAIL: no Link hreflang"; bad=1; }
for a in "$B/free-tools/white-screen/" "https://www.ciunkos.com/free-tools"; do r=$(st "$a"); [ "${r%% *}" = 301 ] || { echo "FAIL: $a → $r"; bad=1; }; done
curl -s $B/free-tools/health | grep -q '"ok":true' || { echo "FAIL: health"; bad=1; }
for a in file-converter/app.mjs file-converter/plan.mjs file-converter/engines/media.mjs file-converter/engines/gif.mjs file-converter/engines/image.mjs file-converter/vendor/media.js file-converter/vendor/mp3.js file-converter/vendor/gif.js file-converter/vendor/heic.js og/pair-mov-gif-en.jpg kit.mjs jwt-decoder/app.mjs jwt-decoder/jwt.mjs character-counter/count.mjs base64-encode-decode/b64.mjs icons/jwt-decoder.svg og/base64-pl.jpg app.css app.mjs site-footer.css white-screen/screen.mjs white-screen/png.mjs img/white-1920x1080.png img/white-3840x2160.png og/white-screen-en.jpg icons/white-screen.svg white-screen/manifest-pl.webmanifest video/white-screen-10-hours-1080p.mp4 video/white-screen-10-hours-4k.mp4 sitemap.xml llms.txt; do r=$(st "$B/free-tools/$a"); [ "${r%% *}" = 200 ] || { echo "FAIL: /free-tools/$a → $r"; bad=1; }; done
curl -s $B/free-tools/white-screen | grep -q 'data-posthog-config="{' || { echo "FAIL: no PostHog config"; bad=1; }
sdk=$(curl -s "$B/free-tools/white-screen" | grep -o 'vendor/posthog/[0-9a-f.-]*/posthog.js' | head -1); r=$(st "$B/$sdk"); [ -n "$sdk" ] && [ "${r%% *}" = 200 ] || { echo "FAIL: PostHog SDK $sdk → $r"; bad=1; }
for u in "$B/free-tools/ph/static/array.js" "$B/free-tools/ph/array/x/config.js"; do r=$(st "$u"); [ "${r%% *}" = 404 ] || { echo "FAIL: proxy serves PostHog code $u → $r"; bad=1; }; done
r=$(curl -s -o /dev/null -w '%{http_code}' -H "Range: bytes=0-1023" "$B/free-tools/video/white-screen-10-hours-1080p.mp4"); [ "$r" = 206 ] || { echo "FAIL: video Range → $r"; bad=1; }
curl -s "$B/free-tools/white-screen" | grep -qi "youtube" && { echo "FAIL: YouTube on the page"; bad=1; }
r=$(st "$B/free-tools/white-screen.html"); [ "${r%% *}" = 404 ] || { echo "FAIL: raw .html served → $r"; bad=1; }
curl -sI "$B/free-tools/mov-to-gif" | grep -i "content-security-policy" | grep -q "wasm-unsafe-eval" || { echo "FAIL: converter CSP"; bad=1; }
curl -sI "$B/free-tools/jwt-decoder" | grep -i "content-security-policy" | grep -q "wasm-unsafe-eval" && { echo "FAIL: wasm allowed outside the converter"; bad=1; }
[ $bad = 0 ] && echo "prod: OK ($(echo $PAGES | wc -w | tr -d ' ') pages, 301, health, assets, PostHog)"; exit $bad
