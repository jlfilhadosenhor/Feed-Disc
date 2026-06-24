/**
 * AeroPulse DISC Assessment Engine
 * Contains the questionnaire data, calculations, and profile interpretation mappings.
 */

const DISC_QUESTOES = [
  {
    id: 1,
    pergunta: "Em reuniões operacionais de alta pressão, meu comportamento principal é:",
    opcoes: [
      { tipo: 'D', texto: "Focar direto nos resultados e propor soluções imediatas e pragmáticas." },
      { tipo: 'I', texto: "Animar a equipe, garantindo que todos continuem motivados e otimistas." },
      { tipo: 'S', texto: "Manter a calma, ouvir a todos e buscar um consenso seguro." },
      { tipo: 'C', texto: "Analisar os dados disponíveis e verificar se a solução cumpre todos os manuais." }
    ]
  },
  {
    id: 2,
    pergunta: "Quando sou confrontado com uma nova regra ou protocolo operacional:",
    opcoes: [
      { tipo: 'C', texto: "Estudo minuciosamente os detalhes técnicos para entender a lógica e conformidade." },
      { tipo: 'D', texto: "Avalio se a mudança vai acelerar ou atrasar os processos práticos." },
      { tipo: 'S', texto: "Aceito de forma colaborativa e ajudo a equipe a se adaptar sem conflitos." },
      { tipo: 'I', texto: "Busco entender como isso afeta a experiência dos passageiros e da equipe." }
    ]
  },
  {
    id: 3,
    pergunta: "Meu ritmo de trabalho ideal é caracterizado por:",
    opcoes: [
      { tipo: 'D', texto: "Rápido, dinâmico e focado em vencer desafios e metas agressivas." },
      { tipo: 'I', texto: "Interativo, cercado de conversas e trocas constantes de ideias." },
      { tipo: 'S', texto: "Estável, previsível, seguindo um cronograma planejado e sem sobressaltos." },
      { tipo: 'C', texto: "Preciso, detalhado, priorizando a qualidade e a exatidão das tarefas." }
    ]
  },
  {
    id: 4,
    pergunta: "Diante de um erro crítico cometido por outro colega de equipe:",
    opcoes: [
      { tipo: 'I', texto: "Converso de forma descontraída para aliviar o peso e incentivo a melhora." },
      { tipo: 'D', texto: "Aponto o erro diretamente e peço uma correção imediata para não atrasar a operação." },
      { tipo: 'S', texto: "Ofereço ajuda imediata para corrigir o erro juntos de forma paciente." },
      { tipo: 'C', texto: "Verifico em qual norma o erro ocorreu e documento a falha para auditoria." }
    ]
  },
  {
    id: 5,
    pergunta: "O que mais me motiva no ambiente de trabalho é:",
    opcoes: [
      { tipo: 'D', texto: "Autonomia, poder de decisão e reconhecimento pelos resultados entregues." },
      { tipo: 'I', texto: "Um ambiente socialmente dinâmico, elogios públicos e influência na equipe." },
      { tipo: 'S', texto: "Segurança de longo prazo, lealdade do grupo e ambiente harmônico." },
      { tipo: 'C', texto: "Processos bem definidos, ferramentas eficientes e garantia de alta qualidade técnica." }
    ]
  },
  {
    id: 6,
    pergunta: "Se um voo ou operação atrasa e os passageiros começam a reclamar:",
    opcoes: [
      { tipo: 'I', texto: "Uso minha simpatia e comunicação para acalmar os ânimos e gerar empatia." },
      { tipo: 'D', texto: "Assumo o comando da situação, distribuo tarefas e busco alternativas rápidas." },
      { tipo: 'S', texto: "Sigo o plano de contingência passo a passo de forma calma e constante." },
      { tipo: 'C', texto: "Busco a informação oficial detalhada para repassar dados precisos aos clientes." }
    ]
  },
  {
    id: 7,
    pergunta: "Nas conversas do dia a dia, costumo ser percebido como alguém que:",
    opcoes: [
      { tipo: 'D', texto: "Fala de forma direta, assertiva e vai direto ao ponto sem rodeios." },
      { tipo: 'I', texto: "Fala com entusiasmo, usa gestos e conta histórias envolventes." },
      { tipo: 'S', texto: "Ouve mais do que fala, demonstra empatia e responde calmamente." },
      { tipo: 'C', texto: "Fala de forma ponderada, baseando-se em fatos reais e termos precisos." }
    ]
  },
  {
    id: 8,
    pergunta: "Em relação a metas de performance:",
    opcoes: [
      { tipo: 'D', texto: "Gosto de metas difíceis, pois o desafio me impulsiona a superar limites." },
      { tipo: 'I', texto: "Gosto de metas compartilhadas onde posso engajar outros a baterem juntos." },
      { tipo: 'S', texto: "Prefiro metas claras, estáveis e atingíveis com esforço contínuo." },
      { tipo: 'C', texto: "Prefiro metas detalhadas em indicadores matemáticos que eu possa auditar." }
    ]
  },
  {
    id: 9,
    pergunta: "Minha maior fraqueza sob estresse agudo costuma ser:",
    opcoes: [
      { tipo: 'D', texto: "Tornar-me impaciente, ríspido ou excessivamente autoritário." },
      { tipo: 'I', texto: "Perder o foco operacional em detalhes importantes e me dispersar conversando." },
      { tipo: 'S', texto: "Demonstrar passividade ou hesitar na tomada de decisões urgentes." },
      { tipo: 'C', texto: "Ficar preso em detalhes excessivos (paralisia por análise) ou teimosia técnica." }
    ]
  },
  {
    id: 10,
    pergunta: "Quando trabalho em equipe, eu agrego mais valor:",
    opcoes: [
      { tipo: 'D', texto: "Garantindo que o projeto ande rápido e vença os obstáculos." },
      { tipo: 'I', texto: "Promovendo a união, resolvendo conflitos interpessoais e mantendo a energia alta." },
      { tipo: 'S', texto: "Oferecendo suporte constante, organização e confiabilidade nas entregas rotineiras." },
      { tipo: 'C', texto: "Revisando os dados, checando a qualidade e prevenindo falhas críticas no processo." }
    ]
  }
];

