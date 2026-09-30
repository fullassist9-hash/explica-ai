/* EXPLICA AI — Tutor contextual (motor local, sem IA generativa externa)
   Recebe: perfil ativo → persona adaptativa · caderno ativo → conceitos e fontes · tela → conceito visível
           erros recentes → pontos fracos · histórico → não repetir a mesma explicação.
   A interface de provedor (EA.Tutor.provider) permite trocar este motor por um LLM real no futuro. */
(() => {
'use strict';
const { norm, esc } = EA;
const EMO = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u200d\uFE0F]/gu;

const INTENTS = [
  ['mediaEmotion', /\b(triste|feliz|nervoso|ansioso|com medo|chateado)\b.*\b(video|foto|post)\b|\b(video|foto|post)\b.*\b(triste|feliz|nervoso|ansioso|medo|chateado)\b/],
  ['aboutMe', /\b(o que (voce|vc) (sabe|lembra|conhece)( me dizer)? (sobre|de) mim|o que (voce|vc) sabe de mim|me conhece|fala (sobre|de) mim)\b/],
  ['nav',     /\b(volta|voltar|abre|abrir|ir) (pra|para|pro|ao|a|o)\b.*\b(geografia|historia|matematica|ciencias|portugues|ingles|caderno)\b/],
  ['private', /\b(qual|que)\b.*\b(meu time|minha geracao|minha nota|minhas notas|materia (favorita|preferida)|meu clube)\b|\b(proxima prova|minha prova|ja caiu numa prova|boletim)\b|\b(clube|time)\b.*\b(jogava|joguei|jogo)\b/],
  ['noFootball', /\bsem futebol\b|\bnao (use|usa|quero) futebol\b/],
  ['meta',    /\b(qual (e a |e o )?(materia|assunto|caderno|conteudo)|que (materia|assunto|caderno)|o que (eu )?(estou|to|tou) estudando|estou estudando o que)\b/],
  ['whoami',  /\b(quem (sou|e) eu|meu perfil|pra quem voce)\b/],
  ['speak',   /\b(fala|fale|falar|le pra mim|leia|ler|ouvir|em voz alta|narra|narre)\b/],
  ['test',    /\b(me test|teste|testa|quiz|me pergunt|pergunta pra mim|me faz uma pergunta)/],
  ['exer',    /\b(exercicio|exercicios|atividade|atividades|treinar|treino)\b/],
  ['easier',  /\b(mais facil|mais simples|nao entendi|nao entendo|complicado|dificil|explica melhor|simplifica)/],
  ['other',   /\b(outra forma|outro jeito|de outra maneira|outra maneira|explica diferente)\b/],
  ['example', /\b(exemplo|exemplos)\b/],
  ['compare', /\b(compar|diferenca|diferente de|versus|vs)\b/],
  ['visual',  /\b(mostr|visual|imagem|foto|figura|mapa|desenho|ver)\b/],
  ['summary', /\b(resum|resumo|em poucas palavras)/],
  ['why',     /\b(por que|porque|pq|por qual motivo|como acontece|qual a causa)\b/],
];
const PRONOUN = /\b(isso|isto|aquilo|ele|ela|esse|essa|este|esta|dele|dela|disso)\b/;
const LABEL = { easier: 'Explique mais fácil', other: 'Explique de outra forma', example: 'Dê um exemplo', compare: 'Faça uma comparação', visual: 'Mostre visualmente', summary: 'Resuma', test: 'Me teste', exer: 'Crie exercícios' };
EA.TUTOR_CHIPS = Object.entries(LABEL);

/* Modo local (offline) — limitação TÉCNICA do modo, nunca fronteira da inteligência do EXPLICA AI.
   O Caderno é contexto, não limite: pergunta de outro assunto recebe aviso honesto de modo local (Cognitive Core §30). */
const OFFLINE_KIND = [
  ['sport', /\b(futebol|futsal|campeonato|gol|gols|jogador|jogadores|time|clube|libertadores|brasileirao|copa|champions|partida|escalacao)\b/],
  ['fresh', /\b(hoje|ontem|agora|placar|noticia|resultado|ultim[oa]s?|tabela|classificacao)\b/],
  ['game', /\b(game|games|fifa|minecraft|fortnite|roblox|videogame)\b/],
];
const OFFLINE_TEXT = {
  personal: 'Neste modo, a sua memória pessoal não está disponível, então não vou chutar nada sobre você. Quando você entrar com a sua conta, eu consigo lembrar do que já foi registrado.',
  sport: 'Adoro esse assunto, mas agora estou no modo local e não consigo conversar sobre futebol com segurança. Quando a conexão voltar, a gente conversa.',
  fresh: 'Isso precisa de informação atualizada, e no modo local eu não consigo checar notícias ou resultados. Quando a conexão voltar, eu confiro para você.',
  game: 'Agora estou no modo local e não consigo conversar sobre games com segurança. Quando a conexão voltar, a gente conversa.',
  general: 'Agora estou no modo local, sem a parte da minha inteligência que responde sobre qualquer assunto. Assim que a conexão voltar, eu te respondo isso direitinho.',
};
function offlineAnswer(t, pack) {
  const kind = (OFFLINE_KIND.find(([, re]) => re.test(t)) || ['general'])[0];
  const sug = pack ? pack.concepts.filter(x => x.src).slice(0, 4).map(x => x.n) : [];
  return { text: OFFLINE_TEXT[kind] + (sug.length ? ` Enquanto isso, posso explicar o seu Caderno ${pack.title}: ${sug.join(', ')}.` : ''), src: 'offline' };
}

function findConcept(pack, text) {
  const t = ' ' + norm(text) + ' ';
  let best = null, len = 0;
  for (const c of pack.concepts) for (const a of [c.n, ...(c.a || [])]) {
    const k = ' ' + norm(a) + ' ';
    if (t.includes(k) && k.length > len) { best = c; len = k.length; }
  }
  return best;
}
const byId = (pack, id) => pack.concepts.find(c => c.id === id);
function sentences(text, max) { const s = String(text).match(/[^.!?]+[.!?]*/g) || [text]; return s.slice(0, max).join(' ').trim(); }
function styleText(text, P) { let t = sentences(text, P.maxSentences); if (!P.emoji) t = t.replace(EMO, '').replace(/\s{2,}/g, ' ').trim(); return t; }
const pick = (a) => a[Math.random() * a.length | 0];

// texto por faixa: campo pode ser string ou {kid, teen, adult}
const lv = (v, band) => (v && typeof v === 'object') ? (v[band] || v.teen || v.kid || v.adult) : v;

function compose(c, mode, P) {
  const b = P.band;
  const def = b === 'kid' ? lv(c.s, b) : (lv(c.d, b) || lv(c.s, b));
  switch (mode) {
    case 'def': return { text: def, src: c.src ? 'material' : 'extra' };
    case 'easier': return { text: lv(c.an, b) || lv(c.s, 'kid'), src: c.an ? 'extra' : 'material' };
    case 'example': return { text: lv(c.ex, b) || def, src: c.exSrc ? 'material' : (c.ex ? 'extra' : 'material') };
    case 'compare': return { text: lv(c.cmp, b) || def, src: 'material' };
    case 'summary': return { text: lv(c.sum, b) || sentences(def, 1), src: 'material' };
    case 'why': return { text: lv(c.why, b) || def, src: c.why ? 'extra' : 'material' };
    case 'visual': return { text: lv(c.visTxt, b) || lv(c.sum, b) || def, src: 'material', vis: c.vis };
    default: return { text: def, src: 'material' };
  }
}

EA.Tutor = {
  provider: 'local-rules-v1',
  context() {
    const profile = EA.profiles.active(), pack = EA.pack(), S = EA.state();
    return {
      active_profile: profile ? { id: profile.id, display_name: profile.display_name, age: profile.age, education_level: profile.education_level, grade: profile.grade, goal: profile.goal } : null,
      persona: EA.persona(profile),
      active_content_pack: pack ? { id: pack.id, subject: pack.subject, title: pack.title, subtitle: pack.subtitle } : null,
      screen: EA.ctx.get(),
      recent_weak_points: pack && S ? EA.weakConcepts(pack, S) : [],
      preferred_modes: S ? Object.entries(S.modes).sort((a, b) => b[1] - a[1]).map(([k]) => k) : [],
    };
  },
  answer(input, forcedMode) {
    const ctx = this.context(), P = ctx.persona, pack = EA.pack(), S = EA.state();
    const t = norm(input);
    const hist = S ? S.tutor : [];
    const last = [...hist].reverse().find(m => m.role === 'ai' && m.concept);
    let intent = forcedMode || (INTENTS.find(([, re]) => re.test(t)) || [null])[0];

    if (intent === 'mediaEmotion') return { text: 'Eu não consigo saber como alguém estava se sentindo olhando um vídeo ou uma foto. Se quiser, me conta você como foi aquele dia.', src: 'meta' };
    if (intent === 'aboutMe') return { text: OFFLINE_TEXT.personal, src: 'offline' };
    if (intent === 'private') return { text: 'Essa informação fica na memória privada do EXPLICA AI, que não está disponível neste modo. Não vou chutar.', src: 'offline' };
    if (intent === 'noFootball') { if (S) S.noFootball = true; return { text: 'Combinado: sem exemplos de futebol daqui pra frente.', src: 'meta' }; }
    if (intent === 'nav') {
      const want = (t.match(/\b(geografia|historia|matematica|ciencias|portugues|ingles)\b/) || [])[1];
      const pk = EA.packsFor(ctx.active_profile?.id).find(p => !want || norm(p.subject) === want);
      return pk ? { text: `Voltando para o caderno de ${pk.subject}.`, src: 'meta', link: { href: `#/c/${pk.id}/home`, label: `Abrir ${pk.subject} — ${pk.title}` } } : { text: 'Ainda não tem caderno dessa matéria.', src: 'meta' };
    }
    // sem caderno aberto: apenas orientação
    if (!pack) {
      const list = EA.packsFor(ctx.active_profile?.id).map(p => `${p.icon} ${p.subject} — ${p.title}`);
      return { text: list.length ? `Abra um caderno para eu explicar com base no seu material: ${list.join(', ')}.` : 'Você ainda não tem cadernos. Em breve dá para criar um a partir de PDF, foto ou texto.', src: 'meta' };
    }
    if (ctx.screen.exam && intent !== 'meta') return { text: 'Durante o simulado eu não dou dicas. Quando terminar, posso explicar cada erro.', src: 'meta' };
    if (intent === 'meta') {
      const scr = ctx.screen.title ? ` Agora você está em: ${ctx.screen.title}.` : '';
      return { text: `Você está estudando ${pack.subject} — ${pack.title} (${pack.subtitle}).${scr}`, src: 'meta' };
    }
    if (intent === 'whoami') {
      const p = ctx.active_profile; const lvl = [p.grade, p.education_level].filter(Boolean).join(' · ');
      return { text: `Este é o perfil ${p.display_name}${lvl ? ` (${lvl})` : ''}. Eu adapto as explicações para esse perfil.`, src: 'meta' };
    }
    if (intent === 'speak') {
      const lastAi = [...hist].reverse().find(m => m.role === 'ai' && m.speak);
      return { text: lastAi ? 'Ouvindo a última explicação.' : 'Ainda não expliquei nada. Pergunte algo primeiro.', src: 'meta', speakNow: lastAi && lastAi.speak };
    }

    // resolve o conceito: texto → pronome/intenção → tela → última conversa
    let c = findConcept(pack, input);
    const recent = this.recent && byId(pack, this.recent);
    if (!c && (PRONOUN.test(t) || intent)) c = recent || byId(pack, ctx.screen.concept) || (last && byId(pack, last.concept));
    if (!c) return offlineAnswer(t, pack);

    if (intent === 'test' || intent === 'exer') {
      const qs = pack.questions.filter(q => q.c === c.id || (c.rel || []).includes(q.c));
      const pool = qs.length ? qs : pack.questions.filter(q => q.t === c.t);
      this.recent = c.id;
      return { text: intent === 'test' ? `Vamos ver se ficou: ${c.n}.` : `Separei exercícios sobre ${c.n}.`, src: 'material', concept: c.id, quiz: EA.shuffle(pool).slice(0, intent === 'test' ? 2 : 3) };
    }

    // correção de erro comum ("Pantanal fica na Amazônia?")
    if (!intent || intent === 'why') {
      const mis = (c.m || []).find(m => m.k.every(k => t.includes(norm(k))));
      if (mis) { this.recent = c.id; } if (mis) return { text: styleText(lv(mis.r, P.band), { ...P, maxSentences: 4 }), src: 'material', concept: c.id, mode: 'fix', warn: true };
    }

    let mode = intent || 'def';
    if (intent === 'easier' || intent === 'other') {
      const used = hist.filter(m => m.role === 'ai' && m.concept === c.id).map(m => m.mode);
      const base = P.band === 'adult' ? ['summary', 'example', 'compare', 'visual', 'easier'] : ['easier', 'example', 'compare', 'visual', 'summary'];
      const st = (S && S.strat) || {}, sc = (m) => st[m] ? (st[m][1] + 1) / (st[m][0] + 2) : 0.5;
      const seq = [...base].sort((a, b) => sc(b) - sc(a));
      mode = seq.find(m => !used.includes(m) && m !== (last && last.mode)) || seq.find(m => m !== (last && last.mode)) || seq[0];
    }
    if (mode === 'def' && P.band === 'kid' && ctx.preferred_modes[0] === 'visual' && c.vis) mode = 'visual';
    this.recent = c.id;
    const out = compose(c, mode, P);
    let text = styleText(out.text, P);
    if (intent === 'easier' || intent === 'other') text = P.dont + ' ' + text;
    else if (mode === 'def' && P.open.length > 1 && P.band === 'kid') text = pick(P.open.slice(0, 1)) + text;
    const weak = ctx.recent_weak_points.includes(c.id) && c.weakTip ? styleText(lv(c.weakTip, P.band), { ...P, maxSentences: 2 }) : '';
    return { text, src: out.src, concept: c.id, mode, vis: out.vis, weak, close: P.close };
  },
};
/* AI_PROVIDER — interface comum (Cognitive Core v3 §10).
   LOCAL_PEDAGOGICAL_PROVIDER: este motor, sempre disponível (offline, sem dados privados).
   REMOTE_LLM_PROVIDER: API privada no VPS (/v1/explain). Só ativa com api_base + sessão autenticada;
   o token vem do login em tempo de execução, nunca do bundle. Falha/timeout → volta ao local. */
const NOT_UNDERSTOOD = /\b(nao entendi|nao entendo|nao sei|mais facil|explica de novo|como assim|nao consegui|simplifica)\b/;
EA.AI = {
  providers: {
    local: { id: 'LOCAL_PEDAGOGICAL_PROVIDER', available: () => true, generate: (q, m) => EA.Tutor.answer(q, m) },
    remote: {
      id: 'REMOTE_LLM_PROVIDER',
      available: () => !!(EA.settings && EA.settings.api_base && EA.session && EA.session.access_token),
      async generate(q, m) {
        const ac = new AbortController(), to = setTimeout(() => ac.abort(), 12000);
        try {
          const ctx = EA.Tutor.context();
          const r = await fetch(EA.settings.api_base.replace(/\/$/, '') + '/v1/explain', { method: 'POST', signal: ac.signal,
            headers: { 'content-type': 'application/json', authorization: 'Bearer ' + EA.session.access_token },
            body: JSON.stringify({ profile_id: ctx.active_profile && ctx.active_profile.id, question: q, mode: m || null, session_id: EA.session.session_id || null,
              screen: { pack_id: ctx.active_content_pack && ctx.active_content_pack.id, screen: ctx.screen.title || null, concept: ctx.screen.concept || null } }) });
          if (!r.ok) throw new Error('api ' + r.status);
          const j = await r.json(), k = (j.provenance_ui && j.provenance_ui[0] && j.provenance_ui[0].key) || 'general';
          const nav = j.action && j.action.type === 'OPEN_PACK' ? EA.packsFor(ctx.active_profile && ctx.active_profile.id).find(p => !j.action.subject || norm(p.subject) === j.action.subject) : null;
          return { text: j.text, src: k === 'meta' ? 'meta' : k, mode: j.strategy ? j.strategy.toLowerCase() : null, provider: j.provider,
            link: nav ? { href: `#/c/${nav.id}/home`, label: `Abrir ${nav.subject} — ${nav.title}` } : undefined };
        } finally { clearTimeout(to); }
      },
    },
  },
  status() { return this.providers.remote.available() ? 'REMOTE' : 'LOCAL'; },
  async ask(q, m) {
    const S = EA.state();
    // §21: sinal de sucesso/falha da estratégia anterior
    if (S && S.lastStrat) {
      const fail = NOT_UNDERSTOOD.test(norm(q)) || m === 'easier' || m === 'other';
      S.strat = S.strat || {}; const e = S.strat[S.lastStrat] || [0, 0]; S.strat[S.lastStrat] = [e[0] + 1, e[1] + (fail ? 0 : 1)]; S.lastStrat = null;
    }
    let r;
    if (this.providers.remote.available()) { try { r = await this.providers.remote.generate(q, m); } catch (e) { r = null; } }
    if (!r) r = this.providers.local.generate(q, m);
    if (S && r.mode && (NOT_UNDERSTOOD.test(norm(q)) || m === 'easier' || m === 'other')) S.lastStrat = r.mode;
    return r;
  },
};
})();
