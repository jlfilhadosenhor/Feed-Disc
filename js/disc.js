/**
 * AeroPulse DISC Engine
 * 20 questions for both manager profile setup and collaborator assessment.
 * Categories: Dominância (D), Influência (I), Estabilidade (E), Conformidade (C)
 */

// ─── Manager DISC Questions (used on first-run profile setup) ────────────────
const DISC_MANAGER_QUESTIONS = [
  {
    id: 1,
    pergunta: "Quando preciso tomar uma decisão importante sob pressão, costumo:",
    opcoes: [
      { texto: "Decidir rapidamente com base nos resultados esperados", tipo: "D" },
      { texto: "Conversar com a equipe para obter adesão antes de decidir", tipo: "I" },
      { texto: "Considerar como isso afetará cada pessoa envolvida", tipo: "E" },
      { texto: "Levantar todos os dados disponíveis antes de qualquer ação", tipo: "C" }
    ]
  },
  {
    id: 2,
    pergunta: "Minha maior motivação como gestor é:",
    opcoes: [
      { texto: "Alcançar metas desafiadoras e superar expectativas", tipo: "D" },
      { texto: "Inspirar e engajar minha equipe com entusiasmo", tipo: "I" },
      { texto: "Construir um time unido, estável e de confiança mútua", tipo: "E" },
      { texto: "Garantir que tudo seja feito com qualidade e precisão", tipo: "C" }
    ]
  },
  {
    id: 3,
    pergunta: "Em situações de conflito na equipe, minha postura natural é:",
    opcoes: [
      { texto: "Confrontar diretamente o problema e impor uma solução rápida", tipo: "D" },
      { texto: "Usar meu carisma para aliviar a tensão e reengajar todos", tipo: "I" },
      { texto: "Ouvir todas as partes com calma e buscar um meio-termo", tipo: "E" },
      { texto: "Analisar as causas raiz e propor um protocolo de resolução", tipo: "C" }
    ]
  },
  {
    id: 4,
    pergunta: "Ao lançar um novo processo ou mudança na operação, prefiro:",
    opcoes: [
      { texto: "Implementar imediatamente e ajustar no caminho", tipo: "D" },
      { texto: "Criar entusiasmo e convencer a equipe do impacto positivo", tipo: "I" },
      { texto: "Introduzir gradualmente, dando suporte a cada pessoa", tipo: "E" },
      { texto: "Documentar cada etapa, treinar todos e só então implementar", tipo: "C" }
    ]
  },
  {
    id: 5,
    pergunta: "Outros me descrevem como um líder que:",
    opcoes: [
      { texto: "Age com assertividade e foca em resultados acima de tudo", tipo: "D" },
      { texto: "É muito comunicativo, criativo e contagia a todos", tipo: "I" },
      { texto: "É paciente, empático e sempre disponível para ouvir", tipo: "E" },
      { texto: "É criterioso, organizado e exigente com os padrões", tipo: "C" }
    ]
  },
  {
    id: 6,
    pergunta: "Quando algo não sai como o planejado, minha reação inicial é:",
    opcoes: [
      { texto: "Identificar quem é responsável e cobrar uma solução agora", tipo: "D" },
      { texto: "Motivar a equipe a ver como superaremos juntos esse desafio", tipo: "I" },
      { texto: "Verificar como cada pessoa está se sentindo e dar suporte", tipo: "E" },
      { texto: "Analisar o que deu errado para evitar que se repita", tipo: "C" }
    ]
  },
  {
    id: 7,
    pergunta: "Meu estilo de comunicação com a equipe é predominantemente:",
    opcoes: [
      { texto: "Direto, objetivo e focado em ação", tipo: "D" },
      { texto: "Animado, expressivo e inspirador", tipo: "I" },
      { texto: "Cuidadoso, acolhedor e paciente", tipo: "E" },
      { texto: "Estruturado, detalhado e preciso", tipo: "C" }
    ]
  },
  {
    id: 8,
    pergunta: "Para mim, um time de alta performance é aquele que:",
    opcoes: [
      { texto: "Entrega resultados consistentes e supera metas", tipo: "D" },
      { texto: "Tem energia, colabora bem e mantém o moral elevado", tipo: "I" },
      { texto: "É fiel, íntegro e apoia uns aos outros nas dificuldades", tipo: "E" },
      { texto: "Segue processos rigorosos e entrega com excelência técnica", tipo: "C" }
    ]
  },
  {
    id: 9,
    pergunta: "Quando tenho que dar um feedback difícil a alguém, costumo:",
    opcoes: [
      { texto: "Ser direto e objetivo, sem rodeios", tipo: "D" },
      { texto: "Usar exemplos positivos primeiro para depois abordar o problema", tipo: "I" },
      { texto: "Escolher o momento certo, com cuidado, para não magoar", tipo: "E" },
      { texto: "Apresentar dados concretos e exemplos específicos do comportamento", tipo: "C" }
    ]
  },
  {
    id: 10,
    pergunta: "Em relação ao cumprimento de normas e regras dentro da equipe:",
    opcoes: [
      { texto: "Flexibilizo quando necessário para alcançar resultados", tipo: "D" },
      { texto: "Envolvo a equipe para que todos entendam e aceitem as regras", tipo: "I" },
      { texto: "Aplico com gentileza, sempre considerando o contexto de cada um", tipo: "E" },
      { texto: "Garanto que todos sigam os padrões sem exceções", tipo: "C" }
    ]
  },
  {
    id: 11,
    pergunta: "Minha principal preocupação ao planejar um mês operacional é:",
    opcoes: [
      { texto: "Atingir os números e superar as metas estabelecidas", tipo: "D" },
      { texto: "Garantir que a equipe esteja engajada e motivada", tipo: "I" },
      { texto: "Assegurar que ninguém fique sobrecarregado ou desmotivado", tipo: "E" },
      { texto: "Que todos os processos sejam seguidos com precisão", tipo: "C" }
    ]
  },
  {
    id: 12,
    pergunta: "Diante de uma crise operacional, o que faço primeiro:",
    opcoes: [
      { texto: "Assumo o controle e tomo decisões rápidas", tipo: "D" },
      { texto: "Reúno a equipe para alinhar e levantar o moral", tipo: "I" },
      { texto: "Verifico o bem-estar da equipe e distribuo o peso", tipo: "E" },
      { texto: "Levanto todos os fatos antes de agir", tipo: "C" }
    ]
  },
  {
    id: 13,
    pergunta: "A minha forma de reconhecer um bom trabalho da equipe é:",
    opcoes: [
      { texto: "Mostrar como aquilo contribuiu diretamente para os resultados", tipo: "D" },
      { texto: "Celebrar publicamente com entusiasmo e reconhecimento aberto", tipo: "I" },
      { texto: "Agradecer individualmente de forma sincera e pessoal", tipo: "E" },
      { texto: "Registrar formalmente a excelência no desempenho", tipo: "C" }
    ]
  },
  {
    id: 14,
    pergunta: "Quando delego uma tarefa, o que mais me preocupa é:",
    opcoes: [
      { texto: "Que seja entregue no prazo e com o resultado esperado", tipo: "D" },
      { texto: "Que a pessoa se sinta motivada e confiante para fazer", tipo: "I" },
      { texto: "Que a pessoa tenha todo o apoio necessário para não falhar", tipo: "E" },
      { texto: "Que siga exatamente os critérios e padrões de qualidade", tipo: "C" }
    ]
  },
  {
    id: 15,
    pergunta: "Em reuniões de equipe, meu papel natural é:",
    opcoes: [
      { texto: "Conduzir com objetividade e foco em decisões e ações", tipo: "D" },
      { texto: "Animar, facilitar e criar um ambiente de participação", tipo: "I" },
      { texto: "Garantir que todos tenham voz e ninguém fique de lado", tipo: "E" },
      { texto: "Estruturar a pauta e registrar cada ponto decidido", tipo: "C" }
    ]
  },
  {
    id: 16,
    pergunta: "Para mim, a liderança eficaz é:",
    opcoes: [
      { texto: "Aquela que move as pessoas em direção a resultados concretos", tipo: "D" },
      { texto: "Aquela que conquista corações e gera conexão genuína", tipo: "I" },
      { texto: "Aquela que cuida de cada pessoa e constrói lealdade real", tipo: "E" },
      { texto: "Aquela que define padrões claros e os mantém com rigor", tipo: "C" }
    ]
  },
  {
    id: 17,
    pergunta: "Quando alguém da equipe comete um erro repetido, minha atitude é:",
    opcoes: [
      { texto: "Ser firme e deixar claro que não é aceitável", tipo: "D" },
      { texto: "Tentar entender o que pode estar desmotivando essa pessoa", tipo: "I" },
      { texto: "Ter uma conversa empática para entender a situação de vida", tipo: "E" },
      { texto: "Investigar se o processo foi seguido corretamente e corrigi-lo", tipo: "C" }
    ]
  },
  {
    id: 18,
    pergunta: "Meu ponto forte como gestor que os outros mais reconhecem é:",
    opcoes: [
      { texto: "A capacidade de tomar decisões difíceis sem hesitar", tipo: "D" },
      { texto: "O entusiasmo e energia que transmito para a equipe", tipo: "I" },
      { texto: "A empatia e disponibilidade para apoiar quem precisa", tipo: "E" },
      { texto: "A atenção aos detalhes e o rigor na qualidade do trabalho", tipo: "C" }
    ]
  },
  {
    id: 19,
    pergunta: "Quando preciso mudar a estratégia da equipe, prefiro:",
    opcoes: [
      { texto: "Anunciar a mudança e esperar que todos se adaptem rapidamente", tipo: "D" },
      { texto: "Apresentar com energia e mostrar as oportunidades que a mudança traz", tipo: "I" },
      { texto: "Conversar individualmente com cada um para garantir que todos estejam bem", tipo: "E" },
      { texto: "Explicar tecnicamente os motivos e o plano detalhado da transição", tipo: "C" }
    ]
  },
  {
    id: 20,
    pergunta: "Ao avaliar a performance da minha equipe, dou mais peso para:",
    opcoes: [
      { texto: "Os resultados alcançados e o impacto no negócio", tipo: "D" },
      { texto: "O nível de engajamento, criatividade e trabalho em equipe", tipo: "I" },
      { texto: "A consistência, lealdade e colaboração entre as pessoas", tipo: "E" },
      { texto: "A conformidade com processos, precisão e qualidade técnica", tipo: "C" }
    ]
  }
];

