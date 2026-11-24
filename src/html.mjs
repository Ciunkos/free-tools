/* html.mjs — pomocniki do szablonów (kopia z ~/business-idea-validator/src/shared/html.mjs). */
export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
export const attr = esc;
/* JSON do <script type="application/ld+json"> albo data-*: „<” uciekamy, żeby treść nie zamknęła skryptu. */
export const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
export const t = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[lang] ?? v.en ?? '') : (v ?? '');
export const paragraphs = (s) => String(s).split(/\n\s*\n/).map((p) => `<p>${inline(p.trim())}</p>`).join('');
/* Lekki markdown inline: `kod`, **pogrubienie**, [tekst](url). */
export function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, (m, tx, u) => /^https?:/.test(u) && !u.startsWith('https://ciunkos.com') ? `<a href="${u}" rel="noopener">${tx}</a>` : `<a href="${u}">${tx}</a>`);
}
