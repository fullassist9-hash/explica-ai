/* CADERNO: Geografia — Missão Brasil (Centro-Oeste + Nordeste)
   Content Pack geo-missao-brasil-v1 · primeiro caderno funcional do EXPLICA AI.
   Toda a lógica visual/interativa deste caderno fica aqui; o núcleo (core.js) é universal. */
(() => {
'use strict';
const { $, $$, h, shuffle, sleep, fx, say, sayBtn, toast } = EA;
const ID = 'geo-missao-brasil-v1';
const R = '#/c/' + ID + '/';
const ST = () => EA.state();

/* ---------------- conteúdo ---------------- */
const REG = { N: ['Norte', 'var(--r-n)', 'var(--learn-region-n)'], NE: ['Nordeste', 'var(--r-ne)', 'var(--learn-region-ne)'], CO: ['Centro-Oeste', 'var(--r-co)', 'var(--learn-region-co)'], SE: ['Sudeste', 'var(--r-se)', 'var(--learn-region-se)'], S: ['Sul', 'var(--r-s)', 'var(--learn-region-s)'] };
const TOPICS = {
  co:    { name: 'Centro-Oeste no mapa', sub: 'MT + MS + GO + DF', ico: '🗺️', c: 'var(--learn-region-co)', bg: 'var(--learn-region-co-bg)', route: 'mapa', acts: ['act_co4'] },
  crv:   { name: 'Clima × Relevo × Vegetação', sub: 'Terreno, tempo ou plantas?', ico: '🧭', c: 'var(--learn-clima)', bg: 'var(--learn-clima-bg)', route: 'conceitos', acts: ['act_sort'] },
  bio:   { name: 'Cerrado × Pantanal', sub: 'Não confunda os dois', ico: '🌳', c: 'var(--learn-vegetacao)', bg: 'var(--learn-vegetacao-bg)', route: 'biomas', acts: ['act_hot', 'act_flood'] },
  campo: { name: 'Campo e cidade', sub: 'Êxodo rural e agroindústria', ico: '🚜', c: 'var(--learn-relevo)', bg: 'var(--learn-relevo-bg)', route: 'campo', acts: ['act_chain', 'act_dnd'] },
  ne:    { name: 'Nordeste', sub: '9 estados · 4 sub-regiões', ico: '🌊', c: 'var(--learn-zm)', bg: 'var(--learn-zm-bg)', route: 'nordeste', acts: ['act_ne9', 'act_zones'] },
};
const BADGES = [
  { id: 'co', t: '⭐ Explorador do Centro-Oeste', test: m => m.co >= 80 },
  { id: 'cer', t: '🌳 Mestre do Cerrado', test: (m, S) => ['bio2', 'bio3', 'bio4'].every(id => S.correct[id]) },
  { id: 'pan', t: '💧 Guardião do Pantanal', test: (m, S) => ['bio1', 'bio5', 'rel1'].every(id => S.correct[id]) },
  { id: 'reg', t: '🗺️ Mestre das Regiões', test: m => m.ne >= 80 },
  { id: 'pro', t: '🏆 Pronto para a Prova', test: m => m.all >= 90 },
];

// Banco de perguntas — cada erro vira um "LEMBRE"
const Q = [
  { id: 'co1', t: 'co', p: 'Quais unidades formam o Centro-Oeste?', o: ['MT, MS, GO e DF', 'MT, MS, GO e Brasília', 'MT, GO, TO e DF', 'BA, GO, MT e MS'], r: ['🟨 Centro-Oeste = MT + MS + GO + DF', '🏛️ Brasília é uma cidade, não um estado'] },
  { id: 'co2', t: 'co', p: 'Brasília é…', o: ['A capital do Brasil, no Distrito Federal', 'O quarto estado do Centro-Oeste', 'Um estado do Nordeste', 'A capital de Goiás'], r: ['🏛️ Brasília = capital do Brasil', '📍 Fica no Distrito Federal (DF)'] },
  { id: 'co3', t: 'co', p: 'Como é o clima do Centro-Oeste?', o: ['Verão quente e chuvoso, inverno seco', 'Frio o ano todo', 'Chuvoso o ano todo', 'Semiárido, quase sem chuva'], r: ['🌦️ Clima tropical', '☀️🌧️ Verão: quente e chuvoso', '☀️🍂 Inverno: seco'] },
  { id: 'co4', t: 'co', p: 'Qual chapada fica em Goiás?', o: ['Chapada dos Veadeiros', 'Chapada dos Guimarães', 'Chapada Diamantina', 'Chapada do Araripe'], r: ['⛰️ VEADEIROS → GO', '⛰️ GUIMARÃES → MT'] },
  { id: 'co5', t: 'co', p: 'A Chapada dos Guimarães fica em…', o: ['Mato Grosso', 'Goiás', 'Bahia', 'Distrito Federal'], r: ['⛰️ GUIMARÃES → MT', '⛰️ VEADEIROS → GO'] },
  { id: 'co6', t: 'co', p: 'Onde fica o Parque Indígena do Xingu?', o: ['Mato Grosso, no Centro-Oeste', 'Na Região Norte', 'Na Bahia', 'Em Goiás'], r: ['🧑🏽‍🤝‍🧑🏽 XINGU → MT → CENTRO-OESTE', '❌ Não é Região Norte'] },
  { id: 'crv1', t: 'crv', p: '“Verão chuvoso” é…', o: ['Clima', 'Relevo', 'Vegetação'], r: ['🌦️ CLIMA = como é o tempo', 'Verão e inverno são CLIMA'] },
  { id: 'crv2', t: 'crv', p: '“Chapada” é…', o: ['Relevo', 'Clima', 'Vegetação'], r: ['⛰️ RELEVO = forma do terreno'] },
  { id: 'crv3', t: 'crv', p: '“Árvores retorcidas” é…', o: ['Vegetação', 'Relevo', 'Clima'], r: ['🌳 VEGETAÇÃO = plantas naturais'] },
  { id: 'crv4', t: 'crv', p: '“Planície” é…', o: ['Relevo', 'Vegetação', 'Clima'], r: ['⛰️ RELEVO = forma do terreno', 'Planície = terreno baixo e plano'] },
  { id: 'rel1', t: 'crv', p: 'O Pantanal é um relevo de…', o: ['Planície', 'Chapada', 'Planalto', 'Montanha'], r: ['💧 Pantanal = PLANÍCIE', 'Terreno baixo e plano, que alaga'] },
  { id: 'bio1', t: 'bio', p: 'Onde fica o Pantanal?', o: ['Mato Grosso e Mato Grosso do Sul', 'Na Amazônia', 'No Nordeste', 'Em Goiás e no DF'], r: ['💧 Pantanal', '📍 MT + MS', '🟨 Centro-Oeste — não é Amazônia'] },
  { id: 'bio2', t: 'bio', p: 'O que forma o Cerrado?', o: ['Gramíneas, arbustos e árvores retorcidas', 'Plantações de soja', 'Cactos e espinhos', 'Floresta fechada e úmida'], r: ['🌾 gramíneas + 🌿 arbustos + 🌳 árvores retorcidas'] },
  { id: 'bio3', t: 'bio', p: 'A soja é…', o: ['Uma plantação (cultura agrícola)', 'A vegetação natural do Cerrado', 'Um tipo de relevo', 'Um tipo de clima'], r: ['⚠️ SOJA NÃO É VEGETAÇÃO NATURAL', '🌱 Soja é plantada pelas pessoas'] },
  { id: 'bio4', t: 'bio', p: 'A Mata Atlântica é vegetação do Cerrado?', o: ['Não. Ela aparece no litoral', 'Sim, é a mesma coisa', 'Sim, no Pantanal'], r: ['🌴 Mata Atlântica → litoral (Zona da Mata)', '🌳 Cerrado → árvores retorcidas'] },
  { id: 'bio5', t: 'bio', p: 'Pantanal = ?', o: ['Planície + alagamentos periódicos', 'Planalto + seca', 'Chapada + neve', 'Floresta + montanhas'], r: ['💧 PANTANAL = PLANÍCIE + ALAGAMENTOS'] },
  { id: 'ca1', t: 'campo', p: 'Qual é o principal cultivo do Centro-Oeste que estudamos?', o: ['Soja', 'Café', 'Uva', 'Cacau'], r: ['🌱 SOJA = principal cultivo'] },
  { id: 'ca2', t: 'campo', p: 'O que é agroindústria?', o: ['Indústria que transforma produtos do campo', 'Uma fazenda sem máquinas', 'Uma cidade grande', 'Um tipo de vegetação'], r: ['🏭 Campo → fábrica → produto', '🌱 soja → 🫗 óleo'] },
  { id: 'ca3', t: 'campo', p: 'Na agroindústria, a soja pode virar…', o: ['Óleo', 'Queijo', 'Hambúrguer'], r: ['🌱 SOJA → 🫗 ÓLEO', '🥛 LEITE → 🧀 QUEIJO'] },
  { id: 'ca4', t: 'campo', p: 'Êxodo rural é…', o: ['Saída de pessoas do campo para a cidade', 'Saída da cidade para o campo', 'Uma chuva muito forte', 'Um tipo de plantação'], r: ['🚶 ÊXODO RURAL = campo → cidade'] },
  { id: 'ca5', t: 'campo', p: 'Mais máquinas no campo causaram…', o: ['Menos trabalho no campo e mais gente indo para a cidade', 'Mais trabalho manual no campo', 'Menos cidades', 'Mais florestas'], r: ['🚜 máquinas → 👨‍🌾 menos trabalho → 🚶 cidade → 🏙️ cidades crescem'] },
  { id: 'ne1', t: 'ne', p: 'Quantos estados tem o Nordeste?', o: ['9', '4', '7', '3'], r: ['🌊 NORDESTE = 9 ESTADOS'] },
  { id: 'ne2', t: 'ne', p: 'Quais são as 4 sub-regiões do Nordeste?', o: ['Zona da Mata, Agreste, Sertão e Meio-Norte', 'Cerrado, Pantanal, Agreste e Sertão', 'Litoral, Amazônia, Sertão e Pampa'], r: ['🌊 Zona da Mata · 🌾 Agreste · ☀️ Sertão · 🌴 Meio-Norte'] },
  { id: 'ne3', t: 'ne', p: 'O Agreste fica entre…', o: ['A Zona da Mata e o Sertão', 'A Zona da Mata e o Meio-Norte', 'O Sertão e o Meio-Norte'], r: ['🌾 AGRESTE = TRANSIÇÃO', 'entre ZONA DA MATA e SERTÃO'] },
  { id: 'ne4', t: 'ne', p: 'Como é o clima da Zona da Mata?', o: ['Tropical litorâneo: quente e úmido', 'Semiárido: seco', 'Frio e seco'], r: ['🌊 Zona da Mata = litoral', '💧 quente e úmido'] },
  { id: 'ne5', t: 'ne', p: 'Qual é a vegetação original da Zona da Mata?', o: ['Mata Atlântica', 'Caatinga', 'Cerrado'], r: ['🌳 ZONA DA MATA → MATA ATLÂNTICA'] },
  { id: 'ne6', t: 'ne', p: 'O que aparece no Sertão?', o: ['Caatinga e clima semiárido', 'Mata Atlântica e muita chuva', 'Pantanal e alagamentos'], r: ['☀️ SERTÃO = interior', '🌵 Caatinga + semiárido'] },
  { id: 'ne7', t: 'ne', p: 'O Meio-Norte fica principalmente em…', o: ['Maranhão e Piauí', 'Bahia e Sergipe', 'Pernambuco e Paraíba'], r: ['🌴 MEIO-NORTE → MA + PI'] },
  { id: 'ne8', t: 'ne', p: 'Qual cultivo foi muito importante na Zona da Mata desde a colônia?', o: ['Cana-de-açúcar', 'Soja', 'Uva'], r: ['🎋 ZONA DA MATA → CANA-DE-AÇÚCAR'] },
];
const QI = Object.fromEntries(Q.map(q => [q.id, q]));

const QC = { co1: 'centro-oeste', co2: 'brasilia', co3: 'clima', co4: 'veadeiros', co5: 'guimaraes', co6: 'xingu', crv1: 'crv', crv2: 'relevo', crv3: 'vegetacao', crv4: 'relevo', rel1: 'pantanal', bio1: 'pantanal', bio2: 'cerrado', bio3: 'soja', bio4: 'mata-atlantica', bio5: 'pantanal', ca1: 'soja', ca2: 'agroindustria', ca3: 'agroindustria', ca4: 'exodo', ca5: 'exodo', ne1: 'nordeste', ne2: 'subregioes', ne3: 'agreste', ne4: 'zona-da-mata', ne5: 'zona-da-mata', ne6: 'sertao', ne7: 'meio-norte', ne8: 'zona-da-mata' };
Q.forEach(q => { q.c = QC[q.id]; });

/* Base de conceitos do tutor. s = versão curta (Ensino Fundamental I); d = versão mais completa (demais perfis).
   src:true = está no material do caderno. why/an = complemento do EXPLICA AI. */
const CONCEPTS = [
  { id: 'centro-oeste', t: 'co', n: 'Centro-Oeste', a: ['centro oeste', 'regiao centro oeste', 'mt ms go df'], src: true,
    s: 'O Centro-Oeste tem 4 partes: Mato Grosso, Mato Grosso do Sul, Goiás e o Distrito Federal.',
    d: 'A Região Centro-Oeste é formada por três estados (MT, MS e GO) e pelo Distrito Federal, onde fica Brasília. É a segunda maior região do país em área.',
    an: 'Pensa num time com 4 jogadores: MT, MS, GO e DF. Brasília não é jogador: é a cidade que fica dentro do DF.',
    ex: 'Quem mora em Cuiabá mora em Mato Grosso, no Centro-Oeste.', cmp: 'Centro-Oeste: 3 estados + DF. Nordeste: 9 estados.',
    sum: 'Centro-Oeste = MT + MS + GO + DF.', vis: { route: 'mapa', label: 'Ver no mapa' }, visTxt: 'Olha no mapa: as 4 partes amarelas são o Centro-Oeste.',
    m: [{ k: ['brasilia', 'estado'], r: 'Não. Brasília é uma cidade: a capital do Brasil. Ela fica no Distrito Federal, a 4ª parte do Centro-Oeste.' }],
    weakTip: 'Lembre: são 3 estados + o DF.' },
  { id: 'brasilia', t: 'co', n: 'Brasília', a: ['distrito federal', 'df', 'capital', 'capital do brasil'], src: true,
    s: 'Brasília é a capital do Brasil. Ela fica no Distrito Federal (DF).',
    d: 'Brasília é a capital federal e fica no Distrito Federal, uma unidade do Centro-Oeste que não é estado. Sua construção ajudou a integrar o território por meio de estradas.',
    an: 'O DF é como a casa, e Brasília é quem mora nela.', why: 'Brasília foi construída no centro do país para levar pessoas, estradas e desenvolvimento para o interior.',
    sum: 'Brasília = capital. Fica no DF.', vis: { route: 'mapa', label: 'Ver o DF no mapa' },
    m: [{ k: ['estado'], r: 'Brasília não é estado. É a capital do Brasil, e fica no Distrito Federal.' }] },
  { id: 'clima', t: 'co', n: 'Clima do Centro-Oeste', a: ['clima', 'verao', 'inverno', 'clima tropical', 'chuvoso'], src: true,
    s: 'Clima é como o tempo fica durante o ano. No Centro-Oeste, o verão é quente e chuvoso e o inverno é seco.',
    d: 'O Centro-Oeste tem clima tropical, com duas estações bem marcadas: verão quente e chuvoso e inverno seco e mais fresco.',
    an: 'Pensa no ano em duas metades: uma com calor e chuva (verão), outra sequinha (inverno).',
    ex: 'Em janeiro chove muito em Goiânia. Em julho quase não chove.', cmp: 'Clima fala do tempo. Relevo fala do terreno. Vegetação fala das plantas.',
    sum: 'Tropical: verão chuvoso, inverno seco.', vis: { route: 'conceitos', label: 'Ver clima × relevo × vegetação' },
    m: [{ k: ['relevo'], r: 'Verão e inverno não são relevo: são CLIMA, porque falam do tempo. Relevo é a forma do terreno.' }] },
  { id: 'crv', t: 'crv', n: 'Clima × Relevo × Vegetação', a: ['clima relevo vegetacao', 'clima e relevo', 'relevo e vegetacao', 'nao confundir'], src: true,
    s: 'Clima é o tempo. Relevo é o terreno. Vegetação são as plantas.',
    d: 'São três categorias diferentes: clima descreve as condições do tempo ao longo do ano; relevo, as formas do terreno; vegetação, as plantas que crescem naturalmente.',
    an: 'Faça 3 perguntas: é sobre o tempo? Clima. É sobre o chão? Relevo. É sobre as plantas? Vegetação.',
    ex: '“Verão chuvoso” é clima. “Chapada” é relevo. “Árvores retorcidas” é vegetação.', cmp: 'Clima = tempo. Relevo = terreno. Vegetação = plantas.',
    sum: 'Tempo, terreno ou plantas?', vis: { route: 'conceitos', label: 'Ver os 3 cartões' } },
  { id: 'relevo', t: 'crv', n: 'Relevo', a: ['relevo', 'terreno', 'planalto', 'chapada', 'planicie', 'formas do relevo'], src: true,
    s: 'Relevo é a forma do terreno: planalto (alto), chapada (alta, com topo plano) e planície (baixa e plana).',
    d: 'Relevo é o conjunto de formas da superfície. No Centro-Oeste predominam planaltos e chapadas; o Pantanal é uma grande planície.',
    an: 'Imagina uma mesa: o tampo reto lá em cima é como a chapada. O chão da sala, baixo e plano, é como a planície.',
    ex: 'A Chapada dos Guimarães é relevo de chapada. O Pantanal é planície.', cmp: 'Planalto: alto. Chapada: alta e plana em cima. Planície: baixa e plana.',
    sum: 'Relevo = forma do terreno.', vis: { route: 'conceitos', label: 'Ver o desenho do relevo' },
    m: [{ k: ['pantanal', 'chapada'], r: 'O Pantanal não é chapada: é PLANÍCIE, baixa e plana.' }] },
  { id: 'vegetacao', t: 'crv', n: 'Vegetação', a: ['vegetacao', 'plantas naturais', 'vegetacao natural'], src: true,
    s: 'Vegetação são as plantas que nascem sozinhas no lugar, sem ninguém plantar.',
    d: 'Vegetação natural é o conjunto de plantas que se desenvolve espontaneamente em uma área, como Cerrado, Mata Atlântica e Caatinga.',
    ex: 'Cerrado, Mata Atlântica e Caatinga são vegetações. Soja não é: foi plantada.', sum: 'Vegetação = plantas naturais.',
    m: [{ k: ['soja'], r: 'Soja não é vegetação natural. É uma plantação feita pelas pessoas.' }] },
  { id: 'cerrado', t: 'bio', n: 'Cerrado', a: ['cerrado', 'arvores retorcidas', 'gramineas', 'arbustos'], src: true, rel: ['soja'],
    s: 'O Cerrado tem capim (gramíneas), arbustos e árvores baixas e retorcidas, com casca grossa.',
    d: 'O Cerrado é a vegetação predominante do Centro-Oeste, formada por gramíneas, arbustos e árvores baixas de galhos retorcidos e casca grossa.',
    an: 'Pensa num campo de capim com arvorezinhas tortas espalhadas, como se alguém tivesse dado um nó nos galhos.',
    ex: 'Na Chapada dos Veadeiros, em Goiás, dá para ver o Cerrado.', cmp: 'Cerrado são as plantas (vegetação). Pantanal é a planície que alaga.',
    why: 'A casca grossa protege as árvores do fogo e da seca do inverno.', sum: 'Cerrado = gramíneas + arbustos + árvores retorcidas.',
    vis: { img: 'img/cerrado.webp', route: 'biomas', label: 'Ver a foto do Cerrado' }, visTxt: 'Veja na foto: capim embaixo, arbustos e árvores tortas.',
    m: [{ k: ['soja'], r: 'Não! Soja não é Cerrado. Soja é uma plantação feita pelas pessoas. O Cerrado é a vegetação natural: capim, arbustos e árvores retorcidas.' },
        { k: ['mata atlantica'], r: 'Não. A Mata Atlântica fica no litoral (Zona da Mata). O Cerrado tem árvores baixas e retorcidas.' }],
    weakTip: 'Cuidado: soja é plantação, não Cerrado.' },
  { id: 'pantanal', t: 'bio', n: 'Pantanal', a: ['pantanal', 'alaga', 'alagamento', 'alagamentos', 'cheia', 'cheias', 'inunda', 'inundacao'], src: true,
    s: 'O Pantanal é uma planície que alaga em parte do ano. Fica em Mato Grosso e Mato Grosso do Sul.',
    d: 'O Pantanal é uma extensa planície com alagamentos periódicos, localizada em Mato Grosso e Mato Grosso do Sul, no Centro-Oeste.',
    an: 'Pensa num prato raso: quando chove muito, a água enche o prato e cobre tudo. Depois seca de novo.',
    ex: 'Na cheia, o gado e os animais procuram as partes mais altas.', cmp: 'Pantanal: planície que alaga. Cerrado: capim, arbustos e árvores retorcidas.',
    why: 'Na época das chuvas os rios enchem e transbordam. Como o terreno é baixo e plano, a água se espalha e demora para ir embora.',
    sum: 'Pantanal = planície + alagamentos.', vis: { img: 'img/pantanal.webp', route: 'biomas', label: 'Ver a cheia animada' }, visTxt: 'Veja: na cheia, a água cobre a planície.',
    m: [{ k: ['amazonia'], r: 'Não! O Pantanal não fica na Amazônia. Ele fica no Centro-Oeste, em Mato Grosso e Mato Grosso do Sul.' },
        { k: ['norte'], r: 'Não. O Pantanal fica no Centro-Oeste: MT e MS.' }],
    weakTip: 'Você já confundiu isso: Pantanal fica em MT + MS, no Centro-Oeste.' },
  { id: 'soja', t: 'campo', n: 'Soja', a: ['soja', 'plantacao', 'lavoura', 'agricultura'], src: true,
    s: 'A soja é uma plantação feita pelas pessoas. É o principal cultivo do Centro-Oeste.',
    d: 'A soja é uma cultura agrícola, não vegetação natural. É o principal produto agrícola do Centro-Oeste, cultivado em grandes áreas mecanizadas.',
    ex: 'Uma colheitadeira passando num campo de soja em Mato Grosso.', cmp: 'Soja: plantada pelas pessoas. Cerrado: nasce sozinho.',
    sum: 'Soja = plantação, não vegetação.', vis: { img: 'img/soja2.webp', route: 'campo', label: 'Ver a colheita' },
    m: [{ k: ['cerrado'], r: 'Não! Soja não é Cerrado. Soja é uma plantação. O Cerrado é a vegetação natural.' },
        { k: ['vegetacao'], r: 'Soja não é vegetação natural. É uma cultura agrícola: foi plantada.' }] },
  { id: 'agroindustria', t: 'campo', n: 'Agroindústria', a: ['agroindustria', 'industria', 'fabrica', 'oleo', 'queijo', 'transformar'], src: true,
    s: 'Agroindústria é a fábrica que transforma o que vem do campo. A soja vira óleo e o leite vira queijo.',
    d: 'Agroindústria é a indústria que processa produtos da agricultura e da pecuária, como soja em óleo, leite em queijo e carne em derivados.',
    an: 'É como uma cozinha gigante: entra o ingrediente do campo e sai um produto pronto.',
    ex: 'Soja → óleo. Leite → queijo. Carne → hambúrguer.', cmp: 'Fazenda produz. Agroindústria transforma.', sum: 'Campo → fábrica → produto.',
    vis: { route: 'campo', label: 'Ver a máquina de transformação' } },
  { id: 'exodo', t: 'campo', n: 'Êxodo rural', a: ['exodo rural', 'exodo', 'mecanizacao', 'maquinas', 'urbanizacao', 'campo para a cidade'], src: true,
    s: 'Êxodo rural é quando as pessoas saem do campo e vão morar na cidade.',
    d: 'Com a mecanização da agricultura, menos trabalhadores foram necessários no campo. Muitos migraram para as cidades (êxodo rural), que cresceram (urbanização).',
    an: 'Uma colheitadeira faz o serviço de muita gente. Aí essas pessoas vão procurar trabalho na cidade.',
    ex: 'Uma família que trabalhava na lavoura se muda para Goiânia para trabalhar.', cmp: 'Êxodo rural: campo → cidade. Urbanização: a cidade cresce.',
    why: 'As máquinas fazem o trabalho de muitas pessoas. Sem emprego no campo, elas vão procurar trabalho na cidade.',
    sum: 'Máquinas → menos trabalho → cidade → cidades crescem.', vis: { route: 'campo', label: 'Ver a sequência animada' } },
  { id: 'guimaraes', t: 'co', n: 'Chapada dos Guimarães', a: ['chapada dos guimaraes', 'guimaraes'], src: true, rel: ['veadeiros'],
    s: 'A Chapada dos Guimarães fica em Mato Grosso (MT).', d: 'A Chapada dos Guimarães, em Mato Grosso, é um relevo de chapada com vegetação de Cerrado e grande atividade turística.',
    cmp: 'Guimarães → MT. Veadeiros → GO.', an: 'GuiMarães e Mato Grosso: os dois têm “M”.', sum: 'Guimarães → MT.' },
  { id: 'veadeiros', t: 'co', n: 'Chapada dos Veadeiros', a: ['chapada dos veadeiros', 'veadeiros'], src: true, rel: ['guimaraes'],
    s: 'A Chapada dos Veadeiros fica em Goiás (GO).', d: 'A Chapada dos Veadeiros fica em Goiás, perto do Distrito Federal, com paisagens de Cerrado e cachoeiras.',
    cmp: 'Veadeiros → GO. Guimarães → MT.', an: 'Veadeiros é vizinha de Brasília: fica em Goiás, pertinho do DF.', sum: 'Veadeiros → GO.' },
  { id: 'xingu', t: 'co', n: 'Parque Indígena do Xingu', a: ['xingu', 'parque indigena', 'indigenas', 'povos indigenas'], src: true,
    s: 'O Parque Indígena do Xingu fica em Mato Grosso. Ele protege povos indígenas, suas terras e culturas.',
    d: 'O Parque Indígena do Xingu, em Mato Grosso, protege diversos povos indígenas, seus territórios, culturas e modos de vida.',
    sum: 'Xingu → MT → Centro-Oeste.', m: [{ k: ['norte'], r: 'Não. O Xingu fica em Mato Grosso, no Centro-Oeste.' }, { k: ['serra'], r: 'O nome certo é Parque Indígena do Xingu, e ele fica em Mato Grosso.' }] },
  { id: 'nordeste', t: 'ne', n: 'Nordeste', a: ['nordeste', 'estados do nordeste', 'nove estados'], src: true,
    s: 'O Nordeste tem 9 estados: Maranhão, Piauí, Ceará, Rio Grande do Norte, Paraíba, Pernambuco, Alagoas, Sergipe e Bahia.',
    d: 'A Região Nordeste reúne nove estados: MA, PI, CE, RN, PB, PE, AL, SE e BA, e se divide em quatro sub-regiões.',
    an: 'Faça uma viagem pelo litoral, de cima para baixo: MA, PI, CE, RN, PB, PE, AL, SE e BA.', sum: 'Nordeste = 9 estados.', vis: { route: 'nordeste', label: 'Ver os 9 estados' } },
  { id: 'subregioes', t: 'ne', n: 'Sub-regiões do Nordeste', a: ['sub regioes', 'subregioes', 'sub regiao', 'quatro sub regioes'], src: true,
    s: 'O Nordeste tem 4 sub-regiões: Zona da Mata (litoral), Agreste (transição), Sertão (interior) e Meio-Norte (oeste).',
    d: 'O Nordeste é dividido em Zona da Mata (litoral úmido), Agreste (faixa de transição), Sertão (interior semiárido) e Meio-Norte (transição a oeste, sobretudo MA e PI).',
    an: 'Imagina uma viagem saindo da praia: primeiro a Zona da Mata, depois o Agreste, depois o Sertão. Virando para o oeste, o Meio-Norte.',
    sum: 'Mata → Agreste → Sertão; a oeste, Meio-Norte.', vis: { route: 'nordeste', label: 'Ver o mapa das sub-regiões' } },
  { id: 'zona-da-mata', t: 'ne', n: 'Zona da Mata', a: ['zona da mata', 'litoral nordestino', 'cana de acucar', 'cana'], src: true,
    s: 'A Zona da Mata fica no litoral. Tem clima quente e úmido, Mata Atlântica e cana-de-açúcar.',
    d: 'A Zona da Mata ocupa a faixa litorânea oriental do Nordeste, com clima tropical litorâneo (quente e úmido), vegetação original de Mata Atlântica e cultivo histórico de cana-de-açúcar desde o período colonial.',
    an: 'Perto do mar tem mais umidade. Com umidade, cresce floresta: a Mata Atlântica.', sum: 'Litoral + úmido + Mata Atlântica + cana.',
    vis: { img: 'img/zonamata.webp', route: 'nordeste', label: 'Ver a Zona da Mata' },
    m: [{ k: ['semiarido'], r: 'Não. Semiárido é o clima do Sertão. A Zona da Mata tem clima tropical litorâneo: quente e úmido.' }] },
  { id: 'agreste', t: 'ne', n: 'Agreste', a: ['agreste', 'transicao'], src: true,
    s: 'O Agreste é a transição: fica entre a Zona da Mata e o Sertão.', d: 'O Agreste é uma faixa de transição entre a Zona da Mata, mais úmida, e o Sertão, semiárido.',
    an: 'É o meio do caminho: um pouco úmido como a Zona da Mata, um pouco seco como o Sertão.', sum: 'Agreste = entre Zona da Mata e Sertão.',
    vis: { img: 'img/agreste.webp', route: 'nordeste', label: 'Ver o Agreste' },
    m: [{ k: ['meio norte'], r: 'Não. O Agreste fica entre a Zona da Mata e o SERTÃO. O Meio-Norte fica a oeste.' }] },
  { id: 'sertao', t: 'ne', n: 'Sertão', a: ['sertao', 'semiarido', 'caatinga'], src: true,
    s: 'O Sertão é o interior do Nordeste. Tem clima semiárido, pouca chuva e vegetação de Caatinga.',
    d: 'O Sertão é a sub-região interior do Nordeste, de clima semiárido, chuvas irregulares e vegetação de Caatinga.',
    an: 'Quanto mais longe do mar, menos chuva. Lá no interior fica o Sertão.', sum: 'Sertão = interior + semiárido + Caatinga.',
    vis: { img: 'img/sertao.webp', route: 'nordeste', label: 'Ver o Sertão' } },
  { id: 'meio-norte', t: 'ne', n: 'Meio-Norte', a: ['meio norte', 'mata dos cocais', 'babacu'], src: true,
    s: 'O Meio-Norte fica no oeste do Nordeste, principalmente no Maranhão e no Piauí. É uma região de transição.',
    d: 'O Meio-Norte, principalmente Maranhão e Piauí, é uma faixa de transição entre a Amazônia e o Sertão, com a Mata dos Cocais (babaçu e carnaúba).',
    sum: 'Meio-Norte = MA + PI, transição.', vis: { img: 'img/meionorte.webp', route: 'nordeste', label: 'Ver o Meio-Norte' } },
  { id: 'mata-atlantica', t: 'bio', n: 'Mata Atlântica', a: ['mata atlantica'], src: true,
    s: 'A Mata Atlântica é a floresta do litoral. No Nordeste, ela aparece na Zona da Mata.',
    d: 'A Mata Atlântica é a floresta tropical da faixa litorânea; no Nordeste, é a vegetação original da Zona da Mata.',
    sum: 'Mata Atlântica → litoral.', m: [{ k: ['cerrado'], r: 'Não. Mata Atlântica não é Cerrado. Ela fica no litoral, na Zona da Mata.' }] },
];


/* ---------------- mapas ---------------- */
const G = window.GEO;
function brazilSVG(mode) {
  const W = G.br.w, H = G.br.h, extra = mode === 'ne' ? 64 : 0;
  const stColor = (st) => mode === 'br' ? REG[st.r][2] : (mode === 'co' ? (st.r === 'CO' ? REG.CO[2] : null) : (st.r === 'NE' ? REG.NE[2] : null));
  let paths = G.br.states.map(st => {
    const c = stColor(st);
    return `<path class="st ${c ? '' : 'dim'}" data-s="${st.s}" d="${st.d}" style="fill:${c || 'var(--learn-map-empty)'}"/>`;
  }).join('');
  let labels = '';
  if (mode === 'br') {
    const pos = { N: [150, 120], NE: [318, 150], CO: [205, 225], SE: [290, 280], S: [230, 345] };
    labels = Object.entries(pos).map(([r, [x, y]]) => `<text class="reg-lbl" x="${x}" y="${y}">${REG[r][0].toUpperCase()}</text>`).join('');
  } else if (mode === 'co') {
    const df = G.br.states.find(s => s.s === 'DF');
    labels = G.br.states.filter(s => s.r === 'CO' && s.s !== 'DF').map(s => `<text class="st-lbl" x="${s.c[0]}" y="${s.c[1] + 4}">${s.s}</text>`).join('');
    labels += `<circle cx="${df.c[0]}" cy="${df.c[1]}" r="16" fill="transparent" data-s="DF" class="hit"/>
      <path d="M${df.c[0]} ${df.c[1] - 7}l2 5h5.5l-4.4 3.3 1.7 5.3-4.8-3.2-4.8 3.2 1.7-5.3-4.4-3.3h5.5z" style="fill:var(--color-brand-primary)" pointer-events="none"/>
      <path class="leader" d="M${df.c[0] + 7} ${df.c[1]} L${df.c[0] + 40} ${df.c[1] - 26}"/>
      <text class="st-lbl" x="${df.c[0] + 62}" y="${df.c[1] - 28}">DF ★</text>`;
  } else {
    const big = ['MA', 'PI', 'CE', 'BA'];
    const ne = G.br.states.filter(s => s.r === 'NE');
    labels = ne.filter(s => big.includes(s.s)).map(s => `<text class="st-lbl" x="${s.c[0]}" y="${s.c[1] + 4}">${s.s}</text>`).join('');
    const small = ne.filter(s => !big.includes(s.s)).sort((a, b) => a.c[1] - b.c[1]);
    let y = small[0].c[1] - 14;
    small.forEach(s => { y = Math.max(y + 17, s.c[1] - 10); labels += `<path class="leader" d="M${s.c[0]} ${s.c[1]} L${W + 14} ${y - 4}"/><text class="st-lbl sm" x="${W + 30}" y="${y}">${s.s}</text>`; });
  }
  return `<svg viewBox="0 -4 ${W + extra} ${H + 8}" role="img" aria-label="Mapa do Brasil">${paths}${labels}</svg>`;
}

function neSVG(mode) {
  const W = G.ne.w, Hh = G.ne.h, extra = 52;
  const tones = { MA: 'var(--learn-region-ne)', PI: 'var(--learn-ne-tone-1)', CE: 'var(--learn-region-ne)', RN: 'var(--learn-ne-tone-1)', PB: 'var(--learn-ne-tone-2)', PE: 'var(--learn-ne-tone-1)', AL: 'var(--learn-ne-tone-2)', SE: 'var(--learn-region-ne)', BA: 'var(--learn-ne-tone-1)' };
  const big = ['MA', 'PI', 'CE', 'BA'];
  let body = '', labels = '';
  if (mode === 'zones') {
    const zc = { zm: 'var(--zm)', ag: 'var(--ag)', se: 'var(--st)', mn: 'var(--mn)' };
    body = Object.entries(G.ne.zones).map(([z, d]) => `<path class="zone" data-z="${z}" d="${d}" style="fill:${zc[z]}"/>`).join('');
    body += `<g class="ne-borders">${G.ne.states.map(s => `<path d="${s.d}"/>`).join('')}</g>`;
  } else {
    body = G.ne.states.map(s => `<path class="st" data-s="${s.s}" d="${s.d}" style="fill:${tones[s.s]}"/>`).join('');
  }
  labels = G.ne.states.filter(s => big.includes(s.s)).map(s => `<text class="st-lbl" x="${s.c[0]}" y="${s.c[1] + 4}" style="font-size:15px">${s.s}</text>`).join('');
  const small = G.ne.states.filter(s => !big.includes(s.s)).sort((a, b) => a.c[1] - b.c[1]);
  let y = small[0].c[1] - 30;
  small.forEach(s => { y = Math.max(y + 30, s.c[1]); labels += `<path class="leader" d="M${s.c[0]} ${s.c[1]} L${W + 6} ${y - 5}"/><text class="st-lbl" x="${W + 26}" y="${y}" style="font-size:14px">${s.s}</text>`; });
  return `<svg viewBox="0 0 ${W + extra} ${Hh}" role="img" aria-label="Mapa do Nordeste">${body}${labels}</svg>`;
}

/* ---------------- ilustrações ---------------- */
const ART = {
  relevo: `<svg class="art" width="104" height="90" viewBox="0 0 104 90"><path d="M0 84 L30 34 L46 52 L66 18 L104 84Z" style="fill:color-mix(in srgb,var(--paper-0) 28%,transparent)"/><path d="M8 84 L36 44 L50 60 L70 30 L98 84Z" style="fill:color-mix(in srgb,var(--paper-0) 55%,transparent)"/><path d="M62 38 L70 30 L78 40 L72 38 L68 42Z" style="fill:var(--paper-0)"/></svg>`,
  clima: `<svg class="art" width="104" height="90" viewBox="0 0 104 90"><circle cx="66" cy="30" r="18" style="fill:var(--illu-sun)"/><g style="stroke:var(--illu-sun)" stroke-width="4" stroke-linecap="round"><path d="M66 2v6M92 30h6M84 12l4-4M48 12l-4-4"/></g><path d="M22 62a14 14 0 0 1 4-27 18 18 0 0 1 34 4 12 12 0 0 1 2 23z" style="fill:var(--paper-0)"/><g style="stroke:var(--illu-rain)" stroke-width="4" stroke-linecap="round"><path d="M30 70l-4 10M44 70l-4 10M58 70l-4 10"/></g></svg>`,
  veg: `<svg class="art" width="104" height="90" viewBox="0 0 104 90"><path d="M50 88c0-14 2-22-6-32s-4-16 2-20M50 60c6-6 14-8 18-16" style="stroke:var(--illu-trunk)" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="40" cy="30" rx="22" ry="14" style="fill:color-mix(in srgb,var(--paper-0) 55%,transparent)"/><ellipse cx="70" cy="38" rx="18" ry="12" style="fill:color-mix(in srgb,var(--paper-0) 75%,transparent)"/><g style="stroke:var(--paper-0)" stroke-width="3" stroke-linecap="round"><path d="M10 88l-4-12M16 88l2-14M22 88l-2-10M84 88l4-12M90 88l-2-14"/></g></svg>`,
};
const PROFILE = `<svg viewBox="0 0 360 170" role="img" aria-label="Corte do relevo: planalto, chapada e planície">
<defs><linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:var(--illu-sky-1)"/><stop offset="1" style="stop-color:var(--illu-sky-2)"/></linearGradient>
<linearGradient id="rock" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:var(--illu-rock-1)"/><stop offset="1" style="stop-color:var(--illu-rock-2)"/></linearGradient></defs>
<rect width="360" height="170" fill="url(#sky)"/>
<path d="M0 62 Q30 56 60 62 T110 60 L118 60 L118 170 L0 170Z" fill="url(#rock)"/>
<path d="M118 60 L126 60 L140 128 L150 128 L162 50 L226 50 L240 128 L360 128 L360 170 L118 170Z" fill="url(#rock)" opacity=".92"/>
<rect x="240" y="122" width="120" height="8" style="fill:var(--illu-water-soft)" opacity=".85"/>
<path d="M0 62 Q30 56 60 62 T110 60 L126 60" style="stroke:var(--learn-vegetacao)" stroke-width="4" fill="none"/>
<path d="M162 50 L226 50" style="stroke:var(--learn-vegetacao)" stroke-width="4"/><path d="M240 128 L360 128" style="stroke:var(--learn-vegetacao)" stroke-width="4"/>
<g font-family="Lexend" font-weight="800" font-size="13" style="fill:var(--color-brand-primary)" text-anchor="middle">
<text x="58" y="40">PLANALTO</text><text x="194" y="32">CHAPADA</text><text x="300" y="108">PLANÍCIE</text></g>
<g font-family="Lexend" font-weight="600" font-size="10.5" style="fill:var(--paper-0)" text-anchor="middle">
<text x="58" y="92">área alta</text><text x="194" y="104">topo plano</text><text x="194" y="118">bordas íngremes</text><text x="300" y="152">baixa e plana</text></g>
<text x="300" y="120" font-family="Lexend" font-size="10" font-weight="700" style="fill:var(--illu-water-text)" text-anchor="middle">💧 Pantanal</text>
</svg>`;

/* ---------------- telas ---------------- */
const V = {};
V.home = (el) => {
  EA.ctx.reset({ screen: 'home', title: 'Início do caderno Missão Brasil', concept: null });
  const m = EA.mastery();
  const next = Object.entries(TOPICS).find(([k]) => m[k] < 100) || ['co', TOPICS.co];
  el.append(h(`<div>
    <section class="hero">
      <div class="flag"><span>5º ANO</span><span>GEOGRAFIA</span></div>
      <h1>Missão<em>Brasil</em></h1>
      <p class="sub">Geografia · Centro-Oeste + Nordeste</p>
      <div class="motto"><b>👀 Veja</b><b>👂 Ouça</b><b>🔗 Associe</b><b>🎯 Acerte</b></div>
    </section>
    <div class="mastery">
      <div class="ring" style="--p:${m.all}"><div>${m.all}%</div></div>
      <p><strong>Domínio geral</strong>Cada acerto e cada atividade enchem o círculo.</p>
    </div>
    <div class="cta-grid">
      <a class="btn btn-primary" href="${R}${next[1].route}">${EA.icon('play', 20)} Começar missão</a>
      <div class="btn-row">
        <a class="btn btn-ghost" href="${R}revisao"><i>${EA.icon('review', 24)}</i>Revisão rápida</a>
        <a class="btn btn-ghost" href="${R}simulado"><i>${EA.icon('target', 24)}</i>Simulado</a>
      </div>
      <a class="btn btn-dark" href="${R}mapa">${EA.icon('map', 20)} Explorar mapa</a>
    </div>
    <section class="section">
      <div class="section-h"><h2>Trilha</h2><span class="muted">5 missões</span></div>
      <div class="trail">${Object.entries(TOPICS).map(([k, t]) => `
        <a href="${R}${t.route}"><span class="ico" style="background:${t.bg}">${t.ico}</span>
          <div><h3>${t.name}</h3><p>${t.sub}</p><div class="bar"><i style="width:${m[k]}%;--c:${t.c}"></i></div></div>
          <span class="go">${EA.icon('chevronRight', 20)}</span></a>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section-h"><h2>Conquistas</h2></div>
      <div class="badges" tabindex="0" role="region" aria-label="Conquistas">${BADGES.map(b => `<span class="badge ${ST().badges[b.id] ? 'on' : ''}">${b.t}</span>`).join('')}</div>
    </section>
  </div>`));
};

V.mapa = (el) => {
  EA.ctx.reset({ screen: 'mapa', title: 'Mapa do Brasil', concept: 'centro-oeste' });
  let mode = 'co', found = new Set();
  el.append(h(`<div>
    <p class="eyebrow">Missão 1 · Localização</p>
    <h1 class="screen-title">Onde fica cada lugar?</h1>
    <p class="lead">Toque nos estados para ver o nome.</p>
    <div class="seg" role="group" aria-label="Escolha o mapa"><button data-m="br">Brasil</button><button data-m="co" class="on">Centro-Oeste</button><button data-m="ne">Nordeste</button></div>
    <div class="map-wrap"><span class="ocean-lbl">OCEANO ATLÂNTICO</span><div class="svg-host"></div>
      <div class="map-info"><span class="sig"></span><div><h4></h4><p></p></div><button class="say" aria-label="Ouvir">${EA.icon('soundOn', 20)}</button></div></div>
    <div class="below"></div>
  </div>`));
  const host = $('.svg-host', el), info = $('.map-info', el), below = $('.below', el);
  function showInfo(s) {
    const st = G.br.states.find(x => x.s === s);
    $('.sig', info).textContent = s; $('.sig', info).style.background = REG[st.r][2]; $('.sig', info).style.color = 'var(--color-text-primary)';
    $('h4', info).textContent = st.n; $('p', info).textContent = 'Região ' + REG[st.r][0];
    const txt = s === 'DF' ? 'Distrito Federal. É onde fica Brasília, a capital do Brasil.' : `${st.n}. Região ${REG[st.r][0]}.`;
    $('.say', info).dataset.say = txt; info.classList.add('show');
    $$('.st', host).forEach(p => p.classList.toggle('sel', p.dataset.s === s));
    return txt;
  }
  function draw() {
    host.innerHTML = brazilSVG(mode); info.classList.remove('show');
    EA.ctx.set({ concept: mode === 'ne' ? 'nordeste' : 'centro-oeste', title: 'Mapa do Brasil — ' + ({ br: 'regiões', co: 'Centro-Oeste', ne: 'Nordeste' })[mode] });
    $$('.seg button', el).forEach(b => b.classList.toggle('on', b.dataset.m === mode));
    if (mode === 'co') {
      below.innerHTML = `
        <div class="equation" aria-label="MT mais MS mais GO mais DF igual a Centro-Oeste">
          ${['MT', 'MS', 'GO', 'DF'].map((s, i) => `${i ? '<span class="op">+</span>' : ''}<span class="chip ${found.has(s) ? 'lit' : ''}" data-c="${s}">${s}</span>`).join('')}
          <span class="eq-break"></span><span class="chip result">= CENTRO-OESTE</span></div>
        <div class="challenge"><div class="q"><small>Desafio</small>Toque nos 4 do Centro-Oeste</div><span class="count">${found.size}/4</span></div>
        <section class="section"><div class="callout"><span class="emo">🏛️</span><p><b>Brasília</b> é a capital do Brasil.<br>Ela fica no <b>Distrito Federal (DF)</b>.</p>${sayBtn('Brasília é a capital do Brasil. Ela fica no Distrito Federal.')}</div>
        <div class="callout" style="margin-top:10px;background:var(--color-feedback-error-bg);border-color:var(--color-feedback-error-border)"><span class="emo">⚠️</span><p>Brasília é uma <b>cidade</b>.<br>Não é o quarto estado!</p></div></section>`;
    } else if (mode === 'br') {
      below.innerHTML = `<section class="section"><div class="section-h"><h2>5 regiões</h2>${sayBtn('O Brasil tem cinco regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.')}</div>
        <div class="pins">${Object.values(REG).map(r => `<span class="pin"><span style="width:14px;height:14px;border-radius:5px;background:${r[2]}"></span>${r[0]}</span>`).join('')}</div></section>`;
    } else {
      below.innerHTML = `<section class="section"><div class="callout" style="background:var(--learn-region-ne-bg);border-color:var(--learn-region-ne-border)"><span class="emo">🌊</span><p><b>NORDESTE = 9 ESTADOS</b><br>MA · PI · CE · RN · PB · PE · AL · SE · BA</p>${sayBtn('O Nordeste tem nove estados.')}</div>
        <a class="btn btn-dark" style="margin-top:12px" href="${R}nordeste">Estudar o Nordeste →</a></section>`;
    }
    $$('[data-s]', host).forEach(p => p.addEventListener('click', () => tapState(p.dataset.s)));
  }
  function tapState(s) {
    const st = G.br.states.find(x => x.s === s);
    const txt = showInfo(s);
    if (mode === 'co') {
      if (st.r === 'CO') {
        if (!found.has(s)) {
          found.add(s); fx.ok();
          const chip = $(`.chip[data-c="${s}"]`, below); chip && chip.classList.add('lit', 'pop');
          $('.count', below).textContent = found.size + '/4';
          if (found.size === 4) { fx.done(); EA.act('act_co4', '⭐ Centro-Oeste completo: MT + MS + GO + DF'); say('Mato Grosso, Mato Grosso do Sul, Goiás e Distrito Federal formam o Centro-Oeste.'); return; }
        } else fx.tap();
      } else { fx.err(); host.classList.add('shake'); setTimeout(() => host.classList.remove('shake'), 450); toast(`${st.n} é da Região ${REG[st.r][0]}`); }
    } else fx.tap();
    say(txt);
  }
  $$('.seg button', el).forEach(b => b.onclick = () => { mode = b.dataset.m; fx.tap(); draw(); });
  draw();
  el.append(EA.quizBlock(['co'], 4));
};

V.conceitos = (el) => {
  EA.ctx.reset({ screen: 'conceitos', title: 'Clima × Relevo × Vegetação', concept: 'crv' });
  el.append(h(`<div>
    <p class="eyebrow">Missão 2 · Não confunda</p>
    <h1 class="screen-title">Clima × Relevo × Vegetação</h1>
    <p class="lead">Três perguntas diferentes. Cada uma tem sua cor.</p>
    <div class="cat-stack">
      <div class="cat relevo"><div><p class="tag">⛰️ RELEVO</p><h3>Terreno</h3><p class="ask">Qual é a forma do terreno?</p></div>${ART.relevo}
        <div class="ex"><span>planalto</span><span>chapada</span><span>planície</span></div>${sayBtn('Relevo: qual é a forma do terreno? Planalto, chapada, planície.', 'light')}</div>
      <div class="cat clima"><div><p class="tag">🌦️ CLIMA</p><h3>Tempo</h3><p class="ask">Como é o tempo durante o ano?</p></div>${ART.clima}
        <div class="ex"><span>quente</span><span>chuvoso</span><span>seco</span></div>${sayBtn('Clima: como é o tempo durante o ano? Quente, chuvoso, seco.', 'light')}</div>
      <div class="cat veg"><div><p class="tag">🌳 VEGETAÇÃO</p><h3>Plantas</h3><p class="ask">Que plantas nascem sozinhas ali?</p></div>${ART.veg}
        <div class="ex"><span>Cerrado</span><span>Mata Atlântica</span><span>Caatinga</span></div>${sayBtn('Vegetação: que plantas nascem naturalmente no lugar? Cerrado, Mata Atlântica, Caatinga.', 'light')}</div>
    </div>
    <div class="ask-self"><p>Pergunte a si mesmo:</p><div class="trio"><span class="t-relevo">terreno?</span><span class="t-clima">tempo?</span><span class="t-veg">plantas?</span></div></div>
    <section class="section"><div class="section-h"><h2>⛰️ Formas do relevo</h2>${sayBtn('Planalto é área alta. Chapada tem topo plano e bordas íngremes. Planície é baixa e plana, como o Pantanal.')}</div>
      <div class="profile">${PROFILE}</div></section>
    <section class="section"><div class="section-h"><h2>🎮 Isto é o quê?</h2><span class="muted">Toque na cor certa</span></div><div class="sorter"></div></section>
  </div>`));
  Sorter($('.sorter', el));
};
function Sorter(el) {
  const CAT = { relevo: ['⛰️', 'RELEVO', 'forma do terreno'], clima: ['🌦️', 'CLIMA', 'como é o tempo'], veg: ['🌳', 'VEGETAÇÃO', 'plantas naturais'] };
  const ITEMS = [['Árvores retorcidas', '🌳', 'veg'], ['Verão chuvoso', '🌧️', 'clima'], ['Chapada', '🏜️', 'relevo'], ['Planície', '〰️', 'relevo'], ['Inverno seco', '🍂', 'clima'], ['Gramíneas', '🌾', 'veg'], ['Planalto', '🏔️', 'relevo'], ['Tropical', '🌡️', 'clima'], ['Mata Atlântica', '🌴', 'veg'], ['Caatinga', '🌵', 'veg'], ['Semiárido', '☀️', 'clima'], ['Terreno baixo que alaga', '💧', 'relevo']];
  let queue = shuffle(ITEMS).slice(0, 9), res = [], retried = new Set();
  function draw() {
    if (!queue.length) {
      const ok = res.filter(r => r).length;
      fx.done(); EA.act('act_sort', '🧭 Você separou clima, relevo e vegetação');
      el.innerHTML = `<div class="game center"><p style="font-size:44px">${ok >= res.length - 1 ? '🏆' : '💪'}</p><p class="big-key" style="font-size:30px">${ok} de ${res.length}</p><p style="opacity:.8;margin-top:4px">acertos de primeira</p><button class="btn btn-primary" style="margin-top:16px">Jogar de novo</button></div>`;
      $('button', el).onclick = () => { queue = shuffle(ITEMS).slice(0, 9); res = []; retried.clear(); draw(); };
      return;
    }
    const [w, e, a] = queue[0];
    el.innerHTML = `<div class="game">
      <div class="game-top"><span>${res.length + 1}ª carta</span><span class="dots">${res.map(r => `<i class="${r ? 'ok' : 'no'}"></i>`).join('')}<i class="cur"></i></span></div>
      <div class="item-card pop"><span class="emo">${e}</span><span class="w">${w}</span></div>
      <div class="sort-btns">${Object.entries(CAT).map(([k, c]) => `<button class="b-${k}" data-k="${k}"><i>${c[0]}</i>${c[1]}</button>`).join('')}</div>
      <div class="feedback"></div></div>`;
    $$('.sort-btns button', el).forEach(b => b.onclick = () => {
      const ok = b.dataset.k === a, fb = $('.feedback', el), c = CAT[a];
      $$('.sort-btns button', el).forEach(x => x.disabled = true);
      if (!retried.has(w)) res.push(ok);
      if (ok) { fx.ok(); fb.className = 'feedback show good'; fb.textContent = `✓ ${w} → ${c[1]} (${c[2]})`; }
      else { fx.err(); $('.item-card', el).classList.add('shake'); fb.className = 'feedback show bad'; fb.innerHTML = `LEMBRE: <b>${w}</b> é <b>${c[1]}</b> — ${c[2]}.<br><span style="opacity:.8">Ela volta daqui a pouco.</span>`; say(`${w} é ${c[1].toLowerCase()}: ${c[2]}.`); retried.add(w); }
      const item = queue.shift(); if (!ok) queue.splice(Math.min(2, queue.length), 0, item);
      setTimeout(draw, ok ? 900 : 2300);
    });
  }
  draw();
}

V.biomas = (el) => {
  EA.ctx.reset({ screen: 'biomas', title: 'Cerrado × Pantanal', concept: 'cerrado' });
  let tab = 'cer';
  el.append(h(`<div>
    <p class="eyebrow">Missão 3 · Vegetação e relevo</p>
    <h1 class="screen-title">Cerrado × Pantanal</h1>
    <p class="lead">Os dois ficam no Centro-Oeste. Mas são muito diferentes.</p>
    <div class="seg"><button data-t="cer" class="on">🌳 Cerrado</button><button data-t="pan">💧 Pantanal</button><button data-t="cmp">⚖️ Comparar</button></div>
    <div class="tab-body"></div>
  </div>`));
  const body = $('.tab-body', el);
  const HOTS = [[16, 56, '🌾', 'Gramíneas (capim)', 0], [44, 40, '🌿', 'Arbustos', 0], [80, 30, '🌳', 'Árvore retorcida', 1], [70, 52, '🪵', 'Casca grossa', 1]];
  function draw() {
    $$('.seg button', el).forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    let opened = new Set();
    EA.ctx.set({ concept: tab === 'pan' ? 'pantanal' : 'cerrado', title: ({ cer: 'Cerrado', pan: 'Pantanal — seca e cheia', cmp: 'Comparação Cerrado × Pantanal' })[tab] });
    if (tab === 'cer') {
      body.innerHTML = `<section class="section" style="margin-top:14px">
        <div class="photo"><img loading="lazy" decoding="async" src="img/cerrado.webp" width="960" height="720" alt="Paisagem de Cerrado com capim, arbustos e árvores retorcidas">
          ${HOTS.map(([x, y, e, t, rt], i) => `<div class="hot ${rt ? 'rt' : ''}" style="left:${x}%;top:${y}%" data-i="${i}"><button aria-label="Ponto ${i + 1}: ${t}" aria-expanded="false">${i + 1}</button><span>${e} ${t}</span></div>`).join('')}
          <div class="ph-title"><div><h3>Cerrado</h3><p>Toque nos pontos da foto</p></div>${sayBtn('Cerrado: gramíneas, arbustos e árvores baixas e retorcidas, com casca grossa.', 'light')}</div></div>
        <p class="credit">Foto: Wikimedia Commons</p>
        <div class="formula"><span class="f-name">CERRADO =</span>
          <span class="f-part"><i>🌾</i><b>gramíneas</b></span><span class="op">+</span>
          <span class="f-part"><i>🌿</i><b>arbustos</b></span><span class="op">+</span>
          <span class="f-part"><i>🌳</i><b>árvores<br>retorcidas</b></span></div>
        <div class="warn"><span class="emo">🚫🌱</span><div><b>SOJA NÃO É VEGETAÇÃO NATURAL</b><p>A soja é uma <b>plantação</b>. Foram as pessoas que plantaram.</p></div></div>
        <div class="pins"><span class="pin">📍 Centro-Oeste</span><span class="pin">🌦️ verão chuvoso · inverno seco</span></div></section>`;
      $$('.hot', body).forEach(hs => hs.onclick = () => {
        const was = hs.classList.contains('open'); $$('.hot', body).forEach(x => x.classList.remove('open')); if (!was) hs.classList.add('open'); $$('.hot', body).forEach(x => $('button', x).setAttribute('aria-expanded', x.classList.contains('open'))); fx.tap(); const t = HOTS[hs.dataset.i][3]; if (hs.classList.contains('open')) say(t);
        opened.add(hs.dataset.i); if (opened.size === 4) EA.act('act_hot', '🌳 Você achou as 4 partes do Cerrado');
      });
    } else if (tab === 'pan') {
      body.innerHTML = `<section class="section" style="margin-top:14px">
        <div class="photo"><img loading="lazy" decoding="async" src="img/pantanal.webp" width="960" height="720" alt="Pantanal na época da cheia, com água cobrindo a planície">
          <div class="ph-title"><div><h3>Pantanal</h3><p>Época da cheia: a água cobre a planície</p></div>${sayBtn('Pantanal: planície com alagamentos periódicos.', 'light')}</div></div>
        <p class="credit">Foto: Wikimedia Commons</p>
        <div class="key-eq"><div class="n">PANTANAL =</div><div class="eq"><span>〰️ PLANÍCIE</span><b>+</b><span>💧 ALAGAMENTOS</span></div></div>
        <div class="section-h" style="margin-top:22px"><h2>A água sobe e desce</h2><button class="say" id="play" style="padding:0 16px">▶ Ver</button></div>
        <div class="flood"><div class="phase"><span data-p="0" class="on">SECA</span><span data-p="1">CHEIA</span><span data-p="2">SECA</span></div>
          <svg viewBox="0 0 360 200"><defs><linearGradient id="fs" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:var(--illu-sky-3)"/><stop offset="1" style="stop-color:var(--illu-sky-4)"/></linearGradient></defs>
          <rect width="360" height="200" fill="url(#fs)"/><circle cx="310" cy="46" r="18" style="fill:var(--illu-sun)"/>
          <g style="fill:var(--illu-foliage)"><ellipse cx="40" cy="118" rx="26" ry="18"/><ellipse cx="80" cy="112" rx="20" ry="16"/><ellipse cx="250" cy="116" rx="24" ry="17"/><ellipse cx="290" cy="120" rx="18" ry="13"/></g>
          <g style="stroke:var(--illu-trunk)" stroke-width="4"><path d="M40 136v14M80 128v22M250 133v17M290 133v17"/></g>
          <path d="M0 150 L360 150 L360 200 L0 200Z" style="fill:var(--illu-grass-1)"/><path d="M150 150 q30 10 60 0 L210 200 L150 200Z" style="fill:var(--illu-water)"/>
          <g id="water" style="transition:transform 1.4s cubic-bezier(.4,0,.2,1);transform:translateY(46px)"><rect x="0" y="136" width="360" height="70" style="fill:var(--illu-water)" opacity=".78"/><path d="M0 136 q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" style="stroke:var(--paper-0)" stroke-width="2" opacity=".6"/></g>
          <text x="180" y="190" font-family="Lexend" font-weight="800" font-size="12" style="fill:var(--paper-0)" text-anchor="middle" letter-spacing="2">PLANÍCIE</text></svg></div>
        <div class="pins"><span class="pin">📍 Mato Grosso</span><span class="pin">📍 Mato Grosso do Sul</span></div>
        <div class="warn"><span class="emo">❌</span><div><b>O Pantanal NÃO fica na Amazônia</b><p>Ele fica no <b>Centro-Oeste</b>: MT + MS.</p></div></div></section>`;
      const water = $('#water', body), ph = $$('.phase span', body);
      const set = (p) => { ph.forEach((s, i) => s.classList.toggle('on', i === p)); water.style.transform = `translateY(${p === 1 ? 0 : 46}px)`; };
      $('#play', body).onclick = async () => {
        fx.tap(); say('Na seca, a água fica nos rios. Na cheia, a água cobre a planície. Depois volta a secar.');
        set(0); await sleep(1400); set(1); fx.tap(); await sleep(2600); set(2); await sleep(600); EA.act('act_flood', '💧 Seca → cheia → seca');
      };
    } else {
      body.innerHTML = `<section class="section" style="margin-top:14px">
        <div class="vs">
          <div class="col c-cer"><h4>🌳 CERRADO</h4><p class="loc">vegetação</p><ul><li><i>🌾</i>gramíneas</li><li><i>🌿</i>arbustos</li><li><i>🌳</i>árvores retorcidas</li></ul><img loading="lazy" decoding="async" src="img/cerrado.webp" width="960" height="720" alt=""></div>
          <div class="col c-pan"><h4>💧 PANTANAL</h4><p class="loc">MT + MS</p><ul><li><i>〰️</i>planície</li><li><i>💧</i>alagamentos</li><li><i>🔁</i>seca e cheia</li></ul><img loading="lazy" decoding="async" src="img/pantanal.webp" width="960" height="720" alt=""></div>
        </div>
        <div class="section-h" style="margin-top:22px"><h2>📸 O que você está vendo?</h2></div><div class="photoquiz"></div></section>`;
      const PQ = [
        { id: 'pq1', t: 'bio', p: 'Que paisagem é esta?', img: 'img/pantanal.webp', o: ['Pantanal', 'Cerrado', 'Caatinga'], r: ['💧 Água cobrindo a planície = PANTANAL'] },
        { id: 'pq2', t: 'bio', p: 'Que vegetação é esta?', img: 'img/cerrado.webp', o: ['Cerrado', 'Mata Atlântica', 'Pantanal'], r: ['🌳 Árvores retorcidas + capim = CERRADO'] },
        { id: 'pq3', t: 'bio', p: 'Isto é vegetação natural?', img: 'img/soja2.webp', o: ['Não. É uma plantação de soja', 'Sim, é o Cerrado', 'Sim, é o Pantanal'], r: ['🚜 Máquina colhendo = PLANTAÇÃO', '⚠️ Soja não é vegetação natural'] },
      ];
      EA.Quiz($('.photoquiz', body), PQ, { label: 'Toque na imagem' });
    }
  }
  $$('.seg button', el).forEach(b => b.onclick = () => { tab = b.dataset.t; fx.tap(); draw(); });
  draw();
  el.append(EA.quizBlock(['bio'], 4));
};

V.campo = (el) => {
  EA.ctx.reset({ screen: 'campo', title: 'Campo e cidade', concept: 'exodo' });
  let tab = 'ex';
  el.append(h(`<div>
    <p class="eyebrow">Missão 4 · Economia</p>
    <h1 class="screen-title">Campo e cidade</h1>
    <p class="lead">Máquinas, fábricas e pessoas mudando de lugar.</p>
    <div class="seg"><button data-t="ex" class="on">🚶 Êxodo rural</button><button data-t="ag">🏭 Agroindústria</button></div>
    <div class="tab-body"></div></div>`));
  const body = $('.tab-body', el);
  function draw() {
    $$('.seg button', el).forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    EA.ctx.set({ concept: tab === 'ex' ? 'exodo' : 'agroindustria', title: tab === 'ex' ? 'Mecanização e êxodo rural' : 'Agroindústria' });
    if (tab === 'ex') {
      const STEPS = [['🚜', 'Mais máquinas no campo'], ['👨‍🌾', 'Menos trabalho manual'], ['🚶', 'Trabalhadores vão para a cidade'], ['🏙️', 'As cidades crescem']];
      body.innerHTML = `<section class="section" style="margin-top:14px">
        <div class="photo"><img loading="lazy" decoding="async" src="img/soja2.webp" width="960" height="720" alt="Colheitadeira colhendo soja"><div class="ph-title"><div><h3>🌱 Soja</h3><p>Principal cultivo · colhida por máquinas</p></div>${sayBtn('A soja é o principal cultivo do Centro-Oeste. Ela é colhida por máquinas.', 'light')}</div></div>
        <p class="credit">Foto: Wikimedia Commons</p>
        <div class="pins"><span class="pin">🌽 milho</span><span class="pin">☁️ algodão</span><span class="pin">🐄 bovinos</span><span class="pin">🐖 suínos</span><span class="pin">🐔 aves</span></div>
        <div class="scene"><svg viewBox="0 0 360 190" id="sc">
          <defs><linearGradient id="sk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:var(--illu-sky-3)"/><stop offset="1" style="stop-color:var(--illu-sky-5)"/></linearGradient></defs>
          <rect width="360" height="190" fill="url(#sk)"/><rect y="140" width="360" height="50" style="fill:var(--illu-grass-2)"/><rect y="150" width="360" height="10" style="fill:var(--illu-soil)"/>
          <g><rect x="18" y="98" width="46" height="42" style="fill:var(--illu-barn-1)"/><path d="M14 100 L41 78 L68 100Z" style="fill:var(--illu-barn-2)"/><rect x="34" y="116" width="14" height="24" style="fill:var(--paper-0)" opacity=".8"/></g>
          <g style="stroke:var(--illu-grass-3)" stroke-width="3"><path d="M72 128h60M72 134h60M72 122h60"/></g>
          <text id="trac" x="92" y="120" font-size="26" style="transition:transform 1.2s" opacity="0">🚜</text>
          <g id="farmers"><text x="70" y="146" font-size="20">👨‍🌾</text><text x="100" y="146" font-size="20">👩‍🌾</text><text x="128" y="146" font-size="20">👨‍🌾</text></g>
          <g id="city" style="transform-origin:300px 140px;transition:transform 1.4s cubic-bezier(.2,.8,.2,1);transform:scaleY(.55)">
            <rect x="244" y="80" width="26" height="60" style="fill:var(--illu-city-1)"/><rect x="274" y="56" width="30" height="84" style="fill:var(--illu-city-2)"/><rect x="308" y="90" width="22" height="50" style="fill:var(--illu-city-3)"/><rect x="332" y="70" width="22" height="70" style="fill:var(--illu-city-4)"/>
            <g style="fill:var(--illu-sun-soft)"><rect x="250" y="88" width="5" height="6"/><rect x="259" y="100" width="5" height="6"/><rect x="281" y="66" width="5" height="6"/><rect x="292" y="80" width="5" height="6"/><rect x="281" y="96" width="5" height="6"/><rect x="338" y="80" width="5" height="6"/><rect x="314" y="100" width="5" height="6"/></g></g>
          <text id="walker" x="150" y="168" font-size="22" style="transition:transform 2.2s cubic-bezier(.4,0,.2,1)" opacity="0">🚶</text>
          <g font-family="Lexend" font-weight="800" font-size="11" style="fill:var(--color-brand-primary)" letter-spacing="1.5"><text x="30" y="30">CAMPO</text><text x="276" y="30">CIDADE</text></g>
        </svg></div>
        <div class="chain">${STEPS.map((s, i) => `${i ? `<div class="arrow" data-a="${i}">↓</div>` : ''}<div class="step" data-i="${i}"><span class="e">${s[0]}</span><b>${s[1]}</b></div>`).join('')}</div>
        <button class="btn btn-primary" id="play" style="margin-top:14px">▶ Ver a sequência</button>
        <div class="exodo-def"><p class="t">ÊXODO RURAL</p><p>Saída de pessoas do campo para a cidade.</p><div class="flow"><span>🌾 campo</span>→<span>🏙️ cidade</span></div>${sayBtn('Êxodo rural é a saída de pessoas do campo para a cidade.', 'light')}</div></section>`;
      const sc = $('#sc', body);
      const setStep = (n) => {
        $$('.step', body).forEach((s, i) => s.classList.toggle('on', i <= n));
        $$('.arrow', body).forEach(a => a.classList.toggle('on', +a.dataset.a <= n));
        $('#trac', sc).setAttribute('opacity', n >= 0 ? 1 : 0); $('#trac', sc).style.transform = n >= 0 ? 'translateX(20px)' : '';
        $$('#farmers text', sc).forEach((f, i) => f.setAttribute('opacity', n >= 1 && i > 0 ? .15 : 1));
        const w = $('#walker', sc); w.setAttribute('opacity', n >= 2 ? 1 : 0); w.style.transform = n >= 2 ? 'translateX(80px)' : '';
        $('#city', sc).style.transform = n >= 3 ? 'scaleY(1)' : 'scaleY(.55)';
      };
      setStep(-1);
      $('#play', body).onclick = async (e) => {
        const b = e.currentTarget; b.disabled = true; fx.tap(); setStep(-1);
        say('Mais máquinas no campo. Menos trabalho manual. Os trabalhadores vão para a cidade. E as cidades crescem.');
        for (let i = 0; i < 4; i++) { await sleep(i ? 1700 : 300); setStep(i); fx.tap(); }
        await sleep(900); fx.done(); EA.act('act_chain', '🚶 Êxodo rural: campo → cidade'); b.disabled = false; b.textContent = '↻ Ver de novo';
      };
    } else {
      const PAIRS = [['soja', '🌱', 'Soja', 'oleo', '🫗', 'Óleo'], ['leite', '🥛', 'Leite', 'queijo', '🧀', 'Queijo'], ['carne', '🥩', 'Carne', 'hamb', '🍔', 'Hambúrguer']];
      body.innerHTML = `<section class="section" style="margin-top:14px">
        <div class="machine"><p class="eyebrow">Máquina de transformação</p>
          <div class="machine-line"><div class="slot" id="in"><span class="muted">do campo</span></div>
            <div class="factory" id="fac"><div class="belt"></div><span class="gear">⚙️</span><small>FÁBRICA</small></div>
            <div class="slot" id="out"><span class="muted">produto</span></div></div>
          <div class="inputs">${PAIRS.map(p => `<button data-k="${p[0]}"><i>${p[1]}</i>${p[2]}</button>`).join('')}</div></div>
        <div class="agro-key"><span>🏭 <b>AGROINDÚSTRIA</b> transforma produtos da agricultura e da pecuária.</span>${sayBtn('Agroindústria transforma produtos da agricultura e da pecuária. A soja vira óleo. O leite vira queijo.')}</div>
        <div class="section-h" style="margin-top:22px"><h2>🎮 Leve até a fábrica</h2><span class="muted">Arraste ou toque</span></div>
        <div class="dnd"></div></section>`;
      $$('.inputs button', body).forEach(b => b.onclick = async () => {
        const p = PAIRS.find(x => x[0] === b.dataset.k), fac = $('#fac', body);
        fx.tap(); $('#in', body).innerHTML = `<span class="fly-in"><span class="e">${p[1]}</span><br>${p[2]}</span>`; $('#out', body).innerHTML = '<span class="muted">…</span>';
        fac.classList.add('run'); await sleep(1100); fac.classList.remove('run');
        $('#out', body).innerHTML = `<span class="fly-in"><span class="e">${p[4]}</span><br>${p[5]}</span>`; fx.ok(); b.classList.add('done'); say(`${p[2]} vira ${p[5]}.`);
      });
      DnD($('.dnd', body), PAIRS);
    }
  }
  $$('.seg button', el).forEach(b => b.onclick = () => { tab = b.dataset.t; fx.tap(); draw(); });
  draw();
  el.append(EA.quizBlock(['campo'], 4));
};
function DnD(el, PAIRS) {
  let placed = 0, picked = null;
  el.innerHTML = `<div class="dnd-row"><div class="dnd-col">${shuffle(PAIRS).map(p => `<div class="drag" data-k="${p[0]}"><i>${p[1]}</i>${p[2]}</div>`).join('')}</div>
    <div class="dnd-col">${shuffle(PAIRS).map(p => `<div class="drop" data-k="${p[0]}"><i>${p[4]}</i>${p[5]}</div>`).join('')}</div></div>`;
  const tryDrop = (drag, drop) => {
    if (!drop || drop.classList.contains('filled')) return false;
    if (drop.dataset.k === drag.dataset.k) {
      const p = PAIRS.find(x => x[0] === drag.dataset.k);
      drop.classList.add('filled', 'pop'); drop.innerHTML = `<i>${p[1]}</i>→<i>${p[4]}</i>${p[5]}`; drag.classList.add('placed'); fx.ok(); placed++;
      if (placed === PAIRS.length) { fx.done(); EA.act('act_dnd', '🏭 Agroindústria dominada'); say('Muito bem. Agroindústria transforma produtos do campo.'); }
      return true;
    }
    drop.classList.remove('no'); void drop.offsetWidth; drop.classList.add('no'); fx.err(); toast('Tente outra fábrica'); return false;
  };
  $$('.drag', el).forEach(d => {
    let ghost = null, sx, sy, moved = false, ox, oy;
    d.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; moved = false; const r = d.getBoundingClientRect(); ox = sx - r.left; oy = sy - r.top; d.setPointerCapture(e.pointerId); });
    d.addEventListener('pointermove', (e) => {
      if (sx == null) return;
      if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
        moved = true; const r = d.getBoundingClientRect(); ghost = d.cloneNode(true); ghost.classList.add('dragging'); ghost.style.width = r.width + 'px'; document.body.append(ghost);
      }
      if (ghost) {
        ghost.style.left = (e.clientX - ox) + 'px'; ghost.style.top = (e.clientY - oy) + 'px';
        const t = document.elementFromPoint(e.clientX, e.clientY); $$('.drop', el).forEach(x => x.classList.toggle('over', x === (t && t.closest('.drop'))));
      }
    });
    const end = (e) => {
      if (sx == null) return;
      if (ghost) { const t = document.elementFromPoint(e.clientX, e.clientY); ghost.remove(); ghost = null; $$('.drop', el).forEach(x => x.classList.remove('over')); tryDrop(d, t && t.closest('.drop')); }
      else { $$('.drag', el).forEach(x => x.classList.remove('picked')); picked = d; d.classList.add('picked'); fx.tap(); }
      sx = null;
    };
    d.addEventListener('pointerup', end); d.addEventListener('pointercancel', () => { if (ghost) ghost.remove(); ghost = null; sx = null; });
  });
  $$('.drop', el).forEach(dr => dr.addEventListener('click', () => { if (picked) { if (tryDrop(picked, dr)) picked = null; else picked.classList.add('picked'); } }));
}

V.nordeste = (el) => {
  EA.ctx.reset({ screen: 'nordeste', title: 'Nordeste', concept: 'nordeste' });
  let tab = 'st';
  el.append(h(`<div>
    <p class="eyebrow">Missão 5 · Agora viajamos para o Nordeste</p>
    <h1 class="screen-title">Nordeste</h1>
    <p class="lead">9 estados. 4 sub-regiões.</p>
    <div class="seg"><button data-t="st" class="on">📍 9 estados</button><button data-t="zn">🎨 4 sub-regiões</button></div>
    <div class="tab-body"></div></div>`));
  const body = $('.tab-body', el);
  const ZONES = {
    zm: { n: 'Zona da Mata', e: '🌊', c: 'var(--zm)', img: 'img/zonamata.webp', w: 'Litoral · perto do mar', facts: [['🌦️', 'CLIMA', 'Tropical litorâneo: quente e úmido', 'clima'], ['🌳', 'VEGETAÇÃO', 'Mata Atlântica', 'veg'], ['🎋', 'ECONOMIA', 'Cana-de-açúcar, desde a colônia', 'eco']], say: 'Zona da Mata: fica no litoral. Clima quente e úmido. Mata Atlântica. E cana-de-açúcar, desde a época colonial.' },
    ag: { n: 'Agreste', e: '🌾', c: 'var(--ag)', img: 'img/agreste.webp', w: 'Entre a Zona da Mata e o Sertão', facts: [['🔀', 'TRANSIÇÃO', 'Do úmido para o seco', 'eco'], ['🌦️', 'CLIMA', 'Um pouco úmido, um pouco seco', 'clima'], ['🐄', 'ECONOMIA', 'Pequenas lavouras e pecuária', 'eco']], say: 'Agreste: é a transição entre a Zona da Mata e o Sertão.' },
    se: { n: 'Sertão', e: '☀️', c: 'var(--st)', img: 'img/sertao.webp', w: 'Interior', facts: [['🌡️', 'CLIMA', 'Semiárido: chuvas irregulares', 'clima'], ['🌵', 'VEGETAÇÃO', 'Caatinga', 'veg'], ['🐐', 'ECONOMIA', 'Criação de animais', 'eco']], say: 'Sertão: fica no interior. Clima semiárido, com chuvas irregulares. A vegetação é a Caatinga.' },
    mn: { n: 'Meio-Norte', e: '🌴', c: 'var(--mn)', img: 'img/meionorte.webp', w: 'Oeste · principalmente Maranhão e Piauí', facts: [['🔀', 'TRANSIÇÃO', 'Entre a Amazônia e o Sertão', 'eco'], ['🌴', 'VEGETAÇÃO', 'Mata dos Cocais (babaçu)', 'veg'], ['💧', 'CLIMA', 'Mais úmido que o Sertão', 'clima']], say: 'Meio-Norte: fica no oeste do Nordeste, principalmente no Maranhão e no Piauí. É uma região de transição.' },
  };
  const FBG = { clima: 'var(--clima-bg)', veg: 'var(--veg-bg)', eco: 'var(--illu-eco-bg)' };
  function draw() {
    $$('.seg button', el).forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    EA.ctx.set({ concept: tab === 'st' ? 'nordeste' : 'subregioes', title: tab === 'st' ? 'Os 9 estados do Nordeste' : 'As 4 sub-regiões do Nordeste' });
    if (tab === 'st') {
      let order = shuffle(G.ne.states.map(s => s.s)), found = new Set();
      body.innerHTML = `<section class="section" style="margin-top:14px">
        <div class="challenge" style="margin-top:0"><div class="q"><small>Toque no mapa</small><span id="target"></span></div><span class="count">0/9</span></div>
        <div class="map-wrap"><div class="svg-host">${neSVG('st')}</div></div>
        <div class="found-list">${G.ne.states.map(s => `<span data-f="${s.s}">${s.s} · ${s.n}</span>`).join('')}</div></section>`;
      const tgt = $('#target', body);
      const next = () => {
        if (!order.length) { tgt.textContent = 'Os 9 estados! 🏆'; fx.done(); EA.act('act_ne9', '🌊 Você achou os 9 estados do Nordeste'); say('Maranhão, Piauí, Ceará, Rio Grande do Norte, Paraíba, Pernambuco, Alagoas, Sergipe e Bahia.'); return; }
        const s = G.ne.states.find(x => x.s === order[0]); tgt.textContent = s.n; say(s.n);
      };
      $$('.st', body).forEach(p => p.onclick = () => {
        const s = G.ne.states.find(x => x.s === p.dataset.s);
        if (!order.length) { say(s.n); return; }
        if (p.dataset.s === order[0]) {
          order.shift(); found.add(s.s); fx.ok(); p.style.fill = 'var(--learn-map-correct)'; p.classList.add('sel');
          $(`[data-f="${s.s}"]`, body).classList.add('lit'); $('.count', body).textContent = found.size + '/9'; setTimeout(next, 500);
        } else { fx.err(); toast(`Esse é ${s.n} (${s.s})`); $('.map-wrap', body).classList.add('shake'); setTimeout(() => $('.map-wrap', body).classList.remove('shake'), 450); }
      });
      next();
    } else {
      body.innerHTML = `<section class="section" style="margin-top:14px">
        <div class="map-wrap" style="background:linear-gradient(180deg,var(--learn-ocean),var(--learn-ocean-2))"><span class="ocean-lbl">MAR</span><div class="svg-host">${neSVG('zones')}</div></div>
        <div class="zone-legend">${Object.entries(ZONES).map(([k, z]) => `<button data-z="${k}"><span class="sw" style="background:${z.c}"></span>${z.e} ${z.n}</button>`).join('')}</div>
        <button class="btn btn-dark" id="tour" style="margin-top:12px">▶ Do mar para o interior</button>
        <div class="strip">${[['🌊', 'MAR', 'var(--illu-water)'], ['🌳', 'ZONA DA MATA', 'var(--zm)'], ['🌾', 'AGRESTE', 'var(--ag)'], ['☀️', 'SERTÃO', 'var(--st)']].map((s, i) => `<div data-si="${i}" style="background:${s[2]};${i === 2 ? 'color:var(--color-brand-primary)' : ''}"><i>${s[0]}</i>${s[1]}</div>`).join('')}</div>
        <p class="muted center" style="margin-top:6px">e mais a oeste: 🌴 <b>Meio-Norte</b></p>
        <div class="agreste-key"><b>AGRESTE = TRANSIÇÃO</b><div class="between"><span style="background:var(--zm)">ZONA DA MATA</span>← 🌾 →<span style="background:var(--st)">SERTÃO</span></div></div>
        <div class="zone-host"></div></section>`;
      const zoneHost = $('.zone-host', body), seen = new Set();
      const focus = (k, speak = true) => {
        $$('.zone', body).forEach(z => z.classList.toggle('dim', k && z.dataset.z !== k));
        $$('.zone-legend button', body).forEach(b => b.classList.toggle('on', b.dataset.z === k));
        if (!k) { zoneHost.innerHTML = ''; return; }
        const z = ZONES[k]; seen.add(k); EA.ctx.set({ concept: ({ zm: 'zona-da-mata', ag: 'agreste', se: 'sertao', mn: 'meio-norte' })[k], title: 'Sub-região: ' + z.n }); if (seen.size === 4) EA.act('act_zones', '🗺️ Você conheceu as 4 sub-regiões');
        zoneHost.innerHTML = `<article class="zone-card"><img loading="lazy" decoding="async" width="960" height="640" src="${z.img}" alt="Paisagem: ${z.n}"><div class="zc-body">
          <div class="zc-head"><span class="sw" style="width:14px;height:44px;border-radius:6px;background:${z.c}"></span><div><h3>${z.e} ${z.n}</h3><p class="where">📍 ${z.w}</p></div>${sayBtn(z.say)}</div>
          <div class="facts">${z.facts.map(f => `<div class="fact" style="background:${FBG[f[3]]}"><i>${f[0]}</i><div><small>${f[1]}</small>${f[2]}</div></div>`).join('')}</div>
          ${k === 'zm' ? `<p class="muted" style="margin-top:12px;font-weight:600">🌊 litoral → 💧 umidade → 🌳 Mata Atlântica → 🎋 cana</p>` : ''}
          <p class="credit">Foto: Wikimedia Commons</p></div></article>`;
        if (speak) say(z.say);
      };
      $$('.zone', body).forEach(z => z.onclick = () => { fx.tap(); focus(z.dataset.z); });
      $$('.zone-legend button', body).forEach(b => b.onclick = () => { fx.tap(); focus(b.dataset.z); });
      $('#tour', body).onclick = async (e) => {
        const b = e.currentTarget; b.disabled = true; zoneHost.innerHTML = '';
        say('Do mar para o interior: Zona da Mata, Agreste e Sertão. Mais a oeste, o Meio-Norte.');
        const strip = $$('.strip div', body);
        for (const [i, k] of [[0, null], [1, 'zm'], [2, 'ag'], [3, 'se'], [4, 'mn']]) {
          strip.forEach((s, j) => s.classList.toggle('dim', j !== i && i < 4));
          $$('.zone', body).forEach(z => z.classList.toggle('dim', k ? z.dataset.z !== k : true));
          fx.tap(); await sleep(1300);
        }
        strip.forEach(s => s.classList.remove('dim')); $$('.zone', body).forEach(z => z.classList.remove('dim')); b.disabled = false; b.textContent = '↻ Ver de novo';
      };
    }
  }
  $$('.seg button', el).forEach(b => b.onclick = () => { tab = b.dataset.t; fx.tap(); draw(); });
  draw();
  el.append(EA.quizBlock(['ne'], 4));
};

V.revisao = (el) => {
  EA.ctx.reset({ screen: 'revisao', title: 'Revisão rápida', concept: null });
  const due = Q.filter(q => ST().wrong[q.id]).sort((a, b) => ST().wrong[a.id] - ST().wrong[b.id]);
  const rest = shuffle(Q.filter(q => !ST().wrong[q.id] && !ST().correct[q.id])).concat(shuffle(Q.filter(q => ST().correct[q.id])));
  const qs = due.concat(rest).slice(0, Math.max(6, Math.min(due.length, 10)));
  el.append(h(`<div><p class="eyebrow">🧠 Revisão rápida</p><h1 class="screen-title">${due.length ? 'Primeiro, o que você errou' : 'Vamos treinar a memória'}</h1>
    <p class="lead">${due.length ? `${due.length} ${due.length > 1 ? 'assuntos voltaram' : 'assunto voltou'} para você fixar.` : 'Perguntas curtas, respostas rápidas.'}</p><div class="quiz"></div></div>`));
  EA.Quiz($('.quiz', el), qs, { label: 'Revisão' });
};
V.simulado = (el) => {
  EA.ctx.reset({ screen: 'simulado', title: 'Simulado', concept: null, exam: true });
  const pick = []; const byT = Object.keys(TOPICS).map(k => shuffle(Q.filter(q => q.t === k)));
  while (pick.length < 10) for (const l of byT) if (l.length && pick.length < 10) pick.push(l.shift());
  el.append(h(`<div><p class="eyebrow">🎯 Simulado</p><h1 class="screen-title">Prova de 10 questões</h1>
    <p class="lead">Sem dicas. No final você vê a nota.</p><div class="quiz"></div></div>`));
  EA.Quiz($('.quiz', el), shuffle(pick), { mode: 'exam' });
};


EA.registerPack({
  id: ID, version: 1, status: 'active',
  owner_profile_ids: ['joao'],
  icon: '🌎', subject: 'Geografia', title: 'Missão Brasil', subtitle: 'Centro-Oeste + Nordeste',
  education_level: '5º ano do Ensino Fundamental', goal: 'Prova escolar', exam_name: 'Prova de Geografia', exam_date: null,
  color: 'var(--learn-region-co)', cover: 'img/cerrado.webp',
  sources: [
    { type: 'pdf', name: 'Cartilha de Geografia — Centro-Oeste + Nordeste' },
    { type: 'image', name: 'Mapa: Brasil — regiões e estados' },
    { type: 'image', name: 'Mapa: Nordeste — estados e sub-regiões' },
    { type: 'notes', name: 'Erros observados no estudo (Pantanal × Amazônia, Cerrado × soja, clima × relevo…)' },
  ],
  common_mistakes: ['Pantanal fica na Amazônia', 'Cerrado é soja', 'Mata Atlântica é vegetação do Cerrado', 'Verão e inverno são relevo', 'Brasília é o quarto estado do Centro-Oeste', 'Agreste fica entre Zona da Mata e Meio-Norte', 'Xingu fica na Região Norte'],
  tutor_context: 'Caderno de Geografia sobre as regiões Centro-Oeste e Nordeste do Brasil: localização, clima, relevo, vegetação (Cerrado, Pantanal), economia (soja, agroindústria, êxodo rural) e as quatro sub-regiões do Nordeste.',
  topics: TOPICS, badges: BADGES, questions: Q, concepts: CONCEPTS,
  tabs: [['home', 'book', 'Caderno'], ['mapa', 'map', 'Mapa'], ['conceitos', 'compass', 'Conceitos'], ['biomas', 'leaf', 'Biomas'], ['campo', 'field', 'Campo'], ['nordeste', 'waves', 'Nordeste']],
  screens: V,
});
})();
