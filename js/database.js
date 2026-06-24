/**
 * AeroPulse Database
 * localStorage-based database. Starts completely empty.
 */

const STORAGE_KEY = 'aeropulse_db';

// Empty blank database for a fresh start
const BLANK_DATABASE = {
  gestor: null, // The manager sets up their profile on first run
  colaboradores: [],
  disc_resultados: [],
  feedbacks: [],
  autoavaliacoes: [],
  planos_acao: [],
  agendas: [],
  evolucao_historico: [],
  qr_feedback_tracking: []
};

class AeroPulseDB {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      this.reset();
    }
  }

  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(BLANK_DATABASE));
  }

  getData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || BLANK_DATABASE;
    } catch (e) {
      this.reset();
      return BLANK_DATABASE;
    }
  }

  saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  isSetupComplete() {
    return this.getData().gestor !== null;
  }

  // --- Gestor ---
  getGestor() {
    return this.getData().gestor;
  }

  saveGestor(gestor) {
    const db = this.getData();
    db.gestor = gestor;
    this.saveData(db);
    return gestor;
  }

  // --- Colaboradores ---
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

  removeColaborador(id) {
    const db = this.getData();
    db.colaboradores    = db.colaboradores.filter(c => c.id !== id);
    db.disc_resultados  = db.disc_resultados.filter(d => d.colaborador_id !== id);
    db.feedbacks        = db.feedbacks.filter(f => f.colaborador_id !== id);
    db.autoavaliacoes   = db.autoavaliacoes.filter(a => a.colaborador_id !== id);
    db.planos_acao      = db.planos_acao.filter(p => p.colaborador_id !== id);
    db.agendas          = db.agendas.filter(a => a.colaborador_id !== id);
    db.evolucao_historico = db.evolucao_historico.filter(h => h.colaborador_id !== id);
    db.qr_feedback_tracking = db.qr_feedback_tracking.filter(q => q.colaborador_id !== id);
    this.saveData(db);
  }

  updateColaborador(id, campos) {
    const db = this.getData();
    const idx = db.colaboradores.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.colaboradores[idx] = { ...db.colaboradores[idx], ...campos };
      this.saveData(db);
      return db.colaboradores[idx];
    }
    return null;
  }

  // --- Feedbacks ---
  getFeedbacks() {
    return this.getData().feedbacks;
  }

  getFeedbacksByColaborador(id) {
    return this.getFeedbacks()
      .filter(f => f.colaborador_id === id)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  addFeedback(feedback) {
    const db = this.getData();
    feedback.id = 'f_' + Date.now();
    feedback.data = feedback.data || new Date().toISOString().split('T')[0];
    db.feedbacks.push(feedback);

    const avg = ((parseFloat(feedback.nota_performance) + parseFloat(feedback.nota_comportamento) + parseFloat(feedback.nota_compliance)) / 3).toFixed(1);
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const mes = months[new Date(feedback.data).getMonth()];
    const idx = db.evolucao_historico.findIndex(h => h.colaborador_id === feedback.colaborador_id && h.mes === mes);
    if (idx !== -1) {
      db.evolucao_historico[idx].score = parseFloat(avg);
    } else {
      db.evolucao_historico.push({ colaborador_id: feedback.colaborador_id, mes, score: parseFloat(avg) });
    }

    this.saveData(db);
    return feedback;
  }

  // --- DISC ---
  getDiscResultados() {
    return this.getData().disc_resultados;
  }

  getDiscResultByColaborador(id) {
    return this.getDiscResultados().find(d => d.colaborador_id === id);
  }

  saveDiscResult(resultado) {
    const db = this.getData();
    resultado.id = resultado.id || 'd_' + Date.now();
    resultado.data_teste = new Date().toISOString().split('T')[0];
    const idx = db.disc_resultados.findIndex(d => d.colaborador_id === resultado.colaborador_id);
    if (idx !== -1) db.disc_resultados[idx] = resultado;
    else db.disc_resultados.push(resultado);
    this.saveData(db);
    return resultado;
  }

  // --- Autoavaliações ---
  getAutoavaliacoes() {
    return this.getData().autoavaliacoes;
  }

  getAutoavaliacoesByColaborador(id) {
    return this.getAutoavaliacoes()
      .filter(a => a.colaborador_id === id)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  addAutoavaliacao(av) {
    const db = this.getData();
    av.id = 'a_' + Date.now();
    av.data = av.data || new Date().toISOString().split('T')[0];
    db.autoavaliacoes.push(av);
    db.qr_feedback_tracking.push({
      id: 'qr_' + Date.now(),
      colaborador_id: av.colaborador_id,
      data_escaneamento: new Date().toISOString().replace('T',' ').substring(0,16),
      dispositivo: navigator.userAgent.includes('Mobile') ? 'Smartphone' : 'Desktop'
    });
    this.saveData(db);
    return av;
  }

  // --- Planos de Ação ---
  getPlanosAcao() {
    return this.getData().planos_acao;
  }

  getPlanosAcaoByColaborador(id) {
    return this.getPlanosAcao().filter(p => p.colaborador_id === id);
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
    if (idx !== -1) { db.planos_acao[idx].status = status; this.saveData(db); return db.planos_acao[idx]; }
    return null;
  }

  // --- Agendas ---
  getAgendas() {
    return this.getData().agendas;
  }

  getAgendasByColaborador(id) {
    return this.getAgendas().filter(a => a.colaborador_id === id);
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
    if (idx !== -1) { db.agendas[idx].status = status; this.saveData(db); return db.agendas[idx]; }
    return null;
  }

  // --- Histórico ---
  getEvolucaoHistorico() {
    return this.getData().evolucao_historico;
  }

  getEvolucaoHistoricoByColaborador(id) {
    const order = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return this.getEvolucaoHistorico()
      .filter(h => h.colaborador_id === id)
      .sort((a, b) => order.indexOf(a.mes) - order.indexOf(b.mes));
  }

  getQrTrackingByColaborador(id) {
    return (this.getData().qr_feedback_tracking || [])
      .filter(q => q.colaborador_id === id)
      .sort((a, b) => new Date(b.data_escaneamento) - new Date(a.data_escaneamento));
  }
}

window.db = new AeroPulseDB();
