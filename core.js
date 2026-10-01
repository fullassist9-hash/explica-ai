/* EXPLICA AI — núcleo da plataforma
   Engines: Profile · Content Pack · Progress/Review · Quiz · Audio · Tutor (EXPLICA)
   Tudo é universal: nada aqui conhece um perfil específico, Geografia ou 5º ano. */
(() => {
'use strict';
const EA = window.EA = {};

/* ============ utilitários ============ */
const $ = EA.$ = (s, r = document) => r.querySelector(s);
const $$ = EA.$$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = EA.h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const shuffle = EA.shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
EA.sleep = (ms) => new Promise(r => setTimeout(r, ms));
const esc = EA.esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = EA.norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const STORE = (() => { try { const s = window['local' + 'Storage']; s.setItem('__ea', '1'); s.removeItem('__ea'); return s; }
  catch (e) { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; } })();
EA.store = STORE;
const LS = {
  get(k, d) { try { const v = STORE.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { STORE.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

/* ============ PROFILE ENGINE ============
   Perfis locais. Cada perfil tem seus próprios cadernos, progresso, erros e histórico do tutor.
   Campos escolares são opcionais e privados (nunca aparecem em URL ou telas públicas). */
/* Entrada (link): a raiz não tem data-entry e usa as chaves históricas, intactas. Outras entradas (ex.: /lulu/)
   têm lista de perfis, perfil ativo e preferências próprios no mesmo aparelho — progresso já é separado por perfil+caderno. */
const ENTRY = EA.ENTRY = document.documentElement.dataset.entry || '';
const SFX = ENTRY ? ':' + ENTRY : '';
const PKEY = 'explica.profiles.v1' + SFX, AKEY = 'explica.activeProfile.v1' + SFX, SKEY = 'explica.settings.v1' + SFX;
EA.SEED_PROFILES = [];            // preenchido por profiles.seed.js
EA.settings = Object.assign({ sound: true }, LS.get(SKEY, {}));
EA.saveSettings = () => LS.set(SKEY, EA.settings);
EA.profiles = {
  all() {
    let list = LS.get(PKEY, null);
    if (!list) { list = EA.SEED_PROFILES.map(p => ({ ...p })); LS.set(PKEY, list); }
    // novos perfis-semente entram sem sobrescrever edições locais
    EA.SEED_PROFILES.forEach(sp => { if (!list.find(p => p.id === sp.id)) list.push({ ...sp }); });
    return list;
  },
  get(id) { return this.all().find(p => p.id === id) || null; },
  active() { const id = LS.get(AKEY, null); return this.get(id) || this.all()[0] || null; },
  setActive(id) { LS.set(AKEY, id); },
  create(data) {
    const list = this.all();
    const id = 'p_' + Date.now().toString(36);
    const p = { id, display_name: data.display_name || 'Estudante', age: data.age || null, education_level: data.education_level || null, grade: data.grade || null, school: data.school || null, location: data.location || null, goal: data.goal || null, language: 'pt-BR', created_at: new Date().toISOString() };
    list.push(p); LS.set(PKEY, list); return p;
  },
  update(id, data) { const list = this.all(), p = list.find(x => x.id === id); if (p) { Object.assign(p, data); LS.set(PKEY, list); } return p; },
};

/* Persona adaptativa: derivada do perfil ativo, nunca global. */
EA.persona = (p) => {
  if (!p) return { band: 'adult', open: [''], close: '', dont: '', lens: null, ok: 'Isso! Você acertou.', err: 'Boa tentativa. Agora temos uma pista:', why: 'Em uma frase: qual raciocínio levou à resposta?' };
  const lvl = norm([p.education_level, p.grade, p.goal].join(' '));
  const g = parseInt((p.grade || '').match(/\d+/)?.[0] || '0', 10);
  let band = 'adult';
  if (p.age && p.age <= 11) band = 'kid';
  else if (p.age && p.age <= 17) band = 'teen';
  else if (/fundamental/.test(lvl) && g && g <= 5) band = 'kid';
  else if (/fundamental|medio/.test(lvl)) band = 'teen';
  else if (/concurso|faculdade|universit|trabalho|profission|tecnico|graduac/.test(lvl)) band = 'adult';
  const styles = {
    kid:   { band, emoji: true,  maxSentences: 3, open: ['', 'Pensa assim: ', 'Olha só: '], close: 'Quer que eu te teste?', dont: 'Sem problema. Vou explicar de outro jeito.' },
    teen:  { band, emoji: false, maxSentences: 4, open: [''], close: 'Quer testar com uma pergunta?', dont: 'Beleza, vou por outro caminho.' },
    adult: { band, emoji: false, maxSentences: 5, open: [''], close: '', dont: 'Vou reformular com outra abordagem.' },
  };
  const P = styles[band];
  // Toque de Letra v2: a personalidade permanece; registro pela faixa; lente só pelo interesse DECLARADO pelo próprio perfil.
  const ints = (p.interests || []).map(norm);
  P.lens = ints.some(i => /futebol|futsal/.test(i)) ? 'futebol' : ints.some(i => /games|jogos/.test(i)) ? 'games' : null;
  const slang = band === 'kid';
  P.ok = P.lens === 'futebol' && band !== 'adult' ? (slang ? 'GOOOL! ⚽ Isso, você acertou.' : 'Golaço. Isso, você acertou.') : P.lens === 'games' && band !== 'adult' ? 'Fase concluída! Isso, você acertou.' : 'Isso! Você acertou.';
  P.err = P.lens === 'futebol' && band !== 'adult' ? 'Boa tentativa. Vamos ver o replay da jogada:' : P.lens === 'games' && band !== 'adult' ? 'Volta do checkpoint. Olha a pista:' : 'Boa tentativa. Agora temos uma pista:';
  P.why = band === 'adult' ? 'Em uma frase: qual raciocínio levou à resposta?' : 'Como você chegou nisso? Explica em uma frase, do seu jeito.';
  return P;
};

/* ============ CONTENT PACK ENGINE ============ */
EA.packs = {};
EA.registerPack = (pack) => { EA.packs[pack.id] = pack; };
EA.packsFor = (pid) => Object.values(EA.packs).filter(p => (p.owner_profile_ids || []).includes(pid) && p.status !== 'hidden');
let activePackId = null;
EA.pack = () => EA.packs[activePackId] || null;
EA.setPack = (id) => { activePackId = id; };

/* ============ PROGRESS / REVIEW ENGINE ============
   Estado separado por profile_id + pack_id. */
const stKey = (pid, kid) => `explica.state.v1:${pid}:${kid}`;
const cache = {};
EA.stateFor = (pid, kid) => {
  const k = stKey(pid, kid);
  if (!cache[k]) cache[k] = Object.assign({ correct: {}, wrong: {}, acts: {}, badges: {}, quiz_history: [], modes: {}, tutor: [] }, LS.get(k, {}));
  return cache[k];
};
EA.state = () => { const p = EA.profiles.active(), k = EA.pack(); return p && k ? EA.stateFor(p.id, k.id) : null; };
EA.save = () => { const p = EA.profiles.active(), k = EA.pack(); if (p && k) LS.set(stKey(p.id, k.id), EA.stateFor(p.id, k.id)); };
EA.migrateLegacy = (legacyKey, pid, kid) => {
  const old = LS.get(legacyKey, null), k = stKey(pid, kid);
  if (old && !STORE.getItem(k)) { const { sound, ...rest } = old; LS.set(k, rest); if (sound === false) { EA.settings.sound = false; EA.saveSettings(); } }
};
EA.masteryOf = (pack, S) => {
  const m = {}; let sum = 0, n = 0;
  for (const [k, t] of Object.entries(pack.topics)) {
    const ids = pack.questions.filter(q => q.t === k).map(q => q.id).concat(t.acts || []);
    const ok = ids.filter(id => S.correct[id] || S.acts[id]).length;
    m[k] = ids.length ? Math.round(ok / ids.length * 100) : 0; sum += m[k]; n++;
  }
  m.all = n ? Math.round(sum / n) : 0;
  return m;
};
EA.mastery = () => EA.masteryOf(EA.pack(), EA.state());
EA.weakConcepts = (pack, S) => {
  const c = {};
  Object.keys(S.wrong).forEach(id => { const q = pack.questions.find(x => x.id === id); if (q && q.c) c[q.c] = (c[q.c] || 0) + 1; });
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k]) => k);
};
EA.record = (q, ok, choice) => {
  const S = EA.state(); if (!S) return;
  if (ok) { S.correct[q.id] = 1; delete S.wrong[q.id]; } else { S.wrong[q.id] = Date.now(); delete S.correct[q.id]; }
  // tipo de erro (opcional): a alternativa escolhida pode estar mapeada para um erro pedagógico do caderno (q.e)
  const et = !ok && q.e && choice != null ? q.e[choice] : null;
  if (et) { S.errtypes = S.errtypes || {}; S.errtypes[et] = (S.errtypes[et] || 0) + 1; }
  S.quiz_history.push({ q: q.id, ok, t: Date.now(), ...(et ? { e: et } : {}) }); if (S.quiz_history.length > 300) S.quiz_history.shift();
  EA.save(); EA.onProgress && EA.onProgress();
};
EA.act = (id, msg) => { const S = EA.state(); if (!S || S.acts[id]) return; S.acts[id] = 1; EA.save(); EA.onProgress && EA.onProgress(); if (msg) toast(msg); };

/* ============ AUDIO ENGINE ============ */
let AC;
function tone(freqs, dur = .12, type = 'sine', vol = .08, gap = .08) {
  if (!EA.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * gap;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + .02);
    });
  } catch (e) {}
}
EA.fx = {
  tap: () => tone([660], .06, 'sine', .04),
  ok: () => tone([784, 1047, 1319], .18, 'sine', .07, .07),
  err: () => tone([240, 200], .16, 'triangle', .06, .1),
  done: () => tone([523, 659, 784, 1047, 1319], .22, 'sine', .07, .09),
};
/* Voz: escolhe a mais humana do aparelho (neural/natural/aprimorada > Google > nomes conhecidos > compacta).
   A pessoa pode trocar em "Voz do app" (EA.voiceList / EA.settings.voiceName). */
