/* EXPLICA AI — shell da plataforma: Home global · Perfis · Cadernos · Tutor contextual · Roteador */
(() => {
'use strict';
const { $, $$, h, esc, fx, say, toast } = EA;

EA.migrateLegacy('missaoBrasil.v1', 'joao', 'geo-missao-brasil-v1');
const lastKey = (pid) => 'explica.lastPack.v1:' + pid;
const view = $('#view'), tabbar = $('#tabbar');

/* ---------- topo ---------- */
function paintTop() {
  const p = EA.profiles.active(), pack = EA.pack();
  $('#profileBtn').innerHTML = `<span class="av">${esc((p?.display_name || '?')[0])}</span>${esc(p?.display_name || 'Perfil')}${EA.icon('chevronDown', 16)}`;
  $('#profileBtn').setAttribute('aria-label', 'Perfil ativo: ' + (p?.display_name || '') + '. Trocar perfil');
  const band = EA.persona(p).band; document.body.dataset.density = band === 'kid' ? 'beginner' : band === 'adult' ? 'advanced' : 'standard';
  const mp = $('#miniProgress');
  if (pack) { const m = EA.mastery(); mp.hidden = false; mp.querySelector('span').style.setProperty('--p', m.all + '%'); mp.querySelector('b').textContent = m.all + '%'; }
  else mp.hidden = true;
}
EA.onProgress = () => {
  paintTop();
  const pack = EA.pack(), S = EA.state(); if (!pack || !S) return;
  const m = EA.mastery();
  for (const b of pack.badges || []) if (!S.badges[b.id] && b.test(m, S)) { S.badges[b.id] = 1; EA.save(); setTimeout(() => { fx.done(); toast('Conquista: ' + b.t, 3000); }, 600); }
};
const sb = $('#soundBtn');
function paintSound() { sb.innerHTML = EA.icon(EA.settings.sound ? 'soundOn' : 'soundOff', 22); sb.classList.toggle('off', !EA.settings.sound); sb.setAttribute('aria-label', EA.settings.sound ? 'Som ligado' : 'Som desligado'); }
sb.onclick = () => { EA.settings.sound = !EA.settings.sound; EA.saveSettings(); paintSound(); if (!EA.settings.sound && 'speechSynthesis' in window) speechSynthesis.cancel(); fx.tap(); toast(EA.settings.sound ? 'Som ligado' : 'Som desligado', 1200); };
paintSound();

/* ---------- sheets ---------- */
let lastFocus = null;
function sheet(html, cls = '', label = '') {
  closeSheet();
  lastFocus = document.activeElement;
  const s = h(`<div class="sheet-wrap"><div class="scrim"></div><div class="sheet ${cls}" role="dialog" aria-modal="true" tabindex="-1"${label ? ` aria-label="${esc(label)}"` : ''}><div class="grab" aria-hidden="true"></div>${html}</div></div>`);
  document.body.append(s); requestAnimationFrame(() => s.classList.add('open'));
  const sh = $('.sheet', s);
  if (!label) { const t = $('.sh-title', sh); if (t) { t.id = t.id || 'sht' + Date.now(); sh.setAttribute('aria-labelledby', t.id); } }
  $('.scrim', s).onclick = () => (sh.dataset.onclose ? EA[sh.dataset.onclose]() : closeSheet());
  // foco preso no diálogo · Esc fecha
  sh.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); sh.dataset.onclose ? EA[sh.dataset.onclose]() : closeSheet(); return; }
    if (e.key !== 'Tab') return;
    const f = $$('a[href],button:not([disabled]),input,select,textarea,summary,[tabindex]:not([tabindex="-1"])', sh).filter(x => x.offsetParent !== null);
    if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  setTimeout(() => { const first = $('input,button:not(.icon-btn)', sh) || sh; (cls === 'tutor' ? ($('#tuInput', sh) || sh) : sh).focus({ preventScroll: true }); }, 60);
  return sh;
}
function closeSheet(keepMin) {
  $$('.sheet-wrap').forEach(s => { if (keepMin && s.classList.contains('min')) return; s.classList.remove('open'); setTimeout(() => s.remove(), 300); });
  if (lastFocus && document.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} } lastFocus = null;
}
EA.closeSheet = closeSheet;

