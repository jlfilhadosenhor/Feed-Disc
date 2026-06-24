/**
 * AeroPulse App Controller
 * Manages view routing, UI event listeners, charts rendering, and coordinates models.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentRole = 'manager'; // 'manager' | 'collaborator'
  let activeCollabPortalId = 'c1'; // Default collaborator for portal view
  let selectedCollabId = null; // Collaborator selected for detail view
  
  // Chart Instances
  let teamDiscChartInstance = null;
  let collabEvolutionChartInstance = null;
  let portalEvolutionChartInstance = null;

  // Initialize Lucide Icons
  lucide.createIcons();

  // Initialize App
  function initApp() {
    window.db.init();
    refreshAllViews();
    setupEventListeners();
  }

  // --- RENDERING VIEWS ---

  function refreshAllViews() {
    renderSidebarFooter();
    
    if (currentRole === 'manager') {
      document.getElementById('nav-group-manager').style.display = 'block';
      document.getElementById('nav-group-collaborator').style.display = 'none';
      
      renderDashboardView();
      renderColaboradoresView();
      renderRiscosView();
      renderAgendaView();
    } else {
      document.getElementById('nav-group-manager').style.display = 'none';
      document.getElementById('nav-group-collaborator').style.display = 'block';
      
      renderCollaboratorPortalView();
      renderCollaboratorAgendaView();
    }
  }

  // Sidebar User Info
  function renderSidebarFooter() {
    const userImg = document.getElementById('sidebar-user-img');
    const userName = document.getElementById('sidebar-user-name');
    const userRole = document.getElementById('sidebar-user-role');

    if (currentRole === 'manager') {
      const manager = window.db.getGestores()[0];
      userImg.src = 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&q=80&w=150';
      userName.textContent = manager.nome;
      userRole.textContent = manager.cargo;
    } else {
      const collab = window.db.getColaboradorById(activeCollabPortalId);
      if (collab) {
        userImg.src = collab.foto;
        userName.textContent = collab.nome;
        userRole.textContent = collab.cargo;
      }
    }
  }

  // View: Manager Dashboard
  function renderDashboardView() {
    const kpis = window.riskEngine.calcularKPIsGlobais();
    
    // Set KPI Values
    document.getElementById('kpi-performance').textContent = kpis.performance;
    document.getElementById('kpi-engajamento').textContent = kpis.engajamento + '%';
    
    const evolEl = document.getElementById('kpi-evolucao');
    const evolTrend = document.getElementById('trend-evolucao');
    if (kpis.evolucao >= 0) {
      evolEl.textContent = `+${kpis.evolucao}%`;
      evolTrend.innerHTML = `<i data-lucide="arrow-up-right"></i><span>Subindo vs. mês anterior</span>`;
      evolTrend.className = 'kpi-trend positive';
    } else {
      evolEl.textContent = `${kpis.evolucao}%`;
      evolTrend.innerHTML = `<i data-lucide="arrow-down-right"></i><span>Queda vs. mês anterior</span>`;
      evolTrend.className = 'kpi-trend negative';
    }
    
    const riskCard = document.getElementById('kpi-risco-card');
    const riskEl = document.getElementById('kpi-risco');
    const riskTrend = document.getElementById('trend-risco');
    
    let riskLabel = 'Baixo';
    let riskClass = 'kpi-card performance';
    if (kpis.risco >= 70) {
      riskLabel = 'Alto';
      riskClass = 'kpi-card risco';
      riskTrend.innerHTML = `<i data-lucide="alert-triangle"></i><span>Risco Operacional Elevado</span>`;
      riskTrend.className = 'kpi-trend negative';
    } else if (kpis.risco >= 40) {
      riskLabel = 'Médio';
      riskClass = 'kpi-card risco';
      riskTrend.innerHTML = `<i data-lucide="alert-triangle"></i><span>Sinal de atenção na equipe</span>`;
      riskTrend.className = 'kpi-trend warning';
    } else {
      riskLabel = 'Baixo';
      riskClass = 'kpi-card risco-baixo';
      riskTrend.innerHTML = `<i data-lucide="check-circle-2"></i><span>Operação estável</span>`;
      riskTrend.className = 'kpi-trend positive';
    }
    
    riskEl.textContent = `${riskLabel} (${kpis.risco})`;
    riskCard.className = riskClass;

    // Render DISC Distribution Chart
    renderDiscDistributionChart();

    // Render Risk Alertas List
    const riskListContainer = document.getElementById('dashboard-risk-list');
    riskListContainer.innerHTML = '';
    
    const colaboradores = window.db.getColaboradores();
    let alertCount = 0;
    
    colaboradores.forEach(c => {
      const riskObj = window.riskEngine.calcularRisco(c.id);
      if (riskObj.score >= 40) {
        alertCount++;
        const item = document.createElement('div');
        item.className = `risk-item ${riskObj.class}`;
        item.innerHTML = `
          <div class="risk-item-info">
            <img src="${c.foto}" alt="${c.nome}" class="risk-collab-img">
            <div class="risk-meta">
              <h5>${c.nome}</h5>
              <p>${riskObj.flags[0] || 'Desvio operacional identificado'}</p>
            </div>
          </div>
          <span class="risk-badge-number">${riskObj.score}</span>
        `;
        riskListContainer.appendChild(item);
      }
    });

    if (alertCount === 0) {
      riskListContainer.innerHTML = `
        <div style="text-align: center; padding: 32px 0; color: var(--text-muted);">
          <i data-lucide="shield-check" style="font-size:32px; color: var(--success); margin-bottom:8px;"></i>
          <p>Nenhum alerta de risco operacional ativo no momento.</p>
        </div>
      `;
    }
    
    document.getElementById('risk-alert-count').textContent = `${alertCount} ${alertCount === 1 ? 'Alerta' : 'Alertas'}`;
    if (alertCount > 0) {
      document.getElementById('risk-alert-count').className = 'badge badge-danger';
    } else {
      document.getElementById('risk-alert-count').className = 'badge badge-success';
    }

    // Render Upcoming Follow-ups in Dashboard
    const agendaListContainer = document.getElementById('dashboard-agenda-list');
    agendaListContainer.innerHTML = '';
    
    const agendas = window.db.getAgendas().filter(a => a.status === 'Agendado').slice(0, 3);
    if (agendas.length > 0) {
      agendas.forEach(a => {
        const collab = window.db.getColaboradorById(a.colaborador_id);
        if (collab) {
          const dateObj = new Date(a.data);
          const day = dateObj.getDate() + 1; // Correction for timezone
          const monthStr = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
          
          const item = document.createElement('div');
          item.className = 'agenda-item';
          item.innerHTML = `
            <div class="agenda-date-box">
              <span class="agenda-date-day">${day}</span>
              <span class="agenda-date-month">${monthStr}</span>
            </div>
            <div class="agenda-item-content">
              <div class="agenda-item-title">${a.tipo}</div>
              <div class="agenda-item-meta">
                <i data-lucide="user"></i><span>${collab.nome}</span>
                <i data-lucide="clock"></i><span>${a.hora}</span>
              </div>
            </div>
          `;
          agendaListContainer.appendChild(item);
        }
      });
    } else {
      agendaListContainer.innerHTML = `
        <p style="color: var(--text-muted); font-size:13px; text-align:center; padding:16px 0;">Nenhuma sessão agendada.</p>
      `;
    }

    // Render Recent Feedbacks Table
    const recentFeedbacksTbody = document.getElementById('dashboard-recent-feedbacks');
    recentFeedbacksTbody.innerHTML = '';
    
    const feedbacks = window.db.getFeedbacks().slice(0, 4);
    feedbacks.forEach(f => {
      const collab = window.db.getColaboradorById(f.colaborador_id);
      if (collab) {
        const avg = ((f.nota_performance + f.nota_comportamento + f.nota_compliance) / 3).toFixed(1);
        const tr = document.createElement('tr');
        tr.className = 'tr-hover';
        tr.innerHTML = `
          <td>
            <div class="collab-cell">
              <img src="${collab.foto}" alt="${collab.nome}" class="collab-cell-img" style="width:28px; height:28px;">
              <span>${collab.nome}</span>
            </div>
          </td>
          <td>${formatDate(f.data)}</td>
          <td><span class="badge badge-info">${avg}</span></td>
          <td>${f.ia_sugerido ? '<span class="badge badge-success">AI Assisted</span>' : '<span class="badge badge-muted">Padrão</span>'}</td>
        </tr>
        `;
        recentFeedbacksTbody.appendChild(tr);
      }
    });

    lucide.createIcons();
  }

  // Dashboard Bar Chart: DISC Distribution
  function renderDiscDistributionChart() {
    const canvas = document.getElementById('chart-disc-distribution');
    if (!canvas) return;

    const dbData = window.db.getData();
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    
    dbData.disc_resultados.forEach(d => {
      counts.D += d.D || 0;
      counts.I += d.I || 0;
      counts.S += d.S || 0;
      counts.C += d.C || 0;
    });

    const total = dbData.disc_resultados.length || 1;
    const avgD = Math.round(counts.D / total);
    const avgI = Math.round(counts.I / total);
    const avgS = Math.round(counts.S / total);
    const avgC = Math.round(counts.C / total);

    if (teamDiscChartInstance) {
      teamDiscChartInstance.destroy();
    }

    teamDiscChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Dominância (D)', 'Influência (I)', 'Estabilidade (S)', 'Conformidade (C)'],
        datasets: [{
          label: 'Prevalência Média (%)',
          data: [avgD, avgI, avgS, avgC],
          backgroundColor: ['#f43f5e', '#eab308', '#06b6d4', '#8b5cf6'],
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' },
            min: 0,
            max: 100
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  // View: Colaboradores List
  function renderColaboradoresView() {
    const tbody = document.getElementById('team-list-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const colaboradores = window.db.getColaboradores();
    
    colaboradores.forEach(c => {
      const disc = window.db.getDiscResultByColaborador(c.id);
      const feedbacks = window.db.getFeedbacksByColaborador(c.id);
      const risk = window.riskEngine.calcularRisco(c.id);

      // DISC Profile badge
      let discBadge = `<span class="badge badge-muted">Sem Teste</span>`;
      if (disc) {
        const prim = disc.perfil.split('/')[0];
        let colorClass = 'badge-muted';
        if (prim === 'Executor') colorClass = 'badge-danger';
        else if (prim === 'Comunicador') colorClass = 'badge-warning';
        else if (prim === 'Planejador') colorClass = 'badge-info';
        else if (prim === 'Analista') colorClass = 'badge-success';
        discBadge = `<span class="badge ${colorClass}">${disc.perfil}</span>`;
      }

      // Last feedback date
      const lastFeedbackDate = feedbacks.length > 0 ? formatDate(feedbacks[0].data) : 'Nenhum';

      // Overall average score
      let scoreGeral = '—';
      if (feedbacks.length > 0) {
        const latest = feedbacks[0];
        scoreGeral = ((latest.nota_performance + latest.nota_comportamento + latest.nota_compliance) / 3).toFixed(1);
      }

      // Risk level badge
      let riskClass = 'badge-success';
      if (risk.score >= 70) riskClass = 'badge-danger';
      else if (risk.score >= 40) riskClass = 'badge-warning';
      const riskBadge = `<span class="badge ${riskClass}">${risk.nivel} (${risk.score})</span>`;

      const tr = document.createElement('tr');
      tr.className = 'tr-hover';
      tr.innerHTML = `
        <td>
          <div class="collab-cell">
            <img src="${c.foto}" alt="${c.nome}" class="collab-cell-img">
            <div class="collab-name-info">
              <span>${c.nome}</span>
              <span>${c.email}</span>
            </div>
          </div>
        </td>
        <td>${c.cargo}</td>
        <td>${discBadge}</td>
        <td>${lastFeedbackDate}</td>
        <td><span class="badge badge-info" style="font-size:12px;">${scoreGeral}</span></td>
        <td>${riskBadge}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm btn-view-collab" data-id="${c.id}">
              <i data-lucide="eye" style="width:14px; height:14px;"></i>Ver Ficha
            </button>
            <button class="btn btn-primary btn-sm btn-feed-collab" data-id="${c.id}">
              <i data-lucide="message-square-plus" style="width:14px; height:14px;"></i>Feedback
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    lucide.createIcons();

    // Bind Detail & Feedback buttons in Colaboradores table
    document.querySelectorAll('.btn-view-collab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openCollaboratorDetails(id);
      });
    });

    document.querySelectorAll('.btn-feed-collab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openFeedbackModal(id);
      });
    });
  }

  // Open detailed file for collaborator
  function openCollaboratorDetails(id) {
    selectedCollabId = id;
    const collab = window.db.getColaboradorById(id);
    const disc = window.db.getDiscResultByColaborador(id);
    const feedbacks = window.db.getFeedbacksByColaborador(id);
    const planos = window.db.getPlanosAcaoByColaborador(id);

    if (!collab) return;

    // Show panel
    document.getElementById('collab-detail-panel').style.display = 'block';
    
    // Basic Info
    document.getElementById('detail-avatar').src = collab.foto;
    document.getElementById('detail-name').textContent = collab.nome;
    document.getElementById('detail-cargo').textContent = collab.cargo;
    
    // Status Badge
    const statusBadge = document.getElementById('detail-status-badge');
    statusBadge.textContent = collab.status;
    statusBadge.className = collab.status === 'Ativo' ? 'badge badge-success' : 'badge badge-muted';

    // Scores
    let avgPerf = '—';
    let avgCompliance = '—';
    if (feedbacks.length > 0) {
      avgPerf = (feedbacks.reduce((acc, f) => acc + f.nota_performance, 0) / feedbacks.length).toFixed(1);
      avgCompliance = (feedbacks.reduce((acc, f) => acc + f.nota_compliance, 0) / feedbacks.length).toFixed(1);
    }
    document.getElementById('detail-stat-perf').textContent = avgPerf;
    document.getElementById('detail-stat-compliance').textContent = avgCompliance;

    // DISC Display
    const discProfileEl = document.getElementById('detail-disc-profile');
    const discScoresRow = document.getElementById('detail-disc-scores-row');
    const discDescEl = document.getElementById('detail-disc-desc');
    const btnTakeDisc = document.getElementById('btn-detail-take-disc');

    discScoresRow.innerHTML = '';

    if (disc) {
      discProfileEl.textContent = disc.perfil;
      btnTakeDisc.innerHTML = `<i data-lucide="refresh-cw"></i>Mapear Novamente`;
      
      // Render D, I, S, C values
      const primarySigla = disc.principal;
      const interpretation = window.discEngine.interpretacoes[primarySigla];
      
      const letters = ['D', 'I', 'S', 'C'];
      letters.forEach(l => {
        const score = disc[l] || 0;
        const isActive = (l === disc.principal || l === disc.secundario);
        
        const card = document.createElement('div');
        card.className = `disc-pill-col ${isActive ? 'active-' + l : ''}`;
        card.innerHTML = `
          <div class="disc-pill-label">${l}</div>
          <div class="disc-pill-value">${score}%</div>
        `;
        discScoresRow.appendChild(card);
      });

      discDescEl.innerHTML = `
        <strong>Perfil Dominante: ${interpretation.nome}</strong><br>
        ${interpretation.descricao}<br><br>
        <strong>Pontos Fortes:</strong> ${interpretation.pontos_fortes.join(', ')}<br>
        <strong>Pontos de Melhoria:</strong> ${interpretation.pontos_melhoria.join(', ')}<br><br>
        <strong>Como o Gestor deve se comunicar:</strong><br>
        <span style="color: #fff; font-style: italic;">"${interpretation.comunicacao_gestor}"</span>
      `;
    } else {
      discProfileEl.textContent = 'Não Mapeado';
      btnTakeDisc.innerHTML = `<i data-lucide="brain"></i>Aplicar DISC`;
      discScoresRow.innerHTML = `
        <div style="width:100%; text-align:center; padding:12px; border:1px dashed var(--border-color); border-radius:8px; color:var(--text-muted);">
          Nenhum mapeamento comportamental registrado.
        </div>
      `;
      discDescEl.textContent = 'O perfil DISC ajuda a entender a personalidade operacional do profissional, seus pontos de foco e a forma ideal de conduzir conversas de feedback e desenvolvimento.';
    }

    // Set QR Code
    // We generate a QR Code referencing the auto-evaluation endpoint for this user
    const qrUrl = `http://aeropulse.com/auto-eval/${collab.id}`;
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;
    document.getElementById('detail-qr-img').src = qrImgUrl;

    // Action Plans Table
    const plansTbody = document.getElementById('detail-action-plans-tbody');
    plansTbody.innerHTML = '';
    
    if (planos.length > 0) {
      planos.forEach(p => {
        let badgeClass = 'badge-warning';
        if (p.status === 'Concluído') badgeClass = 'badge-success';
        else if (new Date(p.prazo) < new Date() && p.status === 'Em Andamento') badgeClass = 'badge-danger';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <strong>${p.titulo}</strong>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${p.descricao}</div>
          </td>
          <td>${p.metas}</td>
          <td>${formatDate(p.prazo)}</td>
          <td><span class="badge ${badgeClass}">${p.status}</span></td>
          <td>
            ${p.status === 'Em Andamento' ? `
              <button class="btn btn-secondary btn-sm btn-complete-plan" data-id="${p.id}">
                Concluir
              </button>
            ` : '—'}
          </td>
        `;
        plansTbody.appendChild(tr);
      });
    } else {
      plansTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Nenhum plano de ação cadastrado.</td></tr>`;
    }

    // Feedbacks History Table
    const feedsTbody = document.getElementById('detail-feedbacks-history-tbody');
    feedsTbody.innerHTML = '';
    
    if (feedbacks.length > 0) {
      feedbacks.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatDate(f.data)}</td>
          <td><span class="badge badge-muted">${f.nota_performance}</span></td>
          <td><span class="badge badge-muted">${f.nota_comportamento}</span></td>
          <td><span class="badge badge-muted">${f.nota_compliance}</span></td>
          <td style="max-width: 300px; white-space: normal; line-height: 1.4;">${f.observacoes}</td>
          <td>${f.ia_sugerido ? '<span class="badge badge-success">AI Assisted</span>' : '<span class="badge badge-muted">Padrão</span>'}</td>
        `;
        feedsTbody.appendChild(tr);
      });
    } else {
      feedsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Nenhum feedback registrado.</td></tr>`;
    }

    // Render Collaborator Evolution Chart
    renderCollabEvolutionChart(collab.id);
    
    lucide.createIcons();

    // Scroll to detail panel
    document.getElementById('collab-detail-panel').scrollIntoView({ behavior: 'smooth' });

    // Bind action plan completion
    document.querySelectorAll('.btn-complete-plan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planId = e.currentTarget.getAttribute('data-id');
        window.db.updatePlanoAcaoStatus(planId, 'Concluído');
        showToast('Plano de ação concluído com sucesso!', 'success');
        openCollaboratorDetails(selectedCollabId);
        refreshAllViews();
      });
    });
  }

  // Collab Evolution Line Chart
  function renderCollabEvolutionChart(collabId) {
    const canvas = document.getElementById('chart-collab-evolution');
    if (!canvas) return;

    const history = window.db.getEvolucaoHistoricoByColaborador(collabId);
    const labels = history.map(h => h.mes);
    const data = history.map(h => h.score);

    if (collabEvolutionChartInstance) {
      collabEvolutionChartInstance.destroy();
    }

    collabEvolutionChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Sem dados'],
        datasets: [{
          label: 'Score Médio de Feedback',
          data: data.length > 0 ? data : [0],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#818cf8',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' },
            min: 0,
            max: 10
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  // View: Riscos
  function renderRiscosView() {
    const tbody = document.getElementById('risk-analysis-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const colaboradores = window.db.getColaboradores();
    colaboradores.forEach(c => {
      const risk = window.riskEngine.calcularRisco(c.id);
      
      let badgeClass = 'badge-success';
      if (risk.score >= 70) badgeClass = 'badge-danger';
      else if (risk.score >= 40) badgeClass = 'badge-warning';

      const flagsHtml = risk.flags.map(f => `<div style="font-size:11px; margin-bottom:4px; color:var(--text-secondary);"><i data-lucide="info" style="width:10px; height:10px; margin-right:4px; display:inline-block; vertical-align:middle;"></i>${f}</div>`).join('') || '<span style="color:var(--success);">Operando seguro e motivado</span>';

      const tr = document.createElement('tr');
      tr.className = 'tr-hover';
      tr.innerHTML = `
        <td>
          <div class="collab-cell">
            <img src="${c.foto}" alt="${c.nome}" class="collab-cell-img" style="width:32px; height:32px;">
            <span>${c.nome}</span>
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${risk.nivel}</span></td>
        <td><span class="risk-badge-number" style="font-size:13px; font-weight:700;">${risk.score}</span></td>
        <td>${flagsHtml}</td>
        <td>
          <button class="btn btn-secondary btn-sm btn-view-mitigation" data-id="${c.id}">
            Ver Mitigação
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    lucide.createIcons();

    // Bind Mitigation button click
    document.querySelectorAll('.btn-view-mitigation').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openRiskMitigation(id);
      });
    });
  }

  // Open risk mitigation guidelines panel
  function openRiskMitigation(collabId) {
    const container = document.getElementById('risk-mitigation-recommendations');
    const risk = window.riskEngine.calcularRisco(collabId);
    
    if (!risk) return;

    let levelClass = 'badge-success';
    if (risk.score >= 70) levelClass = 'badge-danger';
    else if (risk.score >= 40) levelClass = 'badge-warning';

    const listHtml = risk.recomendacoes.map(r => `
      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom:10px;">
        <div style="font-weight:600; color:var(--primary); font-size:13px; margin-bottom:4px;"><i data-lucide="check-square" style="width:14px; height:14px; margin-right:6px; display:inline-block; vertical-align:middle;"></i>Ação Recomendada</div>
        <div style="font-size:12px; color:var(--text-primary); line-height:1.4;">${r}</div>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <img src="${risk.colaborador_foto}" alt="${risk.colaborador_nome}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
        <div>
          <h4 style="font-family:var(--font-title); font-size:15px; font-weight:700;">${risk.colaborador_nome}</h4>
          <span class="badge ${levelClass}" style="font-size:9px;">Risco ${risk.nivel} (${risk.score})</span>
        </div>
      </div>
      
      <div style="margin-bottom:16px;">
        <h5 style="font-size:12px; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Gatilhos de Risco Ativos</h5>
        ${risk.flags.map(f => `<div style="font-size:12px; color:var(--text-secondary); margin-bottom:6px;"><span style="color:var(--danger); margin-right:6px;">⚠️</span>${f}</div>`).join('') || '<div style="font-size:12px; color:var(--success);">Nenhum gatilho operacional crítico ativo.</div>'}
      </div>

      <div>
        <h5 style="font-size:12px; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Diretrizes de Mitigação</h5>
        ${listHtml}
      </div>
    `;

    lucide.createIcons();
  }

  // View: Manager Agenda
  function renderAgendaView() {
    const tbody = document.getElementById('agenda-list-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const agendas = window.db.getAgendas().sort((a, b) => new Date(a.data) - new Date(b.data));
    
    agendas.forEach(a => {
      const collab = window.db.getColaboradorById(a.colaborador_id);
      if (collab) {
        let badgeClass = 'badge-info';
        if (a.status === 'Realizado') badgeClass = 'badge-success';
        else if (a.status === 'Cancelado') badgeClass = 'badge-muted';

        const tr = document.createElement('tr');
        tr.className = 'tr-hover';
        tr.innerHTML = `
          <td>
            <div class="collab-cell">
              <img src="${collab.foto}" alt="${collab.nome}" class="collab-cell-img" style="width:32px; height:32px;">
              <span>${collab.nome}</span>
            </div>
          </td>
          <td>${formatDate(a.data)}</td>
          <td>${a.hora}</td>
          <td>${a.tipo}</td>
          <td><span class="badge ${badgeClass}">${a.status}</span></td>
          <td>
            ${a.status === 'Agendado' ? `
              <div style="display:flex; gap:6px;">
                <button class="btn btn-primary btn-sm btn-realize-session" data-id="${a.id}">
                  Realizado
                </button>
                <button class="btn btn-secondary btn-sm btn-cancel-session" data-id="${a.id}">
                  Cancelar
                </button>
              </div>
            ` : '—'}
          </td>
        `;
        tbody.appendChild(tr);
      }
    });

    // Bind Agenda action buttons
    document.querySelectorAll('.btn-realize-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.db.updateAgendaStatus(id, 'Realizado');
        
        // When session is done, prompt feedback popup for that collab
        const session = window.db.getAgendas().find(a => a.id === id);
        showToast('Sessão marcada como realizada!', 'success');
        refreshAllViews();
        
        if (session) {
          openFeedbackModal(session.colaborador_id);
        }
      });
    });

    document.querySelectorAll('.btn-cancel-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.db.updateAgendaStatus(id, 'Cancelado');
        showToast('Sessão cancelada.', 'muted');
        refreshAllViews();
      });
    });
  }

  // --- COLLABORATOR PORTAL VIEWS ---

  function renderCollaboratorPortalView() {
    const collab = window.db.getColaboradorById(activeCollabPortalId);
    if (!collab) return;

    const disc = window.db.getDiscResultByColaborador(activeCollabPortalId);
    const feedbacks = window.db.getFeedbacksByColaborador(activeCollabPortalId);
    const planos = window.db.getPlanosAcaoByColaborador(activeCollabPortalId);
    const autoavaliacoes = window.db.getAutoavaliacoesByColaborador(activeCollabPortalId);

    // Portal header info
    document.getElementById('portal-user-avatar').src = collab.foto;
    document.getElementById('portal-user-name').textContent = collab.nome;
    document.getElementById('portal-user-cargo').textContent = collab.cargo;

    const discBadge = document.getElementById('portal-disc-badge');
    if (disc) {
      discBadge.textContent = `Perfil: ${disc.perfil}`;
      discBadge.className = 'badge badge-info';
    } else {
      discBadge.textContent = `DISC: Não Mapeado`;
      discBadge.className = 'badge badge-muted';
    }

    // Personal KPIs
    let avgScoreVal = '—';
    let complianceVal = '—';
    if (feedbacks.length > 0) {
      avgScoreVal = ((feedbacks[0].nota_performance + feedbacks[0].nota_comportamento + feedbacks[0].nota_compliance) / 3).toFixed(1);
      complianceVal = feedbacks[0].nota_compliance.toFixed(1);
    }
    document.getElementById('portal-kpi-perf').textContent = avgScoreVal;
    
    // Motivation KPI
    const motivEl = document.getElementById('portal-kpi-motivacao');
    const motivTrend = document.getElementById('portal-kpi-motivacao-trend');
    if (autoavaliacoes.length > 0) {
      const latestAuto = autoavaliacoes[0];
      motivEl.textContent = `${latestAuto.motivacao}/10`;
      motivTrend.textContent = `Reportado em ${formatDate(latestAuto.data)}`;
    } else {
      motivEl.textContent = 'Sem dados';
      motivTrend.textContent = 'Preencha a autoavaliação';
    }

    // Active Action Plans Count
    const activePlansCount = planos.filter(p => p.status === 'Em Andamento').length;
    document.getElementById('portal-kpi-planos').textContent = activePlansCount;
    document.getElementById('portal-kpi-planos-trend').textContent = `${planos.length} total criados`;

    // Compliance rating card class adjustment
    document.getElementById('portal-kpi-conformidade').textContent = complianceVal;
    const conforCard = document.getElementById('portal-kpi-confor-card');
    if (complianceVal !== '—') {
      const complianceNum = parseFloat(complianceVal);
      if (complianceNum >= 9.0) conforCard.className = 'kpi-card performance';
      else if (complianceNum >= 7.5) conforCard.className = 'kpi-card engajamento';
      else conforCard.className = 'kpi-card risco';
    } else {
      conforCard.className = 'kpi-card performance';
    }

    // Action Plans List for Employee
    const plansTbody = document.getElementById('portal-action-plans-tbody');
    plansTbody.innerHTML = '';
    
    if (planos.length > 0) {
      planos.forEach(p => {
        let badgeClass = 'badge-warning';
        if (p.status === 'Concluído') badgeClass = 'badge-success';
        else if (new Date(p.prazo) < new Date() && p.status === 'Em Andamento') badgeClass = 'badge-danger';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <strong>${p.titulo}</strong>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${p.descricao}</div>
          </td>
          <td>${p.metas}</td>
          <td>${formatDate(p.prazo)}</td>
          <td><span class="badge ${badgeClass}">${p.status}</span></td>
          <td>
            ${p.status === 'Em Andamento' ? `
              <button class="btn btn-primary btn-sm btn-complete-plan-portal" data-id="${p.id}">
                Marcar Concluído
              </button>
            ` : '—'}
          </td>
        `;
        plansTbody.appendChild(tr);
      });
    } else {
      plansTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px 0;">Nenhum plano de ação ativo no momento.</td></tr>`;
    }

    // Bind portal action plan complete
    document.querySelectorAll('.btn-complete-plan-portal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planId = e.currentTarget.getAttribute('data-id');
        window.db.updatePlanoAcaoStatus(planId, 'Concluído');
        showToast('Plano de ação enviado para validação!', 'success');
        refreshAllViews();
      });
    });

    // DISC Test panel in collaborator dashboard
    const discStatusContent = document.getElementById('portal-disc-status-content');
    if (disc) {
      discStatusContent.innerHTML = `
        <div style="text-align:left; background:rgba(255,255,255,0.01); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom:12px;">
          <h4 style="font-family:var(--font-title); font-size:14px; font-weight:700; color:var(--accent); margin-bottom:6px;">Perfil: ${disc.perfil}</h4>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">Seu perfil comportamental é registrado no sistema para ajudar nas tomadas de decisão e na forma de condução de mentorias com o seu gestor.</p>
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-portal-retest">
          <i data-lucide="refresh-cw"></i>Refazer Mapeamento DISC
        </button>
      `;
      document.getElementById('btn-portal-retest').addEventListener('click', () => {
        openDiscTestModal(activeCollabPortalId);
      });
    } else {
      discStatusContent.innerHTML = `
        <div style="padding:16px 0;">
          <i data-lucide="brain" style="font-size:32px; color:var(--accent); margin-bottom:8px; display:inline-block;"></i>
          <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">Você ainda não mapeou seu perfil comportamental. Responda o questionário DISC do AeroPulse para entender melhor suas forças operacionais.</p>
          <button class="btn btn-primary btn-sm" id="btn-portal-start-disc" style="width:100%;">
            <i data-lucide="sparkles"></i>Mapear Meu Perfil (10 Questões)
          </button>
        </div>
      `;
      document.getElementById('btn-portal-start-disc').addEventListener('click', () => {
        openDiscTestModal(activeCollabPortalId);
      });
    }

    // Portal Feedbacks History Table
    const feedsTbody = document.getElementById('portal-feedbacks-tbody');
    feedsTbody.innerHTML = '';
    
    if (feedbacks.length > 0) {
      feedbacks.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatDate(f.data)}</td>
          <td><span class="badge badge-muted">${f.nota_performance}</span></td>
          <td><span class="badge badge-muted">${f.nota_comportamento}</span></td>
          <td><span class="badge badge-muted">${f.nota_compliance}</span></td>
          <td style="max-width: 300px; white-space: normal; line-height: 1.4;">${f.observacoes}</td>
        `;
        feedsTbody.appendChild(tr);
      });
    } else {
      feedsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px 0;">Nenhum feedback registrado ainda.</td></tr>`;
    }

    // Render Portal Line Chart
    renderPortalEvolutionChart(activeCollabPortalId);
    
    lucide.createIcons();
  }

  // Collaborator Portal Line Chart
  function renderPortalEvolutionChart(collabId) {
    const canvas = document.getElementById('chart-portal-evolution');
    if (!canvas) return;

    const history = window.db.getEvolucaoHistoricoByColaborador(collabId);
    const labels = history.map(h => h.mes);
    const data = history.map(h => h.score);

    if (portalEvolutionChartInstance) {
      portalEvolutionChartInstance.destroy();
    }

    portalEvolutionChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Sem dados'],
        datasets: [{
          label: 'Evolução de Scores',
          data: data.length > 0 ? data : [0],
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#c084fc',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' },
            min: 0,
            max: 10
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  // View: Collaborator Portal Agenda
  function renderCollaboratorAgendaView() {
    const tbody = document.getElementById('portal-agenda-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const agendas = window.db.getAgendasByColaborador(activeCollabPortalId).sort((a, b) => new Date(a.data) - new Date(b.data));
    
    if (agendas.length > 0) {
      agendas.forEach(a => {
        const manager = window.db.getGestores()[0];
        let badgeClass = 'badge-info';
        if (a.status === 'Realizado') badgeClass = 'badge-success';
        else if (a.status === 'Cancelado') badgeClass = 'badge-muted';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatDate(a.data)}</td>
          <td>${a.hora}</td>
          <td><strong>${a.tipo}</strong></td>
          <td>${manager.nome}</td>
          <td><span class="badge ${badgeClass}">${a.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px 0;">Nenhuma sessão de acompanhamento agendada.</td></tr>`;
    }
  }


  // --- SETUP EVENT LISTENERS & ROUTING ---

  function setupEventListeners() {
    
    // Switch View navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const viewName = e.currentTarget.getAttribute('data-view');
        
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Add active to clicked link
        e.currentTarget.classList.add('active');
        
        // Toggle view containers
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`view-${viewName}`).classList.add('active');
        
        // Set Header Title text
        let headerTitle = 'Dashboard Operacional';
        if (viewName === 'colaboradores') headerTitle = 'Gestão de Colaboradores';
        else if (viewName === 'riscos') headerTitle = 'Gestão de Risco & Mitigação';
        else if (viewName === 'agenda') headerTitle = 'Agenda de Follow-up';
        else if (viewName === 'colaborador-portal') headerTitle = 'Meu Portal de Performance';
        else if (viewName === 'colaborador-agenda') headerTitle = 'Minhas Sessões Agendadas';
        
        document.getElementById('current-view-title').textContent = headerTitle;
      });
    });

    // Toggle Role: Manager vs Collaborator
    document.getElementById('toggle-manager').addEventListener('click', (e) => {
      if (currentRole === 'manager') return;
      currentRole = 'manager';
      
      document.getElementById('toggle-manager').classList.add('active');
      document.getElementById('toggle-collab').classList.remove('active');
      
      refreshAllViews();
      
      // Go to manager dashboard view by default
      const dashLink = document.querySelector('[data-view="dashboard"]');
      if (dashLink) dashLink.click();
    });

    document.getElementById('toggle-collab').addEventListener('click', (e) => {
      if (currentRole === 'collaborator') return;
      
      // Prompt user to select which collaborator to simulate
      const collaborators = window.db.getColaboradores();
      
      // Create quick choice list
      let promptText = "Selecione o colaborador que deseja simular:\n\n";
      collaborators.forEach((c, idx) => {
        promptText += `${idx + 1}. ${c.nome} (${c.cargo})\n`;
      });
      
      const choice = prompt(promptText, "1");
      if (choice === null) return; // cancelled
      
      const choiceIdx = parseInt(choice) - 1;
      if (isNaN(choiceIdx) || choiceIdx < 0 || choiceIdx >= collaborators.length) {
        alert("Opção inválida!");
        return;
      }
      
      activeCollabPortalId = collaborators[choiceIdx].id;
      currentRole = 'collaborator';
      
      document.getElementById('toggle-manager').classList.remove('active');
      document.getElementById('toggle-collab').classList.add('active');
      
      refreshAllViews();
      
      // Go to collaborator portal view
      const portalLink = document.querySelector('[data-view="colaborador-portal"]');
      if (portalLink) portalLink.click();
    });

    // Reset Database Demo Button
    document.getElementById('btn-reset-db').addEventListener('click', () => {
      if (confirm('Deseja realmente redefinir o banco de dados e carregar os dados de demonstração da Aviação? Todos os seus feedbacks e cadastros locais serão limpos.')) {
        window.db.reset();
        selectedCollabId = null;
        document.getElementById('collab-detail-panel').style.display = 'none';
        refreshAllViews();
        showToast('Banco de dados redefinido para o padrão com sucesso!', 'success');
      }
    });

    // Modals Open Shortcut buttons in Dashboard
    document.getElementById('btn-schedule-shortcut').addEventListener('click', () => {
      openScheduleModal();
    });
    
    document.getElementById('btn-feedback-shortcut').addEventListener('click', () => {
      // Default to first collaborator
      const collab = window.db.getColaboradores()[0];
      if (collab) openFeedbackModal(collab.id);
    });

    // Close Modals events
    document.querySelectorAll('.modal-close, .modal-cancel, #btn-close-qr-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Find closest modal-overlay and close it
        const overlay = e.currentTarget.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('active');
      });
    });

    // Close Detail sheet panel
    document.getElementById('btn-close-detail').addEventListener('click', () => {
      document.getElementById('collab-detail-panel').style.display = 'none';
      selectedCollabId = null;
    });

    // --- FORM SUBMISSIONS ---

    // Cadastrar Colaborador
    document.getElementById('form-add-collab').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nome = document.getElementById('collab-nome').value;
      const email = document.getElementById('collab-email').value;
      const cargo = document.getElementById('collab-cargo').value;
      const foto = document.getElementById('collab-foto').value || null;

      const newCollab = window.db.addColaborador({ nome, email, cargo, foto });
      showToast(`${newCollab.nome} foi cadastrado com sucesso!`, 'success');
      
      // Close modal
      document.getElementById('modal-add-collab').classList.remove('active');
      
      // Clear form
      document.getElementById('form-add-collab').reset();
      
      // Refresh
      refreshAllViews();
    });

    // Add Collaborator button trigger modal
    document.getElementById('btn-add-collab').addEventListener('click', () => {
      openModal('modal-add-collab');
    });

    // Add Feedback form
    document.getElementById('form-add-feedback').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const collabId = document.getElementById('feedback-collab-id').value;
      const perf = parseFloat(document.getElementById('feed-nota-perf').value);
      const comp = parseFloat(document.getElementById('feed-nota-comp').value);
      const compliance = parseFloat(document.getElementById('feed-nota-compliance').value);
      
      const p_comunicacao = parseInt(document.getElementById('feed-p-comunicacao').value);
      const p_conformidade = parseInt(document.getElementById('feed-p-conformidade').value);
      const p_resolucao = parseInt(document.getElementById('feed-p-resolucao').value);
      const p_empatia = parseInt(document.getElementById('feed-p-empatia').value);

      const obs = document.getElementById('feed-obs').value;
      const isAiAssisted = document.getElementById('ai-text-result-container').style.display === 'block';

      const feedback = {
        colaborador_id: collabId,
        gestor_id: 'g1',
        nota_performance: perf,
        nota_comportamento: comp,
        nota_compliance: compliance,
        observacoes: obs,
        pilares: {
          comunicacao: p_comunicacao,
          conformidade: p_conformidade,
          resolucao_problemas: p_resolucao,
          empatia: p_empatia
        },
        ia_sugerido: isAiAssisted
      };

      window.db.addFeedback(feedback);
      showToast('Feedback registrado com sucesso!', 'success');
      
      // Close modal
      document.getElementById('modal-add-feedback').classList.remove('active');
      
      // Refresh views
      refreshAllViews();
      if (selectedCollabId === collabId) {
        openCollaboratorDetails(collabId);
      }
    });

    // AI suggestion generation in feedback form
    document.getElementById('btn-generate-ai-text').addEventListener('click', () => {
      const collabId = document.getElementById('feedback-collab-id').value;
      const area = document.getElementById('ai-feed-area').value;
      const tom = document.getElementById('ai-feed-tom').value;

      const aiRes = window.aiCopilot.sugerirAbordagemFeedback(collabId, area, tom);
      if (aiRes) {
        document.getElementById('ai-strategic-approach').innerHTML = `<strong>Abordagem DISC Ideal (${aiRes.perfil}):</strong><br>${aiRes.abordagem_estrategica}`;
        document.getElementById('ai-text-suggestion').textContent = aiRes.texto_sugerido;
        
        const dicasUl = document.getElementById('ai-dicas-list');
        dicasUl.innerHTML = '';
        aiRes.dicas_entrega.forEach(d => {
          const li = document.createElement('li');
          li.textContent = d;
          dicasUl.appendChild(li);
        });

        document.getElementById('ai-text-result-container').style.display = 'block';
      }
    });

    // Copy AI text suggestion into observations field
    document.getElementById('btn-copy-ai-text').addEventListener('click', () => {
      const text = document.getElementById('ai-text-suggestion').textContent;
      document.getElementById('feed-obs').value = text;
      showToast('Abordagem da IA copiada para as observações!', 'info');
    });

    // Trigger Action Plan Create Modal
    document.getElementById('btn-create-action-plan').addEventListener('click', () => {
      if (selectedCollabId) {
        document.getElementById('action-plan-collab-id').value = selectedCollabId;
        
        // Pick lowest pillar to show AI default recommendation
        const feedbacks = window.db.getFeedbacksByColaborador(selectedCollabId);
        let lowestPillar = 'comunicacao';
        if (feedbacks.length > 0) {
          const p = feedbacks[0].pilares;
          const minVal = Math.min(p.comunicacao, p.conformidade, p.resolucao_problemas, p.empatia);
          if (p.conformidade === minVal) lowestPillar = 'conformidade';
          else if (p.resolucao_problemas === minVal) lowestPillar = 'resolucao_problemas';
          else if (p.empatia === minVal) lowestPillar = 'empatia';
        }
        document.getElementById('ai-plan-pilar').value = lowestPillar;
        
        openModal('modal-action-plan');
      }
    });

    // AI Action Plan generator trigger
    document.getElementById('btn-generate-ai-plan').addEventListener('click', () => {
      const collabId = document.getElementById('action-plan-collab-id').value;
      const pilar = document.getElementById('ai-plan-pilar').value;

      const planSug = window.aiCopilot.sugerirPlanoAcao(collabId, pilar);
      if (planSug) {
        document.getElementById('plan-titulo').value = planSug.titulo;
        document.getElementById('plan-descricao').value = planSug.descricao;
        document.getElementById('plan-metas').value = planSug.metas;
        document.getElementById('plan-prazo').value = planSug.prazo;
        showToast('Plano de Ação estruturado pela IA com sucesso!', 'info');
      }
    });

    // Action Plan submit
    document.getElementById('form-action-plan').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const collabId = document.getElementById('action-plan-collab-id').value;
      const titulo = document.getElementById('plan-titulo').value;
      const descricao = document.getElementById('plan-descricao').value;
      const metas = document.getElementById('plan-metas').value;
      const prazo = document.getElementById('plan-prazo').value;

      window.db.addPlanoAcao({ colaborador_id: collabId, titulo, descricao, metas, prazo });
      showToast('Plano de Ação ativado com sucesso!', 'success');
      
      // Close modal
      document.getElementById('modal-action-plan').classList.remove('active');
      
      // Refresh views
      refreshAllViews();
      if (selectedCollabId === collabId) {
        openCollaboratorDetails(collabId);
      }
    });

    // Trigger DISC Mapear Novamente from Detail View
    document.getElementById('btn-detail-take-disc').addEventListener('click', () => {
      if (selectedCollabId) {
        openDiscTestModal(selectedCollabId);
      }
    });

    // Trigger Schedule Session Modal
    document.getElementById('btn-schedule-session').addEventListener('click', () => {
      openScheduleModal();
    });

    // Schedule form submit
    document.getElementById('form-schedule').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const collabId = document.getElementById('schedule-collab-id-select').value;
      const data = document.getElementById('schedule-data').value;
      const hora = document.getElementById('schedule-hora').value;
      const tipo = document.getElementById('schedule-tipo').value;

      window.db.addAgenda({ colaborador_id: collabId, gestor_id: 'g1', data, hora, tipo });
      showToast('Sessão de acompanhamento agendada!', 'success');
      
      // Close modal
      document.getElementById('modal-schedule').classList.remove('active');
      
      // Clear form
      document.getElementById('form-schedule').reset();
      
      // Refresh
      refreshAllViews();
    });

    // QR Code simulation scan trigger
    document.getElementById('btn-simulate-qr').addEventListener('click', () => {
      if (selectedCollabId) {
        openAutoEvaluationModal(selectedCollabId);
      }
    });
    
    document.getElementById('btn-simulate-qr-action').addEventListener('click', () => {
      const collabId = document.getElementById('auto-eval-collab-id').value;
      document.getElementById('modal-qr-view').classList.remove('active');
      openAutoEvaluationModal(collabId);
    });

    // Auto-avaliação submit form (Collaborator Perspective)
    document.getElementById('form-auto-eval').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const collabId = document.getElementById('auto-eval-collab-id').value;
      const notaAuto = parseFloat(document.getElementById('auto-nota-auto').value);
      const motivacao = parseFloat(document.getElementById('auto-nota-motivacao').value);
      const metas = document.getElementById('auto-metas').value;
      const comentarios = document.getElementById('auto-comentarios').value;

      window.db.addAutoavaliacao({
        colaborador_id: collabId,
        nota_auto: notaAuto,
        motivacao: motivacao,
        respostas_metas: metas,
        comentarios: comentarios
      });

      showToast('Autoavaliação enviada com sucesso! Os KPIs do gestor foram atualizados.', 'success');
      
      // Close modal
      document.getElementById('modal-auto-eval').classList.remove('active');
      
      // Clear form
      document.getElementById('form-auto-eval').reset();
      
      // Refresh
      refreshAllViews();
      if (selectedCollabId === collabId) {
        openCollaboratorDetails(collabId);
      }
    });

  }

  // --- MODAL TRIGGERS AND COMPONENT CONTROLLERS ---

  function openModal(id) {
    document.getElementById(id).classList.add('active');
    lucide.createIcons();
  }

  // Open feedback dialog
  function openFeedbackModal(collabId) {
    const collab = window.db.getColaboradorById(collabId);
    if (!collab) return;

    document.getElementById('feedback-collab-id').value = collabId;
    
    // Check if DISC mapped to show labels in AI box
    const disc = window.db.getDiscResultByColaborador(collabId);
    const discLabel = document.getElementById('ai-collab-disc-label');
    if (disc) {
      discLabel.textContent = `Perfil: ${disc.perfil}`;
      discLabel.className = 'badge badge-info';
    } else {
      discLabel.textContent = `Não Mapeado`;
      discLabel.className = 'badge badge-muted';
    }

    // Hide AI result until they generate
    document.getElementById('ai-text-result-container').style.display = 'none';
    document.getElementById('feed-obs').value = '';

    openModal('modal-add-feedback');
  }

  // Open schedule dialog
  function openScheduleModal() {
    const select = document.getElementById('schedule-collab-id-select');
    select.innerHTML = '';

    const colaboradores = window.db.getColaboradores();
    colaboradores.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.nome} (${c.cargo})`;
      select.appendChild(opt);
    });

    // Default dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('schedule-data').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('schedule-hora').value = '10:00';

    openModal('modal-schedule');
  }

  // Open auto-evaluation input form (representing QR Code scan payload)
  function openAutoEvaluationModal(collabId) {
    const collab = window.db.getColaboradorById(collabId);
    if (!collab) return;

    document.getElementById('auto-eval-collab-id').value = collabId;
    document.getElementById('auto-eval-collab-name').textContent = collab.nome;
    document.getElementById('form-auto-eval').reset();

    openModal('modal-auto-eval');
  }


  // --- DISC ASSESSMENT DIALOG FLOW ---
  
  let discSurveyCurrentIndex = 0;
  let discSurveyAnswers = [];
  let discSurveyCollabId = null;

  function openDiscTestModal(collabId) {
    const collab = window.db.getColaboradorById(collabId);
    if (!collab) return;

    discSurveyCollabId = collabId;
    discSurveyCurrentIndex = 0;
    discSurveyAnswers = [];
    document.getElementById('disc-collab-name-modal').textContent = collab.nome;

    renderDiscSurveyQuestion();
    openModal('modal-disc-test');
  }

  function renderDiscSurveyQuestion() {
    const q = window.discEngine.questoes[discSurveyCurrentIndex];
    const container = document.getElementById('disc-questions-container');
    
    // Progress
    document.getElementById('disc-survey-progress').textContent = `Questão ${discSurveyCurrentIndex + 1} de ${window.discEngine.questoes.length}`;

    // Options mapping HTML
    const optionsHtml = q.opcoes.map((opt, idx) => `
      <label class="disc-survey-option-label">
        <input type="radio" name="disc_opt" value="${opt.tipo}" ${discSurveyAnswers[discSurveyCurrentIndex] === opt.tipo ? 'checked' : ''}>
        <span class="disc-survey-option-text">${opt.texto}</span>
      </label>
    `).join('');

    container.innerHTML = `
      <div class="disc-survey-q-card">
        <div class="disc-survey-q-title">${q.id}. ${q.pergunta}</div>
        <div class="disc-survey-options">
          ${optionsHtml}
        </div>
      </div>
    `;

    // Navigation buttons toggle
    const prevBtn = document.getElementById('btn-disc-prev');
    const nextBtn = document.getElementById('btn-disc-next');
    const finishBtn = document.getElementById('btn-disc-finish');

    prevBtn.style.display = discSurveyCurrentIndex > 0 ? 'inline-block' : 'none';
    
    if (discSurveyCurrentIndex === window.discEngine.questoes.length - 1) {
      nextBtn.style.display = 'none';
      finishBtn.style.display = 'inline-block';
    } else {
      nextBtn.style.display = 'inline-block';
      finishBtn.style.display = 'none';
    }
  }

  // DISC Question buttons bindings
  document.getElementById('btn-disc-next').addEventListener('click', () => {
    const selected = document.querySelector('input[name="disc_opt"]:checked');
    if (!selected) {
      alert('Por favor, selecione uma opção para continuar.');
      return;
    }
    
    discSurveyAnswers[discSurveyCurrentIndex] = selected.value;
    discSurveyCurrentIndex++;
    renderDiscSurveyQuestion();
  });

  document.getElementById('btn-disc-prev').addEventListener('click', () => {
    discSurveyCurrentIndex--;
    renderDiscSurveyQuestion();
  });

  document.getElementById('btn-disc-finish').addEventListener('click', () => {
    const selected = document.querySelector('input[name="disc_opt"]:checked');
    if (!selected) {
      alert('Por favor, selecione uma opção para finalizar.');
      return;
    }
    discSurveyAnswers[discSurveyCurrentIndex] = selected.value;

    // Calculate score
    const result = window.discEngine.calcular(discSurveyAnswers);
    result.colaborador_id = discSurveyCollabId;
    
    // Save to Database
    window.db.saveDiscResult(result);
    
    // Show Toast
    showToast(`Mapeamento concluído! Perfil dominante: ${result.perfil}`, 'success');
    
    // Close modal
    document.getElementById('modal-disc-test').classList.remove('active');
    
    // Refresh UI
    refreshAllViews();
    if (selectedCollabId === discSurveyCollabId) {
      openCollaboratorDetails(discSurveyCollabId);
    }
  });


  // --- UTILITY FUNCTIONS ---

  // Custom Toast notification
  function showToast(message, type = 'primary') {
    const container = document.getElementById('toast-container');
    if (!container) {
      const toastCont = document.createElement('div');
      toastCont.id = 'toast-container';
      document.body.appendChild(toastCont);
    }

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    
    let icon = 'info';
    if (type === 'success') {
      icon = 'check-circle';
      toast.style.borderColor = 'var(--success)';
    } else if (type === 'danger') {
      icon = 'alert-triangle';
      toast.style.borderColor = 'var(--danger)';
    } else if (type === 'warning') {
      icon = 'alert-octagon';
      toast.style.borderColor = 'var(--warning)';
    }

    toast.innerHTML = `
      <i data-lucide="${icon}"></i>
      <span style="font-size:13px; font-weight:600;">${message}</span>
    `;

    document.getElementById('toast-container').appendChild(toast);
    lucide.createIcons();

    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Format Date (YYYY-MM-DD -> DD/MM/YYYY)
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  // Start app
  initApp();
});