// ─── Collaborator DISC Questions ─────────────────────────────────────────────
const DISC_COLABORADOR_QUESTIONS = DISC_MANAGER_QUESTIONS.map((q, i) => ({
  ...q,
  id: i + 1,
  pergunta: q.pergunta
    .replace(/gestor/gi, 'mim')
    .replace(/minha equipe/gi, 'minha equipe')
}));

// ─── Engine ───────────────────────────────────────────────────────────────────
const DISC_PROFILES = {
  D: {
    nome: "Dominância",
    cor: "#ef4444",
    emoji: "🔴",
    descricao: "Perfil orientado à ação, liderança e resultados. Toma decisões rápidas, é assertivo e foca em metas.",
    pontos_fortes: ["Assertividade", "Foco em resultados", "Tomada de decisão rápida", "Liderança diretiva"],
    pontos_atencao: ["Pode ser impaciente", "Pode ignorar os sentimentos da equipe", "Tendência a não ouvir"],
    abordagem_feedback: "Seja direto e objetivo. Mostre dados, resultados e impacto. Evite rodeios."
  },
  I: {
    nome: "Influência",
    cor: "#f59e0b",
    emoji: "🟡",
    descricao: "Perfil orientado ao entusiasmo e conexões. Altamente comunicativo, carismático e motivador.",
    pontos_fortes: ["Comunicação", "Entusiasmo", "Conexão interpessoal", "Criatividade"],
    pontos_atencao: ["Pode se dispersar facilmente", "Dificuldade com detalhes e processos", "Pode ser impulsivo"],
    abordagem_feedback: "Use linguagem positiva e inspiradora. Conecte o feedback à visão e ao impacto coletivo."
  },
  E: {
    nome: "Estabilidade",
    cor: "#22c55e",
    emoji: "🟢",
    descricao: "Perfil orientado à empatia e lealdade. Constrói relacionamentos sólidos e mantém ambientes estáveis.",
    pontos_fortes: ["Empatia", "Lealdade", "Consistência", "Trabalho em equipe"],
    pontos_atencao: ["Resistência a mudanças rápidas", "Dificuldade com confronto", "Pode absorver demais o estresse alheio"],
    abordagem_feedback: "Seja gentil e cuidadoso. Dê tempo para processar. Reforce a confiança e o apoio que você oferece."
  },
  C: {
    nome: "Conformidade",
    cor: "#3b82f6",
    emoji: "🔵",
    descricao: "Perfil orientado à qualidade, análise e precisão. Segue processos rigorosos e preza pela excelência técnica.",
    pontos_fortes: ["Precisão", "Análise crítica", "Qualidade", "Organização"],
    pontos_atencao: ["Pode ser perfeccionista em excesso", "Dificuldade em tomar decisões rápidas", "Pode ser inflexível"],
    abordagem_feedback: "Use dados, evidências e exemplos concretos. Seja lógico e detalhado. Evite generalidades."
  }
};

