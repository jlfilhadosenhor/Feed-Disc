/**
 * AeroPulse Risk Engine
 * Calculates operational, behavioral, and reputational risk scores for collaborators.
 */

class AeroPulseRiskEngine {
  /**
   * Calculates the overall risk profile for a collaborator.
   * @param {string} colaboradorId 
   * @returns {Object} { score, nivel, class, flags: [], recomendacoes: [] }
   */
  calcularRisco(colaboradorId) {
    const colaborador = window.db.getColaboradorById(colaboradorId);
    if (!colaborador) return null;

    const feedbacks = window.db.getFeedbacksByColaborador(colaboradorId);
    const autoavaliacoes = window.db.getAutoavaliacoesByColaborador(colaboradorId);
    const planos = window.db.getPlanosAcaoByColaborador(colaboradorId);

    let score = 0;
    const flags = [];
    const recomendacoes = [];

    // 1. PERFORMANCE & TREND (Weight: 30%)
    if (feedbacks.length > 0) {
      const latestFeedback = feedbacks[0];
      const avgPerf = (latestFeedback.nota_performance + latestFeedback.nota_comportamento + latestFeedback.nota_compliance) / 3;
      
      if (avgPerf < 7.5) {
        const penalty = Math.round((7.5 - avgPerf) * 20); // up to 30 points
        score += Math.min(30, penalty);
        flags.push("Média de performance recente abaixo do padrão operacional (7.5)");
      }

      if (feedbacks.length > 1) {
        const prevFeedback = feedbacks[1];
        const prevAvg = (prevFeedback.nota_performance + prevFeedback.nota_comportamento + prevFeedback.nota_compliance) / 3;
        const diff = prevAvg - avgPerf;
        
        if (diff > 0.8) {
          score += 15;
          flags.push(`Queda acentuada na performance operacional (-${diff.toFixed(1)} pts desde o último ciclo)`);
        }
      }
    } else {
      score += 10;
      flags.push("Sem histórico de feedbacks formalizados no sistema");
    }

    // 2. COMPLIANCE & SAFETY (Weight: 25%)
    if (feedbacks.length > 0) {
      const latestFeedback = feedbacks[0];
      if (latestFeedback.nota_compliance < 7.5) {
        score += 25;
        flags.push("Alerta crítico de Compliance/Segurança (Nota inferior a 7.5)");
        recomendacoes.push("Agendar auditoria operacional assistida e repassar checklists obrigatórios imediatamente.");
      } else if (latestFeedback.nota_compliance < 8.5) {
        score += 10;
        flags.push("Conformidade operacional com margem de atenção");
      }
    }

    // 3. EMOTIONAL / MOTIVATION (Weight: 25%)
    if (autoavaliacoes.length > 0) {
      const latestAuto = autoavaliacoes[0];
      if (latestAuto.motivacao <= 6) {
        score += 25;
        flags.push(`Nível crítico de desmotivação auto-reportado: Nota ${latestAuto.motivacao}/10`);
        recomendacoes.push("Realizar uma sessão de escuta ativa individual com foco em fatores de estresse e bem-estar.");
      } else if (latestAuto.motivacao <= 7.5) {
        score += 12;
        flags.push(`Motivação reportada em declínio moderado: Nota ${latestAuto.motivacao}/10`);
      }
    } else {
      score += 12;
      flags.push("Ausência de autoavaliação de engajamento preenchida pelo colaborador");
      recomendacoes.push("Solicitar preenchimento de autoavaliação via QR Code impresso ou link.");
    }

    // 4. ACTION PLANS ONGOING & DELAYED (Weight: 20%)
    const today = new Date();
    let hasDelayedPlan = false;
    
    planos.forEach(p => {
      if (p.status === 'Em Andamento') {
        const prazo = new Date(p.prazo);
        if (prazo < today) {
          hasDelayedPlan = true;
        }
      }
    });

    if (hasDelayedPlan) {
      score += 20;
      flags.push("Plano de Ação de Performance vencido e não concluído");
      recomendacoes.push("Revisar o plano de ação pendente e ajustar os prazos ou apoiar na execução.");
    } else {
      const activePlans = planos.filter(p => p.status === 'Em Andamento').length;
      if (activePlans > 1) {
        score += 5;
        flags.push("Múltiplos planos de ação simultâneos ativos");
      }
    }

    score = Math.max(0, Math.min(100, score));

    // Categorize
    let nivel = 'Baixo';
    let cssClass = 'risk-low';
    if (score >= 70) {
      nivel = 'Alto';
      cssClass = 'risk-high';
      if (recomendacoes.length === 0) {
        recomendacoes.push("Sinalizar recursos humanos e agendar reunião de alinhamento urgente.");
      }
    } else if (score >= 40) {
      nivel = 'Médio';
      cssClass = 'risk-medium';
      if (recomendacoes.length === 0) {
        recomendacoes.push("Acompanhar o progresso do plano de desenvolvimento atual e reforçar feedbacks de rotina.");
      }
    } else {
      recomendacoes.push("Manter o ciclo padrão de feedback e reconhecer os bons resultados operacionais.");
    }

    return {
      colaborador_id: colaboradorId,
      colaborador_nome: colaborador.nome,
      colaborador_cargo: colaborador.cargo,
      colaborador_foto: colaborador.foto,
      score,
      nivel,
      class: cssClass,
      flags,
      recomendacoes
    };
  }

