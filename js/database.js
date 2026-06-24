/**
 * AeroPulse Database Simulator
 * Simulates a Supabase/PostgreSQL schema using localStorage with realistic aviation seed data.
 */

const STORAGE_KEY = 'aeropulse_db';

// Initial Seed Data
const DEFAULT_DATABASE = {
  gestores: [
    { id: 'g1', nome: 'Cap. Roberto Melo', email: 'roberto.melo@aeropulse.com.br', cargo: 'Gerente de Operações e Escalas' }
  ],
  colaboradores: [
    { 
      id: 'c1', 
      nome: 'Alice Santos', 
      email: 'alice.santos@aeropulse.com.br', 
      cargo: 'Coordenadora de Embarque (Gate)', 
      data_admissao: '2024-03-15', 
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      status: 'Ativo'
    },
    { 
      id: 'c2', 
      nome: 'Bruno Souza', 
      email: 'bruno.souza@aeropulse.com.br', 
      cargo: 'Comissário de Bordo Premium', 
      data_admissao: '2023-08-10', 
      foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      status: 'Ativo'
    },
    { 
      id: 'c3', 
      nome: 'Carlos Lima', 
      email: 'carlos.lima@aeropulse.com.br', 
      cargo: 'Supervisor de Rampa e Bagagens', 
      data_admissao: '2022-11-01', 
      foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      status: 'Ativo'
    },
    { 
      id: 'c4', 
      nome: 'Diana Costa', 
      email: 'diana.costa@aeropulse.com.br', 
      cargo: 'Agente de Atendimento VIP Lounge', 
      data_admissao: '2024-01-20', 
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      status: 'Ativo'
    },
    { 
      id: 'c5', 
      nome: 'Eduardo Rocha', 
      email: 'eduardo.rocha@aeropulse.com.br', 
      cargo: 'Despachante Técnico de Voo (DOV)', 
      data_admissao: '2021-05-18', 
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      status: 'Ativo'
    }
  ],
  disc_resultados: [
    { id: 'd1', colaborador_id: 'c1', D: 15, I: 20, S: 35, C: 30, perfil: 'Planejador/Analista', data_teste: '2026-03-20' },
    { id: 'd2', colaborador_id: 'c2', D: 35, I: 40, S: 10, C: 15, perfil: 'Comunicador/Executor', data_teste: '2026-03-21' },
    { id: 'd3', colaborador_id: 'c3', D: 45, I: 15, S: 15, C: 25, perfil: 'Executor/Analista', data_teste: '2026-03-22' },
    { id: 'd4', colaborador_id: 'c4', D: 10, I: 45, S: 35, C: 10, perfil: 'Comunicador/Planejador', data_teste: '2026-03-23' },
    { id: 'd5', colaborador_id: 'c5', D: 20, I: 10, S: 30, C: 40, perfil: 'Analista/Planejador', data_teste: '2026-03-24' }
  ],
  feedbacks: [
    // Alice Santos
    { 
      id: 'f1', 
      colaborador_id: 'c1', 
      gestor_id: 'g1', 
      data: '2026-05-10', 
      nota_performance: 8.5, 
      nota_comportamento: 9.0,
      nota_compliance: 9.5,
      observacoes: 'Excelente pontualidade e conformidade com protocolos de segurança no portão. Precisa melhorar velocidade de resposta sob alta pressão em overbooking.',
      pilares: { comunicacao: 8, conformidade: 10, resolucao_problemas: 8, empatia: 9 },
      ia_sugerido: false
    },
    { 
      id: 'f2', 
      colaborador_id: 'c1', 
      gestor_id: 'g1', 
      data: '2026-06-12', 
      nota_performance: 7.0, 
      nota_comportamento: 8.0,
      nota_compliance: 9.0,
      observacoes: 'Queda de performance observada devido a estresse emocional durante atraso em voo crítico. Apresentou hesitação na tomada de decisão.',
      pilares: { comunicacao: 7, conformidade: 9, resolucao_problemas: 6, empatia: 8 },
      ia_sugerido: true
    },
    // Bruno Souza
    { 
      id: 'f3', 
      colaborador_id: 'c2', 
      gestor_id: 'g1', 
      data: '2026-05-15', 
      nota_performance: 9.5, 
      nota_comportamento: 8.0,
      nota_compliance: 6.0,
      observacoes: 'Excelente empatia e carisma com passageiros de primeira classe. No entanto, pulou o check list obrigatório de cabine duas vezes neste mês.',
      pilares: { comunicacao: 10, conformidade: 6, resolucao_problemas: 8, empatia: 10 },
      ia_sugerido: false
    },
    { 
      id: 'f4', 
      colaborador_id: 'c2', 
      gestor_id: 'g1', 
      data: '2026-06-18', 
      nota_performance: 9.8, 
      nota_comportamento: 8.5,
      nota_compliance: 7.0,
      observacoes: 'Continua sendo muito elogiado no SAC premium. Teve evolução no checklist após alerta verbal, mas ainda carece de rigor operacional absoluto.',
      pilares: { comunicacao: 10, conformidade: 7, resolucao_problemas: 9, empatia: 10 },
      ia_sugerido: true
    },
    // Carlos Lima
    { 
      id: 'f5', 
      colaborador_id: 'c3', 
      gestor_id: 'g1', 
      data: '2026-06-01', 
      nota_performance: 9.0, 
      nota_comportamento: 6.5,
      nota_compliance: 9.0,
      observacoes: 'Tempo de carregamento e entrega das malas abaixo do SLA estipulado (ótimo!). Contudo, foi ríspido com a equipe em duas ocasiões de pico operacional.',
      pilares: { comunicacao: 5, conformidade: 9, resolucao_problemas: 9, empatia: 5 },
      ia_sugerido: false
    },
    // Diana Costa
    { 
      id: 'f6', 
      colaborador_id: 'c4', 
      gestor_id: 'g1', 
      data: '2026-06-05', 
      nota_performance: 9.0, 
      nota_comportamento: 9.5,
      nota_compliance: 9.0,
      observacoes: 'Diana é extremamente atenciosa e mantém o lounge VIP com nota máxima de satisfação. Teve ótima postura ao contornar o problema de cancelamento do voo da comitiva diplomática.',
      pilares: { comunicacao: 9, conformidade: 9, resolucao_problemas: 9, empatia: 10 },
      ia_sugerido: false
    },
    // Eduardo Rocha
    { 
      id: 'f7', 
      colaborador_id: 'c5', 
      gestor_id: 'g1', 
      data: '2026-06-02', 
      nota_performance: 9.5, 
      nota_comportamento: 8.5,
      nota_compliance: 10.0,
      observacoes: 'Precisão cirúrgica no cálculo de combustível e balanceamento das aeronaves. Comunicação direta e sem falhas, porém tímida nas reuniões de briefing.',
      pilares: { comunicacao: 7, conformidade: 10, resolucao_problemas: 10, empatia: 7 },
      ia_sugerido: false
    }
  ],
  autoavaliacoes: [
    { 
      id: 'a1', 
      colaborador_id: 'c1', 
      data: '2026-06-15', 
      nota_auto: 8.0, 
      motivacao: 6.0, 
      comentarios: 'Sinto que o excesso de escalas e atrasos na última quinzena drenou minha energia. Estou me esforçando para seguir os protocolos, mas a exaustão física está pesando.',
      respostas_metas: 'Sim, mas com dificuldade.'
    },
    { 
      id: 'a2', 
      colaborador_id: 'c2', 
      data: '2026-06-20', 
      nota_auto: 9.0, 
      motivacao: 9.0, 
      comentarios: 'Adoro atender os clientes! Estou focando bastante em melhorar meus checklists de segurança para o Capitão não precisar me alertar.',
      respostas_metas: 'Sim, estou evoluindo.'
    },
    { 
      id: 'a3', 
      colaborador_id: 'c3', 
      data: '2026-06-10', 
      nota_auto: 8.5, 
      motivacao: 8.0, 
      comentarios: 'Minha meta é manter o tempo de rampa abaixo de 20 minutos. Às vezes cobro forte a equipe, pois na aviação comercial tempo é tudo.',
      respostas_metas: 'Sim, batendo todas as metas.'
    }
  ],
  planos_acao: [
    { 
      id: 'pa1', 
      colaborador_id: 'c1', 
      titulo: 'Desenvolvimento de Resiliência em Crise', 
      descricao: 'Treinamento prático de gerenciamento de crise no portão de embarque e técnicas de descompressão emocional.',
      metas: 'Completar workshop de inteligência emocional e realizar 2 simulações de overbooking.',
      prazo: '2026-07-15', 
      status: 'Em Andamento', 
      data_criacao: '2026-06-13'
    },
    { 
      id: 'pa2', 
      colaborador_id: 'c2', 
      titulo: 'Excelência em Protocolos de Segurança', 
      descricao: 'Duplo check de segurança em cabine assistido nas próximas 10 rotas e revisão do manual operacional de segurança da companhia.',
      metas: 'Zero falhas em auditorias surpresa internas durante 30 dias.',
      prazo: '2026-07-20', 
      status: 'Em Andamento', 
      data_criacao: '2026-06-19'
    },
    { 
      id: 'pa3', 
      colaborador_id: 'c3', 
      titulo: 'Comunicação Não-Violenta (CNV) em Rampa', 
      descricao: 'Curso online de liderança assertiva e comunicação não-violenta aplicada a ambientes de alta pressão.',
      metas: 'Obter feedback positivo de 80% da equipe de rampa nos briefings diários.',
      prazo: '2026-07-30', 
      status: 'Em Andamento', 
      data_criacao: '2026-06-03'
    }
  ],
  agendas: [
    { id: 'ag1', colaborador_id: 'c1', gestor_id: 'g1', data: '2026-06-28', hora: '10:00', status: 'Agendado', tipo: 'Follow-up Mensal' },
    { id: 'ag2', colaborador_id: 'c2', gestor_id: 'g1', data: '2026-06-29', hora: '14:30', status: 'Agendado', tipo: 'Acompanhamento do Plano de Ação' },
    { id: 'ag3', colaborador_id: 'c3', gestor_id: 'g1', data: '2026-06-25', hora: '09:00', status: 'Agendado', tipo: 'Feedback Operacional' },
    { id: 'ag4', colaborador_id: 'c4', gestor_id: 'g1', data: '2026-07-02', hora: '11:00', status: 'Agendado', tipo: 'Alinhamento de Carreira VIP' },
    { id: 'ag5', colaborador_id: 'c5', gestor_id: 'g1', data: '2026-07-05', hora: '15:00', status: 'Agendado', tipo: 'Alinhamento Técnico' }
  ],
  evolucao_historico: [
    { colaborador_id: 'c1', mes: 'Jan', score: 8.8 },
    { colaborador_id: 'c1', mes: 'Fev', score: 8.9 },
    { colaborador_id: 'c1', mes: 'Mar', score: 9.0 },
    { colaborador_id: 'c1', mes: 'Abr', score: 9.1 },
    { colaborador_id: 'c1', mes: 'Mai', score: 8.8 },
    { colaborador_id: 'c1', mes: 'Jun', score: 8.0 },

    { colaborador_id: 'c2', mes: 'Jan', score: 7.2 },
    { colaborador_id: 'c2', mes: 'Fev', score: 7.5 },
    { colaborador_id: 'c2', mes: 'Mar', score: 7.8 },
    { colaborador_id: 'c2', mes: 'Abr', score: 8.1 },
    { colaborador_id: 'c2', mes: 'Mai', score: 8.5 },
    { colaborador_id: 'c2', mes: 'Jun', score: 8.9 },

    { colaborador_id: 'c3', mes: 'Mar', score: 8.2 },
    { colaborador_id: 'c3', mes: 'Abr', score: 8.4 },
    { colaborador_id: 'c3', mes: 'Mai', score: 8.3 },
    { colaborador_id: 'c3', mes: 'Jun', score: 8.2 },

    { colaborador_id: 'c4', mes: 'Abr', score: 9.0 },
    { colaborador_id: 'c4', mes: 'Mai', score: 9.2 },
    { colaborador_id: 'c4', mes: 'Jun', score: 9.3 },

    { colaborador_id: 'c5', mes: 'Fev', score: 9.2 },
    { colaborador_id: 'c5', mes: 'Mar', score: 9.3 },
    { colaborador_id: 'c5', mes: 'Abr', score: 9.4 },
    { colaborador_id: 'c5', mes: 'Mai', score: 9.5 },
    { colaborador_id: 'c5', mes: 'Jun', score: 9.6 }
  ],
  qr_feedback_tracking: [
    { id: 'qr1', colaborador_id: 'c1', data_escaneamento: '2026-06-15 08:30', dispositivo: 'iPhone iOS' },
    { id: 'qr2', colaborador_id: 'c2', data_escaneamento: '2026-06-20 12:15', dispositivo: 'Samsung Android' },
    { id: 'qr3', colaborador_id: 'c3', data_escaneamento: '2026-06-10 17:40', dispositivo: 'Motorola Android' }
  ]
};

