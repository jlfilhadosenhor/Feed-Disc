/**
 * AeroPulse Risk Engine
 * Calculates operational risk scores from feedback data.
 */

class AeroPulseRiskEngine {
  static calcularRisco(colaboradorId) {
    const fbs = db.getFeedbacksByColaborador(colaboradorId);
    if (!fbs.length) return null;

    const avg = fbs.reduce((s, f) => {
      return s + ((parseFloat(f.nota_performance) + parseFloat(f.nota_comportamento) + parseFloat(f.nota_compliance)) / 3);
    }, 0) / fbs.length;

    const risco = Math.round(100 - (avg * 10));
    const nivel = risco >= 60 ? 'Alto' : risco >= 35 ? 'Médio' : 'Baixo';
    return { risco, nivel, avg: avg.toFixed(1), totalFeedbacks: fbs.length };
  }
}

window.AeroPulseRiskEngine = AeroPulseRiskEngine;