  /**
   * Calculates collective risk and KPIs for dashboard summary
   */
  calcularKPIsGlobais() {
    const colaboradores = window.db.getColaboradores();
    if (colaboradores.length === 0) {
      return { performance: 0, engajamento: 0, evolucao: 0, risco: 0, frequencia: 0 };
    }

    let totalPerf = 0;
    let totalMotivacao = 0;
    let totalRisk = 0;
    let feedbackTotal = 0;
    let feedbackRealizadoCount = 0;

    colaboradores.forEach(c => {
      const risk = this.calcularRisco(c.id);
      totalRisk += risk.score;

      const feedbacks = window.db.getFeedbacksByColaborador(c.id);
      if (feedbacks.length > 0) {
        const latest = feedbacks[0];
        totalPerf += (latest.nota_performance + latest.nota_comportamento + latest.nota_compliance) / 3;
        feedbackRealizadoCount += feedbacks.length;
      }
      
      const autos = window.db.getAutoavaliacoesByColaborador(c.id);
      if (autos.length > 0) {
        totalMotivacao += autos[0].motivacao;
      } else {
        totalMotivacao += 5;
      }

      feedbackTotal += 2;
    });

    const performanceMedia = (totalPerf / colaboradores.length).toFixed(1);
    const engajamentoMedio = Math.round((totalMotivacao / colaboradores.length) * 10);
    const riscoMedio = Math.round(totalRisk / colaboradores.length);
    const frequenciaFeedback = Math.min(100, Math.round((feedbackRealizadoCount / feedbackTotal) * 100));

    const db = window.db.getData();
    let scoreJun = 0;
    let countJun = 0;
    let scoreMai = 0;
    let countMai = 0;

    db.evolucao_historico.forEach(h => {
      if (h.mes === 'Jun') {
        scoreJun += h.score;
        countJun++;
      } else if (h.mes === 'Mai') {
        scoreMai += h.score;
        countMai++;
      }
    });

    const mediaJun = countJun > 0 ? (scoreJun / countJun) : 0;
    const mediaMai = countMai > 0 ? (scoreMai / countMai) : 0;
    
    let evolucaoDiferenca = 0;
    if (mediaMai > 0) {
      evolucaoDiferenca = Math.round(((mediaJun - mediaMai) / mediaMai) * 100);
    }

    return {
      performance: parseFloat(performanceMedia) || 0,
      engajamento: engajamentoMedio,
      evolucao: evolucaoDiferenca,
      risco: riscoMedio,
      frequencia: frequenciaFeedback
    };
  }
}

window.riskEngine = new AeroPulseRiskEngine();
