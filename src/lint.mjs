/* lint.mjs: HTML rules for every page. No inline scripts (CSP), no on*=, no javascript:, hreflang for both languages,
   no em dash and no "nie tylko", title up to 70 characters, description up to 160, the "Przemo says" callout on every
   tool page, and the shared JSON-LD rules (sprawdzLd: one @graph, canonical #person, dateModified = visible date). */
import { sprawdzLd } from './shared/schema-ld.mjs';

const odEnc = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
export function lintHtml(html, nazwa, { tool = true } = {}) {
  const out = [];
  for (const s of html.match(/<script\b[^>]*>/g) || []) {
    if (/type="application\/ld\+json"/.test(s)) continue;
    if (!/\bsrc=/.test(s)) out.push(`${nazwa}: inline script: ${s.slice(0, 60)}`);
  }
  if (/\son[a-z]+="/i.test(html)) out.push(`${nazwa}: on*= attribute`);
  if (/(?:href|src|action)\s*=\s*["']?\s*javascript:/i.test(html)) out.push(`${nazwa}: javascript: link`);
  if (!/hreflang="pl"/.test(html) || !/hreflang="en"/.test(html)) out.push(`${nazwa}: missing hreflang`);
  if (/—/.test(html)) out.push(`${nazwa}: em dash in content`);
  if (/nie tylko/i.test(html)) out.push(`${nazwa}: "nie tylko" in content`);
  const tytul = odEnc((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  if (!tytul || tytul.length > 70) out.push(`${nazwa}: title has ${tytul.length} characters (limit 70)`);
  const opis = odEnc((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (!opis || opis.length > 160) out.push(`${nazwa}: description has ${opis.length} characters (limit 160)`);
  if (tool && !/<aside class="przemo"/.test(html)) out.push(`${nazwa}: no "Przemo says" callout`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) out.push(`${nazwa}: needs exactly one h1`);
  return out;
}
export const lintLd = (html, nazwa) => sprawdzLd(html).map((e) => `${nazwa}: ${e}`);