// Database class helper
class AeroPulseDB {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      this.reset();
    }
  }

  // Resets local storage database to default seed data
  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATABASE));
  }

  // Get raw JSON database
  getData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : DEFAULT_DATABASE;
    } catch (e) {
      console.error('Error reading localStorage database, resetting...', e);
      this.reset();
      return DEFAULT_DATABASE;
    }
  }

  // Save raw JSON database
  saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // --- TABLES API ---

  // Gestores
  getGestores() {
    return this.getData().gestores;
  }

  // Colaboradores
  getColaboradores() {
    return this.getData().colaboradores;
  }

  getColaboradorById(id) {
    return this.getColaboradores().find(c => c.id === id);
  }

  addColaborador(colaborador) {
    const db = this.getData();
    colaborador.id = 'c_' + Date.now();
    colaborador.status = 'Ativo';
    colaborador.data_admissao = new Date().toISOString().split('T')[0];
    colaborador.foto = colaborador.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
    db.colaboradores.push(colaborador);
    this.saveData(db);
    return colaborador;
  }

  updateColaborador(id, fields) {
    const db = this.getData();
    const idx = db.colaboradores.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.colaboradores[idx] = { ...db.colaboradores[idx], ...fields };
      this.saveData(db);
      return db.colaboradores[idx];
    }
    return null;
  }

  // Feedbacks
  getFeedbacks() {
    return this.getData().feedbacks;
  }

  getFeedbacksByColaborador(colaboradorId) {
    return this.getFeedbacks()
      .filter(f => f.colaborador_id === colaboradorId)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  addFeedback(feedback) {
    const db = this.getData();
    feedback.id = 'f_' + Date.now();
    feedback.data = feedback.data || new Date().toISOString().split('T')[0];
    db.feedbacks.push(feedback);

    // Save historical entry
    const avgScore = ((parseFloat(feedback.nota_performance) + parseFloat(feedback.nota_comportamento) + parseFloat(feedback.nota_compliance)) / 3).toFixed(1);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const curMonth = months[new Date(feedback.data).getMonth()];
    
    // Check if month already exists for this collaborator, update it, else add it
    const histIdx = db.evolucao_historico.findIndex(h => h.colaborador_id === feedback.colaborador_id && h.mes === curMonth);
    if (histIdx !== -1) {
      db.evolucao_historico[histIdx].score = parseFloat(avgScore);
    } else {
      db.evolucao_historico.push({
        colaborador_id: feedback.colaborador_id,
        mes: curMonth,
        score: parseFloat(avgScore)
      });
    }

    this.saveData(db);
    return feedback;
  }

  // DISC
  getDiscResultados() {
    return this.getData().disc_resultados;
  }

  getDiscResultByColaborador(colaboradorId) {
    return this.getDiscResultados().find(d => d.colaborador_id === colaboradorId);
  }

  saveDiscResult(resultado) {
    const db = this.getData();
    resultado.id = resultado.id || 'd_' + Date.now();
    resultado.data_teste = new Date().toISOString().split('T')[0];
    
    const idx = db.disc_resultados.findIndex(d => d.colaborador_id === resultado.colaborador_id);
    if (idx !== -1) {
      db.disc_resultados[idx] = resultado;
    } else {
      db.disc_resultados.push(resultado);
    }
    
    this.saveData(db);
    return resultado;
  }

  // Autoavaliações
  getAutoavaliacoes() {
    return this.getData().autoavaliacoes;
  }

  getAutoavaliacoesByColaborador(colaboradorId) {
    return this.getAutoavaliacoes()
      .filter(a => a.colaborador_id === colaboradorId)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  addAutoavaliacao(autoavaliacao) {
    const db = this.getData();
    autoavaliacao.id = 'a_' + Date.now();
    autoavaliacao.data = autoavaliacao.data || new Date().toISOString().split('T')[0];
    db.autoavaliacoes.push(autoavaliacao);
    
    // Log tracking
    db.qr_feedback_tracking.push({
      id: 'qr_' + Date.now(),
      colaborador_id: autoavaliacao.colaborador_id,
      data_escaneamento: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dispositivo: navigator.userAgent.includes('Mobile') ? 'Smartphone Link' : 'Desktop Link'
    });

    this.saveData(db);
    return autoavaliacao;
  }

  // Planos de Ação
  getPlanosAcao() {
    return this.getData().planos_acao;
  }

  getPlanosAcaoByColaborador(colaboradorId) {
    return this.getPlanosAcao().filter(p => p.colaborador_id === colaboradorId);
  }

  addPlanoAcao(plano) {
    const db = this.getData();
    plano.id = 'pa_' + Date.now();
    plano.data_criacao = new Date().toISOString().split('T')[0];
    plano.status = 'Em Andamento';
    db.planos_acao.push(plano);
    this.saveData(db);
    return plano;
  }

  updatePlanoAcaoStatus(id, status) {
    const db = this.getData();
    const idx = db.planos_acao.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.planos_acao[idx].status = status;
      this.saveData(db);
      return db.planos_acao[idx];
    }
    return null;
  }

  // Agendas
  getAgendas() {
    return this.getData().agendas;
  }

  getAgendasByColaborador(colaboradorId) {
    return this.getAgendas().filter(a => a.colaborador_id === colaboradorId);
  }

  addAgenda(agenda) {
    const db = this.getData();
    agenda.id = 'ag_' + Date.now();
    agenda.status = 'Agendado';
    db.agendas.push(agenda);
    this.saveData(db);
    return agenda;
  }

  updateAgendaStatus(id, status) {
    const db = this.getData();
    const idx = db.agendas.findIndex(a => a.id === id);
    if (idx !== -1) {
      db.agendas[idx].status = status;
      this.saveData(db);
      return db.agendas[idx];
    }
    return null;
  }

  // Evolução Histórico
  getEvolucaoHistorico() {
    return this.getData().evolucao_historico;
  }

  getEvolucaoHistoricoByColaborador(colaboradorId) {
    const monthsOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return this.getEvolucaoHistorico()
      .filter(h => h.colaborador_id === colaboradorId)
      .sort((a, b) => monthsOrder.indexOf(a.mes) - monthsOrder.indexOf(b.mes));
  }

  // QR Tracking Audit
  getQrTracking() {
    return this.getData().qr_feedback_tracking;
  }

  getQrTrackingByColaborador(colaboradorId) {
    return this.getQrTracking()
      .filter(q => q.colaborador_id === colaboradorId)
      .sort((a, b) => new Date(b.data_escaneamento) - new Date(a.data_escaneamento));
  }
}

// Instantiate globally
window.db = new AeroPulseDB();