/* ---------- perfis ---------- */
const LEVELS = ['Ensino Fundamental', 'Ensino Médio', 'Faculdade', 'Pós-graduação', 'Curso técnico', 'Nenhum / não se aplica'];
const INTERESTS = ['Futebol/futsal', 'Games', 'Música', 'Leitura', 'Idiomas', 'Educação financeira', 'Ciência e tecnologia', 'Esporte', 'Desenho e criatividade', 'Culinária e nutrição', 'Cinema e séries', 'Natureza e animais'];
const GOALS = ['Prova escolar', 'Faculdade', 'Concurso', 'Curso', 'Trabalho', 'Aprendizado pessoal', 'Outro'];
function profileSheet() {
  const act = EA.profiles.active();
  const s = sheet(`<h3 class="sh-title">Quem está estudando?</h3>
    <div class="prof-list">${EA.profiles.all().map(p => `<button class="prof ${p.id === act.id ? 'on' : ''}" data-id="${p.id}">
      <span class="av lg">${esc(p.display_name[0])}</span><span><b>${esc(p.display_name)}</b><small>${esc([p.grade, p.goal].filter(Boolean).join(' · ') || 'Perfil')}</small></span>${p.id === act.id ? `<i>${EA.icon('check', 22)}</i>` : ''}</button>`).join('')}</div>
    <details class="priv"><summary>${EA.icon('lock', 18)} Contexto de aprendizagem de ${esc(act.display_name)}</summary>
      <dl>${[['Nível', act.education_level], ['Série', act.grade], ['Escola', act.school], ['Cidade', act.location], ['Objetivo', act.goal], ['Idioma', act.language]].filter(r => r[1]).map(r => `<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>
      <p class="muted">Usado só para adaptar explicações deste perfil. Não aparece em links nem em outras áreas.</p></details>
    <div class="btn-row"><button class="btn btn-ghost" id="editProf">${EA.icon('edit', 20)} Editar perfil</button><button class="btn btn-ghost" id="newProf">${EA.icon('plus', 20)} Novo perfil</button></div>`);
  $$('.prof', s).forEach(b => b.onclick = () => { EA.profiles.setActive(b.dataset.id); fx.tap(); closeSheet(); location.hash = '#/'; route(); toast('Perfil: ' + EA.profiles.active().display_name); });
  $('#newProf', s).onclick = () => newProfileSheet();
  $('#editProf', s).onclick = () => newProfileSheet(act);
}
function newProfileSheet(ed) {
  const s = sheet(`<h3 class="sh-title">${ed ? 'Editar perfil' : 'Novo perfil'}</h3><p class="muted" style="margin-bottom:12px">Só o nome é obrigatório. O resto ajuda o EXPLICA AI a falar do jeito certo.</p>
    <form class="form" id="pf">
      <label>Nome ou apelido<input name="display_name" required maxlength="30" autocomplete="off"></label>
      <div class="row2"><label>Idade <small>opcional</small><input name="age" type="number" min="4" max="99" inputmode="numeric"></label>
      <label>Série <small>opcional</small><input name="grade" maxlength="20" placeholder="ex.: 7º ano"></label></div>
      <label>Nível de ensino <small>opcional</small><select name="education_level"><option value="">—</option>${LEVELS.map(l => `<option>${l}</option>`).join('')}</select></label>
      <label>Escola <small>opcional · fica só neste aparelho</small><input name="school" maxlength="60"></label>
      <label>Cidade <small>opcional · fica só neste aparelho</small><input name="location" maxlength="60"></label>
      <fieldset class="ints" style="border:0;padding:0;margin:0"><legend style="font-weight:600;margin-bottom:6px">Do que você curte? <small class="muted">opcional · o EXPLICA usa nos exemplos · fica só neste aparelho</small></legend>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${INTERESTS.map(t => `<label class="pin" style="display:inline-flex;align-items:center;gap:6px;min-height:44px;cursor:pointer"><input type="checkbox" name="interests" value="${t}" style="width:20px;height:20px"> ${t}</label>`).join('')}</div></fieldset>
      <label>Objetivo<select name="goal">${GOALS.map(g => `<option>${g}</option>`).join('')}</select></label>
      <button class="btn btn-brand" type="submit">${ed ? 'Salvar' : 'Criar perfil'}</button></form>`);
  if (ed) for (const [k, v] of Object.entries(ed)) { const i = $(`[name="${k}"]`, s); if (i && v != null) i.value = v; }
  if (ed && Array.isArray(ed.interests)) $$('[name="interests"]', s).forEach(c => { c.checked = ed.interests.includes(c.value); });
  $('#pf', s).onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target), f = Object.fromEntries(fd); f.interests = fd.getAll('interests');
    if (f.education_level === 'Nenhum / não se aplica') f.education_level = null;
    const data = { ...f, age: f.age ? +f.age : null };
    for (const k of ['grade', 'school', 'location', 'education_level']) if (!data[k]) data[k] = null;
    if (ed) { EA.profiles.update(ed.id, data); closeSheet(); route(); toast('Perfil atualizado'); return; }
    const p = EA.profiles.create(data);
    EA.profiles.setActive(p.id); closeSheet(); location.hash = '#/'; route(); toast('Perfil criado: ' + p.display_name);
  };
}
$('#profileBtn').onclick = () => { fx.tap(); profileSheet(); };

/* ---------- novo caderno (preparado para ingestão futura) ---------- */
function newPackSheet() {
  sheet(`<h3 class="sh-title">Novo caderno</h3><p class="muted">Envie o material e o EXPLICA AI monta explicações, cartões, quiz, revisão e áudio.</p>
    <div class="src-grid">${[['file', 'PDF'], ['camera', 'Foto'], ['text', 'Texto'], ['book', 'Documento'], ['slides', 'Slides'], ['link2', 'Link']].map(([e, n]) => `<button class="src" disabled aria-disabled="true">${EA.icon(e, 26)}${n}<small>em breve</small></button>`).join('')}</div>
    <div class="flow-mini">Material → Compreensão → Visual → Explicação → Exercício → Revisão → Domínio</div>
    <p class="muted center" style="margin-top:10px">Por enquanto, novos cadernos são montados sob pedido.</p>`);
}

/* ---------- tutor EXPLICA ---------- */
const fab = $('#fab');
const CHIPI = { easier: 'simpler', other: 'swap', example: 'example', compare: 'compare', visual: 'image', summary: 'summary', test: 'quiz', exer: 'pencilList' };
const CTXN = (c) => { const pk = EA.pack(); const k = pk && c.concept && pk.concepts.find(x => x.id === c.concept); return k ? k.n : ''; };
EA.onCtx = (c) => { const n = CTXN(c); fab.setAttribute('aria-label', n ? 'Perguntar ao EXPLICA AI sobre ' + n : 'Perguntar ao EXPLICA AI'); const f = $('.fab-ctx', fab); if (f) f.textContent = n ? '· ' + n : ''; fab.classList.toggle('has-ctx', !!n && !c.exam); fab.hidden = !!c.exam; };
/* Proveniência v1.1 — 5 fontes (ícone + texto; nunca só cor). Compatível com os selos antigos (.mat/.ext/.none).
   Nunca exibe o dado privado usado — só a categoria da fonte. */
const SRC = {
  material: ['source-material mat', 'book', 'No seu material'],
  school:   ['source-school', 'layers', 'No seu colégio'],
  profile:  ['source-profile', 'user', 'Do seu contexto'],
  extra:    ['source-general ext', 'facet', 'EXPLICA AI complementa'],
  general:  ['source-general ext', 'facet', 'Conhecimento geral'],
  fresh:    ['source-fresh', 'eye', 'Informação atualizada'],
  offline:  ['none', 'alert', 'Modo local'],
  none:     ['none', 'alert', 'Modo local'],
};
function srcBadge(src) { const d = SRC[src]; return d ? `<span class="src-b ${d[0]}">${EA.icon(d[1], 14)}${d[2]}</span>` : ''; }
EA.srcBadge = srcBadge;
function tutorSheet(prefill) {
  const pack = EA.pack(), prof = EA.profiles.active(), S = EA.state(), ctx = EA.ctx.get();
  EA.Tutor.recent = null;
  const where = pack ? `${ctx.title || 'Início do caderno'} · ${pack.title}` : 'Início';
  const s = sheet(`<div class="tu-head"><span class="tu-logo">${LOGO(34)}</span><div class="tu-id"><b><span class="sr-only">EXPLICA AI</span><svg class="wm-svg" viewBox="0 0 96 16" width="96" height="16" aria-hidden="true" focusable="false"><text x="0" y="13.2" textLength="96" lengthAdjust="spacingAndGlyphs" style="font:700 15.5px Lexend,system-ui,sans-serif;fill:var(--color-brand-primary)">EXPLICA <tspan style="fill:var(--color-brand-accent)">AI</tspan></text></svg></b><small>Você está em: ${esc(where)}</small></div><button class="icon-btn sm" id="tuMin" aria-label="Minimizar EXPLICA AI (a conversa continua)">${EA.icon('chevronDown', 20)}</button><button class="icon-btn sm" id="tuClose" aria-label="Fechar EXPLICA AI">${EA.icon('close', 20)}</button></div>
    <div class="tu-log" id="tuLog" role="log" aria-live="polite" aria-relevant="additions"></div>
    <div class="tu-chips" role="toolbar" aria-label="Ações rápidas">${EA.TUTOR_CHIPS.map(([k, l]) => `<button data-m="${k}">${EA.icon(CHIPI[k] || 'facet', 16)}<span>${l}</span></button>`).join('')}<button data-speak="1">${EA.icon('soundOn', 16)}<span>Ouvir</span></button></div>
    <form class="tu-in" id="tuForm"><input id="tuInput" placeholder="Pergunte sobre esta tela…" aria-label="Pergunte sobre esta tela" autocomplete="off" enterkeyhint="send"><button class="tu-send" aria-label="Enviar pergunta">${EA.icon('send', 22)}</button></form>`, 'tutor', 'EXPLICA AI — tutor');
  s.dataset.onclose = 'tutorClose';
  const log = $('#tuLog', s);
  const hist = S ? S.tutor : [];
  const push = (m) => { if (S) { hist.push(m); if (hist.length > 40) hist.shift(); EA.save(); } };
  function bubbleAI(r) {
    const b = h(`<div class="msg ai"><div class="bub">
      ${r.warn ? `<p class="fix">${EA.icon('alert', 16)} Não confunda</p>` : ''}<p>${esc(r.text)}</p>
      ${r.weak ? `<p class="weak">${EA.icon('review', 16)}<span>${esc(r.weak)}</span></p>` : ''}
      ${r.vis && r.vis.img ? `<img src="${r.vis.img}" width="960" height="600" alt="${esc(r.vis.label || '')}" loading="lazy" decoding="async">` : ''}
      ${r.link ? `<a class="go-screen" href="${esc(r.link.href)}">${esc(r.link.label)} ${EA.icon('chevronRight', 16)}</a>` : ''}
      ${r.vis && r.vis.route && pack ? `<a class="go-screen" href="#/c/${pack.id}/${r.vis.route}">${esc(r.vis.label || 'Abrir tela')} ${EA.icon('chevronRight', 16)}</a>` : ''}
      ${r.quiz ? '<div class="tu-quiz"></div>' : ''}
      <div class="meta">${srcBadge(r.src)}${r.src !== 'meta' || r.speakNow ? `<button class="say sm" data-say="${esc(r.speakNow || r.text)}">${EA.icon('soundOn', 16)} Ouvir resposta</button>` : ''}</div>
      ${r.close && !r.quiz ? `<p class="close">${esc(r.close)}</p>` : ''}</div></div>`);
    log.append(b);
    if (r.quiz) EA.Quiz($('.tu-quiz', b), r.quiz, { label: 'EXPLICA AI testa' });
    $$('.go-screen', b).forEach(a => a.onclick = () => closeSheet());
    if (r.speakNow) say(r.speakNow);
    b.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    if (s.closest('.sheet-wrap')?.classList.contains('min')) fab.classList.add('has-reply');
  }
  function bubbleUser(t) { log.append(h(`<div class="msg me"><div class="bub">${esc(t)}</div></div>`)); }
  function ask(text, mode) {
    bubbleUser(text); push({ role: 'me', text });
    const th = h('<div class="msg ai" role="status"><div class="bub thinking"><i></i><i></i><i></i><span>Organizando a explicação…</span></div></div>'); log.append(th); th.scrollIntoView({ block: 'end' });
    const t0 = Date.now(), wait = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    EA.AI.ask(text, mode).then((r) => {
      if (S && r.mode) { S.modes[r.mode] = (S.modes[r.mode] || 0) + 1; }
      push({ role: 'ai', text: r.text, concept: r.concept, mode: r.mode, speak: r.text });
      setTimeout(() => { th.remove(); bubbleAI(r); fx.tap(); }, Math.max(0, wait - (Date.now() - t0)));
    });
  }
  // abertura contextual
  const c = pack && ctx.concept ? pack.concepts.find(x => x.id === ctx.concept) : null;
  const weak = pack && S ? EA.weakConcepts(pack, S).slice(0, 2).map(id => pack.concepts.find(x => x.id === id)?.n).filter(Boolean) : [];
  const P = EA.persona(prof);
  const hi = P.band === 'adult' ? `Olá, ${prof.display_name}.` : `Oi, ${prof.display_name}!`;
  bubbleAI({ text: `${hi} ${c ? `Vi que você está em ${c.n}. Pode perguntar, até “por que isso acontece?”.` : pack ? `Pergunte qualquer coisa sobre ${pack.title}.` : 'Abra um caderno ou pergunte o que quiser.'}${weak.length ? ` Dá pra revisar: ${weak.join(' e ')}.` : ''}`, src: 'meta' });
  $$('.tu-chips button', s).forEach(b => b.onclick = () => b.dataset.speak ? ask('Fala isso para mim') : ask(b.textContent.trim(), b.dataset.m));
  $('#tuForm', s).onsubmit = (e) => { e.preventDefault(); const i = $('#tuInput', s); const v = i.value.trim(); if (!v) return; i.value = ''; ask(v); };
  const wrapEl = s.closest('.sheet-wrap');
  EA.tutorMin = () => { wrapEl.classList.add('min'); wrapEl.classList.remove('open'); fab.classList.add('is-min'); fab.setAttribute('aria-expanded', 'false'); fab.focus({ preventScroll: true }); };
  EA.tutorRestore = () => { wrapEl.classList.add('open'); wrapEl.classList.remove('min'); fab.classList.remove('is-min', 'has-reply'); fab.setAttribute('aria-expanded', 'true'); setTimeout(() => $('#tuInput', s).focus({ preventScroll: true }), 60); };
  EA.tutorClose = () => { const v = $('#tuInput', s).value.trim(); if (v && !confirm('Descartar a pergunta que você digitou?')) return; fab.classList.remove('is-min', 'has-reply'); fab.setAttribute('aria-expanded', 'false'); closeSheet(); };
  $('#tuMin', s).onclick = EA.tutorMin;
  $('#tuClose', s).onclick = EA.tutorClose;
  fab.setAttribute('aria-expanded', 'true');
  if (prefill) ask(prefill);
  EA.tutorAsk = ask;
}
fab.onclick = () => { fx.tap(); const m = $('.sheet-wrap.min'); if (m && EA.tutorRestore) EA.tutorRestore(); else tutorSheet(); };
document.addEventListener('click', (e) => { const b = e.target.closest('[data-ask]'); if (b) { e.preventDefault(); $$('.sheet-wrap.min').forEach(x => x.remove()); fab.classList.remove('is-min', 'has-reply'); tutorSheet(b.dataset.ask); } });

/* ---------- marca ---------- */
const LOGO = (s = 28, m = 'pos') => EA.MARK(s, m);
EA.LOGO = LOGO;
$('#brandMark').innerHTML = LOGO(30);
$('#fab').innerHTML = `${EA.MARK(30, 'neg')}<span>EXPLICA</span><span class="fab-ctx"></span>`;

/* ---------- Home global ---------- */
function heroArt() {
  // globo de conhecimento (globe.js): qualquer assunto, qualquer lugar → um ponto de clareza (nó dourado)
  return `<canvas class="bh-globe" aria-hidden="true"></canvas><span class="bh-scrim" aria-hidden="true"></span>`;
}
function globalHome() {
  const p = EA.profiles.active(), packs = EA.packsFor(p.id);
  const lastId = EA.store.getItem(lastKey(p.id));
  const cont = packs.find(k => k.id === lastId) || packs[0];
  const pct = (k) => EA.masteryOf(k, EA.stateFor(p.id, k.id)).all;
  EA.ctx.reset({ screen: 'home-global', title: 'Início', concept: null });
  let next = '';
  if (cont) {
    const S = EA.stateFor(p.id, cont.id), weak = EA.weakConcepts(cont, S)[0], wc = weak && cont.concepts.find(c => c.id === weak);
    next = wc ? `${EA.icon('review', 16)} Revisar: ${esc(wc.n)}` : `${EA.icon('play', 16)} Próximo passo pronto para você`;
  }
  const el = h(`<div class="view-enter g-home">
    <section class="brand-hero">
      ${heroArt()}
      <p class="bh-name">${EA.MARK(24, 'neg')} EXPLICA <span class="ai">AI</span></p>
      <h1>Entenda qualquer assunto, <em>do seu jeito.</em></h1>
      <div class="verbs" aria-label="Pergunte, entenda, pratique, aprenda"><span>Pergunte</span><span>Entenda</span><span>Pratique</span><span>Aprenda</span></div>
    </section>
    <h2 class="hello">Olá, ${esc(p.display_name)}.</h2>
    ${cont ? `<a class="continue" href="#/c/${cont.id}/home" aria-label="Continuar estudando ${esc(cont.subject)}: ${esc(cont.title)}, ${pct(cont)}% de domínio">
        <div class="ct-img" style="background-image:url(${cont.cover})"><span class="ct-subj">${EA.icon('book', 14)} ${esc(cont.subject)}</span></div>
        <div class="ct-body"><p class="eyebrow">Continue estudando</p>
          <h3>${esc(cont.title)}</h3><p class="ct-t">${esc(cont.subtitle)}</p>
          <div class="ct-prog"><div class="bar"><i style="width:${pct(cont)}%;--c:var(--color-brand-accent)"></i></div><b>${pct(cont)}%</b></div>
          <p class="ct-next">${next}</p>
          <span class="btn btn-brand sm">Continuar ${EA.icon('chevronRight', 18)}</span></div></a>`
      : `<div class="empty">${EA.icon('layers', 36)}<h3>Nenhum caderno ainda</h3><p class="muted">Crie o primeiro a partir de um PDF, foto ou texto.</p></div>`}
    <section class="section"><div class="section-h"><h2>Seus cadernos</h2><span class="muted">${packs.length}</span></div>
      <div class="packs">${packs.map(k => `<a class="pk" href="#/c/${k.id}/home"><span class="pk-ico">${EA.icon('book', 24)}</span><div><b>${esc(k.subject)} — ${esc(k.title)}</b><small>${esc(k.subtitle)}</small><div class="bar"><i style="width:${pct(k)}%;--c:var(--color-brand-accent)"></i></div></div><span class="go">${EA.icon('chevronRight', 20)}</span></a>`).join('')}
        <button class="pk new" id="newPack"><span class="pk-ico">${EA.icon('plus', 24)}</span><div><b>Novo caderno</b><small>PDF, foto, texto ou link</small></div></button></div></section>
  </div>`);
  view.append(el);
  EA.globe && EA.globe($('.bh-globe', el));
  $('#newPack', el).onclick = () => { fx.tap(); newPackSheet(); };
}

/* ---------- roteador ---------- */
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  closeSheet(true);
  view.innerHTML = '';
  const prof = EA.profiles.active();
  if (parts[0] === 'c' && EA.packs[parts[1]] && EA.packs[parts[1]].owner_profile_ids.includes(prof.id)) {
    const pack = EA.packs[parts[1]], scr = parts[2] || 'home';
    EA.setPack(pack.id); EA.store.setItem(lastKey(prof.id), pack.id);
    document.body.dataset.scope = 'pack';
    tabbar.innerHTML = pack.tabs.map(([k, i, l]) => `<a href="#/c/${pack.id}/${k}" data-tab="${k}"><i>${EA.ICONS.includes(i) ? EA.icon(i, 24) : i}</i><span>${l}</span></a>`).join('');
    tabbar.hidden = false;
    const wrap = h('<div class="view-enter"></div>'); view.append(wrap);
    (pack.screens[scr] || pack.screens.home)(wrap);
    $$('a', tabbar).forEach(a => { const on = a.dataset.tab === scr || ((scr === 'revisao' || scr === 'simulado') && a.dataset.tab === 'home'); a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  } else {
    if (parts.length) { history.replaceState(null, '', '#/'); }
    EA.setPack(null); document.body.dataset.scope = 'global'; tabbar.hidden = true;
    globalHome();
  }
  window.scrollTo(0, 0);
  paintTop();
}
EA.route = route;
window.addEventListener('hashchange', route);
route();
})();
/* FAB estendido → compacto ao rolar para baixo; volta ao rolar para cima (não cobre o conteúdo durante a leitura) */
(() => { let y0 = 0; addEventListener('scroll', () => { const y = scrollY, f = document.getElementById('fab'); if (!f) return; if (y > y0 + 6 && y > 60) f.classList.add('compact'); else if (y < y0 - 6 || y < 60) f.classList.remove('compact'); y0 = y; }, { passive: true }); })();
/* MAPA acessível (§17/§24): cada estado/zona vira alvo de teclado + lista alternativa abaixo do mapa. Só aciona os handlers existentes. */
(() => {
  const ZN = { zm: 'Zona da Mata', ag: 'Agreste', st: 'Sertão', mn: 'Meio-Norte' };
  const name = (p) => { if (p.dataset.z) return ZN[p.dataset.z] || p.dataset.z; const all = (window.GEO?.br?.states || []).concat(window.GEO?.ne?.states || []); const s = all.find(x => x.s === p.dataset.s); return s ? `${s.n} (${s.s})` : p.dataset.s; };
  function enhance(root) {
    root.querySelectorAll('.svg-host').forEach(host => {
      const paths = [...host.querySelectorAll('path.st:not(.dim), path.zone')];
      if (!paths.length || paths[0].hasAttribute('tabindex')) return;
      const svg = host.querySelector('svg'); if (svg) { svg.setAttribute('role', 'group'); }
      paths.forEach(p => { p.setAttribute('tabindex', '0'); p.setAttribute('role', 'button'); p.setAttribute('aria-label', name(p));
        p.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.dispatchEvent(new MouseEvent('click', { bubbles: true })); } }; });
      const wrap = host.closest('.map-wrap'); if (!wrap) return;
      let list = wrap.nextElementSibling && wrap.nextElementSibling.classList.contains('map-list') ? wrap.nextElementSibling : null;
      if (!list) { list = document.createElement('details'); list.className = 'map-list'; wrap.after(list); }
      list.innerHTML = `<summary>Lista acessível do mapa (${paths.length})</summary><div class="ml-grid">${paths.map((p, i) => `<button type="button" data-i="${i}">${EA.esc(name(p))}</button>`).join('')}</div>`;
      list.querySelectorAll('button').forEach(b => b.onclick = () => paths[+b.dataset.i].dispatchEvent(new MouseEvent('click', { bubbles: true })));
    });
  }
  const v = document.getElementById('view');
  new MutationObserver(() => enhance(v)).observe(v, { childList: true, subtree: true });
  enhance(v);
})();
