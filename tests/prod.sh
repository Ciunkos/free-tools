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
curl -s $B/free-tools/api/health | grep -q '"ok":true' || { echo "FAIL: health"; bad=1; }
for a in a/app.css a/t/white-screen/screen.mjs a/t/white-screen/png.mjs a/img/white-1920x1080.png a/img/white-3840x2160.png a/og/white-screen-en.jpg a/icons/white-screen.svg a/t/white-screen/manifest-pl.webmanifest sitemap.xml llms.txt; do r=$(st "$B/free-tools/$a"); [ "${r%% *}" = 200 ] || { echo "FAIL: /free-tools/$a → $r"; bad=1; }; done
curl -s $B/free-tools/white-screen | grep -q 'data-posthog-config="{' || { echo "FAIL: no PostHog config"; bad=1; }
sdk=$(curl -s "$B/free-tools/white-screen" | grep -o 'vendor/posthog/[0-9a-f.-]*/posthog.js' | head -1); r=$(st "$B/$sdk"); [ -n "$sdk" ] && [ "${r%% *}" = 200 ] || { echo "FAIL: PostHog SDK $sdk → $r"; bad=1; }
for u in "$B/free-tools/a/ph/static/array.js" "$B/free-tools/a/ph/array/x/config.js"; do r=$(st "$u"); [ "${r%% *}" = 404 ] || { echo "FAIL: proxy serves PostHog code $u → $r"; bad=1; }; done
[ $bad = 0 ] && echo "prod: OK ($(echo $PAGES | wc -w | tr -d ' ') pages, 301, health, assets, PostHog)"; exit $bad
