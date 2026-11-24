/* Character counter client: recount on every change (one animation frame at most), limits, SMS, top words,
   optional local storage of the text. Nothing is sent anywhere. */
import { $, $$, track, strings, copy, paste, fmt } from '../kit.mjs';
import { stats, sms, topWords, LIMITS, limitValue } from './count.mjs';

const U = strings();
const lang = U.lang || document.documentElement.lang;
const input = $('#cc-in'), remember = $('#cc-remember');
const KEY = 'ft_cc_text';
const n = (x) => fmt(x, lang);
const dur = (sec) => (sec >= 60 ? U.minS.replace('{m}', Math.floor(sec / 60)).replace('{s}', sec % 60) : U.secS.replace('{s}', sec));

let frame = 0, tracked = false;
function update() {
  frame = 0;
  const t = input.value, s = stats(t, lang);
  $('#cc-chars').textContent = n(s.chars);
  $('#cc-noSpaces').textContent = n(s.noSpaces);
  $('#cc-words').textContent = n(s.words);
  $('#cc-sentences').textContent = n(s.sentences);
  $('#cc-paragraphs').textContent = n(s.paragraphs);
  $('#cc-lines').textContent = n(s.lines);
  $('#cc-reading').textContent = dur(s.readingSeconds);
  $('#cc-speaking').textContent = dur(s.speakingSeconds);
  $('#cc-pages').textContent = new Intl.NumberFormat(lang === 'pl' ? 'pl-PL' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(s.pages);
  $('#cc-bytes').textContent = n(s.bytes);
  $('#cc-other').textContent = U.other.replace('{utf16}', n(s.utf16)).replace('{cp}', n(s.codePoints)).replace('{spaces}', n(s.spaces));

  for (const l of LIMITS) {
    const li = $(`#cc-limits li[data-id="${l.id}"]`), v = limitValue(l, s, t), over = v > l.limit;
    li.querySelector('.lim-n b').textContent = n(v);
    li.querySelector('.bar i').style.width = Math.min(100, (v / l.limit) * 100) + '%';
    li.classList.toggle('over', over);
    li.classList.toggle('near', !over && v > l.limit * 0.9);
    li.title = over ? U.over.replace('{n}', n(v - l.limit)) : U.left.replace('{n}', n(l.limit - v));
  }
  const m = sms(t);
  $('#cc-sms').textContent = U.smsLine.replace('{units}', n(m.units)).replace('{enc}', m.encoding).replace('{seg}', n(m.segments)).replace('{msgs}', m.segments === 1 ? U.msg1 : U.msgN);
  $('#cc-sms-note').textContent = m.nonGsm.length ? U.smsUcs.replace('{chars}', m.nonGsm.join(' ')) : '';

  const top = topWords(t, 8, lang);
  $('#cc-top').innerHTML = top.length ? top.map(([w, c]) => `<li><span>${w.replace(/[&<>]/g, (x) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[x])}</span><b>${n(c)}</b></li>`).join('') : `<li class="none">${U.none}</li>`;

  if (remember.checked) try { localStorage.setItem(KEY, t); } catch { /* private mode */ }
  if (!tracked && s.chars > 0) { tracked = true; track('text_counted', {}); }
}
const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

input.addEventListener('input', schedule);
$('#cc-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
$('#cc-copy').addEventListener('click', () => copy(input.value, U.copied));
$('#cc-paste').addEventListener('click', async () => { const t = await paste(); if (t != null) { input.value = t; update(); } else input.focus(); });
remember.addEventListener('change', () => {
  try { if (remember.checked) { localStorage.setItem(KEY + '_on', '1'); localStorage.setItem(KEY, input.value); } else { localStorage.removeItem(KEY + '_on'); localStorage.removeItem(KEY); } } catch { /* private mode */ }
});
try { if (localStorage.getItem(KEY + '_on') === '1') { remember.checked = true; input.value = localStorage.getItem(KEY) || ''; } } catch { /* private mode */ }
update();
for (const el of $$('#cc .stat b')) el.setAttribute('aria-atomic', 'true');