const DISC_INTERPRETACOES = {
  'D': {
    nome: 'Executor (Dominância)',
    cor: '#f43f5e', // Rose/Red
    descricao: "Profissionais com alta dominância são focados em resultados, decididos e competitivos. Eles adoram resolver problemas complexos e assumir o controle em situações críticas. São movidos por desafios e autonomia.",
    pontos_fortes: ["Tomada de decisão rápida", "Foco em resultados e metas", "Coragem frente a crises operacionais", "Iniciativa e proatividade"],
    pontos_melhoria: ["Impaciência com processos lentos", "Dificuldade em ouvir opiniões divergentes", "Pode parecer ríspido ou autoritário", "Tendência a centralizar tarefas"],
    comunicacao_gestor: "Seja direto, objetivo e vá direto ao ponto. Apresente fatos, dê autonomia de escolha, fale sobre 'o quê' e foque nos resultados imediatos. Evite rodeios e microgerenciamento."
  },
  'I': {
    nome: 'Comunicador (Influência)',
    cor: '#eab308', // Yellow
    descricao: "Profissionais com alta influência são comunicativos, otimistas e orientados a pessoas. Eles têm facilidade para persuadir, engajar equipes e criar conexões emocionais. São essenciais em áreas que demandam empatia e relacionamento com o cliente.",
    pontos_fortes: ["Excelente comunicação e persuasão", "Facilidade para trabalhar em equipe", "Empatia e foco na experiência do cliente", "Capacidade de motivar o grupo"],
    pontos_melhoria: ["Falta de atenção a detalhes burocráticos", "Dificuldade em seguir rotinas muito rígidas", "Necessidade constante de aprovação social", "Tendência a dispersar o foco operacional"],
    comunicacao_gestor: "Demonstre entusiasmo, seja caloroso e informal. Dê espaço para expressarem suas ideias. Reconheça-os publicamente. Fale sobre 'quem' e ajude-os a criar mecanismos de foco e organização."
  },
  'S': {
    nome: 'Planejador (Estabilidade / Steadiness)',
    cor: '#06b6d4', // Cyan/Teal
    descricao: "Profissionais estáveis são cooperativos, leais, pacientes e ótimos ouvintes. Eles preferem ambientes previsíveis e processos consolidados. São a 'âncora' de estabilidade da equipe, garantindo consistência e harmonia operacional.",
    pontos_fortes: ["Lealdade e espírito de equipe", "Trabalho consistente e detalhado", "Paciência e resiliência sob rotina", "Ótima escuta e mediação de conflitos"],
    pontos_melhoria: ["Resistência a mudanças rápidas ou bruscas", "Dificuldade em lidar com confrontos diretos", "Tendência a guardar estresse para si", "Hesitação em assumir riscos imediatos"],
    comunicacao_gestor: "Fale com tom de voz calmo e amigável. Dê previsibilidade sobre mudanças operacionais futuras. Mostre como o trabalho deles apoia a equipe. Dê segurança e evite pressionar por decisões sem aviso prévio."
  },
  'C': {
    nome: 'Analista (Conformidade / Conscientiousness)',
    cor: '#8b5cf6', // Violet
    descricao: "Profissionais com alta conformidade são analíticos, detalhistas, precisos e orientados a normas. Eles buscam a perfeição técnica, seguem regras à risca e odeiam cometer erros. São cruciais para a segurança, compliance e qualidade de processos em ambientes críticos.",
    pontos_fortes: ["Adesão estrita a regras e checklists de segurança", "Precisão e rigor técnico absoluto", "Pensamento lógico e analítico apurado", "Organização e planejamento detalhado"],
    pontos_melhoria: ["Tendência ao perfeccionismo paralisante", "Excesso de formalidade ou distanciamento interpessoal", "Dificuldade em improvisar quando necessário", "Foco excessivo na falha alheia"],
    comunicacao_gestor: "Forneça dados concretos, números e especificações. Baseie suas opiniões em manuais e regulamentos reais. Fale sobre 'como' e dê tempo para que analisem as informações. Seja formal e exato nas instruções."
  }
};

