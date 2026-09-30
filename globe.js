/* EXPLICA AI — Globo de conhecimento (fundo da página inicial)
   Canvas procedural: esfera de pontos com continentes, rede de conexões, arcos de interface e luz de borda.
   Cores só por tokens (lidas do CSS). Pausa fora da tela / aba oculta. prefers-reduced-motion → quadro estático. */
(() => {
'use strict';
const D2R = Math.PI / 180;
// continentes aproximados (lon, lat, raioLon, raioLat)
const LAND = [
  [-60, -14, 17, 27], [-73, 4, 8, 9], [-68, -40, 7, 13],               // América do Sul
  [-102, 46, 30, 17], [-88, 22, 9, 9], [-150, 63, 14, 8], [-42, 72, 11, 7], // América do Norte + Groenlândia
  [20, 8, 19, 20], [26, -18, 13, 16], [45, 8, 6, 6],                  // África
  [14, 50, 16, 8], [-3, 40, 5, 4],                                    // Europa
  [90, 50, 46, 17], [78, 21, 8, 10], [105, 12, 9, 9], [120, 30, 10, 12], [138, 37, 3, 6], // Ásia
  [134, -25, 17, 10], [172, -42, 3, 5],                               // Oceania
];
const hash = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };
function isLand(lon, lat) {
  for (const [cx, cy, rx, ry] of LAND) {
    const dx = (lon - cx) / rx, dy = (lat - cy) / ry, n = 0.82 + hash(Math.round(lon / 6), Math.round(lat / 6)) * 0.36;
    if (dx * dx + dy * dy < n) return true;
  }
  return false;
}
// malha de pontos (espaçamento constante na superfície)
const DOTS = [];
for (let lat = -84; lat <= 84; lat += 2.6) {
  const step = 2.6 / Math.max(0.18, Math.cos(lat * D2R));
  for (let lon = -180; lon < 180; lon += step) DOTS.push([lon, lat, isLand(lon, lat) ? 1 : 0]);
}
// nós da rede (cidades-conhecimento); o do Rio é o ponto da marca
const NODES = [[-43, -23, 2], [-47, -15, 1], [-60, -3, 0], [-38, -8, 0], [-58, -34, 0], [-77, -12, 0], [-74, 4, 1], [-99, 19, 0], [-74, 40, 1], [-118, 34, 0],
  [-79, 43, 0], [-0, 51, 1], [2, 48, 0], [13, 52, 0], [-9, 38, 0], [31, 30, 0], [3, 6, 0], [28, -26, 1], [37, -1, 0], [55, 25, 0], [77, 28, 1], [104, 1, 0],
  [116, 40, 0], [139, 35, 1], [151, -34, 0], [-70, -33, 0], [-35, -6, 0], [-51, -30, 0]];
const EDGES = [];
NODES.forEach((a, i) => {
  const d = NODES.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1])]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]);
  for (const [j] of d.slice(0, 2)) if (!EDGES.some(([p, q]) => (p === j && q === i))) EDGES.push([i, j]);
});

