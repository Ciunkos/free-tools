/* The registry drives routes, sitemap and links: every live tool has both slugs under its hub, nothing collides, and the
   wrangler routes cover every page. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOOLS, LIVE, SOON, STRONY, HUB, ASSETY, sciezka } from '../src/meta.mjs';

test('live tools have EN and PL slugs, names and pains; paths are unique', () => {
  const all = STRONY.flatMap((s) => [s.path.en, s.path.pl]);
  assert.equal(new Set(all).size, all.length);
  for (const id of LIVE) {
    const t = TOOLS[id];
    for (const lang of ['en', 'pl']) { assert.ok(t.slug[lang] && t.name[lang] && t.pain[lang], id + ' ' + lang); assert.ok(sciezka(id, lang).startsWith(HUB[lang] + '/')); }
    assert.notEqual(t.slug.en, 'a'); assert.notEqual(t.slug.en, 'api');
  }
  for (const id of SOON) assert.ok(!LIVE.includes(id));
});

test('assets live under the EN hub and wrangler routes cover both hubs', () => {
  assert.equal(ASSETY, '/free-tools/a');
  const w = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
  for (const lang of ['en', 'pl']) { assert.ok(w.includes(`"ciunkos.com/${HUB[lang]}*"`)); assert.ok(w.includes(`"www.ciunkos.com/${HUB[lang]}*"`)); }
});