class DISCEngine {
  constructor(questions) {
    this.questions = questions;
    this.respostas = {};
  }

  registrarResposta(questionId, tipo) {
    this.respostas[questionId] = tipo;
  }

  calcularResultado() {
    const scores = { D: 0, I: 0, E: 0, C: 0 };
    Object.values(this.respostas).forEach(tipo => { if (scores[tipo] !== undefined) scores[tipo]++; });
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const percentuais = {};
    Object.keys(scores).forEach(k => { percentuais[k] = Math.round((scores[k] / total) * 100); });
    const perfil_dominante = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const perfil = DISC_PROFILES[perfil_dominante];
    return {
      scores,
      percentuais,
      perfil_dominante,
      nome_perfil: perfil.nome,
      cor_perfil: perfil.cor,
      emoji_perfil: perfil.emoji,
      descricao: perfil.descricao,
      pontos_fortes: perfil.pontos_fortes,
      pontos_atencao: perfil.pontos_atencao,
      abordagem_feedback: perfil.abordagem_feedback
    };
  }
}

window.DISC_MANAGER_QUESTIONS = DISC_MANAGER_QUESTIONS;
window.DISC_COLABORADOR_QUESTIONS = DISC_COLABORADOR_QUESTIONS;
window.DISC_PROFILES = DISC_PROFILES;
window.DISCEngine = DISCEngine;