let voice = null;
const voiceScore = (v) => (/natural|neural|online|premium|enhanced|aprimorad|melhorad/i.test(v.name + ' ' + v.voiceURI) ? 50 : 0) + (/google/i.test(v.name) ? 30 : 0)
  + (/francisca|thalita|luciana|camila|vitoria|vitória|antonio|daniel/i.test(v.name) ? 10 : 0) - (/compact|espeak|maria\b/i.test(v.name + ' ' + v.voiceURI) ? 25 : 0) + (v.localService === false ? 5 : 0) + (/pt[-_]BR/i.test(v.lang) ? 3 : 0);
EA.voiceList = () => ('speechSynthesis' in window ? speechSynthesis.getVoices() : []).filter(v => /^pt/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a));
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = EA.voiceList();
  voice = vs.find(v => v.name === EA.settings.voiceName) || vs[0] || null;
}
EA.setVoice = (name) => { EA.settings.voiceName = name; EA.saveSettings(); pickVoice(); };
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener ? speechSynthesis.addEventListener('voiceschanged', pickVoice) : (speechSynthesis.onvoiceschanged = pickVoice); }
let speakingBtn = null;
/* Matemática falada: “x_v = −b/(2a)” → “xis vê igual a menos b sobre 2 a”. */
const speakMath = (t) => String(t)
  .replace(/<[^>]+>/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&nbsp;/g, ' ').replace(/&amp;/g, ' e ')
  .replace(/\bx_v\b/g, 'xis vê').replace(/\bx v\b/g, 'xis vê').replace(/\by v\b/g, 'ípsilon vê').replace(/\by_v\b/g, 'ípsilon vê').replace(/\bt_v\b/g, 'tê vê').replace(/x₁/g, 'xis um').replace(/x₂/g, 'xis dois')
  .replace(/([A-Za-z0-9)])²/g, '$1 ao quadrado').replace(/([A-Za-z0-9)])³/g, '$1 ao cubo')
  .replace(/\b([a-zA-Z])\(([\p{L}\d ]{1,8})\)/gu, '$1 de $2')
  .replace(/[−–]/g, ' menos ').replace(/(^|[\s(=,])-(?=\s?[\dA-Za-zΔ(])/g, '$1 menos ')
  .replace(/Δ/g, ' delta ').replace(/≠/g, ' diferente de ').replace(/≥/g, ' maior ou igual a ').replace(/≤/g, ' menor ou igual a ')
  .replace(/>/g, ' maior que ').replace(/</g, ' menor que ').replace(/±/g, ' mais ou menos ').replace(/√/g, ' raiz de ').replace(/∩/g, ' montanha ')
  .replace(/(\d)\s*·\s*(?=[\d(a-zA-Z])/g, '$1 vezes ').replace(/·/g, ', ').replace(/\s\/\s|\//g, ' sobre ').replace(/=/g, ' igual a ').replace(/\+/g, ' mais ')
  .replace(/(\d)([a-zA-Z])/g, '$1 $2').replace(/\bx\b/g, 'xis').replace(/\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{3,}\b/g, w => w.toLowerCase()).replace(/→/g, ', ').replace(/×/g, ' ou ')
  .replace(/[^\p{L}\p{N}\s.,:;!?()]/gu, ' ').replace(/[()]/g, ' ').replace(/\s+([.,:;!?])/g, '$1').replace(/\s+/g, ' ').trim();
EA.speakMath = speakMath;
/* Voz gravada (neural, gerada antes): manifest.json + <hash>.mp3 por texto falado. Toca o arquivo quando existe;
   senão cai na voz do aparelho. Hash = FNV-1a 32 bits sobre o texto já em "matemática falada" (igual ao gerador). */
const fnv = EA.audioKey = (s) => { let h = 0x811c9dc5; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
EA.audioPack = null; let player = null;
EA.loadAudio = (base) => fetch(base + 'manifest.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null)).then(m => { if (m && m.files) EA.audioPack = { base, ...m }; return EA.audioPack; }).catch(() => null);
const stopAll = EA.stopSpeech = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); if (player) { player.pause(); player = null; } };
EA.say = (text, btn) => {
  if (!EA.settings.sound || !text) return;
  stopAll();
  if (speakingBtn) speakingBtn.classList.remove('speaking');
  if (btn) { speakingBtn = btn; btn.classList.add('speaking'); }
  const key = fnv(speakMath(text)), ap = EA.audioPack;
  if (ap && ap.files[key] && EA.settings.recorded !== false) {
    player = new Audio(ap.base + key + '.mp3'); EA.lastAudio = player.src; player.playbackRate = EA.settings.voiceRate && EA.settings.voiceRate < 1 ? .95 : 1;
    player.onended = player.onerror = () => btn && btn.classList.remove('speaking');
    player.play().catch(() => btn && btn.classList.remove('speaking')); return;
  }
  if (!('speechSynthesis' in window)) { btn && btn.classList.remove('speaking'); return; }
  if (!voice) pickVoice();
  // frases curtas em fila: evita o corte de ~15 s do Chrome Android e deixa a entonação natural
  const parts = speakMath(text).match(/[^.!?;:]+[.!?;:]?/g) || [];
  parts.forEach((p, k) => { const u = new SpeechSynthesisUtterance(p.trim()); u.lang = voice ? voice.lang : 'pt-BR'; if (voice) u.voice = voice;
    u.rate = EA.settings.voiceRate || 1.05; u.pitch = 1;
    if (k === parts.length - 1) u.onend = u.onerror = () => btn && btn.classList.remove('speaking');
    speechSynthesis.speak(u); });
};
EA.sayBtn = (text, cls = '') => `<button class="say ${cls}" data-say="${esc(text)}" aria-label="Ouvir">${EA.icon ? EA.icon('soundOn', 20) : '🔊'}</button>`;
document.addEventListener('click', (e) => { const b = e.target.closest('[data-say]'); if (b) { e.preventDefault(); EA.say(b.dataset.say, b); } });

/* ============ UI helpers ============ */
let tt;
const toast = EA.toast = (msg, ms = 2200) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), ms); };

/* ============ QUIZ ENGINE ============ */
EA.Quiz = function Quiz(el, qs, opts = {}) {
  const { fx, say, sayBtn } = EA;
  const exam = opts.mode === 'exam';
  let list = qs.map(q => ({ q })), i = 0, answers = [];
  const L = 'ABCD';
  function draw() {
    if (i >= list.length) return finish();
    const { q } = list[i];
    const o2 = shuffle(q.o);
    el.innerHTML = `<div class="q-card view-enter">
      <div class="q-meta"><span>${opts.label || (exam ? 'Simulado' : 'Teste rápido')}${list[i].retry ? ' · Reteste' : ''}</span><span>Pergunta ${i + 1} / ${list.length}</span></div>
      <div class="q-bar"><i style="width:${i / list.length * 100}%"></i></div>
      <div style="display:flex;gap:10px;align-items:flex-start"><p class="q-prompt" id="qp${i}" style="flex:1">${q.p}</p>${exam ? '' : sayBtn(q.p)}</div>
      ${q.img ? `<div class="q-img"><img src="${q.img}" alt="" width="960" height="640" decoding="async"></div>` : ''}
      <div class="q-opts" role="group" aria-labelledby="qp${i}">${o2.map((o, k) => `<button class="q-opt" data-o="${esc(o)}"><span class="l">${L[k]}</span>${o}</button>`).join('')}</div>
      <div class="q-fb" aria-live="polite"></div></div>`;
    const ob = $$('.q-opt', el);
    ob.forEach((b, k) => { b.onclick = () => pick(b, q); b.onkeydown = (e) => { const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); ob[(k + d + ob.length) % ob.length].focus(); } }; });
    EA.ctx.set({ question: q.p, concept: q.c || EA.ctx.get().concept });
  }
  function pick(b, q) {
    const ok = b.dataset.o === q.o[0];
    $$('.q-opt', el).forEach(x => x.disabled = true);
    answers.push({ q, ok });
    if (exam) { b.classList.add('sel'); fx.tap(); EA.record(q, ok, b.dataset.o); setTimeout(() => { i++; draw(); }, 380); return; }
    const OK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    const NO = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';
    const mark = (x, cls, ico, tag) => { x.classList.add(cls); $('.l', x).innerHTML = ico; x.insertAdjacentHTML('beforeend', `<span class="q-tag">${tag}</span>`); };
    const rightBtn = $$('.q-opt', el).find(x => x.dataset.o === q.o[0]);
    if (ok) { mark(b, 'right', OK, 'Sua resposta · Correta'); fx.ok(); }
    else {
      mark(b, 'wrong', NO, 'Sua resposta'); b.classList.add('shake'); fx.err();
      mark(rightBtn, 'right', OK, 'Correta');
      if (!list[i].retry) list.splice(Math.min(i + 3, list.length), 0, { q, retry: true });
    }
    EA.record(q, ok, b.dataset.o);
    const fb = $('.q-fb', el), P = EA.persona(EA.profiles.active());
    fb.innerHTML = ok
      ? `<div class="remind good"><div class="h">${OK} ${list[i].retry ? 'Agora foi! Você lembrou.' : P.ok}</div><ul><li>${q.r[0]}</li></ul>${answers.filter(a => a.ok).length % 3 === 1 ? `<p class="muted" style="margin-top:6px">💭 ${P.why}</p>` : ''}</div>`
      : `<div class="remind fix"><p class="fix-h">${NO}<span>${P.err} sua resposta foi <b>${esc(b.dataset.o)}</b></span></p>
         <div class="h">${OK} Correta: ${esc(q.o[0])}</div>
         <p class="lembre">Lembre</p><ul>${q.r.map(x => `<li>${x}</li>`).join('')}</ul>
         <p class="retest"><i aria-hidden="true"></i>Essa pergunta volta daqui a pouco para você tentar de novo.</p>
         <div class="fix-act">${sayBtn(q.r.join('. '), 'sm')}<button class="ask-inline" data-ask="Por que a resposta certa é: ${esc(q.o[0])}?">${EA.MARK ? EA.MARK(18, 'neg') : ''} Explica pra mim</button></div></div>`;
    fb.insertAdjacentHTML('beforeend', `<button class="btn btn-dark q-next">${i + 1 < list.length ? 'Próxima →' : 'Ver resultado'}</button>`);
    if (!ok) say(q.r.join('. '));
    $('.q-next', fb).onclick = () => { fx.tap(); i++; draw(); };
  }
  function finish() {
    const pack = EA.pack();
    fx.done();
    const firstTry = answers.filter((a, k) => !answers.slice(0, k).some(b => b.q.id === a.q.id));
    const tot = firstTry.length, ok = firstTry.filter(a => a.ok).length;
    if (exam) {
      EA.ctx.set({ exam: false });
      const byT = {}; firstTry.forEach(a => { (byT[a.q.t] = byT[a.q.t] || []).push(a.ok); });
      const name = (k) => (pack.topics[k] || {}).name || k;
      const dom = Object.entries(byT).filter(([, v]) => v.every(Boolean)).map(([k]) => name(k));
      const rev = Object.entries(byT).filter(([, v]) => !v.every(Boolean)).map(([k]) => name(k));
      const wrongQs = firstTry.filter(a => !a.ok).map(a => a.q);
      el.innerHTML = `<div class="q-card result view-enter">
        <p class="eyebrow">Nota</p><p class="score">${(ok / tot * 10).toFixed(1).replace('.', ',')}<small> /10</small></p>
        <p class="lead" style="margin-top:6px"><b>${ok}</b> acertos de ${tot}</p>
        ${dom.length ? `<p class="eyebrow" style="margin-top:18px">Assuntos dominados</p><div class="tags">${dom.map(d => `<span class="ok">✓ ${d}</span>`).join('')}</div>` : ''}
        ${rev.length ? `<p class="eyebrow" style="margin-top:14px">Para revisar</p><div class="tags">${rev.map(d => `<span class="no">↻ ${d}</span>`).join('')}</div>` : ''}
        <div style="display:grid;gap:10px;margin-top:20px">
        ${wrongQs.length ? `<button class="btn btn-primary" id="redo">↻ Revisar só o que errei</button>` : ''}
        <button class="btn btn-ghost" id="again">Fazer outro simulado</button></div></div>`;
      if (wrongQs.length) $('#redo', el).onclick = () => Quiz(el, wrongQs, { label: 'Revisão dos erros' });
      $('#again', el).onclick = () => Quiz(el, shuffle(pack.questions).slice(0, 10), { mode: 'exam' });
    } else {
      el.innerHTML = `<div class="q-card result view-enter">
        <p style="font-size:44px">${ok === tot ? '🏆' : ok >= tot * .7 ? '⭐' : '💪'}</p>
        <p class="score" style="font-size:52px">${ok}<small> / ${tot}</small></p>
        <p class="lead" style="margin-top:6px">${ok === tot ? 'Perfeito. Você lembrou de tudo.' : 'Os erros voltam na Revisão rápida.'}</p>
        <button class="btn btn-dark" style="margin-top:18px" id="again">Jogar de novo</button></div>`;
      $('#again', el).onclick = () => Quiz(el, shuffle(qs.filter((v, k, a) => a.findIndex(x => x.id === v.id) === k)), opts);
    }
    opts.onDone && opts.onDone(ok, tot);
  }
  draw();
};
EA.quizBlock = (topics, n = 4) => {
  const pack = EA.pack(), S = EA.state();
  const wrap = h(`<section class="section"><div class="section-h"><h2>🎯 Teste rápido</h2><span class="muted">${n} perguntas</span></div><div class="quiz"></div></section>`);
  const pool = pack.questions.filter(q => topics.includes(q.t));
  const due = pool.filter(q => S.wrong[q.id]);
  EA.Quiz($('.quiz', wrap), due.concat(shuffle(pool.filter(q => !S.wrong[q.id]))).slice(0, n));
  return wrap;
};

/* ============ CONTEXTO DE TELA ============
   Cada tela informa o que está visível; o tutor usa isso para entender "isso". */
let CTX = {};
EA.ctx = {
  reset(base) { CTX = Object.assign({}, base); EA.onCtx && EA.onCtx(CTX); },
  set(p) { Object.assign(CTX, p); EA.onCtx && EA.onCtx(CTX); },
  get() { return CTX; },
};
})();