EA.globe = function (canvas) {
  if (!canvas || canvas._globe) return; canvas._globe = true;
  const ctx = canvas.getContext('2d'), host = canvas.parentElement;
  const css = getComputedStyle(document.documentElement), v = (n, f) => css.getPropertyValue(n).trim() || f;
  const C = { white: v('--color-text-inverse', '#fff'), gold: v('--color-brand-accent', '#FFC436'), blue: v('--blue-600', '#2463C4'), blueLt: v('--blue-100', '#E6EFFC'), navy: v('--color-background-inverse', '#071B33') };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, raf = 0, visible = true, t0 = performance.now();
  function size() {
    const r = host.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(performance.now());
  }
  function draw(now) {
    const t = (now - t0) / 1000, R = Math.min(W * 0.74, H * 0.62), cx = W * 0.30, cy = H * 0.50;
    const lon0 = -105 + (reduce ? 0 : t * 3.2), lat0 = -8 * D2R, sl = Math.sin(lat0), cl = Math.cos(lat0);
    const proj = (lon, lat) => { const l = (lon - lon0) * D2R, p = lat * D2R, x = Math.cos(p) * Math.sin(l), y = cl * Math.sin(p) - sl * Math.cos(p) * Math.cos(l), z = sl * Math.sin(p) + cl * Math.cos(p) * Math.cos(l); return [cx + R * x, cy - R * y, z]; };
    ctx.clearRect(0, 0, W, H);
    // corpo da esfera (sombra do lado noturno para dar volume)
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    const body = ctx.createRadialGradient(cx + R * .35, cy - R * .4, R * .1, cx, cy, R);
    body.addColorStop(0, 'rgba(36,99,196,.20)'); body.addColorStop(.7, 'rgba(7,27,51,.0)'); body.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = body; ctx.fill(); ctx.restore();
    // pontos
    for (const [lon, lat, land] of DOTS) {
      const [x, y, z] = proj(lon, lat); if (z <= 0.02) continue;
      if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
      const a = land ? 0.38 + z * 0.6 : 0.07 + z * 0.1, s = land ? 1.3 + z * 1.1 : 0.9;
      ctx.globalAlpha = a; ctx.fillStyle = C.white; ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    // rede
    const P = NODES.map(([lon, lat]) => proj(lon, lat));
    ctx.lineWidth = 0.8;
    for (const [i, j] of EDGES) {
      const a = P[i], b = P[j]; if (a[2] <= 0.05 || b[2] <= 0.05) continue;
      ctx.globalAlpha = Math.min(a[2], b[2]) * 0.55; ctx.strokeStyle = C.white; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    NODES.forEach(([, , k], i) => {
      const [x, y, z] = P[i]; if (z <= 0.05) return;
      const r = k === 2 ? 4.2 : k === 1 ? 2.8 : 2;
      ctx.globalAlpha = 0.35 + z * 0.65; ctx.fillStyle = k ? C.gold : C.white; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      if (k === 2) { // pulso no ponto da marca
        const ph = reduce ? 0.5 : (t % 2.4) / 2.4; ctx.globalAlpha = (1 - ph) * 0.7 * z; ctx.strokeStyle = C.gold; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, r + 3 + ph * 14, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 0.8;
      }
    });
    // arcos de interface (HUD) em volta de 2 nós
    [[0, 16, 0], [23, 13, 1]].forEach(([n, rr, gold], q) => {
      const [x, y, z] = P[n]; if (z <= 0.2) return; const rot = (reduce ? 0 : t * (q ? -0.35 : 0.25));
      ctx.globalAlpha = 0.5 * z; ctx.lineWidth = 1.4;
      ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, rr + 8, rot, rot + 1.1); ctx.stroke();
      ctx.strokeStyle = C.white; ctx.globalAlpha = 0.3 * z; ctx.beginPath(); ctx.arc(x, y, rr + 14, rot + 2.2, rot + 3.9); ctx.stroke();
      ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x, y, rr + 20, -rot + 4.3, -rot + 5.6); ctx.stroke();
    });
    // luz de borda (nascer do sol no horizonte do globo)
    ctx.globalAlpha = 1;
    const lx = cx + R * Math.cos(-0.62), ly = cy + R * Math.sin(-0.62);
    const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 0.75);
    glow.addColorStop(0, 'rgba(230,239,252,.75)'); glow.addColorStop(.1, 'rgba(36,99,196,.5)'); glow.addColorStop(.45, 'rgba(36,99,196,.12)'); glow.addColorStop(1, 'rgba(36,99,196,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, -1.45, 0.25); ctx.strokeStyle = C.blueLt; ctx.globalAlpha = .7; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
    ctx.globalAlpha = 1;
  }
  function loop(now) { draw(now); raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0; }
  const start = () => { if (!reduce && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop); };
  new ResizeObserver(size).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(host);
  document.addEventListener('visibilitychange', start);
  size(); start();
};
})();