/**
 * Calculates DISC scores from raw question answers
 * @param {Array} respostas Array of types (e.g., ['D', 'C', 'I', 'D'...])
 * @returns {Object} { D: %, I: %, S: %, C: %, perfil: string, interpretacao: object }
 */
function calcularDISC(respostas) {
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  const total = respostas.length;

  if (total === 0) return { D: 25, I: 25, S: 25, C: 25, perfil: 'Equilibrado' };

  respostas.forEach(tipo => {
    if (counts[tipo] !== undefined) counts[tipo]++;
  });

  const D_pct = Math.round((counts.D / total) * 100);
  const I_pct = Math.round((counts.I / total) * 100);
  const S_pct = Math.round((counts.S / total) * 100);
  const C_pct = Math.round((counts.C / total) * 100);

  // Determine dominant profiles
  const profiles = [
    { tipo: 'D', pct: D_pct, nome: 'Executor' },
    { tipo: 'I', pct: I_pct, nome: 'Comunicador' },
    { tipo: 'S', pct: S_pct, nome: 'Planejador' },
    { tipo: 'C', pct: C_pct, nome: 'Analista' }
  ];

  profiles.sort((a, b) => b.pct - a.pct);

  let perfilResult = '';
  // If the top 2 profiles are close (difference <= 10%), make it a joint profile
  if (profiles[0].pct - profiles[1].pct <= 10) {
    perfilResult = `${profiles[0].nome}/${profiles[1].nome}`;
  } else {
    perfilResult = profiles[0].nome;
  }

  return {
    D: D_pct,
    I: I_pct,
    S: S_pct,
    C: C_pct,
    perfil: perfilResult,
    principal: profiles[0].tipo,
    secundario: profiles[1].tipo
  };
}

window.discEngine = {
  questoes: DISC_QUESTOES,
  interpretacoes: DISC_INTERPRETACOES,
  calcular: calcularDISC
};
