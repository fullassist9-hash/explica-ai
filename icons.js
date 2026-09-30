/* EXPLICA AI — Iconografia v1
   Grade 24 · traço 1.75 · pontas e junções arredondadas · sem preenchimento (exceto marcas de estado).
   Legível em 20–24 px. Emojis ficam restritos a conteúdo didático (ganchos de memória). */
(() => {
const P = {
  home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  map: '<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2z"/><path d="M9 4v14M15 6v14"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19 13 11"/>',
  field: '<path d="M3 19h18"/><path d="M6 19v-5m0 0c-1.5 0-2.5-1-2.5-2.5C5 11.5 6 12.5 6 14zm0 0c1.5 0 2.5-1 2.5-2.5C7 11.5 6 12.5 6 14zM12 19v-8m0 0c-1.8 0-3-1.2-3-3 1.8 0 3 1.2 3 3zm0 0c1.8 0 3-1.2 3-3-1.8 0-3 1.2-3 3zM18 19v-5m0 0c-1.5 0-2.5-1-2.5-2.5 1.5 0 2.5 1 2.5 2.5zm0 0c1.5 0 2.5-1 2.5-2.5-1.5 0-2.5 1-2.5 2.5z"/>',
  waves: '<path d="M3 9c2 0 2-1.5 4.5-1.5S9.5 9 12 9s2.5-1.5 4.5-1.5S19 9 21 9M3 14c2 0 2-1.5 4.5-1.5S9.5 14 12 14s2.5-1.5 4.5-1.5S19 14 21 14M3 19c2 0 2-1.5 4.5-1.5S9.5 19 12 19s2.5-1.5 4.5-1.5S19 19 21 19"/>',
  soundOn: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  soundOff: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5m0-5-5 5"/>',
  chevronDown: '<path d="m7 10 5 5 5-5"/>',
  chevronRight: '<path d="m10 7 5 5-5 5"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  review: '<path d="M4.5 12a7.5 7.5 0 1 1 2.2 5.3"/><path d="M4 7.5v4.5h4.5"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".9" fill="currentColor"/>',
  book: '<path d="M4 5.5C6.5 4.5 9.5 4.7 12 6.5v13c-2.5-1.8-5.5-2-8-1z"/><path d="M20 5.5c-2.5-1-5.5-.8-8 1v13c2.5-1.8 5.5-2 8-1z"/>',
  facet: '<path d="M12 3.5 14 10l6.5 2-6.5 2-2 6.5-2-6.5-6.5-2L10 10z"/>',
  send: '<path d="M12 19V5m0 0-6 6m6-6 6 6"/>',
  close: '<path d="M6.5 6.5l11 11m0-11-11 11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  alert: '<path d="M12 4 21 19.5H3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  ear: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 3.5-3 6.5a3 3 0 0 1-5.5 1.6"/><path d="M10 9.5a2 2 0 0 1 4 0"/>',
  link2: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  bulb: '<path d="M9 17.5h6M10 20.5h4"/><path d="M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z"/>',
  edit: '<path d="M4.5 19.5 5.5 15 15.5 5a2.1 2.1 0 0 1 3 3L8.5 18z"/><path d="m13.5 7 3 3"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  file: '<path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z"/><path d="M14 3.5V8h4"/>',
  camera: '<path d="M4 8h3.5l1.5-2.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
  text: '<path d="M5 6h14M5 10.5h14M5 15h9M5 19.5h6"/>',
  slides: '<rect x="3.5" y="5" width="17" height="11.5" rx="1.5"/><path d="M12 16.5V20M8.5 20h7"/>',
  layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
  compare: '<path d="M12 3.5v17"/><rect x="3.5" y="6.5" width="6" height="11" rx="1.5"/><rect x="14.5" y="6.5" width="6" height="11" rx="1.5"/>',
  summary: '<path d="M5 6.5h14M5 12h10M5 17.5h6"/>',
  quiz: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4"/><circle cx="12" cy="16.6" r=".6" fill="currentColor"/>',
  pencilList: '<path d="M4 6.5h9M4 11.5h7M4 16.5h5"/><path d="m13 19 .6-2.6 5.2-5.2a1.4 1.4 0 0 1 2 2L15.6 18.4z"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17.5 5-4.5 4 3.5 2.5-2 4.5 3.5"/>',
  simpler: '<path d="M4 7c3 0 3 5 8 5M4 17c3 0 3-5 8-5h8"/><path d="m17 9 3 3-3 3"/>',
  swap: '<path d="M7 7.5h11m0 0-3-3m3 3-3 3M17 16.5H6m0 0 3-3m-3 3 3 3"/>',
  example: '<path d="M12 3.5 14.5 9l6 .6-4.5 4 1.3 5.9L12 16.5l-5.3 3 1.3-5.9-4.5-4 6-.6z"/>',
  flame: '<path d="M12 20.5c-3.6 0-6-2.5-6-5.8 0-3.6 3-5.2 3.5-9.2 2.3 1.5 3.5 3.5 3.5 5.5.8-.4 1.5-1.3 1.8-2.5C16.9 10.3 18 12.3 18 14.7c0 3.3-2.4 5.8-6 5.8z"/>',
  trophy: '<path d="M8 4.5h8v5a4 4 0 0 1-8 0z"/><path d="M8 6.5H5v1.5a3 3 0 0 0 3 3M16 6.5h3v1.5a3 3 0 0 1-3 3M12 13.5V17M8.5 20h7M9.5 17h5v3h-5z"/>',
};
EA.icon = (name, size = 22, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || ''}</svg>`;
EA.ICONS = Object.keys(P);

/* Marca oficial EXPLICA AI — Brand Master v1.0 (handoff/02-symbol-master). Geometria única; só a cor muda. O CORTE (x 276→292) é inviolável.
   mode: 'pos' (fundo claro: forma navy) · 'neg' (fundo navy: forma branca) · 'mono' (currentColor) · 'app' (container navy + negativo) */
const SYM = '<path d="M234.2 238 L368.2 328.5 A38 38 0 0 1 368.2 391.5 L292 442.9 L292 368.7 L191.8 301 A38 38 0 0 1 234.2 238 Z"/><path d="M262.7 371 L276 380 L276 453.7 L234.2 482 A38 38 0 0 1 191.8 419 Z"/>';
EA.MARK = (s = 28, mode = 'pos') => {
  const shape = { pos: 'var(--color-brand-primary)', neg: 'var(--color-on-brand)', mono: 'currentColor', app: 'var(--color-on-brand)' }[mode] || 'var(--color-brand-primary)';
  const dot = mode === 'mono' ? 'currentColor' : 'var(--ea-symbol-accent, var(--color-brand-accent))';
  const g = `<g style="fill:${shape}">${SYM}</g><circle cx="173" cy="360" r="48" style="fill:${dot}"/>`;
  if (mode === 'app') return `<svg class="ea-mark" viewBox="0 0 1024 1024" width="${s}" height="${s}" aria-hidden="true" focusable="false"><rect width="1024" height="1024" rx="230" style="fill:var(--color-brand-primary)"/><g transform="translate(512 512) scale(2.35) translate(-257 -360)">${g}</g></svg>`;
  return `<svg class="ea-mark" viewBox="115 220 280 280" width="${s}" height="${s}" aria-hidden="true" focusable="false">${g}</svg>`;
};
})();
