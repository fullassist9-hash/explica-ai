/* CADERNO: Matemática — Função Quadrática (foco: vértice, máximo e mínimo)
   Content Pack mat-funcao-quadratica-v1 · mesmo motor do EXPLICA AI (core.js / app.js / tutor.js).
   Fonte primária: livro didático da aluna, cap. 5.1, pp. 253–259 (fotos enviadas pelo responsável).
   Fonte complementar: relatório pedagógico (método, erros prováveis, simulados autorais) — sempre marcado como complemento. */
(() => {
'use strict';
const { $, $$, h, shuffle, fx, say, sayBtn, toast, esc } = EA;
const ID = 'mat-funcao-quadratica-v1';
const R = '#/c/' + ID + '/';
const ST = () => EA.state();

/* ---------------- utilidades matemáticas ---------------- */
const fmt = (n) => { const r = Math.round(n * 100) / 100; const s = Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0$/, ''); return s.replace('-', '−').replace('.', ','); };
const term = (k, x, first) => { if (!k) return ''; const sg = k < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + '); const v = Math.abs(k); return sg + (x ? (v === 1 ? '' : fmt(v)) + x : fmt(v)); };
const poly = (a, b, c, v = 'x') => { let s = term(a, v + '²', true); s += term(b, v, !s); s += term(c, '', !s); return s || '0'; };
const vertexOf = (a, b, c) => { const xv = -b / (2 * a); return { xv, yv: a * xv * xv + b * xv + c, d: b * b - 4 * a * c }; };
const rootsOf = (a, b, c) => { const d = b * b - 4 * a * c; if (d < 0) return []; if (d === 0) return [-b / (2 * a)]; const s = Math.sqrt(d); return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q); };
const near = (p, q) => Math.abs(p - q) < 1e-6;
const parse = (s) => { const t = String(s ?? '').trim().replace('−', '-').replace(',', '.'); return t === '' ? null : (isNaN(+t) ? NaN : +t); };

/* Gráfico SVG: janela centrada no vértice; eixo de simetria, vértice, raízes e (0, c). */
function plot(a, b, c, o = {}) {
  const W = o.w || 340, H = o.h || 260, { xv, yv } = vertexOf(a, b, c), rs = rootsOf(a, b, c);
  const span = o.span || Math.max(4, ...rs.map(r => Math.abs(r - xv) + 1.5), Math.abs(xv) + 1);
  const x0 = Math.min(xv - span, -1), x1 = Math.max(xv + span, 1);
  const f = (x) => a * x * x + b * x + c;
  const ys = []; for (let i = 0; i <= 80; i++) ys.push(f(x0 + (x1 - x0) * i / 80));
  let y0 = Math.min(...ys, 0, yv) - 1, y1 = Math.max(...ys.filter(y => Math.abs(y - yv) < 40), 0, c) + 1;
  if (a > 0) y1 = Math.min(y1, yv + Math.max(8, (y1 - yv) * .8)); else y0 = Math.max(y0, yv - Math.max(8, (yv - y0) * .8));
  const X = (x) => 28 + (x - x0) / (x1 - x0) * (W - 40), Y = (y) => H - 22 - (y - y0) / (y1 - y0) * (H - 34);
  let d = ''; for (let i = 0; i <= 120; i++) { const x = x0 + (x1 - x0) * i / 120, y = f(x); d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(Math.max(y0 - 50, Math.min(y1 + 50, y))).toFixed(1); }
  const ext = a > 0 ? 'mínimo' : 'máximo', col = a > 0 ? 'var(--color-feedback-success, #1F8A5B)' : 'var(--color-feedback-error, #C2410C)';
  return `<svg viewBox="0 0 ${W} ${H}" class="qplot" role="img" aria-label="Gráfico de y = ${esc(poly(a, b, c))}: vértice (${fmt(xv)}, ${fmt(yv)}), ponto de ${ext}">
    <defs><clipPath id="clp${W}${H}"><rect x="28" y="6" width="${W - 34}" height="${H - 28}"/></clipPath></defs>
    <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="var(--color-surface-raised, #fff)"/>
    ${x0 < 0 && x1 > 0 ? `<line x1="${X(0)}" y1="6" x2="${X(0)}" y2="${H - 22}" stroke="#9AA4B2" stroke-width="1"/>` : ''}
    ${y0 < 0 && y1 > 0 ? `<line x1="28" y1="${Y(0)}" x2="${W - 8}" y2="${Y(0)}" stroke="#9AA4B2" stroke-width="1"/>` : ''}
    <text x="${W - 14}" y="${Math.min(H - 26, Math.max(14, Y(0) - 4))}" font-size="11" fill="#6B7280">x</text>
    ${o.axis !== false ? `<line x1="${X(xv)}" y1="6" x2="${X(xv)}" y2="${H - 22}" stroke="${col}" stroke-dasharray="5 4" stroke-width="1.4"/><text x="${X(xv) + 4}" y="16" font-size="11" fill="${col}">x = ${fmt(xv)}</text>` : ''}
    <path d="${d}" fill="none" stroke="var(--color-brand-primary, #0B5FFF)" stroke-width="3" stroke-linecap="round" clip-path="url(#clp${W}${H})"/>
    ${o.roots !== false ? rs.map(r => `<circle cx="${X(r)}" cy="${Y(0)}" r="5" fill="#fff" stroke="#374151" stroke-width="2"/><text x="${X(r) - 6}" y="${Y(0) + 16}" font-size="11" fill="#374151">${fmt(r)}</text>`).join('') : ''}
    ${o.c !== false && x0 < 0 && x1 > 0 ? `<circle cx="${X(0)}" cy="${Y(c)}" r="4.5" fill="#6B7280"/><text x="${X(0) + 6}" y="${Y(c) - 6}" font-size="11" fill="#374151">(0, ${fmt(c)})</text>` : ''}
    <circle cx="${X(xv)}" cy="${Y(yv)}" r="7" fill="${col}" stroke="#fff" stroke-width="2"/>
    <text x="${Math.min(W - 120, X(xv) + 10)}" y="${a > 0 ? Y(yv) + 18 : Y(yv) - 10}" font-size="12.5" font-weight="700" fill="${col}">V(${fmt(xv)}, ${fmt(yv)}) · ${ext}</text>
  </svg>`;
}

/* ---------------- erros pedagógicos (registrados por tipo) ---------------- */
const ERR = {
  SIGN_ERROR_XV: { n: 'Sinal de x_v', t: 'Esqueceu o “menos” de x_v = −b/(2a).', fix: 'Circule o sinal de menos antes de substituir. Com b = −6 e a = 1: x_v = −(−6)/(2·1) = +3.' },
  COEFFICIENT_IDENTIFICATION: { n: 'Identificar a, b, c', t: 'Trocou a, b ou c (ou perdeu o sinal).', fix: 'Reescreva em ordem: ax² + bx + c. Termo que falta vale 0: x² + 5 = 1x² + 0x + 5. O sinal vai junto com o número.' },
  CONCAVITY_EXTREME_CONFUSION: { n: 'Máximo × mínimo', t: 'Confundiu o tipo de extremo com a concavidade.', fix: 'a > 0 → abre para cima (U) → o vértice é MÍNIMO. a < 0 → abre para baixo (∩) → o vértice é MÁXIMO.' },
  VERTEX_INCOMPLETE: { n: 'Vértice incompleto', t: 'Achou só um número; o vértice é um PONTO.', fix: 'Sempre feche com as duas coordenadas: V = (x_v, y_v).' },
  XV_YV_INTERPRETATION: { n: 'x_v × y_v', t: 'Respondeu x_v quando pediram y_v (ou o contrário).', fix: 'x_v responde ONDE / QUANDO / QUANTOS. y_v responde QUAL É o valor máximo ou mínimo.' },
  ROOT_VS_VERTEX_CONFUSION: { n: 'Raiz × vértice', t: 'Usou raiz no lugar do vértice.', fix: 'Raiz = onde a parábola corta o eixo x (y = 0). Vértice = ponto mais baixo (mínimo) ou mais alto (máximo).' },
  CANONICAL_FORM_SIGN_ERROR: { n: 'Forma canônica', t: 'Inverteu o sinal dentro do parêntese.', fix: 'Em a(x − h)² + k o vértice é (h, k). Atenção: (x + 4) = (x − (−4)) → h = −4.' },
};

/* ---------------- conteúdo ---------------- */
const TOPICS = {
  par:   { name: 'Parábola e função quadrática', sub: '01–05 · parábola, eixo, a·b·c, concavidade', ico: '〰️', c: 'var(--learn-clima)', bg: 'var(--learn-clima-bg)', route: 'parabola', acts: [] },
  vert:  { name: 'Vértice: máximo e mínimo', sub: '06 · 09–12 · prioridade da prova', ico: '🎯', c: 'var(--learn-region-co)', bg: 'var(--learn-region-co-bg)', route: 'vertice', acts: [] },
  graf:  { name: 'Gráfico e pontos notáveis', sub: '07 · 08 · 13 · 14 · raízes × vértice', ico: '📈', c: 'var(--learn-vegetacao)', bg: 'var(--learn-vegetacao-bg)', route: 'grafico', acts: ['act_graf'] },
  prob:  { name: 'Situações-problema', sub: '15 · quando × quanto', ico: '🧩', c: 'var(--learn-relevo)', bg: 'var(--learn-relevo-bg)', route: 'problemas', acts: [] },
  treino:{ name: 'Treino do vértice', sub: '16 · seus erros viram treino', ico: '🏋️', c: 'var(--learn-zm)', bg: 'var(--learn-zm-bg)', route: 'treino', acts: ['act_tr1', 'act_tr2', 'act_tr3', 'act_canon', 'act_coef'] },
};
const SECTIONS = [
  ['01', 'Conheça a parábola', 'parabola', 's01', 'p. 253'], ['02', 'Foco, diretriz e eixo de simetria', 'parabola', 's02', 'p. 254'],
  ['03', 'Conceito de função quadrática', 'parabola', 's03', 'p. 255'], ['04', 'Coeficientes a, b, c', 'parabola', 's04', 'p. 256'],
  ['05', 'Concavidade', 'parabola', 's05', 'p. 257'], ['06', 'Máximo × mínimo', 'vertice', 's06', 'complemento'],
  ['07', 'Construção do gráfico', 'grafico', 's07', 'pp. 256–257'], ['08', 'Raízes × vértice', 'grafico', 's08', 'p. 258'],
  ['09', 'Cálculo de x_v', 'vertice', 's09', 'p. 259'], ['10', 'Cálculo de y_v', 'vertice', 's10', 'p. 259'],
  ['11', 'V = (x_v, y_v)', 'vertice', 's11', 'p. 259'], ['12', 'Interpretação de máximo e mínimo', 'vertice', 's12', 'complemento'],
  ['13', 'Pontos notáveis', 'grafico', 's13', 'p. 258'], ['14', 'Esboço completo', 'grafico', 's14', 'p. 258'],
  ['15', 'Situações-problema', 'problemas', 's15', 'p. 255 + complemento'], ['16', 'Seus erros', 'treino', 's16', 'EXPLICA AI'],
  ['17', 'Revisão inteligente', 'revisao', '', 'EXPLICA AI'], ['18', 'Simulado', 'simulado', '', 'complemento'],
];
const BADGES = [
  { id: 'vtx', t: '🎯 Domina o vértice', test: (m, S) => ['v5', 'v6', 'v7', 'v12'].every(id => S.correct[id]) },
  { id: 'mm', t: '⬆️⬇️ Máximo × mínimo', test: (m, S) => ['v1', 'v2', 'v20', 'p8'].every(id => S.correct[id]) },
  { id: 'xy', t: '🧭 x_v × y_v', test: (m, S) => ['v9', 'v10', 'pr1', 'pr2'].every(id => S.correct[id]) },
  { id: 'tr', t: '🏋️ Treino completo', test: (m, S) => ['act_tr1', 'act_tr2', 'act_tr3'].every(id => S.acts[id]) },
  { id: 'pro', t: '🏆 Pronta para a prova', test: m => m.all >= 85 },
];

// Banco de perguntas. o[0] é a correta (o quiz embaralha). lv: 1 fácil · 2 médio · 3 difícil.
// e: alternativa errada → tipo de erro (vira treino dirigido). Fonte: 📘 livro ou ➕ complemento (relatório).
const SIGN = 'SIGN_ERROR_XV', COEF = 'COEFFICIENT_IDENTIFICATION', CONC = 'CONCAVITY_EXTREME_CONFUSION', INC = 'VERTEX_INCOMPLETE', XY = 'XV_YV_INTERPRETATION', ROOT = 'ROOT_VS_VERTEX_CONFUSION', CAN = 'CANONICAL_FORM_SIGN_ERROR';
const Q = [
  // 01–05 · parábola e função (📘 pp. 253–257)
  { id: 'p1', t: 'par', c: 'parabola', lv: 1, p: 'A trajetória de um jato d’água lançado obliquamente para cima tem forma de:', o: ['Parábola', 'Reta', 'Circunferência', 'Triângulo'], r: ['📘 Livro, p. 253: a trajetória do jato d’água é parabólica.'] },
  { id: 'p2', t: 'par', c: 'foco-diretriz', lv: 2, p: 'Pela definição do livro, a parábola é o conjunto dos pontos do plano que estão à mesma distância de:', o: ['um ponto F (foco) e uma reta d (diretriz)', 'dois pontos fixos', 'um ponto e uma circunferência', 'os dois eixos'], r: ['📘 Livro, p. 254: pontos equidistantes do foco F e da diretriz d.'] },
  { id: 'p3', t: 'par', c: 'eixo-simetria', lv: 1, p: 'O vértice V é a interseção da parábola com:', o: ['o eixo de simetria', 'o eixo x', 'a diretriz', 'o foco'], r: ['📘 Livro, p. 254: a interseção da parábola com seu eixo de simetria é o vértice V.'], e: { 'o eixo x': ROOT } },
  { id: 'p4', t: 'par', c: 'funcao-quadratica', lv: 1, p: 'Qual destas é uma função quadrática?', o: ['y = 5x² − 3x + 8', 'y = 3x + 2', 'y = 0x² + 4x', 'y = 7'], r: ['📘 Livro, p. 255: y = ax² + bx + c com a ≠ 0.', 'Se a = 0, não é quadrática.'] },
  { id: 'p5', t: 'par', c: 'coeficientes', lv: 2, k: COEF, p: 'Em y = −4x² + x, os coeficientes são:', o: ['a = −4, b = 1, c = 0', 'a = 4, b = 1, c = 0', 'a = −4, b = 0, c = 1', 'a = 1, b = −4, c = 0'], r: ['📘 Livro, p. 256 (exemplo b).', 'O sinal vai junto: a = −4. O x sozinho é 1x → b = 1. Não tem número solto → c = 0.'], e: { 'a = 4, b = 1, c = 0': COEF, 'a = −4, b = 0, c = 1': COEF, 'a = 1, b = −4, c = 0': COEF } },
  { id: 'p6', t: 'par', c: 'coeficientes', lv: 2, k: COEF, p: 'Em f(x) = 5 − x² + 3x, quanto vale b?', o: ['3', '5', '−1', '1'], r: ['Reordene: f(x) = −x² + 3x + 5 → a = −1, b = 3, c = 5.'], e: { '5': COEF, '−1': COEF, '1': COEF } },
  { id: 'p7', t: 'par', c: 'coeficientes', lv: 3, k: COEF, p: 'Em g(x) = x² − √3, os coeficientes são:', o: ['a = 1, b = 0, c = −√3', 'a = 1, b = −√3, c = 0', 'a = 0, b = 1, c = −√3', 'a = 1, b = 1, c = −√3'], r: ['📘 Livro, p. 256 (exemplo c).', 'Não há termo em x → b = 0.'], e: { 'a = 1, b = −√3, c = 0': COEF, 'a = 0, b = 1, c = −√3': COEF, 'a = 1, b = 1, c = −√3': COEF } },
  { id: 'p8', t: 'par', c: 'concavidade', lv: 1, k: CONC, p: 'Em y = −2x² + 8x + 3, a concavidade é:', o: ['Para baixo (∩), porque a < 0', 'Para cima (U), porque a < 0', 'Para cima (U), porque b > 0', 'Para baixo (∩), porque c > 0'], r: ['📘 Livro, p. 257: a > 0 → para cima; a < 0 → para baixo.', 'Quem decide é só o a.'], e: { 'Para cima (U), porque a < 0': CONC, 'Para cima (U), porque b > 0': COEF, 'Para baixo (∩), porque c > 0': COEF } },
  { id: 'p9', t: 'par', c: 'concavidade', lv: 1, p: 'Em y = x² − 6x + 5 a concavidade é para cima porque:', o: ['a = 1 é positivo', 'b = −6 é negativo', 'c = 5 é positivo', 'Δ = 16 é positivo'], r: ['📘 Livro, p. 258: como a > 0, a concavidade é voltada para cima.'], e: { 'b = −6 é negativo': COEF, 'c = 5 é positivo': COEF } },
  { id: 'p10', t: 'par', c: 'funcao-quadratica', lv: 2, k: COEF, p: 'No custo da recicladora, C(x) = −9x² + 1.800x (livro, p. 255), quanto vale a?', o: ['−9', '1.800', '9', '0'], r: ['a é o número que multiplica x²: a = −9 (com o sinal).', 'b = 1.800 e c = 0.'], e: { '1.800': COEF, '9': COEF, '0': COEF } },
  // 06 · 09–12 · vértice (📘 p. 259 + ➕ complemento)
  { id: 'v1', t: 'vert', c: 'maxmin', lv: 1, k: CONC, p: 'Se a > 0, o vértice é ponto de:', o: ['Mínimo', 'Máximo', 'Raiz', 'Foco'], r: ['a > 0 → parábola em U → o vértice é o ponto mais BAIXO → mínimo.'], e: { 'Máximo': CONC, 'Raiz': ROOT } },
  { id: 'v2', t: 'vert', c: 'maxmin', lv: 1, k: CONC, p: 'Se a < 0, o vértice é ponto de:', o: ['Máximo', 'Mínimo', 'Raiz', 'Interseção com o eixo y'], r: ['a < 0 → parábola em ∩ → o vértice é o ponto mais ALTO → máximo.'], e: { 'Mínimo': CONC, 'Raiz': ROOT } },
  { id: 'v3', t: 'vert', c: 'xv', lv: 1, k: SIGN, p: 'A abscissa do vértice é:', o: ['x_v = −b/(2a)', 'x_v = b/(2a)', 'x_v = −Δ/(4a)', 'x_v = −b/a'], r: ['📘 Livro, p. 259: x_v = −b/(2a).', 'Não esqueça o sinal de menos.'], e: { 'x_v = b/(2a)': SIGN, 'x_v = −Δ/(4a)': XY } },
  { id: 'v4', t: 'vert', c: 'yv', lv: 1, k: XY, p: 'A ordenada do vértice é:', o: ['y_v = −Δ/(4a)', 'y_v = −b/(2a)', 'y_v = Δ/(4a)', 'y_v = b² − 4ac'], r: ['📘 Livro, p. 259: y_v = −Δ/(4a).', 'Ou mais fácil: y_v = f(x_v).'], e: { 'y_v = −b/(2a)': XY } },
  { id: 'v5', t: 'vert', c: 'xv', lv: 1, k: SIGN, p: 'Em y = x² − 6x + 5, quanto vale x_v?', o: ['3', '−3', '6', '5'], r: ['📘 Livro, p. 259: x_v = −(−6)/(2·1) = 3.'], e: { '−3': SIGN, '5': ROOT } },
  { id: 'v6', t: 'vert', c: 'yv', lv: 2, k: XY, p: 'Em y = x² − 6x + 5, quanto vale y_v?', o: ['−4', '3', '4', '5'], r: ['y_v = f(3) = 9 − 18 + 5 = −4.', '📘 Livro, p. 259: −[(−6)² − 4·1·5]/(4·1) = −4.'], e: { '3': XY, '5': ROOT } },
  { id: 'v7', t: 'vert', c: 'vertice-ponto', lv: 2, k: INC, p: 'O vértice da parábola de y = x² − 6x + 5 é:', o: ['V = (3, −4)', 'V = 3', 'V = (−3, −4)', 'V = (1, 5)'], r: ['📘 Livro, p. 259: V(3, −4).', 'Vértice é PONTO: (x_v, y_v).'], e: { 'V = 3': INC, 'V = (−3, −4)': SIGN, 'V = (1, 5)': ROOT } },
  { id: 'v8', t: 'vert', c: 'maxmin', lv: 2, k: XY, p: 'Qual é o valor máximo de g(x) = −2x² + 8x + 3?', o: ['11', '2', '−2', '3'], r: ['a = −2 < 0 → máximo.', 'x_v = −8/(2·(−2)) = 2 → g(2) = −8 + 16 + 3 = 11.', 'O valor máximo é y_v = 11 (acontece em x = 2).'], e: { '2': XY, '−2': SIGN } },
  { id: 'v9', t: 'vert', c: 'xv-yv', lv: 1, k: XY, p: 'x_v responde à pergunta:', o: ['ONDE / QUANDO acontece o máximo ou mínimo', 'QUAL é o valor máximo ou mínimo', 'Onde a parábola corta o eixo x', 'Onde corta o eixo y'], r: ['x_v = onde / quando / quantos.', 'y_v = qual é o valor.'], e: { 'QUAL é o valor máximo ou mínimo': XY, 'Onde a parábola corta o eixo x': ROOT } },
  { id: 'v10', t: 'vert', c: 'xv-yv', lv: 1, k: XY, p: 'y_v responde à pergunta:', o: ['QUAL é o valor máximo ou mínimo', 'ONDE / QUANDO ocorre o extremo', 'Quais são as raízes', 'Qual é o valor de a'], r: ['y_v = o valor máximo ou mínimo da função.'], e: { 'ONDE / QUANDO ocorre o extremo': XY, 'Quais são as raízes': ROOT } },
  { id: 'v11', t: 'vert', c: 'xv', lv: 2, k: SIGN, p: 'Calcule x_v de f(x) = x² + 8x + 3.', o: ['−4', '4', '−8', '3'], r: ['x_v = −8/(2·1) = −4.'], e: { '4': SIGN } },
  { id: 'v12', t: 'vert', c: 'vertice-ponto', lv: 2, k: SIGN, p: 'O vértice de f(x) = x² − 4x + 7 é:', o: ['(2, 3)', '(−2, 3)', '(2, 7)', '(4, 7)'], r: ['x_v = −(−4)/2 = 2.', 'y_v = f(2) = 4 − 8 + 7 = 3.'], e: { '(−2, 3)': SIGN, '(2, 7)': COEF } },
  { id: 'v13', t: 'vert', c: 'maxmin', lv: 3, k: XY, p: 'Qual é o valor máximo de h(x) = −x² + 6x − 4?', o: ['5', '3', '−4', '9'], r: ['x_v = −6/(2·(−1)) = 3.', 'h(3) = −9 + 18 − 4 = 5 → máximo 5.'], e: { '3': XY } },
  { id: 'v14', t: 'vert', c: 'forma-canonica', lv: 1, k: CAN, p: 'Qual é o vértice de g(x) = −2(x − 5)² + 9?', o: ['(5, 9)', '(−5, 9)', '(9, 5)', '(5, −9)'], r: ['Forma a(x − h)² + k → V = (h, k) = (5, 9).'], e: { '(−5, 9)': CAN, '(9, 5)': XY } },
  { id: 'v15', t: 'vert', c: 'forma-canonica', lv: 2, k: CAN, p: 'Qual é o vértice de h(x) = 4(x + 2)² − 3?', o: ['(−2, −3)', '(2, −3)', '(−2, 3)', '(4, −3)'], r: ['(x + 2) = (x − (−2)) → h = −2.', 'V = (−2, −3).'], e: { '(2, −3)': CAN } },
  { id: 'v16', t: 'vert', c: 'forma-canonica', lv: 2, k: CAN, p: 'Qual é o vértice de f(x) = 2(x − 3)² − 5?', o: ['(3, −5)', '(−3, −5)', '(2, −5)', '(3, 5)'], r: ['V = (h, k) = (3, −5). Não troque o sinal do 3.'], e: { '(−3, −5)': CAN, '(2, −5)': COEF } },
  { id: 'v17', t: 'vert', c: 'xv', lv: 3, k: SIGN, p: 'A abscissa do vértice de f(x) = 2x² − 8x + 1 é:', o: ['2', '−2', '4', '−4'], r: ['x_v = −(−8)/(2·2) = 8/4 = 2.'], e: { '−2': SIGN } },
  { id: 'v18', t: 'vert', c: 'vertice-ponto', lv: 3, k: SIGN, p: 'O vértice de f(x) = x² + 6x + 5 é:', o: ['(−3, −4)', '(3, −4)', '(−3, 4)', '(−6, 5)'], r: ['x_v = −6/2 = −3.', 'f(−3) = 9 − 18 + 5 = −4 → V = (−3, −4).'], e: { '(3, −4)': SIGN } },
  { id: 'v19', t: 'vert', c: 'xv', lv: 2, p: 'Por que a fórmula de x_v tem “menos b”?', o: ['Porque vem de 2ax + b = 0, então x = −b/(2a)', 'Porque a é sempre negativo', 'Porque o vértice fica sempre à esquerda', 'É só uma convenção'], r: ['📘 Livro, p. 259: na dedução aparece (2ax + b)² = 0 → 2ax + b = 0 → x = −b/(2a).'] },
  { id: 'v20', t: 'vert', c: 'maxmin', lv: 3, k: CONC, p: 'Sem calcular: f(x) = 3x² − 12x + 1 tem máximo ou mínimo?', o: ['Mínimo, porque a = 3 > 0', 'Máximo, porque a = 3 > 0', 'Máximo, porque b < 0', 'Mínimo, porque c > 0'], r: ['Olhe só o a: positivo → U → mínimo.'], e: { 'Máximo, porque a = 3 > 0': CONC, 'Máximo, porque b < 0': COEF } },
  // 07 · 08 · 13 · 14 · gráfico (📘 pp. 256–258)
  { id: 'g1', t: 'graf', c: 'raiz-vertice', lv: 1, k: ROOT, p: 'Raiz e vértice são a mesma coisa?', o: ['Não: raiz é onde y = 0; vértice é o ponto de máximo ou mínimo', 'Sim, sempre', 'Só quando a > 0', 'Só quando Δ > 0'], r: ['Raiz = cruza o eixo x.', 'Vértice = ponto mais alto ou mais baixo.'], e: { 'Sim, sempre': ROOT, 'Só quando a > 0': ROOT, 'Só quando Δ > 0': ROOT } },
  { id: 'g2', t: 'graf', c: 'pontos-notaveis', lv: 1, p: 'Onde a parábola de y = ax² + bx + c corta o eixo y?', o: ['(0, c)', '(c, 0)', '(0, b)', '(−b/(2a), 0)'], r: ['📘 Livro, p. 258: x = 0 → y = c → ponto (0, c).'], e: { '(−b/(2a), 0)': ROOT } },
  { id: 'g3', t: 'graf', c: 'raizes', lv: 2, p: 'Se Δ < 0, a parábola:', o: ['Não toca o eixo x', 'Toca o eixo x em um ponto', 'Corta o eixo x em dois pontos', 'Não tem vértice'], r: ['📘 Livro, p. 258: Δ < 0 → nenhuma raiz real → não toca o eixo x.', 'O vértice continua existindo!'], e: { 'Não tem vértice': ROOT } },
  { id: 'g4', t: 'graf', c: 'raizes', lv: 2, p: 'Se Δ = 0, a parábola:', o: ['Tangencia o eixo x em um ponto (o próprio vértice)', 'Não toca o eixo x', 'Corta em dois pontos', 'Não tem vértice'], r: ['📘 Livro, p. 258: Δ = 0 → raízes iguais → tangente ao eixo x.'] },
  { id: 'g5', t: 'graf', c: 'raizes', lv: 2, k: ROOT, p: 'Quais são as raízes de y = x² − 6x + 5?', o: ['1 e 5', '3 e −4', '−1 e −5', '0 e 5'], r: ['📘 Livro, p. 258: x = (6 ± 4)/2 → x = 5 ou x = 1.', '(3, −4) é o vértice, não as raízes.'], e: { '3 e −4': ROOT, '−1 e −5': SIGN } },
  { id: 'g6', t: 'graf', c: 'raiz-vertice', lv: 2, k: ROOT, p: 'Uma função tem raízes 2 e 8. A abscissa do vértice é:', o: ['5', '2', '8', '10'], r: ['O vértice fica no meio das raízes: x_v = (2 + 8)/2 = 5.'], e: { '2': ROOT, '8': ROOT } },
  { id: 'g7', t: 'graf', c: 'eixo-simetria', lv: 2, k: SIGN, p: 'O eixo de simetria de f(x) = x² − 2x − 8 é:', o: ['x = 1', 'x = −1', 'x = 2', 'x = −2'], r: ['Eixo: x = x_v = −(−2)/(2·1) = 1.'], e: { 'x = −1': SIGN } },
  { id: 'g8', t: 'graf', c: 'esboco', lv: 3, p: 'Em f(x) = x² − 4x + 3, o ponto (0, 3) tem um simétrico no gráfico. Qual?', o: ['(4, 3)', '(2, −1)', '(3, 0)', '(−4, 3)'], r: ['Eixo x = 2. O 0 está a 2 unidades do eixo → o simétrico está em x = 4 → (4, 3).'], e: { '(2, −1)': INC } },
  { id: 'g9', t: 'graf', c: 'pontos-notaveis', lv: 3, k: CONC, p: 'Qual é a imagem de f(x) = 2(x − 1)² + 5?', o: ['y ≥ 5', 'y ≤ 5', 'y > 1', 'Todos os reais'], r: ['a = 2 > 0 → mínimo em y_v = 5 → imagem y ≥ 5.'], e: { 'y ≤ 5': CONC, 'y > 1': XY } },
  { id: 'g10', t: 'graf', c: 'grafico', lv: 1, p: 'Na tabela de y = x² − 1 (livro, p. 257), para x = −2 temos y =', o: ['3', '−5', '5', '−3'], r: ['(−2)² − 1 = 4 − 1 = 3.', 'Atenção: (−2)² = +4.'] },
  { id: 'g11', t: 'graf', c: 'esboco', lv: 1, k: CONC, p: 'Para esboçar a parábola, o primeiro passo recomendado é:', o: ['Ver o sinal de a (concavidade)', 'Fazer Bhaskara sempre', 'Achar c', 'Testar x = 100'], r: ['➕ Roteiro: 1) sinal de a · 2) vértice · 3) eixo · 4) raízes · 5) (0, c) · 6) simétrico de (0, c).'] },
  // 15 · situações-problema (📘 p. 255 + ➕ complemento)
  { id: 'pr1', t: 'prob', c: 'xv-yv', lv: 2, k: XY, p: 'A altura de um objeto é H(t) = −2t² + 8t + 1. Em que instante a altura é máxima?', o: ['2 s', '9 s', '8 s', '1 s'], r: ['“Em que instante” = QUANDO → x_v.', 't_v = −8/(2·(−2)) = 2 s.'], e: { '9 s': XY } },
  { id: 'pr2', t: 'prob', c: 'xv-yv', lv: 2, k: XY, p: 'No mesmo H(t) = −2t² + 8t + 1, qual é a altura máxima?', o: ['9', '2', '8', '17'], r: ['“Qual a altura máxima” = QUAL VALOR → y_v.', 'H(2) = −8 + 16 + 1 = 9.'], e: { '2': XY } },
  { id: 'pr3', t: 'prob', c: 'situacao-problema', lv: 3, k: XY, p: 'Lucro L(x) = −x² + 12x − 20 (centenas de reais), x = lotes vendidos. Quantos lotes dão lucro máximo?', o: ['6', '16', '12', '20'], r: ['“Quantos lotes” → x_v = −12/(2·(−1)) = 6.'], e: { '16': XY } },
  { id: 'pr4', t: 'prob', c: 'situacao-problema', lv: 3, k: XY, p: 'No mesmo L(x) = −x² + 12x − 20 (centenas de reais), qual é o lucro máximo?', o: ['R$ 1.600', 'R$ 600', 'R$ 2.000', 'R$ 1.200'], r: ['L(6) = −36 + 72 − 20 = 16 centenas = R$ 1.600.'], e: { 'R$ 600': XY } },
  { id: 'pr5', t: 'prob', c: 'situacao-problema', lv: 3, k: XY, p: 'Retângulo de perímetro 40 m: A(x) = x(20 − x). Qual é a área máxima?', o: ['100 m²', '10 m²', '20 m²', '400 m²'], r: ['A(x) = −x² + 20x → x_v = 10.', 'A(10) = 10 · 10 = 100 m².'], e: { '10 m²': XY } },
  { id: 'pr6', t: 'prob', c: 'situacao-problema', lv: 3, k: XY, p: 'Uma bola segue h(t) = −5t² + 30t + 2 (metros, segundos). Qual é a altura máxima?', o: ['47 m', '3 m', '30 m', '32 m'], r: ['t_v = −30/(2·(−5)) = 3 s.', 'h(3) = −45 + 90 + 2 = 47 m.'], e: { '3 m': XY } },
  { id: 'pr7', t: 'prob', c: 'xv-yv', lv: 1, k: XY, p: 'Num problema, a pergunta “QUANDO ocorre o máximo?” pede:', o: ['x_v', 'y_v', 'as raízes', 'o valor de c'], r: ['Quando / onde / quantos → x_v.'], e: { 'y_v': XY, 'as raízes': ROOT } },
  { id: 'pr8', t: 'prob', c: 'situacao-problema', lv: 3, k: XY, p: 'Custo C(x) = −9x² + 1.800x (livro, p. 255). Para qual produção x o custo é máximo?', o: ['100 toneladas', '90.000 toneladas', '200 toneladas', '1.800 toneladas'], r: ['x_v = −1.800/(2·(−9)) = 100.', '90.000 é o custo máximo (y_v), não a produção.'], e: { '90.000 toneladas': XY, '200 toneladas': ROOT } },
  // Plano personalizado da Lulu — diagnóstico (d*), lista progressiva (l*) e simulado da Lulu (s*) · ➕ complemento autoral
  { id: 'd1', t: 'vert', c: 'maxmin', lv: 1, k: CONC, p: 'Em f(x) = 3x² − 12x + 5, o vértice é máximo ou mínimo?', o: ['Mínimo', 'Máximo', 'Nenhum dos dois', 'Depende do Δ'], r: ['a = 3 > 0 → U → mínimo.', 'O Δ não decide máximo ou mínimo.'], e: { 'Máximo': CONC, 'Depende do Δ': CONC } },
  { id: 'd6', t: 'graf', c: 'raiz-vertice', lv: 2, k: ROOT, p: 'Se as raízes são 2 e 10, quanto vale x_v?', o: ['6', '2', '10', '12'], r: ['x_v é o ponto médio das raízes: (2 + 10)/2 = 6.'], e: { '2': ROOT, '10': ROOT } },
  { id: 'd8', t: 'prob', c: 'xv-yv', lv: 1, k: XY, p: 'Numa função de altura H(t), qual coordenada do vértice informa o INSTANTE da altura máxima?', o: ['x_v', 'y_v', 'a raiz', 'c'], r: ['Instante = quando → x_v.', 'A altura máxima é y_v.'], e: { 'y_v': XY, 'a raiz': ROOT } },
  { id: 'l1', t: 'par', c: 'coeficientes', lv: 1, k: COEF, p: 'Em f(x) = 4x² − 3x + 1: a, b, c e o tipo de extremo são:', o: ['a = 4, b = −3, c = 1 · mínimo', 'a = 4, b = 3, c = 1 · mínimo', 'a = 4, b = −3, c = 1 · máximo', 'a = −3, b = 4, c = 1 · mínimo'], r: ['a = 4 > 0 → mínimo. O sinal de b vai junto: b = −3.'], e: { 'a = 4, b = 3, c = 1 · mínimo': COEF, 'a = 4, b = −3, c = 1 · máximo': CONC, 'a = −3, b = 4, c = 1 · mínimo': COEF } },
  { id: 'l2', t: 'par', c: 'coeficientes', lv: 1, k: COEF, p: 'Em g(x) = −x² + 7: a, b, c e o tipo de extremo são:', o: ['a = −1, b = 0, c = 7 · máximo', 'a = −1, b = 7, c = 0 · máximo', 'a = 1, b = 0, c = 7 · mínimo', 'a = −1, b = 0, c = 7 · mínimo'], r: ['Não há termo em x → b = 0.', 'a = −1 < 0 → máximo.'], e: { 'a = −1, b = 7, c = 0 · máximo': COEF, 'a = 1, b = 0, c = 7 · mínimo': COEF, 'a = −1, b = 0, c = 7 · mínimo': CONC } },
  { id: 'l3', t: 'par', c: 'coeficientes', lv: 2, k: COEF, p: 'Reorganize h(x) = 3x − 2x² + 5 e identifique os coeficientes:', o: ['−2x² + 3x + 5 · a = −2, b = 3, c = 5', '3x² − 2x + 5 · a = 3, b = −2, c = 5', '−2x² + 3x + 5 · a = 3, b = −2, c = 5', '2x² + 3x + 5 · a = 2, b = 3, c = 5'], r: ['Em ordem: −2x² + 3x + 5.'], e: { '3x² − 2x + 5 · a = 3, b = −2, c = 5': COEF, '−2x² + 3x + 5 · a = 3, b = −2, c = 5': COEF, '2x² + 3x + 5 · a = 2, b = 3, c = 5': COEF } },
  { id: 'l4', t: 'vert', c: 'vertice-ponto', lv: 2, k: SIGN, p: 'Calcule o vértice de f(x) = x² − 8x + 12.', o: ['(4, −4)', '(−4, −4)', '(4, 12)', '(2, 6)'], r: ['x_v = −(−8)/2 = 4 · y_v = f(4) = 16 − 32 + 12 = −4.'], e: { '(−4, −4)': SIGN, '(2, 6)': ROOT } },
  { id: 'l5', t: 'vert', c: 'vertice-ponto', lv: 2, k: SIGN, p: 'Calcule o vértice de g(x) = −x² + 4x + 5.', o: ['(2, 9)', '(−2, 9)', '(2, 5)', '(5, −1)'], r: ['x_v = −4/(2·(−1)) = 2 · g(2) = −4 + 8 + 5 = 9.'], e: { '(−2, 9)': SIGN, '(5, −1)': ROOT } },
  { id: 'l6', t: 'vert', c: 'vertice-ponto', lv: 3, k: SIGN, p: 'Calcule o vértice de h(x) = 2x² + 12x + 10.', o: ['(−3, −8)', '(3, −8)', '(−3, 8)', '(−6, 10)'], r: ['x_v = −12/(2·2) = −3 · h(−3) = 18 − 36 + 10 = −8.'], e: { '(3, −8)': SIGN } },
  { id: 'l7', t: 'vert', c: 'maxmin', lv: 3, k: XY, p: 'Qual é o valor máximo de p(x) = −2x² − 8x + 1?', o: ['9', '−2', '2', '1'], r: ['x_v = −(−8)/(2·(−2)) = −2 · p(−2) = −8 + 16 + 1 = 9.'], e: { '−2': XY, '2': SIGN } },
  { id: 'l8', t: 'vert', c: 'maxmin', lv: 2, k: XY, p: 'Qual é o valor mínimo de q(x) = 3x² − 6x + 4?', o: ['1', '4', '−1', '3'], r: ['x_v = 6/6 = 1 · q(1) = 3 − 6 + 4 = 1.'], e: { '−1': SIGN } },
  { id: 'l9', t: 'graf', c: 'eixo-simetria', lv: 2, k: ROOT, p: 'Uma função tem raízes −2 e 8. Qual é o eixo de simetria?', o: ['x = 3', 'x = 5', 'x = −2', 'x = 6'], r: ['x = (−2 + 8)/2 = 3.'], e: { 'x = −2': ROOT, 'x = 5': SIGN } },
  { id: 'l10', t: 'prob', c: 'situacao-problema', lv: 2, k: XY, p: 'A área de um retângulo é A(x) = −x² + 14x. Qual é a área máxima?', o: ['49', '7', '14', '196'], r: ['x_v = −14/(2·(−1)) = 7 · A(7) = −49 + 98 = 49.'], e: { '7': XY } },
  { id: 'l11', t: 'prob', c: 'xv-yv', lv: 3, k: XY, p: 'H(t) = −2t² + 12t + 5. Quando ocorre a altura máxima e qual é ela?', o: ['3 s e 23', '23 s e 3', '3 s e 5', '6 s e 5'], r: ['t_v = −12/(2·(−2)) = 3 s · H(3) = −18 + 36 + 5 = 23.'], e: { '23 s e 3': XY, '3 s e 5': INC } },
  { id: 'l12', t: 'prob', c: 'situacao-problema', lv: 3, k: XY, p: 'Lucro L(x) = −x² + 20x − 64. Quantidade que maximiza e lucro máximo:', o: ['x = 10 e lucro 36', 'x = 36 e lucro 10', 'x = 10 e lucro 64', 'x = 4 e lucro 16'], r: ['x_v = −20/(2·(−1)) = 10 · L(10) = −100 + 200 − 64 = 36.'], e: { 'x = 36 e lucro 10': XY, 'x = 4 e lucro 16': ROOT } },
  { id: 's1', t: 'vert', c: 'maxmin', lv: 2, k: CONC, p: 'A função f(x) = −3x² + 12x − 7 possui:', o: ['máximo, porque a < 0', 'mínimo, porque a < 0', 'mínimo, porque b > 0', 'máximo, porque c < 0'], r: ['a = −3 → concavidade para baixo → máximo.'], e: { 'mínimo, porque a < 0': CONC, 'mínimo, porque b > 0': COEF, 'máximo, porque c < 0': COEF } },
  { id: 's4', t: 'vert', c: 'forma-canonica', lv: 2, k: CAN, p: 'Em f(x) = 2(x − 1)² + 5, o valor mínimo é:', o: ['5', '1', '2', '7'], r: ['Forma a(x − h)² + k → vértice (h, k) = (1, 5) → mínimo 5.'], e: { '1': XY, '2': COEF } },
  { id: 's6', t: 'vert', c: 'vertice-ponto', lv: 3, k: INC, p: 'Para f(x) = −2x² − 4x + 6: vértice, eixo e valor extremo.', o: ['V = (−1, 8) · eixo x = −1 · máximo 8', 'V = (1, 0) · eixo x = 1 · mínimo 0', 'V = (−1, 8) · eixo x = 8 · mínimo 8', 'V = −1 · eixo x = −1 · máximo 8'], r: ['a = −2 → máximo · x_v = −(−4)/(2·(−2)) = −1 · f(−1) = −2 + 4 + 6 = 8.'], e: { 'V = (1, 0) · eixo x = 1 · mínimo 0': SIGN, 'V = (−1, 8) · eixo x = 8 · mínimo 8': CONC, 'V = −1 · eixo x = −1 · máximo 8': INC } },
];
const DIAG = ['d1', 'v11', 'v12', 'v14', 'v13', 'd6', 'g1', 'd8'];

// Conceitos (o tutor usa: s = simples, d = definição, an = analogia, ex = exemplo, cmp = comparação, why, sum, m = erros comuns).
// src: true = do livro · false = complemento do EXPLICA AI (o tutor marca "EXPLICA AI complementa").
const CONCEPTS = [
  { id: 'parabola', t: 'par', n: 'Parábola', a: ['parabola', 'parabolas', 'curva', 'conica'], src: true,
    s: 'A parábola é a curva do gráfico da função quadrática. Aparece no jato de água e na luz da lanterna na parede.',
    d: 'Livro, p. 253: a parábola é a intersecção de uma superfície cônica ilimitada com um plano paralelo a uma de suas geratrizes.',
    an: 'Pensa no jato de um bebedouro: a água sobe, faz uma curva e desce. Essa curva é uma parábola.',
    ex: 'O jato de água lançado obliquamente e a trajetória de um projétil (Galileu) são parabólicos.', sum: 'Parábola = gráfico da função quadrática.',
    vis: { route: 'grafico', label: 'Ver uma parábola no gráfico interativo' }, visTxt: 'No gráfico interativo você muda a, b e c e vê a parábola mudar.' },
  { id: 'foco-diretriz', t: 'par', n: 'Foco e diretriz', a: ['foco', 'diretriz', 'equidistantes'], src: true,
    s: 'Cada ponto da parábola está à mesma distância do foco F e da reta diretriz d.',
    d: 'Livro, p. 254: parábola é o conjunto dos pontos do plano equidistantes de uma reta d (diretriz) e de um ponto F (foco), com F fora de d.',
    sum: 'Parábola = pontos à mesma distância de F e de d.' },
  { id: 'eixo-simetria', vis: { route: 'grafico', label: 'Ver o eixo de simetria' }, visTxt: 'O eixo de simetria é a linha tracejada: os dois lados da parábola são espelhados.', t: 'par', n: 'Eixo de simetria', a: ['eixo de simetria', 'eixo', 'simetria', 'simetrico'], src: true,
    s: 'É a reta vertical que divide a parábola em duas metades iguais. Ela passa pelo vértice: x = x_v.',
    d: 'Livro, p. 254: a reta que passa pelo foco e é perpendicular à diretriz é o eixo de simetria; a parábola tem dois ramos simétricos a ele.',
    ex: 'Em y = x² − 6x + 5 o eixo é x = 3.', why: 'Os dois lados da parábola são espelhados, por isso o ponto mais baixo (ou mais alto) fica exatamente no meio: no eixo.', sum: 'Eixo: x = x_v.' },
  { id: 'funcao-quadratica', t: 'par', n: 'Função quadrática', a: ['funcao quadratica', 'funcao do 2 grau', 'funcao do segundo grau', 'segundo grau', 'quadratica'], src: true,
    s: 'É toda função y = ax² + bx + c, com a diferente de zero.',
    d: 'Livro, p. 255: toda função do tipo y = ax² + bx + c, com a, b, c reais e a ≠ 0, é função polinomial do 2º grau ou função quadrática.',
    ex: 'Livro, p. 255: o custo da recicladora C(x) = −9x² + 1.800x.', m: [{ k: ['a', 'zero'], r: 'Se a = 0, o x² some e a função deixa de ser quadrática.' }], sum: 'y = ax² + bx + c, a ≠ 0.' },
  { id: 'coeficientes', t: 'par', n: 'Coeficientes a, b, c', a: ['coeficientes', 'coeficiente', 'a b e c', 'a b c', 'identificar a'], src: true,
    s: 'a multiplica x², b multiplica x e c é o número sozinho. O sinal vai junto.',
    d: 'Em y = ax² + bx + c: a é o coeficiente de x², b o de x e c o termo independente. Livro, p. 256: em y = −4x² + x, a = −4, b = 1 e c = 0.',
    an: 'Antes de calcular, “arrume a casa”: escreva em ordem ax² + bx + c e complete o que falta com 0.',
    ex: 'f(x) = 5 − x² + 3x → reordene: −x² + 3x + 5 → a = −1, b = 3, c = 5.', weakTip: 'Atenção ao sinal: em −6x, b = −6.', sum: 'a ↔ x² · b ↔ x · c ↔ número sozinho.' },
  { id: 'concavidade', t: 'par', n: 'Concavidade', a: ['concavidade', 'concava', 'para cima', 'para baixo', 'abre para'], src: true,
    s: 'Se a > 0 a parábola abre para cima (U). Se a < 0 abre para baixo (∩).',
    d: 'Livro, p. 257: a concavidade da parábola de y = ax² + bx + c é voltada para cima se, e somente se, a > 0; para baixo se, e somente se, a < 0.',
    an: 'a positivo = sorriso (U). a negativo = tristeza (∩).', cmp: 'U (a > 0) tem ponto mais baixo. ∩ (a < 0) tem ponto mais alto.',
    m: [{ k: ['b', 'concavidade'], r: 'Quem decide a concavidade é só o a — não o b nem o c.' }], sum: 'a > 0 → U · a < 0 → ∩.',
    vis: { route: 'grafico', label: 'Mudar o a no gráfico' }, visTxt: 'Mude o a para negativo e veja a parábola virar de cabeça para baixo.' },
  { id: 'maxmin', t: 'vert', n: 'Máximo e mínimo', a: ['maximo', 'minimo', 'maximo ou minimo', 'maximo e minimo', 'ponto maximo', 'ponto minimo', 'valor maximo', 'valor minimo', 'extremo'], src: false,
    s: 'O vértice é o ponto mais baixo (mínimo) quando a > 0, e o mais alto (máximo) quando a < 0.',
    d: 'Se a > 0, a parábola abre para cima e o vértice é ponto de mínimo. Se a < 0, abre para baixo e o vértice é ponto de máximo. Decida isso ANTES de calcular.',
    an: 'U é um vale: o vértice é o fundo (mínimo). ∩ é um morro: o vértice é o topo (máximo).',
    ex: 'g(x) = −2x² + 8x + 3: a = −2 < 0 → máximo. O máximo é 11, em x = 2.',
    cmp: 'Mínimo: a > 0, U, vértice embaixo. Máximo: a < 0, ∩, vértice em cima.',
    why: 'Com a > 0 os dois ramos sobem sem parar, então existe um ponto mais baixo e nenhum mais alto. Com a < 0 é o contrário.',
    m: [{ k: ['positivo', 'maximo'], r: 'Cuidado: a positivo dá MÍNIMO (U), não máximo.' }], weakTip: 'Desenhe na margem: U = mínimo, ∩ = máximo.',
    sum: 'a > 0 → mínimo · a < 0 → máximo.', vis: { route: 'grafico', label: 'Ver máximo e mínimo no gráfico' }, visTxt: 'No gráfico, o ponto colorido é o vértice: verde quando é mínimo, laranja quando é máximo.' },
  { id: 'vertice', t: 'vert', n: 'Vértice', a: ['vertice', 'vertice da parabola', 'ponto v', 'coordenadas do vertice'], src: true,
    rel: ['xv', 'yv', 'maxmin', 'xv-yv', 'vertice-ponto', 'forma-canonica'],
    s: 'O vértice é o ponto da parábola que fica no eixo de simetria: o mais baixo (se a > 0) ou o mais alto (se a < 0).',
    d: 'Livro, pp. 254 e 259: o vértice V é a intersecção da parábola com seu eixo de simetria e tem coordenadas V(−b/(2a), −Δ/(4a)).',
    an: 'Pensa numa pista de skate em U: o vértice é o fundo, onde o skate para de descer e começa a subir.',
    ex: 'Livro, p. 259: em y = x² − 6x + 5, x_v = 3 e y_v = −4, então V(3, −4).',
    cmp: 'x_v diz ONDE está o vértice; y_v diz QUAL é o valor nesse ponto.',
    why: 'O vértice fica no eixo de simetria, bem no meio da parábola. Por isso ele é o ponto mais baixo (ou mais alto).',
    m: [{ k: ['raiz'], r: 'Vértice não é raiz: raiz é onde y = 0; vértice é o ponto mais alto ou mais baixo.' }],
    weakTip: 'Feche sempre com V = (x_v, y_v).', sum: 'V = (−b/(2a), −Δ/(4a)).',
    vis: { route: 'grafico', label: 'Ver o vértice no gráfico interativo' }, visTxt: 'Abra o gráfico e veja o ponto V marcado no eixo de simetria (linha tracejada).' },
  { id: 'xv', vis: { route: 'grafico', label: 'Ver x_v no gráfico' }, visTxt: 'A linha tracejada do gráfico é o eixo x = x_v: o vértice sempre fica nela.', whySrc: 'material', t: 'vert', n: 'Cálculo de x_v', a: ['x v', 'xv', 'abscissa do vertice', 'menos b', 'b sobre 2a', '2a', 'formula do vertice', 'formula'], src: true,
    s: 'x_v = −b/(2a). É o x do vértice.',
    d: 'Livro, p. 259: a abscissa do vértice é x_v = −b/(2a).',
    an: 'Faça sempre em 3 passos: 1) escreva b com sinal; 2) troque o sinal (o “menos” da fórmula); 3) divida por 2a.',
    ex: 'y = x² − 6x + 5: b = −6, a = 1 → x_v = −(−6)/(2·1) = 6/2 = 3.',
    why: 'Livro, p. 259: igualando a parábola à reta y = k que toca só no vértice, sai (2ax + b)² = 0, ou seja, 2ax + b = 0. Isolando x: x = −b/(2a). O “menos” vem de passar o b para o outro lado.',
    m: [{ k: ['b', '2a', 'sem'], r: 'Não esqueça o menos: é −b/(2a), não b/(2a).' }], weakTip: 'Circule o “−” antes de substituir.', sum: 'x_v = −b/(2a).' },
  { id: 'yv', vis: { route: 'grafico', label: 'Ver y_v no gráfico' }, visTxt: 'y_v é a altura do ponto colorido do gráfico: o valor mínimo (verde) ou máximo (laranja).', whySrc: 'material', t: 'vert', n: 'Cálculo de y_v', a: ['y v', 'yv', 'ordenada do vertice', 'delta sobre 4a', '4a'], src: true,
    s: 'y_v é o valor da função no vértice: y_v = f(x_v) = −Δ/(4a).',
    d: 'Livro, p. 259: a ordenada do vértice é y_v = −Δ/(4a), com Δ = b² − 4ac.',
    an: 'Dica do complemento: o jeito mais seguro é substituir x_v na função. Depois, se quiser, confira com −Δ/(4a).',
    ex: 'y = x² − 6x + 5: y_v = f(3) = 9 − 18 + 5 = −4. Conferindo: Δ = 36 − 20 = 16 → −16/4 = −4.',
    why: 'Livro, p. 259: a reta y = k tangente no vértice deixa a equação com Δ = 0; daí k = −Δ/(4a).', sum: 'y_v = f(x_v) = −Δ/(4a).' },
  { id: 'vertice-ponto', vis: { route: 'vertice?s=s11', label: 'Ver V(3, −4) no gráfico' }, visTxt: 'Veja o ponto V(3, −4) marcado no gráfico de x² − 6x + 5.', t: 'vert', n: 'V = (x_v, y_v)', a: ['v x v y v', 'vertice completo', 'ponto do vertice'], src: true,
    s: 'O vértice é um PONTO, com duas coordenadas: V = (x_v, y_v).',
    d: 'Livro, p. 259: o vértice V da parábola y = ax² + bx + c é o ponto V(−b/(2a), −Δ/(4a)).',
    ex: 'Livro, p. 259: y = x² − 6x + 5 → V(3, −4).', m: [{ k: ['so', 'x'], r: 'Só o x não basta: o vértice tem x_v E y_v.' }], weakTip: 'Feche sempre com V = (x_v, y_v).', sum: 'V = (x_v, y_v).' },
  { id: 'xv-yv', vis: { route: 'grafico', label: 'Ver x_v e y_v no gráfico' }, visTxt: 'No gráfico, x_v é a linha tracejada vertical (onde acontece) e y_v é a altura do ponto colorido (quanto vale).', t: 'vert', n: 'x_v × y_v', a: ['x v e y v', 'xv e yv', 'x v ou y v', 'diferenca entre x v', 'quando e quanto', 'quando ou quanto'], src: false,
    s: 'x_v diz ONDE (ou QUANDO, QUANTOS) acontece o extremo. y_v diz QUAL É o valor máximo ou mínimo.',
    d: 'x_v responde “quando?”, “para qual quantidade?” ou “em que posição?”. y_v responde “qual é o maior/menor valor?”.',
    cmp: 'x_v = onde/quando (entrada). y_v = quanto (saída: o valor máximo ou mínimo). Ex.: lucro L(x) = −x² + 12x − 20 → 6 lotes (x_v) dão lucro de 16 centenas (y_v).',
    ex: 'H(t) = −2t² + 8t + 1: o instante da altura máxima é t = 2 s (x_v); a altura máxima é 9 (y_v).',
    m: [{ k: ['quando', 'y v'], r: '“Quando” pede x_v, não y_v.' }], weakTip: 'Sublinhe na pergunta: QUANDO/QUANTOS → x_v; QUAL O VALOR → y_v.', sum: 'x_v = onde · y_v = quanto.' },
  { id: 'raiz-vertice', vis: { route: 'grafico?s=s08', label: 'Ver raízes × vértice no gráfico' }, visTxt: 'No gráfico de x² − 6x + 5: os pontos brancos no eixo x são as raízes (1 e 5); o ponto colorido no fundo é o vértice (3, −4).', t: 'graf', n: 'Raízes × vértice', a: ['raiz e vertice', 'raizes e vertice', 'raiz ou vertice', 'mesma coisa'], src: false,
    s: 'Não são a mesma coisa. Raiz é onde a parábola corta o eixo x (y = 0). Vértice é o ponto mais alto ou mais baixo.',
    d: 'As raízes resolvem ax² + bx + c = 0 (Bhaskara). O vértice é V = (−b/(2a), −Δ/(4a)). Se há duas raízes, x_v fica no meio delas: x_v = (x₁ + x₂)/2.',
    cmp: 'Raízes de x² − 6x + 5: 1 e 5. Vértice: (3, −4). O 3 é a média de 1 e 5.',
    m: [{ k: ['mesma coisa'], r: 'Não! Raiz é onde y = 0. Vértice é o máximo ou mínimo. Em x² − 6x + 5: raízes 1 e 5; vértice (3, −4).' }],
    weakTip: 'Pergunte: “quero onde cruza o eixo x (raiz) ou o extremo (vértice)?”', sum: 'Raiz: y = 0 · Vértice: extremo.' },
  { id: 'raizes', vis: { route: 'grafico?s=s08', label: 'Ver as raízes no gráfico' }, visTxt: 'As raízes são os pontos brancos onde a curva corta o eixo x.', t: 'graf', n: 'Raízes e Δ', a: ['raiz', 'raizes', 'zeros', 'bhaskara', 'delta', 'discriminante', 'intersecao com o eixo x', 'corta o eixo x'], src: true,
    s: 'As raízes são onde a parábola corta o eixo x. O Δ diz quantas existem.',
    d: 'Livro, p. 258: Δ > 0 → duas raízes reais distintas; Δ = 0 → duas iguais (parábola tangente ao eixo x); Δ < 0 → nenhuma raiz real.',
    ex: 'Livro, p. 258: x² − 6x + 5 = 0 → Δ = 16 → x = (6 ± 4)/2 → 1 e 5.', sum: 'x = (−b ± √Δ)/(2a).' },
  { id: 'pontos-notaveis', t: 'graf', n: 'Pontos notáveis', a: ['pontos notaveis', 'ponto notavel', 'eixo y', 'intersecao com y', '0 c'], src: true,
    s: 'Os pontos que ajudam a desenhar: raízes, (0, c) e o vértice.',
    d: 'Livro, p. 258: intersecção com Ox nas raízes; intersecção com Oy em (0, c); e o vértice V.',
    ex: 'y = x² − 6x + 5: raízes (1, 0) e (5, 0), ponto (0, 5), vértice (3, −4).', sum: 'Raízes · (0, c) · vértice.' },
  { id: 'grafico', t: 'graf', n: 'Construção do gráfico', a: ['grafico', 'tabela', 'construir o grafico', 'construcao do grafico', 'desenhar'], src: true,
    s: 'Faça uma tabela com alguns valores de x, calcule y e ligue os pontos com uma curva.',
    d: 'Livro, pp. 256–257: o gráfico de uma função é uma parábola de eixo vertical se, e somente se, a função é quadrática; por exemplo, y = x² − 1 passa por (−3, 8), (−1, 0), (0, −1), (1, 0), (3, 8).',
    vis: { route: 'grafico', label: 'Abrir o gráfico interativo' }, visTxt: 'No gráfico interativo você vê a curva, o eixo e o vértice ao mesmo tempo.', sum: 'Tabela → pontos → curva.' },
  { id: 'esboco', vis: { route: 'grafico?s=s14', label: 'Ver o esboço completo' }, visTxt: 'Veja o esboço de x² − 4x + 3 com eixo, vértice, raízes e (0, 3).', t: 'graf', n: 'Esboço completo', a: ['esboco', 'esbocar', 'roteiro'], src: false,
    s: 'Roteiro: 1) sinal de a; 2) vértice; 3) eixo x = x_v; 4) raízes; 5) ponto (0, c); 6) o simétrico de (0, c).',
    d: 'Para esboçar com segurança: concavidade (sinal de a), vértice, eixo de simetria, raízes (se houver), (0, c) e o simétrico de (0, c) em relação ao eixo.',
    ex: 'f(x) = x² − 4x + 3: U; V(2, −1); eixo x = 2; raízes 1 e 3; (0, 3) e o simétrico (4, 3).', sum: '6 passos do esboço.' },
  { id: 'forma-canonica', t: 'vert', n: 'Forma canônica', a: ['forma canonica', 'canonica', 'x h', 'a x h'], src: false,
    s: 'Na forma a(x − h)² + k o vértice é (h, k). Cuidado com o sinal de dentro.',
    d: 'Forma canônica: f(x) = a(x − x_v)² + y_v. Em 2(x − 3)² − 5, V = (3, −5). Em −(x + 4)² + 7, como x + 4 = x − (−4), V = (−4, 7).',
    m: [{ k: ['x', 'mais'], r: 'Em (x + 4)², o x_v é −4 (o sinal troca).' }], weakTip: 'Sinal de dentro do parêntese sempre troca.', sum: 'a(x − h)² + k → V(h, k).' },
  { id: 'situacao-problema', t: 'prob', n: 'Situações-problema', a: ['problema', 'situacao problema', 'lucro', 'altura maxima', 'area maxima', 'custo', 'instante'], src: false,
    s: 'Primeiro decida: a pergunta pede QUANDO/QUANTOS (x_v) ou QUAL O VALOR (y_v)?',
    d: 'Método: 1) organize ax² + bx + c; 2) marque a, b, c com sinal; 3) a > 0 mínimo, a < 0 máximo; 4) x_v = −b/(2a); 5) y_v = f(x_v); 6) responda com frase e unidade.',
    ex: 'Lucro L(x) = −x² + 12x − 20 (centenas): 6 lotes dão o lucro máximo de 16 centenas = R$ 1.600.', sum: 'Quando → x_v · Quanto → y_v.' },
  { id: 'galileu', t: 'par', n: 'Galileu e a parábola', a: ['galileu', 'projetil', 'eppur si muove'], src: true,
    s: 'Livro, p. 255: Galileu mostrou que, sem atrito, a trajetória de um projétil lançado obliquamente é uma parábola.', sum: 'Projétil → parábola.' },
];

/* ---------------- telas ---------------- */
const V = {};
const SRC_BOOK = (pg) => `<span class="src-b source-material mat">${EA.icon('book', 14)}Do seu livro · ${pg}</span>`;
const SRC_EXTRA = `<span class="src-b source-general ext">${EA.icon('facet', 14)}EXPLICA AI complementa</span>`;
const scrollTo = () => { const s = new URLSearchParams(location.hash.split('?')[1] || '').get('s'); if (s) setTimeout(() => { const t = document.getElementById(s); t && t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); };
const sec = (id, n, title, src, body, sayTxt) => `<section class="section" id="${id}"><div class="section-h"><h2><small class="muted">${n}</small> ${title}</h2>${sayTxt ? sayBtn(sayTxt) : ''}</div><div style="margin:-4px 0 10px">${src}</div>${body}</section>`;
const card = (html, style = '') => `<div class="callout" style="display:block;${style}">${html}</div>`;
const STYLE = `<style>.qplot{width:100%;height:auto;display:block;border:1px solid var(--color-border-subtle,#E5E7EB);border-radius:14px}
.mq-steps{display:grid;gap:8px;margin:10px 0}.mq-steps li{margin-left:18px}.mq-big{font-size:20px;font-weight:700;text-align:center;margin:8px 0}
.mq-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.mq-in{width:92px;padding:10px;border-radius:12px;border:1.5px solid var(--color-border-strong,#9AA4B2);font:inherit;font-size:18px;text-align:center}
.mq-fb{margin-top:10px}.mq-err{display:grid;gap:8px}.mq-err .callout{display:block}.mq-sl{display:grid;grid-template-columns:28px 1fr 46px;gap:8px;align-items:center;margin:6px 0}
.mq-sl input{width:100%}.mq-read{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.mq-read div{background:var(--color-surface-sunken,#F3F4F6);border-radius:12px;padding:8px;text-align:center}
.mq-read b{display:block;font-size:18px}.mq-uv{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mq-uv div{border-radius:16px;padding:12px;text-align:center;border:1.5px solid}
.mq-trail{display:grid;gap:6px}.mq-trail a{display:grid;grid-template-columns:36px 1fr auto;gap:8px;align-items:center;padding:10px 12px;border-radius:14px;background:var(--color-surface-raised,#fff);border:1px solid var(--color-border-subtle,#E5E7EB);text-decoration:none;color:inherit}
.mq-trail b{font-variant-numeric:tabular-nums;color:var(--color-brand-primary,#0B5FFF)}.mq-trail small{color:var(--color-text-secondary,#6B7280)}</style>`;

V.home = (el) => {
  EA.ctx.reset({ screen: 'home', title: 'Início do caderno Função Quadrática', concept: 'vertice' });
  const m = EA.mastery(), S = ST(), errs = Object.entries(S.errtypes || {}).sort((a, b) => b[1] - a[1]);
  el.append(h(`<div>${STYLE}
    <section class="hero">
      <div class="flag"><span>1ª SÉRIE · EM</span><span>MATEMÁTICA</span></div>
      <h1>Função<em>Quadrática</em></h1>
      <p class="sub">Foco da prova: vértice, máximo e mínimo</p>
      <div class="motto"><b>📈 Veja</b><b>🧠 Entenda</b><b>✍️ Calcule</b><b>🎯 Acerte</b></div>
    </section>
    <div class="mastery"><div class="ring" style="--p:${m.all}"><div>${m.all}%</div></div>
      <p><strong>Domínio geral</strong>Cada acerto e cada treino enchem o círculo.</p></div>
    <div class="cta-grid">
      <a class="btn btn-primary" href="${R}vertice">${EA.icon('target', 20)} Começar pelo vértice</a>
      <div class="btn-row">
        <a class="btn btn-ghost" href="${R}revisao"><i>${EA.icon('review', 24)}</i>Revisão inteligente</a>
        <a class="btn btn-ghost" href="${R}simulado"><i>${EA.icon('quiz', 24)}</i>Simulado</a>
      </div>
      <a class="btn btn-dark" href="${R}treino">${EA.icon('pencilList', 20)} Treino do vértice</a>
      <a class="btn btn-brand" href="${R}plano">${EA.icon('bulb', 20)} Plano para a prova · diagnóstico</a>
    </div>
    ${card(`<p class="eyebrow">A regra que resolve a prova</p>
      <p class="mq-big">a &gt; 0 → U → <span style="color:#1F8A5B">MÍNIMO</span> &nbsp;·&nbsp; a &lt; 0 → ∩ → <span style="color:#C2410C">MÁXIMO</span></p>
      <p class="mq-big" style="font-size:17px">x_v = −b/(2a) &nbsp;→ ONDE/QUANDO &nbsp;·&nbsp; y_v = f(x_v) → QUAL VALOR</p>
      <p class="mq-big" style="font-size:17px">Sempre feche: V = (x_v, y_v)</p>`, 'margin-top:14px')}
    ${errs.length ? `<section class="section"><div class="section-h"><h2>Seus erros mais frequentes</h2><a class="muted" href="${R}treino?s=s16">ver todos</a></div>
      <div class="mq-err">${errs.slice(0, 3).map(([k, n]) => `<div class="callout" style="background:var(--color-feedback-error-bg);border-color:var(--color-feedback-error-border)"><p><b>${ERR[k].n}</b> · ${n}×<br>${ERR[k].fix}</p></div>`).join('')}</div>
      <a class="btn btn-primary" style="margin-top:10px" href="${R}revisao">${EA.icon('review', 20)} Treinar só esses erros</a></section>` : ''}
    <section class="section"><div class="section-h"><h2>Trilha</h2><span class="muted">18 passos</span></div>
      <div class="mq-trail">${SECTIONS.map(([n, t, r, s, pg]) => `<a href="${R}${r}${s ? '?s=' + s : ''}"><b>${n}</b><span>${t}<br><small>${pg === 'complemento' || pg === 'EXPLICA AI' ? pg : 'livro · ' + pg}</small></span><span class="go">${EA.icon('chevronRight', 18)}</span></a>`).join('')}</div>
    </section>
    <section class="section"><div class="section-h"><h2>Conquistas</h2></div>
      <div class="badges" tabindex="0" role="region" aria-label="Conquistas">${BADGES.map(b => `<span class="badge ${S.badges[b.id] ? 'on' : ''}">${b.t}</span>`).join('')}</div></section>
    <p class="muted center" style="margin:18px 0 6px;font-size:13px">Fonte principal: seu livro, cap. 5.1 (pp. 253–259). O que vier marcado “EXPLICA AI complementa” é explicação extra, não é texto do livro.</p>
  </div>`));
};

V.parabola = (el) => {
  EA.ctx.reset({ screen: 'parabola', title: 'Parábola e função quadrática', concept: 'parabola' });
  el.append(h(`<div>${STYLE}<p class="eyebrow">Passos 01–05</p><h1 class="screen-title">Parábola e função quadrática</h1>
    ${sec('s01', '01', 'Conheça a parábola', SRC_BOOK('p. 253'), `<p class="lead">O estudo da função do 2º grau depende de uma curva chamada <b>parábola</b>: a intersecção de uma superfície cônica com um plano paralelo a uma geratriz.</p>
      ${card('<p>💡 Onde você vê: a luz da lanterna na parede e o <b>jato de água</b> lançado para cima. Galileu mostrou que a trajetória de um projétil é parabólica (p. 255).</p>')}`, 'A parábola é a curva do gráfico da função quadrática. Exemplo: o jato de água lançado para cima.')}
    ${sec('s02', '02', 'Foco, diretriz e eixo de simetria', SRC_BOOK('p. 254'), `<p>Parábola = pontos do plano que estão à <b>mesma distância</b> de um ponto <b>F (foco)</b> e de uma reta <b>d (diretriz)</b>.</p>
      <p style="margin-top:8px">A reta que passa por F e é perpendicular a d é o <b>eixo de simetria</b>. Onde a parábola cruza o eixo fica o <b>vértice V</b>.</p>
      ${plot(1, 0, 0, { roots: false, c: false, span: 3 })}`, 'O eixo de simetria divide a parábola em duas metades iguais. O vértice fica no eixo.')}
    ${sec('s03', '03', 'Conceito de função quadrática', SRC_BOOK('p. 255'), `<p class="mq-big">y = ax² + bx + c, com a ≠ 0</p>
      ${card('<p>📘 Exemplo do livro: uma recicladora de PET tem custo <b>C(x) = −9x² + 1.800x</b>. É quadrática porque tem x² e a = −9 ≠ 0.</p>')}`, 'Função quadrática é y igual a a x ao quadrado mais b x mais c, com a diferente de zero.')}
    ${sec('s04', '04', 'Coeficientes a, b, c', SRC_BOOK('p. 256'), `<p>a multiplica x², b multiplica x, c é o número sozinho. <b>O sinal vai junto.</b></p>
      ${card(`<p>📘 y = 5x² − 3x + 8 → a = 5, b = −3, c = 8<br>📘 y = −4x² + x → a = −4, b = 1, c = 0<br>📘 g(x) = x² − √3 → a = 1, b = 0, c = −√3</p>`)}
      <div class="mq-row" style="margin-top:10px">${SRC_EXTRA}</div><p style="margin-top:6px">Dica: reescreva em ordem e complete com 0. Ex.: f(x) = 5 − x² + 3x → −x² + 3x + 5.</p>`)}
    ${sec('s05', '05', 'Concavidade', SRC_BOOK('p. 257'), `<div class="mq-uv"><div style="border-color:#1F8A5B;background:#ECFDF3"><b style="font-size:30px">U</b><br>a &gt; 0<br>para cima</div><div style="border-color:#C2410C;background:#FFF4ED"><b style="font-size:30px">∩</b><br>a &lt; 0<br>para baixo</div></div>
      <p style="margin-top:8px">Só o <b>a</b> decide. Não é o b nem o c.</p>`, 'Se a é positivo, a parábola abre para cima. Se a é negativo, abre para baixo.')}
  </div>`));
  el.append(EA.quizBlock(['par'], 4)); scrollTo();
};

V.vertice = (el) => {
  EA.ctx.reset({ screen: 'vertice', title: 'Vértice: máximo e mínimo', concept: 'vertice' });
  el.append(h(`<div>${STYLE}<p class="eyebrow">Passos 06 · 09–12 · prioridade da prova</p><h1 class="screen-title">Vértice: máximo e mínimo</h1>
    ${sec('s06', '06', 'Máximo × mínimo', SRC_EXTRA, `<div class="mq-uv"><div style="border-color:#1F8A5B;background:#ECFDF3"><b style="font-size:30px">U</b><br>a &gt; 0<br>vértice = <b>MÍNIMO</b><br><small>ponto mais baixo</small></div>
      <div style="border-color:#C2410C;background:#FFF4ED"><b style="font-size:30px">∩</b><br>a &lt; 0<br>vértice = <b>MÁXIMO</b><br><small>ponto mais alto</small></div></div>
      <p style="margin-top:8px">Decida <b>antes de calcular</b>: olhe só o sinal de a. (O livro mostra a concavidade na p. 257; o máximo/mínimo é a consequência.)</p>
      <div class="mq-row" style="margin-top:8px">${plot(1, -6, 5, { w: 300, h: 220 })}${plot(-2, 8, 3, { w: 300, h: 220 })}</div>`, 'Se a é positivo, o vértice é ponto de mínimo. Se a é negativo, o vértice é ponto de máximo.')}
    ${sec('s09', '09', 'Cálculo de x_v', SRC_BOOK('p. 259'), `<p class="mq-big">x_v = −b / (2a)</p>
      <ol class="mq-steps"><li>Escreva <b>b com sinal</b>. Em x² − 6x + 5, b = −6.</li><li>Troque o sinal (é o “menos” da fórmula): −(−6) = +6.</li><li>Divida por 2a: 6 / (2·1) = <b>3</b>.</li></ol>
      ${card('<p><b>Por que tem “menos b”?</b> 📘 Na p. 259, o livro chega em (2ax + b)² = 0, ou seja, 2ax + b = 0. Passando o b para o outro lado: 2ax = −b → <b>x = −b/(2a)</b>.</p>')}`, 'x v é igual a menos b sobre dois a. Em x ao quadrado menos seis x mais cinco, x v é três.')}
    ${sec('s10', '10', 'Cálculo de y_v', SRC_BOOK('p. 259'), `<p class="mq-big">y_v = f(x_v) = −Δ / (4a)</p>
      <p>O jeito mais seguro (complemento): <b>substitua x_v na função</b>. Depois confira com −Δ/(4a).</p>
      ${card('<p>y = x² − 6x + 5 → y_v = f(3) = 9 − 18 + 5 = <b>−4</b>.<br>📘 Conferindo como no livro: −[(−6)² − 4·1·5]/(4·1) = −16/4 = −4.</p>')}`)}
    ${sec('s11', '11', 'V = (x_v, y_v)', SRC_BOOK('p. 259'), `<p class="mq-big">V = (3, −4)</p><p>📘 “Portanto, o vértice da parábola é o ponto V(3, −4).” O vértice é um <b>ponto</b>: tem x e y. Só o 3 não é a resposta completa.</p>
      ${plot(1, -6, 5, { w: 320, h: 220 })}`, 'O vértice é um ponto. Sempre feche com x v e y v. Exemplo: V igual a três, menos quatro.')}
    ${sec('s12', '12', 'Interpretação de máximo e mínimo', SRC_EXTRA, `<div class="mq-uv"><div style="border-color:#0B5FFF;background:#EEF4FF"><b>x_v</b><br>ONDE · QUANDO · QUANTOS<br><small>o instante, a quantidade, a posição</small></div>
      <div style="border-color:#7C3AED;background:#F5F0FF"><b>y_v</b><br>QUAL É O VALOR<br><small>o lucro, a altura, o custo máximo/mínimo</small></div></div>
      ${card('<p>Exemplo com máximo: g(x) = −2x² + 8x + 3 → a &lt; 0 (máximo) · x_v = −8/(2·(−2)) = 2 · y_v = g(2) = 11 → <b>o máximo é 11, quando x = 2</b>. V = (2, 11).</p>', 'margin-top:10px')}`, 'x v responde onde ou quando. y v responde qual é o valor máximo ou mínimo.')}
  </div>`));
  el.append(EA.quizBlock(['vert'], 5)); scrollTo();
};

V.grafico = (el) => {
  EA.ctx.reset({ screen: 'grafico', title: 'Gráfico interativo da função quadrática', concept: 'vertice' });
  let a = 1, b = -6, c = 5;
  el.append(h(`<div>${STYLE}<p class="eyebrow">Passos 07 · 08 · 13 · 14</p><h1 class="screen-title">Gráfico e pontos notáveis</h1>
    ${sec('s07', '07', 'Construção do gráfico — interativo', SRC_BOOK('pp. 256–258') + ' ' + SRC_EXTRA, `<p class="lead">Mude a, b e c e veja o vértice, o eixo e as raízes. (Mesma ideia do “Simulador” citado no livro, p. 259.)</p>
      <div class="mq-plot"></div>
      <div class="mq-sl"><b>a</b><input type="range" min="-3" max="3" step="0.5" value="1" data-k="a" aria-label="coeficiente a"><output data-o="a">1</output></div>
      <div class="mq-sl"><b>b</b><input type="range" min="-10" max="10" step="1" value="-6" data-k="b" aria-label="coeficiente b"><output data-o="b">−6</output></div>
      <div class="mq-sl"><b>c</b><input type="range" min="-10" max="10" step="1" value="5" data-k="c" aria-label="coeficiente c"><output data-o="c">5</output></div>
      <div class="mq-read"></div>
      <div class="seg" role="group" aria-label="Exemplos" style="margin-top:10px"><button data-p="1,-6,5">📘 x²−6x+5</button><button data-p="1,0,-1">📘 x²−1</button><button data-p="-2,8,3">−2x²+8x+3</button></div>
      <div class="challenge" style="margin-top:12px"><div class="q"><small>Desafio</small>Monte uma parábola com <b>MÁXIMO</b> em y_v = 4</div><span class="count">🎯</span></div>`)}
    ${sec('s08', '08', 'Raízes × vértice', SRC_BOOK('p. 258'), `<p>📘 Raízes: onde a parábola corta o eixo x. Δ &gt; 0 → duas · Δ = 0 → uma (tangente) · Δ &lt; 0 → nenhuma.</p>
      ${card('<p><b>Não confunda:</b> em x² − 6x + 5 as raízes são <b>1 e 5</b>; o vértice é <b>(3, −4)</b>. O x_v = 3 fica no meio das raízes: (1 + 5)/2 = 3.</p>', 'margin-top:8px;background:var(--color-feedback-error-bg);border-color:var(--color-feedback-error-border)')}`, 'Raiz é onde a parábola corta o eixo x. Vértice é o ponto de máximo ou mínimo. Não são a mesma coisa.')}
    ${sec('s13', '13', 'Pontos notáveis', SRC_BOOK('p. 258'), `<ul class="mq-steps"><li>Interseção com o eixo x: as raízes.</li><li>Interseção com o eixo y: <b>(0, c)</b>.</li><li>O vértice <b>V</b>.</li></ul>`)}
    ${sec('s14', '14', 'Esboço completo', SRC_EXTRA, `<ol class="mq-steps"><li>Sinal de a → U ou ∩.</li><li>Vértice V = (x_v, y_v).</li><li>Eixo x = x_v.</li><li>Raízes (se houver).</li><li>Ponto (0, c).</li><li>Simétrico de (0, c) em relação ao eixo.</li></ol>
      ${card('<p>f(x) = x² − 4x + 3: U · V(2, −1) · eixo x = 2 · raízes 1 e 3 · (0, 3) e o simétrico (4, 3).</p>')}${plot(1, -4, 3, { w: 320, h: 220 })}`)}
  </div>`));
  const host = $('.mq-plot', el), read = $('.mq-read', el);
  function draw() {
    const { xv, yv, d } = vertexOf(a, b, c);
    host.innerHTML = plot(a, b, c);
    read.innerHTML = `<div>x_v<b>${fmt(xv)}</b></div><div>y_v<b>${fmt(yv)}</b></div><div>Δ<b>${fmt(d)}</b></div>`;
    EA.ctx.set({ title: `Gráfico de y = ${poly(a, b, c)} · V(${fmt(xv)}, ${fmt(yv)}) · ${a > 0 ? 'mínimo' : 'máximo'}` });
    $$('[data-o]', el).forEach(o => { o.textContent = fmt({ a, b, c }[o.dataset.o]); });
    if (a < 0 && near(yv, 4) && !ST().acts.act_graf) { fx.done(); EA.act('act_graf', '🎯 Desafio: máximo em y_v = 4!'); }
  }
  $$('input[type=range]', el).forEach(i => i.oninput = () => { let v = +i.value; if (i.dataset.k === 'a' && v === 0) v = i.value = 0.5; ({ a: () => (a = v), b: () => (b = v), c: () => (c = v) })[i.dataset.k](); draw(); });
  $$('[data-p]', el).forEach(btn => btn.onclick = () => { [a, b, c] = btn.dataset.p.split(',').map(Number); [['a', a], ['b', b], ['c', c]].forEach(([k, v]) => { $(`[data-k="${k}"]`, el).value = v; }); fx.tap(); draw(); });
  draw();
  el.append(EA.quizBlock(['graf'], 4)); scrollTo();
};

V.problemas = (el) => {
  EA.ctx.reset({ screen: 'problemas', title: 'Situações-problema', concept: 'situacao-problema' });
  el.append(h(`<div>${STYLE}<p class="eyebrow">Passo 15</p><h1 class="screen-title">Situações-problema</h1>
    ${sec('s15', '15', 'Quando × quanto', SRC_BOOK('p. 255') + ' ' + SRC_EXTRA, `${card('<p><b>Antes de calcular, sublinhe a pergunta:</b><br>QUANDO / QUANTOS / EM QUE INSTANTE → <b>x_v</b><br>QUAL O MAIOR / MENOR VALOR → <b>y_v</b></p>')}
      <ol class="mq-steps"><li>Organize: ax² + bx + c.</li><li>Marque a, b, c com sinal.</li><li>a &gt; 0 mínimo · a &lt; 0 máximo.</li><li>x_v = −b/(2a).</li><li>y_v = f(x_v).</li><li>Responda com frase e unidade.</li></ol>
      ${card('<p>📘 <b>Livro, p. 255:</b> custo C(x) = −9x² + 1.800x. a = −9 &lt; 0 → máximo. x_v = −1.800/(2·(−9)) = <b>100 toneladas</b>; C(100) = <b>R$ 90.000</b> (o cálculo do vértice é complemento do EXPLICA AI).</p>', 'margin-top:10px')}
      ${card('<p>Lucro L(x) = −x² + 12x − 20 (centenas de reais): x_v = <b>6 lotes</b>; L(6) = 16 centenas = <b>R$ 1.600</b>.</p>', 'margin-top:10px')}
      ${card('<p>Bola h(t) = −5t² + 30t + 2: <b>3 s</b> (quando) e <b>47 m</b> (altura máxima).</p>', 'margin-top:10px')}`, 'Quando ou quantos é x v. Qual o maior ou menor valor é y v.')}
  </div>`));
  el.append(EA.quizBlock(['prob'], 4)); scrollTo();
};

/* Treino do vértice: gera funções com vértice inteiro e classifica o erro (erro → micro → novo exercício → revisão → reteste). */
V.treino = (el) => {
  EA.ctx.reset({ screen: 'treino', title: 'Treino do vértice', concept: 'vertice' });
  const S = ST();
  el.append(h(`<div>${STYLE}<p class="eyebrow">Passo 16 · seus erros viram treino</p><h1 class="screen-title">Treino do vértice</h1>
    <div class="seg" role="group" aria-label="Nível"><button data-l="1" class="on">Fácil</button><button data-l="2">Médio</button><button data-l="3">Difícil</button><button data-l="c">Canônica</button><button data-l="k">a, b, c</button></div>
    <div class="mq-ex" style="margin-top:12px"></div>
    ${sec('s16', '16', 'Seus erros', `<span class="src-b source-profile">${EA.icon('user', 14)}Do seu progresso</span>`, `<div class="mq-err mq-errlist"></div>`)}
  </div>`));
  const box = $('.mq-ex', el), list = $('.mq-errlist', el);
  let level = '1', streak = { 1: 0, 2: 0, 3: 0, c: 0, k: 0 };
  const rint = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pickNZ = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function paintErrs() {
    const e = S.errtypes || {};
    list.innerHTML = Object.entries(ERR).map(([k, v]) => `<div class="callout" style="${e[k] ? 'background:var(--color-feedback-error-bg);border-color:var(--color-feedback-error-border)' : ''}"><p><b>${v.n}</b> ${e[k] ? `· ${e[k]}×` : '· ainda sem erros'}<br><small>${v.t}</small><br>${v.fix}</p></div>`).join('');
  }
  function err(code) { S.errtypes = S.errtypes || {}; S.errtypes[code] = (S.errtypes[code] || 0) + 1; EA.save(); paintErrs(); return ERR[code]; }
  function fb(ok, html) { fx[ok ? 'ok' : 'err'](); const f = $('.mq-fb', box); f.innerHTML = `<div class="remind ${ok ? 'good' : 'fix'}">${html}</div>`; }
  function done(lv) {
    streak[lv]++; const actId = { 1: 'act_tr1', 2: 'act_tr2', 3: 'act_tr3', c: 'act_canon', k: 'act_coef' }[lv];
    if (streak[lv] >= 3 && !S.acts[actId]) EA.act(actId, '🏋️ 3 acertos seguidos neste nível!');
    $('.mq-fb', box).insertAdjacentHTML('beforeend', `<button class="btn btn-dark q-next" style="margin-top:10px">Próximo →</button>`); $('.q-next', box).onclick = () => { fx.tap(); next(); };
  }
  function vertexEx(lv) {
    let a, h0, k0, ctx = null;
    if (lv === '1') { a = pickNZ([1, -1]); h0 = rint(-5, 5); k0 = rint(-9, 9); }
    else if (lv === '2') { a = pickNZ([2, -2, 3, -3, 1, -1]); h0 = rint(-4, 4); k0 = rint(-12, 12); }
    else { a = pickNZ([-1, -2, -5]); h0 = rint(2, 6); k0 = rint(10, 60); ctx = pickNZ([['L', 'O lucro (em centenas de reais) é L(x)', 'x = lotes vendidos', 'Quantos lotes dão o lucro máximo?', 'Qual é o lucro máximo?'], ['H', 'A altura de uma bola é H(t)', 't em segundos, H em metros', 'Em que instante a altura é máxima?', 'Qual é a altura máxima?']]); }
    const b = -2 * a * h0, c = a * h0 * h0 + k0, rs = rootsOf(a, b, c).filter(r => Number.isInteger(Math.round(r * 1e6) / 1e6));
    const v = ctx ? ctx[0] === 'L' ? 'x' : 't' : 'x', fname = ctx ? ctx[0] : 'f';
    box.innerHTML = `<div class="q-card"><p class="q-meta"><span>${lv === '1' ? 'Fácil' : lv === '2' ? 'Médio' : 'Difícil · problema'}</span><span>${streak[lv]} seguidos</span></p>
      <p class="q-prompt">${ctx ? `${ctx[1]} = ${poly(a, b, c, v)} (${ctx[2]}).` : `f(x) = ${poly(a, b, c)}`}</p>
      <p style="margin:8px 0 6px"><b>1.</b> O vértice é máximo ou mínimo?</p><div class="mq-row"><button class="btn btn-ghost sm" data-mm="max">Máximo (∩)</button><button class="btn btn-ghost sm" data-mm="min">Mínimo (U)</button></div>
      <p style="margin:10px 0 6px"><b>2.</b> ${ctx ? ctx[3] : 'x_v ='}</p><div class="mq-row"><input class="mq-in" data-i="x" inputmode="decimal" aria-label="x do vértice" placeholder="${v}_v"></div>
      <p style="margin:10px 0 6px"><b>3.</b> ${ctx ? ctx[4] : 'y_v ='}</p><div class="mq-row"><input class="mq-in" data-i="y" inputmode="decimal" aria-label="y do vértice" placeholder="y_v"><button class="btn btn-brand sm" data-go>Conferir</button></div>
      <div class="mq-fb"></div></div>`;
    let mm = null;
    $$('[data-mm]', box).forEach(btn => btn.onclick = () => { mm = btn.dataset.mm; $$('[data-mm]', box).forEach(x => x.classList.toggle('btn-primary', x === btn)); fx.tap(); });
    $('[data-go]', box).onclick = () => {
      const x = parse($('[data-i=x]', box).value), y = parse($('[data-i=y]', box).value), want = a > 0 ? 'min' : 'max';
      const steps = `<ul><li>a = ${fmt(a)} ${a > 0 ? '&gt; 0 → U → mínimo' : '&lt; 0 → ∩ → máximo'}</li><li>x_v = −(${fmt(b)})/(2·${fmt(a)}) = ${fmt(h0)}</li><li>y_v = ${fname}(${fmt(h0)}) = ${fmt(k0)}</li><li><b>V = (${fmt(h0)}, ${fmt(k0)})</b> → ${want === 'min' ? 'mínimo' : 'máximo'} ${fmt(k0)} em ${v} = ${fmt(h0)}</li></ul>`;
      const issues = [];
      if (mm !== want) issues.push(mm ? err('CONCAVITY_EXTREME_CONFUSION') : null);
      if (x == null || isNaN(x) || !near(x, h0)) {
        if (x != null && near(x, -h0) && h0 !== 0) issues.push(err('SIGN_ERROR_XV'));
        else if (x != null && near(x, k0)) issues.push(err('XV_YV_INTERPRETATION'));
        else if (x != null && rs.some(r => near(r, x))) issues.push(err('ROOT_VS_VERTEX_CONFUSION'));
        else issues.push({ n: 'x_v', fix: 'Use x_v = −b/(2a), com o sinal de b.' });
      }
      if (y == null) issues.push(err('VERTEX_INCOMPLETE'));
      else if (isNaN(y) || !near(y, k0)) {
        if (near(y, h0) && h0 !== k0) issues.push(err('XV_YV_INTERPRETATION'));
        else issues.push({ n: 'y_v', fix: `Substitua x_v na função: y_v = ${fname}(x_v). Cuidado com (−n)² = +n².` });
      }
      const real = issues.filter(Boolean);
      if (!real.length) { fb(true, `<div class="h">Isso! V = (${fmt(h0)}, ${fmt(k0)}) · ${want === 'min' ? 'mínimo' : 'máximo'}.</div><p><i>Como a é ${a > 0 ? 'positivo, a parábola abre para cima; portanto, o vértice é ponto de mínimo' : 'negativo, a parábola abre para baixo; portanto, o vértice é ponto de máximo'}: ${want === 'min' ? 'mínimo' : 'máximo'} ${fmt(k0)} em ${v} = ${fmt(h0)}.</i></p>${ctx ? `<p>${ctx[3]} → ${v} = ${fmt(h0)}. ${ctx[4]} → ${fmt(k0)}.</p>` : ''}`); done(lv); }
      else { fb(false, `<p class="fix-h"><span>Quase. Veja o que aconteceu:</span></p><ul>${real.map(r => `<li><b>${r.n}:</b> ${r.fix}</li>`).join('')}</ul><p class="lembre">Resolução</p>${steps}`); streak[lv] = 0; done(lv); }
    };
  }
  function canonEx() {
    const a = pickNZ([1, -1, 2, -2, 3]), h0 = pickNZ([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), k0 = rint(-9, 9);
    const inside = h0 > 0 ? `(x − ${h0})` : `(x + ${-h0})`, aa = a === 1 ? '' : a === -1 ? '−' : fmt(a);
    box.innerHTML = `<div class="q-card"><p class="q-meta"><span>Forma canônica</span><span>${streak.c} seguidos</span></p><p class="q-prompt">g(x) = ${aa}${inside}²${term(k0, '', false)}</p>
      <p style="margin:8px 0">Vértice V = (<input class="mq-in" data-i="h" inputmode="decimal" aria-label="x do vértice">, <input class="mq-in" data-i="k" inputmode="decimal" aria-label="y do vértice">)</p><button class="btn btn-brand sm" data-go>Conferir</button><div class="mq-fb"></div></div>`;
    $('[data-go]', box).onclick = () => {
      const hh = parse($('[data-i=h]', box).value), kk = parse($('[data-i=k]', box).value);
      if (near(hh, h0) && near(kk, k0)) { fb(true, `<div class="h">Isso! V = (${fmt(h0)}, ${fmt(k0)}).</div>`); return done('c'); }
      const e = near(hh, -h0) ? err('CANONICAL_FORM_SIGN_ERROR') : (hh == null || kk == null) ? err('VERTEX_INCOMPLETE') : { n: 'Vértice', fix: 'Compare com a(x − h)² + k: o vértice é (h, k).' };
      fb(false, `<ul><li><b>${e.n}:</b> ${e.fix}</li></ul><p>${inside} = (x − (${fmt(h0)})) → h = ${fmt(h0)} · k = ${fmt(k0)} → <b>V = (${fmt(h0)}, ${fmt(k0)})</b></p>`); streak.c = 0; done('c');
    };
  }
  function coefEx() {
    const a = pickNZ([1, -1, 2, -3, 5, -4]), b = pickNZ([0, 1, -1, 3, -6, 8]), c = pickNZ([0, 5, -2, 7, -9]);
    const parts = shuffle([term(a, 'x²', true).replace(/^\+/, ''), b ? term(b, 'x', true) : null, c ? term(c, '', true) : null].filter(Boolean));
    const shown = parts.map((p, i) => i === 0 ? p : (p.startsWith('−') ? ' − ' + p.slice(1) : ' + ' + p)).join('');
    box.innerHTML = `<div class="q-card"><p class="q-meta"><span>Identifique a, b, c</span><span>${streak.k} seguidos</span></p><p class="q-prompt">f(x) = ${shown}</p>
      <div class="mq-row">a = <input class="mq-in" data-i="a" inputmode="decimal" aria-label="a"> b = <input class="mq-in" data-i="b" inputmode="decimal" aria-label="b"> c = <input class="mq-in" data-i="c" inputmode="decimal" aria-label="c"></div>
      <button class="btn btn-brand sm" style="margin-top:10px" data-go>Conferir</button><div class="mq-fb"></div></div>`;
    $('[data-go]', box).onclick = () => {
      const A = parse($('[data-i=a]', box).value), B = parse($('[data-i=b]', box).value), Cc = parse($('[data-i=c]', box).value);
      if (near(A, a) && near(B, b) && near(Cc, c)) { fb(true, `<div class="h">Isso! a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}.</div>`); return done('k'); }
      const e = err('COEFFICIENT_IDENTIFICATION');
      fb(false, `<ul><li><b>${e.n}:</b> ${e.fix}</li></ul><p>Em ordem: f(x) = ${poly(a, b, c)} → <b>a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}</b></p>`); streak.k = 0; done('k');
    };
  }
  function next() { level === 'c' ? canonEx() : level === 'k' ? coefEx() : vertexEx(level); }
  $$('[data-l]', el).forEach(btn => btn.onclick = () => { level = btn.dataset.l; $$('[data-l]', el).forEach(x => x.classList.toggle('on', x === btn)); fx.tap(); next(); });
  const lq = new URLSearchParams(location.hash.split('?')[1] || '').get('l'); if (lq && streak[lq] != null) { level = lq; $$('[data-l]', el).forEach(x => x.classList.toggle('on', x.dataset.l === lq)); }
  paintErrs(); next(); scrollTo();
};

/* Plano personalizado da Lulu (complemento autoral, alinhado ao livro pp. 253–259). */
const det = (sum, body) => `<details class="map-list" style="margin-top:8px"><summary>${sum}</summary><div style="padding:10px 4px">${body}</div></details>`;
const tbl = (rows) => `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px">${rows.map((r, i) => `<tr>${r.map(c => i ? `<td style="border-top:1px solid #E5E7EB;padding:6px">${c}</td>` : `<th style="text-align:left;padding:6px">${c}</th>`).join('')}</tr>`).join('')}</table></div>`;
V.plano = (el) => {
  EA.ctx.reset({ screen: 'plano', title: 'Plano para a prova', concept: 'vertice' });
  el.append(h(`<div>${STYLE}<p class="eyebrow">Plano personalizado</p><h1 class="screen-title">Plano para a prova</h1>
    <p class="lead">Meta: reconhecer o vértice no desenho, calcular certo e explicar o que cada coordenada significa. Ordem: <b>ver → compreender → calcular → interpretar</b>.</p>
    <div style="margin:8px 0">${SRC_EXTRA}</div>
    <div class="cta-grid"><a class="btn btn-primary" href="${R}diagnostico">${EA.icon('target', 20)} Fazer o diagnóstico (8 questões, 15 min)</a></div>
    <section class="section"><div class="section-h"><h2>Se o tempo for curto, nesta ordem</h2>${sayBtn('Primeiro o sinal de a: máximo ou mínimo. Depois x v. Depois y v por substituição. Depois escreva V completo. Depois raízes versus vértice. Depois problemas. Por último, o gráfico completo.')}</div>
      <ol class="mq-steps"><li><b>Sinal de a</b>: máximo ou mínimo.</li><li>Fórmula e cálculo de <b>x_v</b>.</li><li>Substituição para <b>y_v = f(x_v)</b>.</li><li>Escrever <b>V = (x_v, y_v)</b>.</li><li>Raízes × vértice.</li><li>Interpretação de problemas.</li><li>Gráfico completo.</li></ol></section>
    <section class="section"><div class="section-h"><h2>Antes de qualquer conta: 3 perguntas</h2></div>
      ${card('<ol class="mq-steps"><li>Qual é o <b>sinal de a</b>? → abertura e máximo/mínimo.</li><li>A questão quer <b>onde/quando</b> (x_v) ou <b>qual valor</b> (y_v)?</li><li>Quer <b>raízes</b> (eixo x) ou <b>vértice</b> (extremo)?</li></ol>')}</section>
    <section class="section"><div class="section-h"><h2>Cartão de memória</h2>${sayBtn('f de x igual a a x ao quadrado mais b x mais c, com a diferente de zero. Delta igual a b ao quadrado menos quatro a c. x v igual a menos b sobre dois a. y v igual a f de x v, ou menos delta sobre quatro a.')}</div>
      ${card(`<p class="mq-big" style="font-size:17px">f(x) = ax² + bx + c, a ≠ 0 · Δ = b² − 4ac</p><p class="mq-big" style="font-size:17px">x_v = −b/(2a) · y_v = f(x_v) = −Δ/(4a)</p>
        <ul class="mq-steps"><li>a &gt; 0: U, <b>mínimo</b>, imagem y ≥ y_v.</li><li>a &lt; 0: ∩, <b>máximo</b>, imagem y ≤ y_v.</li><li>Eixo de simetria: x = x_v.</li><li>Vértice completo: V = (x_v, y_v).</li><li>Duas raízes: x_v = (x₁ + x₂)/2.</li></ul>`)}
      ${card('<p>🗣️ Frase para acompanhar cada conta: <i>“Como a é positivo, a parábola abre para cima; portanto, o vértice representa um ponto de mínimo.”</i></p>', 'margin-top:10px')}</section>
    <section class="section"><div class="section-h"><h2>Método em 6 passos — modelo</h2></div>
      ${card(`<p><b>f(x) = x² − 6x + 5</b> (o exemplo do seu livro, p. 259)</p><ol class="mq-steps"><li>Forma ax² + bx + c ✔</li><li>a = 1, b = −6, c = 5</li><li>a &gt; 0 → haverá <b>mínimo</b></li><li>x_v = −(−6)/(2·1) = 3</li><li>y_v = f(3) = 9 − 18 + 5 = −4</li><li>V = (3, −4). O valor mínimo é −4, atingido quando x = 3.</li></ol>`)}</section>
    <section class="section"><div class="section-h"><h2>Três ideias fundamentais</h2></div>
      ${card('<p><b>Raiz não é vértice.</b> Em x² − 6x + 5: raízes 1 e 5; vértice (3, −4). E x_v = (1 + 5)/2 = 3.</p>')}
      ${card('<p><b>O vértice é um ponto.</b> Abscissa x_v = 3 · ordenada y_v = −4 · vértice V = (3, −4) · valor mínimo −4. “O vértice é 3” está incompleto.</p>', 'margin-top:8px')}
      ${card('<p><b>Quem decide máximo/mínimo é o a, não o Δ.</b> a = 2 → mínimo; a = −2 → máximo. O Δ só diz quantas vezes a parábola corta o eixo x (livro, p. 258).</p>', 'margin-top:8px')}</section>
    <section class="section"><div class="section-h"><h2>Exemplos graduais</h2></div>
      ${det('Nível 1 — identificar', '<p>f(x) = −2x² + 8x + 3: a = −2. Sem conta: abre para baixo → <b>máximo</b>.</p>')}
      ${det('Nível 2 — calcular', '<p>f(x) = x² − 4x + 7: x_v = −(−4)/(2·1) = 2 · y_v = f(2) = 4 − 8 + 7 = 3 → <b>V = (2, 3)</b>, mínimo 3.</p>')}
      ${det('Nível 3 — máximo', '<p>g(x) = −x² + 10x − 21: x_v = −10/(2·(−1)) = 5 · y_v = g(5) = −25 + 50 − 21 = 4 → <b>V = (5, 4)</b>, máximo 4.</p>')}
      ${det('Nível 4 — situação-problema', '<p>h(t) = −5t² + 20t + 2: a = −5 &lt; 0 → máximo. t_v = −20/(2·(−5)) = <b>2 s</b> · h(2) = −20 + 40 + 2 = <b>22 m</b>. A bola alcança 22 m após 2 s: x_v é o tempo; y_v é a altura máxima.</p>')}</section>
    <section class="section"><div class="section-h"><h2>Sessão de 35 minutos</h2></div>
      ${tbl([['Tempo', 'O que fazer'], ['5 min', 'Relembrar as fórmulas sem consultar'], ['10 min', 'Rever um exemplo resolvido'], ['15 min', 'Resolver 4 a 6 questões'], ['5 min', 'Registrar erros e explicar uma questão em voz alta']])}</section>
    <section class="section"><div class="section-h"><h2>Plano de 7 dias</h2></div>
      ${tbl([['Dia', 'Foco', 'Tarefa'], ['1', 'Diagnóstico', '<a href="' + R + 'diagnostico">8 questões sem consulta</a>'], ['2', 'Imagem e concavidade', '<a href="' + R + 'grafico">Classificar parábolas e marcar o vértice</a>'], ['3', 'Fórmula de x_v', '<a href="' + R + 'treino">Treino fácil</a>'], ['4', 'Vértice completo', '<a href="' + R + 'treino">Treino médio</a>'], ['5', 'Raízes × vértice', '<a href="' + R + 'grafico?s=s08">Raízes, simetria, interseções</a>'], ['6', 'Problemas', '<a href="' + R + 'problemas">Altura, área, lucro, custo</a>'], ['7', 'Simulado', '<a href="' + R + 'simulado">Simulado</a> + caderno de erros']])}
      <p class="muted" style="margin-top:6px">Prova amanhã? Faça hoje: diagnóstico → vértice → treino → revisão dos erros → simulado.</p></section>
    <section class="section"><div class="section-h"><h2>Lista progressiva (com respostas)</h2></div>
      ${det('Bloco A — identificação', '<ol class="mq-steps"><li>f(x) = 4x² − 3x + 1</li><li>g(x) = −x² + 7</li><li>h(x) = 3x − 2x² + 5 (reorganize)</li></ol>' + det('Respostas', '<p>1) a = 4, b = −3, c = 1, mínimo · 2) a = −1, b = 0, c = 7, máximo · 3) −2x² + 3x + 5: a = −2, b = 3, c = 5</p>'))}
      ${det('Bloco B — vértice', '<ol class="mq-steps" start="4"><li>Vértice de f(x) = x² − 8x + 12</li><li>Vértice de g(x) = −x² + 4x + 5</li><li>Vértice de h(x) = 2x² + 12x + 10</li><li>Valor máximo de p(x) = −2x² − 8x + 1</li><li>Valor mínimo de q(x) = 3x² − 6x + 4</li></ol>' + det('Respostas', '<p>4) (4, −4) · 5) (2, 9) · 6) (−3, −8) · 7) 9 · 8) 1</p>'))}
      ${det('Bloco C — interpretação', '<ol class="mq-steps" start="9"><li>Raízes −2 e 8: eixo de simetria?</li><li>A(x) = −x² + 14x: área máxima?</li><li>H(t) = −2t² + 12t + 5: quando e qual a altura máxima?</li><li>L(x) = −x² + 20x − 64: quantidade e lucro máximo?</li></ol>' + det('Respostas', '<p>9) x = 3 · 10) 49 · 11) 3 s e 23 · 12) x = 10 e lucro 36</p>'))}
      <a class="btn btn-ghost" style="margin-top:10px" href="${R}revisao">${EA.icon('quiz', 20)} Fazer a lista como quiz</a></section>
    <section class="section"><div class="section-h"><h2>Simulado discursivo (com gabarito)</h2></div>
      ${det('6. f(x) = −2x² − 4x + 6: vértice, eixo e valor extremo', '<p>V = (−1, 8) · eixo x = −1 · máximo 8 (a = −2 &lt; 0).</p>')}
      ${det('7. h(t) = −5t² + 30t + 2: instante e altura máxima', '<p>3 s e 47 m. É máximo porque a = −5 &lt; 0.</p>')}
      ${det('8. A(x) = x(20 − x): dimensões e área máxima', '<p>A(x) = −x² + 20x · x_v = 10 → 10 m por 10 m · área máxima 100 m².</p>')}
      <p class="muted" style="margin-top:6px">Questões autorais de treino — não são da prova real.</p></section>
    <section class="section"><div class="section-h"><h2>Caderno de erros</h2></div>
      ${tbl([['Tipo', 'Exemplo'], ['Conceito', 'Confundiu raiz, vértice, máximo ou mínimo'], ['Sinal', 'Perdeu o sinal de a ou de b'], ['Operação', 'Errou potência, multiplicação ou substituição'], ['Interpretação', 'Calculou x_v, mas pediam y_v'], ['Comunicação', 'Achou o resultado, mas sem unidade ou conclusão']])}
      <p style="margin-top:6px">Para cada erro: <b>questão · tipo de erro · resolução correta · regra para não repetir</b>. O EXPLICA AI já registra seus erros no <a href="${R}treino?s=s16">Treino</a>.</p></section>
    <section class="section"><div class="section-h"><h2>Para quem ajuda: perguntas sem dar a resposta</h2></div>
      ${card('<ul class="mq-steps"><li>“Qual é o valor de a?”</li><li>“Esse desenho é U ou ∩?”</li><li>“Então o vértice é máximo ou mínimo?”</li><li>“A questão perguntou quando acontece ou qual é o valor?”</li><li>“Você já tem x_v; o vértice está completo?”</li><li>“Esse resultado combina com a abertura do gráfico?”</li></ul><p class="muted">Se errar: peça para desenhar uma parábola aproximada e comparar.</p>')}</section>
    <section class="section"><div class="section-h"><h2>Pronta para a prova quando…</h2></div>
      <ul class="mq-steps"><li>Identifica a, b, c sem perder sinais.</li><li>Diz máximo ou mínimo antes de calcular.</li><li>Calcula x_v e y_v sem consulta.</li><li>Distingue raízes, intercepto em y e vértice.</li><li>Interpreta x_v e y_v num problema.</li><li>Esboça concavidade, eixo e vértice.</li><li>Faz pelo menos 80% no simulado e corrige sozinha os erros.</li></ul></section>
  </div>`));
};
V.diagnostico = (el) => {
  EA.ctx.reset({ screen: 'diagnostico', title: 'Diagnóstico', concept: null, exam: true });
  el.append(h(`<div><p class="eyebrow">Diagnóstico · 15 minutos · sem consulta</p><h1 class="screen-title">Onde você está?</h1>
    <p class="lead">8 questões. No final, o EXPLICA diz o que priorizar.</p><div class="quiz"></div><div class="mq-diag"></div></div>`));
  EA.Quiz($('.quiz', el), DIAG.map(id => Q.find(q => q.id === id)), { mode: 'exam', onDone: (ok) => {
    const msg = ok <= 3 ? ['0–3 acertos', 'Revise sinais, substituição e identificação de a, b, c.', 'treino?l=k', 'Treinar a, b, c']
      : ok <= 6 ? ['4–6 acertos', 'Trabalhe principalmente a diferença entre x_v, y_v e raízes.', 'vertice?s=s12', 'Ver x_v × y_v']
      : ['7–8 acertos', 'Avance para interpretação de problemas e prova cronometrada.', 'simulado', 'Fazer o simulado'];
    $('.mq-diag', el).innerHTML = `<div class="callout" style="display:block;margin-top:12px"><p><b>${msg[0]}:</b> ${msg[1]}</p><a class="btn btn-primary" style="margin-top:8px" href="${R}${msg[2]}">${msg[3]} →</a></div>`;
  } });
};

/* 17 · Revisão inteligente: primeiro o que errou, depois os tipos de erro mais frequentes, depois o resto. */
V.revisao = (el) => {
  EA.ctx.reset({ screen: 'revisao', title: 'Revisão inteligente', concept: 'vertice' });
  const S = ST(), top = Object.entries(S.errtypes || {}).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const due = Q.filter(q => S.wrong[q.id]).sort((a, b) => S.wrong[a.id] - S.wrong[b.id]);
  const byErr = top.flatMap(k => shuffle(Q.filter(q => q.k === k && !S.wrong[q.id] && !S.correct[q.id])).slice(0, 3));
  const rest = shuffle(Q.filter(q => q.t === 'vert' && !S.wrong[q.id])).concat(shuffle(Q.filter(q => !S.wrong[q.id])));
  const seen = new Set(), qs = due.concat(byErr, rest).filter(q => !seen.has(q.id) && seen.add(q.id)).slice(0, Math.max(8, Math.min(due.length + byErr.length, 12)));
  el.append(h(`<div><p class="eyebrow">17 · Revisão inteligente</p><h1 class="screen-title">${due.length || top.length ? 'Primeiro, o que você errou' : 'Treino focado no vértice'}</h1>
    <p class="lead">${top.length ? `Seus erros mais frequentes: ${top.slice(0, 3).map(k => ERR[k].n).join(' · ')}.` : 'Começa pelo vértice, que é o foco da prova.'}</p><div class="quiz"></div></div>`));
  EA.Quiz($('.quiz', el), qs, { label: 'Revisão' });
};
/* 18 · Simulado: 10 questões, mais peso no vértice. Questões autorais (não são da prova real). */
V.simulado = (el) => {
  EA.ctx.reset({ screen: 'simulado', title: 'Simulado', concept: null, exam: true });
  const pick = [...shuffle(Q.filter(q => q.t === 'vert')).slice(0, 5), ...shuffle(Q.filter(q => q.t === 'graf')).slice(0, 2), ...shuffle(Q.filter(q => q.t === 'prob')).slice(0, 2), ...shuffle(Q.filter(q => q.t === 'par')).slice(0, 1)];
  el.append(h(`<div><p class="eyebrow">18 · Simulado</p><h1 class="screen-title">Prova de 10 questões</h1>
    <p class="lead">Sem dicas. No final você vê a nota e revisa só o que errou. <small class="muted">Questões de treino, não são da prova real.</small></p><div class="quiz"></div></div>`));
  EA.Quiz($('.quiz', el), shuffle(pick), { mode: 'exam' });
};

EA.registerPack({
  id: ID, version: 1, status: 'active',
  owner_profile_ids: ['lulu'],
  icon: '📈', subject: 'Matemática', title: 'Função Quadrática', subtitle: 'Vértice · máximo · mínimo',
  education_level: '1ª série do Ensino Médio', goal: 'Prova escolar', exam_name: 'Prova de Matemática', exam_date: null,
  color: 'var(--learn-region-co)', cover: '../img/mat-parabola.svg', focus: 'vertice',
  sources: [
    { type: 'image', name: 'Livro didático — cap. 5.1 Função quadrática, pp. 253–259 (fotos do responsável)', primary: true },
    { type: 'notes', name: 'Relatório pedagógico: método do vértice, erros prováveis, simulados autorais', supplemental: true },
  ],
  common_mistakes: ['x_v = b/(2a) sem o sinal de menos', 'trocar a e b', 'a > 0 dá máximo', 'achar só x_v', 'responder y_v quando pedem quando', 'raiz é o vértice', 'sinal da forma canônica'],
  error_types: ERR,
  tutor_context: 'Caderno de Matemática (1ª série do EM) sobre função quadrática, com prioridade no vértice da parábola: concavidade (a > 0 mínimo, a < 0 máximo), x_v = −b/(2a), y_v = −Δ/(4a) = f(x_v), V = (x_v, y_v) e interpretação de x_v (quando/onde) × y_v (qual valor).',
  topics: TOPICS, badges: BADGES, questions: Q, concepts: CONCEPTS,
  tabs: [['home', 'book', 'Caderno'], ['parabola', 'waves', 'Parábola'], ['vertice', 'target', 'Vértice'], ['grafico', 'compass', 'Gráfico'], ['problemas', 'bulb', 'Problemas'], ['treino', 'pencilList', 'Treino']],
  screens: V,
});
})();
