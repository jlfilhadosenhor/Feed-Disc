/**
 * AeroPulse AI Copilot
 * Provides DISC-adapted feedback suggestions and action plan recommendations.
 */

class AeroPulseAICopilot {
  static sugerirFeedback(colaboradorId) {
    const disc = db.getDiscResultByColaborador(colaboradorId);
    if (!disc) return 'Realize a avaliação DISC para obter sugestões personalizadas de feedback.';
    const profiles = window.DISC_PROFILES;
    return profiles[disc.perfil_dominante]?.abordagem_feedback || '';
  }

  static sugerirPlanoAcao(colaboradorId) {
    const disc  = db.getDiscResultByColaborador(colaboradorId);
    const fbs   = db.getFeedbacksByColaborador(colaboradorId);
    const risco = window.AeroPulseRiskEngine?.calcularRisco(colaboradorId);

    const sugestoes = [];
    if (!disc) sugestoes.push('Realizar avaliação DISC para mapeamento comportamental');
    if (!fbs.length) sugestoes.push('Registrar primeiro feedback de performance');
    if (risco && risco.nivel === 'Alto') sugestoes.push('Iniciar plano de melhoria de performance urgente');
    if (risco && risco.nivel === 'Médio') sugestoes.push('Reforçar acompanhamento quinzenal');

    return sugestoes.length ? sugestoes.join('; ') : 'Colaborador com bom desempenho — manter acompanhamento regular.';
  }
}

window.AeroPulseAICopilot = AeroPulseAICopilot;
