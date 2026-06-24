/**
 * AeroPulse — app.js
 * Main application controller. Handles onboarding, routing, and all views.
 */

// ─── State ────────────────────────────────────────────────────────────────────
let currentView = 'dashboard';
let currentColabId = null;
let currentPlanoColabId = null;
let currentAgendaColabId = null;

// Onboarding state
let obGestorData = {};
let obDiscEngine = null;
let obCurrentQ = 0;
let obDiscResult = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (db.isSetupComplete()) {
    launchApp();
  } else {
    showOnboarding();
  }
});

function showOnboarding() {
  document.getElementById('onboarding-overlay').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function launchApp() {
  document.getElementById('onboarding-overlay').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderSidebarProfile();
  navigateTo('dashboard', document.querySelector('[data-view="dashboard"]'));
}

// ─── ONBOARDING FLOW ─────────────────────────────────────────────────────────
function obNextStep1() {
  const nome    = document.getElementById('ob-nome').value.trim();
  const cargo   = document.getElementById('ob-cargo').value.trim();
  const empresa = document.getElementById('ob-empresa').value.trim();
  const email   = document.getElementById('ob-email').value.trim();

  if (!nome || !cargo || !empresa || !email) {
    showToast('Preencha todos os campos antes de continuar.', 'error');
    return;
  }

  obGestorData = { nome, cargo, empresa, email };
  obSetStep(2);
}

function obStartDisc() {
  obDiscEngine = new DISCEngine(DISC_MANAGER_QUESTIONS);
  obCurrentQ = 0;
  obSetStep(3);
  obRenderQuestion();
}

function obRenderQuestion() {
  const q = DISC_MANAGER_QUESTIONS[obCurrentQ];
  const total = DISC_MANAGER_QUESTIONS.length;
  const pct   = Math.round(((obCurrentQ + 1) / total) * 100);
  const letters = ['A','B','C','D'];

  document.getElementById('ob-disc-counter').textContent = `Pergunta ${obCurrentQ + 1} de ${total}`;
  document.getElementById('ob-disc-progress').style.width = pct + '%';
  document.getElementById('ob-disc-question').textContent = q.pergunta;

  const opts = document.getElementById('ob-disc-options');
  opts.innerHTML = '';
  // Shuffle options for each render (keep original order for consistency)
  q.opcoes.forEach((op, i) => {
    const div = document.createElement('div');
    div.className = 'disc-option';
    const saved = obDiscEngine.respostas[q.id];
    if (saved === op.tipo) div.classList.add('selected');

    div.innerHTML = `<div class="disc-option-letter">${letters[i]}</div><span>${op.texto}</span>`;
    div.onclick = () => {
      document.querySelectorAll('.disc-option').forEach(d => d.classList.remove('selected'));
      div.classList.add('selected');
      obDiscEngine.registrarResposta(q.id, op.tipo);
      document.getElementById('ob-disc-next').disabled = false;
    };
    opts.appendChild(div);
  });

  document.getElementById('ob-disc-next').disabled = !obDiscEngine.respostas[q.id];
  document.getElementById('ob-disc-prev').disabled = obCurrentQ === 0;

  // Last question: change button to "Ver Resultado"
  const nextBtn = document.getElementById('ob-disc-next');
  nextBtn.textContent = obCurrentQ === total - 1 ? 'Ver Resultado →' : 'Próxima →';
}

function obDiscNext() {
  const total = DISC_MANAGER_QUESTIONS.length;
  if (obCurrentQ < total - 1) {
    obCurrentQ++;
    obRenderQuestion();
  } else {
    // Show result
    obDiscResult = obDiscEngine.calcularResultado();
    obSetStep(4);
    obRenderDiscResult();
  }
}

function obDiscPrev() {
  if (obCurrentQ > 0) {
    obCurrentQ--;
    obRenderQuestion();
  }
}

function obRenderDiscResult() {
  const r = obDiscResult;
  const profile = DISC_PROFILES[r.perfil_dominante];
  const container = document.getElementById('ob-disc-result');
  container.innerHTML = `
    <div class="disc-result-badge" style="color:${profile.cor};border-color:${profile.cor};background:${profile.cor}1a;">
      <span>${profile.emoji}</span>
    </div>
    <div class="disc-result-name" style="color:${profile.cor}">${profile.nome}</div>
    <div class="disc-result-desc">${profile.descricao}</div>
    <div class="disc-bars">
      ${Object.entries(r.percentuais).map(([k,v]) => `
        <div class="disc-bar-item">
          <label><span>${DISC_PROFILES[k].emoji} ${DISC_PROFILES[k].nome}</span><span>${v}%</span></label>
          <div class="bar"><div class="bar-fill bar-${k}" style="width:${v}%"></div></div>
        </div>
      `).join('')}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px;">
      ${profile.pontos_fortes.map(p => `<span class="badge badge-purple">${p}</span>`).join('')}
    </div>
  `;
}

function obFinish() {
  const gestor = {
    ...obGestorData,
    disc: obDiscResult,
    foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(obGestorData.nome)}&background=7c3aed&color=fff&size=128`,
    created_at: new Date().toISOString()
  };
  db.saveGestor(gestor);
  launchApp();
}

function obSetStep(n) {
  document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`ob-step-${n}`).classList.add('active');
}

// ─── SIDEBAR & ROUTING ────────────────────────────────────────────────────────
function renderSidebarProfile() {
  const gestor = db.getGestor();
  if (!gestor) return;
  document.getElementById('sidebar-name').textContent = gestor.nome;
  document.getElementById('sidebar-avatar').src = gestor.foto || '';
  const discBadge = document.getElementById('sidebar-disc-badge');
  if (gestor.disc) {
    const p = DISC_PROFILES[gestor.disc.perfil_dominante];
    discBadge.textContent = `${p.emoji} ${p.nome}`;
    discBadge.style.background = p.cor + '22';
    discBadge.style.color = p.cor;
    discBadge.style.borderColor = p.cor + '66';
  } else {
    discBadge.textContent = 'DISC Pendente';
  }
}

function navigateTo(view, el) {
  currentView = view;

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  else {
    const target = document.querySelector(`[data-view="${view}"]`);
    if (target) target.classList.add('active');
  }

  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  const titles = {
    'dashboard':      ['Dashboard',             'Visão geral da operação'],
    'colaboradores':  ['Colaboradores',         'Equipe cadastrada na plataforma'],
    'feedbacks':      ['Feedbacks',             'Histórico de feedbacks registrados'],
    'risco':          ['Risco Operacional',     'Análise de risco por colaborador'],
    'planos':         ['Planos de Ação',        'Planos ativos da equipe'],
    'agenda':         ['Agenda',                'Sessões de acompanhamento agendadas'],
    'meu-perfil':     ['Meu Perfil',            'Seu perfil DISC e informações de gestor'],
    'perfil-colab':   ['Perfil do Colaborador', 'Histórico e indicadores do colaborador'],
  };

  const [title, subtitle] = titles[view] || ['AeroPulse', ''];
  document.getElementById('top-bar-title').textContent = title;
  document.getElementById('top-bar-subtitle').textContent = subtitle;

  // Show / hide top bar action button
  document.getElementById('top-bar-action-btn').style.display =
    ['dashboard','colaboradores'].includes(view) ? 'flex' : 'none';

  // Activate view and render
  const viewEl = document.getElementById(`view-${view}`);
  if (viewEl) {
    viewEl.classList.add('active');
    renderView(view);
  }
}

function renderView(view) {
  switch (view) {
    case 'dashboard':     renderDashboard();     break;
    case 'colaboradores': renderColaboradores(); break;
    case 'feedbacks':     renderFeedbacks();     break;
    case 'risco':         renderRisco();         break;
    case 'planos':        renderPlanos();        break;
    case 'agenda':        renderAgenda();        break;
    case 'meu-perfil':    renderMeuPerfil();     break;
    case 'perfil-colab':  renderPerfilColab();   break;
  }
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function renderDashboard() {
  const colabs = db.getColaboradores();
  const feedbacks = db.getFeedbacks();

  if (colabs.length === 0) {
    document.getElementById('dash-empty').style.display = 'flex';
    document.getElementById('dash-content').style.display = 'none';
    return;
  }
  document.getElementById('dash-empty').style.display = 'none';
  document.getElementById('dash-content').style.display = 'block';

  // KPIs
  const totalFeedbacks = feedbacks.length;
  const avgScore = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + ((parseFloat(f.nota_performance) + parseFloat(f.nota_comportamento) + parseFloat(f.nota_compliance)) / 3), 0) / feedbacks.length).toFixed(1)
    : '—';
  const discResultados = db.getDiscResultados();
  const semDisc = colabs.filter(c => !discResultados.find(d => d.colaborador_id === c.id)).length;

  document.getElementById('dash-kpis').innerHTML = `
    <div class="kpi-card accent-purple">
      <div class="kpi-label">Total de Colaboradores</div>
      <div class="kpi-value">${colabs.length}</div>
      <div class="kpi-sub">Equipe cadastrada</div>
    </div>
    <div class="kpi-card accent-blue">
      <div class="kpi-label">Feedbacks Registrados</div>
      <div class="kpi-value">${totalFeedbacks}</div>
      <div class="kpi-sub">No histórico geral</div>
    </div>
    <div class="kpi-card accent-green">
      <div class="kpi-label">Score Médio</div>
      <div class="kpi-value">${avgScore}</div>
      <div class="kpi-sub">Performance da equipe</div>
    </div>
    <div class="kpi-card accent-red">
      <div class="kpi-label">Sem Perfil DISC</div>
      <div class="kpi-value">${semDisc}</div>
      <div class="kpi-sub">Aguardando avaliação</div>
    </div>
  `;

  // DISC distribution
  const discCount = { D:0, I:0, E:0, C:0 };
  discResultados.forEach(d => { if (discCount[d.perfil_dominante] !== undefined) discCount[d.perfil_dominante]++; });
  document.getElementById('dash-disc-chart').innerHTML = `
    <div class="disc-bars-list">
      ${Object.entries(discCount).map(([k,v]) => {
        const p = DISC_PROFILES[k];
        const pct = discResultados.length ? Math.round((v/discResultados.length)*100) : 0;
        return `
          <div class="disc-bar-row">
            <label><span>${p.emoji} ${p.nome}</span><span>${v} pessoa${v!==1?'s':''} (${pct}%)</span></label>
            <div class="bar"><div class="bar-fill bar-${k}" style="width:${pct}%"></div></div>
          </div>`;
      }).join('')}
    </div>
    ${discResultados.length === 0 ? '<div class="chart-placeholder" style="margin-top:12px">Nenhum perfil DISC avaliado ainda</div>' : ''}
  `;

  // Risk list
  const riskEl = document.getElementById('dash-risk-list');
  if (feedbacks.length === 0) {
    riskEl.innerHTML = '<div class="chart-placeholder">Nenhum feedback registrado ainda</div>';
  } else {
    const riscos = colabs.map(c => {
      const fbs = db.getFeedbacksByColaborador(c.id);
      if (!fbs.length) return null;
      const avg = fbs.reduce((s, f) => s + ((parseFloat(f.nota_performance)+parseFloat(f.nota_comportamento)+parseFloat(f.nota_compliance))/3), 0) / fbs.length;
      const risk = Math.round(100 - (avg * 10));
      return { c, risk };
    }).filter(Boolean).sort((a,b) => b.risk - a.risk).slice(0,5);

    riskEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px;">
      ${riscos.map(({c, risk}) => {
        const cls = risk >= 60 ? 'risk-high' : risk >= 35 ? 'risk-medium' : 'risk-low';
        const label = risk >= 60 ? '🔴 Alto' : risk >= 35 ? '🟡 Médio' : '🟢 Baixo';
        return `
          <div class="risk-bar-wrap">
            <span style="width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:0.82rem">${c.nome}</span>
            <div class="risk-bar"><div class="risk-fill ${cls}" style="width:${risk}%"></div></div>
            <span style="width:70px;text-align:right;font-size:0.78rem;color:#94a3b8">${label}</span>
          </div>`;
      }).join('')}
    </div>`;
  }

  // Recent feedbacks
  const recentFbs = feedbacks.slice(-5).reverse();
  const fbEl = document.getElementById('dash-recent-feedbacks');
  if (recentFbs.length === 0) {
    fbEl.innerHTML = '<div class="chart-placeholder">Nenhum feedback registrado ainda</div>';
  } else {
    fbEl.innerHTML = `<div class="timeline">${recentFbs.map(f => {
      const colab = db.getColaboradorById(f.colaborador_id);
      const avg = ((parseFloat(f.nota_performance)+parseFloat(f.nota_comportamento)+parseFloat(f.nota_compliance))/3).toFixed(1);
      return `
        <div class="timeline-item">
          <div class="timeline-meta">${colab?.nome || 'Colaborador'} · ${f.data}</div>
          <div style="font-size:0.9rem;margin-bottom:6px;">${f.pontos_fortes?.substring(0,120) || '—'}</div>
          <div class="timeline-scores">
            <span class="score-chip">Performance: ${f.nota_performance}</span>
            <span class="score-chip">Comportamento: ${f.nota_comportamento}</span>
            <span class="score-chip">Compliance: ${f.nota_compliance}</span>
            <span class="score-chip">Média: ${avg}</span>
          </div>
        </div>`;
    }).join('')}</div>`;
  }
}

// ─── COLABORADORES ────────────────────────────────────────────────────────────
function renderColaboradores() {
  const colabs = db.getColaboradores();
  const grid   = document.getElementById('colab-cards-grid');
  const empty  = document.getElementById('colab-empty');

  if (colabs.length === 0) {
    empty.style.display = 'flex';
    grid.innerHTML = '';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = colabs.map(c => {
    const fbs  = db.getFeedbacksByColaborador(c.id);
    const disc = db.getDiscResultByColaborador(c.id);
    const avg  = fbs.length
      ? (fbs.reduce((s,f) => s + ((parseFloat(f.nota_performance)+parseFloat(f.nota_comportamento)+parseFloat(f.nota_compliance))/3), 0) / fbs.length).toFixed(1)
      : null;
    const risk = avg ? Math.round(100 - (parseFloat(avg) * 10)) : null;
    const riskCls = risk === null ? '' : risk >= 60 ? 'badge-red' : risk >= 35 ? 'badge-yellow' : 'badge-green';
    const riskLabel = risk === null ? '—' : risk >= 60 ? '🔴 Alto' : risk >= 35 ? '🟡 Médio' : '🟢 Baixo';
    const discLabel = disc ? `${DISC_PROFILES[disc.perfil_dominante].emoji} ${disc.nome_perfil}` : '— Sem DISC';
    const discBadgeCls = disc ? `disc-${disc.perfil_dominante}` : 'badge-blue';

    return `
      <div class="colab-card" onclick="openPerfilColab('${c.id}')">
        <div class="colab-card-top">
          <img src="${c.foto}" class="avatar-sm" alt="${c.nome}" style="width:48px;height:48px;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=7c3aed&color=fff&size=80'">
          <div class="colab-card-info">
            <div class="name">${c.nome}</div>
            <div class="role">${c.cargo} · ${c.setor}</div>
          </div>
        </div>
        <div class="colab-card-stats">
          <span class="badge ${riskBadgeCls(risk)}">${riskLabel}</span>
          <span class="badge ${discBadgeCls}">${discLabel}</span>
          <span class="badge badge-purple">Score: ${avg || '—'}</span>
          <span class="badge badge-blue">${fbs.length} feedback${fbs.length!==1?'s':''}</span>
        </div>
      </div>`;
  }).join('');
}

function riskBadgeCls(risk) {
  if (risk === null) return 'badge-blue';
  if (risk >= 60)   return 'badge-red';
  if (risk >= 35)   return 'badge-yellow';
  return 'badge-green';
}

// ─── PERFIL DO COLABORADOR ────────────────────────────────────────────────────
function openPerfilColab(id) {
  currentColabId = id;
  navigateTo('perfil-colab', null);
}

function renderPerfilColab() {
  const c    = db.getColaboradorById(currentColabId);
  if (!c) return;
  const fbs  = db.getFeedbacksByColaborador(currentColabId);
  const disc = db.getDiscResultByColaborador(currentColabId);
  const planos = db.getPlanosAcaoByColaborador(currentColabId);
  const agendas = db.getAgendasByColaborador(currentColabId);

  const avg = fbs.length
    ? (fbs.reduce((s,f) => s + ((parseFloat(f.nota_performance)+parseFloat(f.nota_comportamento)+parseFloat(f.nota_compliance))/3), 0) / fbs.length).toFixed(1)
    : '—';
  const risk = avg !== '—' ? Math.round(100 - (parseFloat(avg) * 10)) : null;
  const riskCls  = risk === null ? '' : risk >= 60 ? 'risk-high' : risk >= 35 ? 'risk-medium' : 'risk-low';
  const riskText = risk === null ? 'N/A' : risk >= 60 ? '🔴 Alto' : risk >= 35 ? '🟡 Médio' : '🟢 Baixo';

  const discSection = disc ? `
    <div class="disc-profile-card">
      <div class="disc-profile-header">
        <div class="disc-profile-icon">${DISC_PROFILES[disc.perfil_dominante].emoji}</div>
        <div>
          <div style="font-size:1.1rem;font-weight:700">${disc.nome_perfil}</div>
          <div style="font-size:0.8rem;color:#94a3b8">${disc.descricao}</div>
        </div>
      </div>
      <div class="disc-bars-list">
        ${Object.entries(disc.percentuais).map(([k,v]) => `
          <div class="disc-bar-row">
            <label><span>${DISC_PROFILES[k].emoji} ${DISC_PROFILES[k].nome}</span><span>${v}%</span></label>
            <div class="bar"><div class="bar-fill bar-${k}" style="width:${v}%"></div></div>
          </div>`).join('')}
      </div>
      <div style="margin-top:16px;padding:14px;background:rgba(124,58,237,0.08);border-radius:8px;border:1px solid rgba(124,58,237,0.2);font-size:0.85rem;color:#a78bfa;">
        💡 <strong>Abordagem recomendada:</strong> ${disc.abordagem_feedback}
      </div>
    </div>
  ` : `
    <div class="disc-profile-card" style="text-align:center;padding:32px;">
      <div style="font-size:2.5rem;margin-bottom:12px">🔍</div>
      <div style="font-weight:600;margin-bottom:8px">Perfil DISC não avaliado</div>
      <div style="color:#94a3b8;font-size:0.85rem;margin-bottom:16px">Realize a avaliação DISC para obter insights comportamentais detalhados.</div>
      <button class="btn btn-primary btn-sm" onclick="openDiscColab('${c.id}')">Iniciar Avaliação DISC</button>
    </div>
  `;

  const feedbackSection = fbs.length ? `
    <div class="timeline">
      ${fbs.slice(0,10).map(f => {
        const avg = ((parseFloat(f.nota_performance)+parseFloat(f.nota_comportamento)+parseFloat(f.nota_compliance))/3).toFixed(1);
        return `
          <div class="timeline-item">
            <div class="timeline-meta">${f.data}</div>
            <div style="margin-bottom:6px;font-size:0.9rem"><strong>Pontos fortes:</strong> ${f.pontos_fortes || '—'}</div>
            <div style="margin-bottom:8px;font-size:0.9rem"><strong>Melhorias:</strong> ${f.pontos_melhoria || '—'}</div>
            <div class="timeline-scores">
              <span class="score-chip">Performance: ${f.nota_performance}</span>
              <span class="score-chip">Comportamento: ${f.nota_comportamento}</span>
              <span class="score-chip">Compliance: ${f.nota_compliance}</span>
              <span class="score-chip">Média: ${avg}</span>
            </div>
          </div>`;
      }).join('')}
    </div>
  ` : '<div class="empty-state" style="min-height:120px"><div class="empty-icon">💬</div><p>Nenhum feedback registrado ainda.</p></div>';

  const planosSection = planos.length ? `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${planos.map(p => `
        <div class="timeline-item">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-weight:600">${p.titulo}</div>
              <div style="font-size:0.8rem;color:#94a3b8;margin-top:4px">${p.objetivo}</div>
              <div style="font-size:0.78rem;color:#64748b;margin-top:6px">Prazo: ${p.prazo} · Responsável: ${p.responsavel}</div>
            </div>
            <span class="badge ${p.status === 'Concluído' ? 'badge-green' : 'badge-yellow'}">${p.status}</span>
          </div>
          ${p.status !== 'Concluído' ? `<button class="btn btn-sm btn-secondary" style="margin-top:10px" onclick="concluirPlano('${p.id}')">✅ Marcar Concluído</button>` : ''}
        </div>`).join('')}
    </div>
  ` : '<div class="empty-state" style="min-height:100px"><p>Nenhum plano de ação criado.</p></div>';

  const agendasSection = agendas.length ? `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${agendas.map(a => `
        <div class="timeline-item" style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-weight:600">${a.tipo}</div>
            <div style="font-size:0.82rem;color:#94a3b8;margin-top:4px">${a.data_hora}</div>
            ${a.observacoes ? `<div style="font-size:0.8rem;color:#64748b;margin-top:4px">${a.observacoes}</div>` : ''}
          </div>
          <span class="badge ${a.status === 'Realizado' ? 'badge-green' : 'badge-blue'}">${a.status}</span>
        </div>`).join('')}
    </div>
  ` : '<div class="empty-state" style="min-height:100px"><p>Nenhuma sessão agendada.</p></div>';

  document.getElementById('perfil-colab-content').innerHTML = `
    <div class="profile-hero">
      <img src="${c.foto}" class="profile-avatar" alt="${c.nome}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=7c3aed&color=fff&size=128'">
      <div class="profile-meta" style="flex:1">
        <h2>${c.nome}</h2>
        <div style="color:#94a3b8;font-size:0.9rem">${c.cargo} · ${c.setor}</div>
        <div class="profile-meta-row">
          <span class="badge badge-green">${c.status}</span>
          <span class="badge badge-purple">Score: ${avg}</span>
          ${risk !== null ? `<span class="badge ${riskBadgeCls(risk)}">${riskText}</span>` : ''}
          ${disc ? `<span class="badge disc-${disc.perfil_dominante}">${DISC_PROFILES[disc.perfil_dominante].emoji} ${disc.nome_perfil}</span>` : ''}
        </div>
        ${risk !== null ? `
          <div class="risk-bar-wrap" style="margin-top:14px;max-width:320px">
            <span style="font-size:0.78rem;color:#94a3b8;width:80px">Risco</span>
            <div class="risk-bar"><div class="risk-fill ${riskCls}" style="width:${risk}%"></div></div>
            <span style="font-size:0.8rem;color:#94a3b8">${risk}%</span>
          </div>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">
        <button class="btn btn-primary btn-sm" onclick="openFeedbackForColab('${c.id}')">+ Feedback</button>
        <button class="btn btn-secondary btn-sm" onclick="openDiscColab('${c.id}')">🔍 DISC</button>
        <button class="btn btn-secondary btn-sm" onclick="openPlanoForColab('${c.id}')">📋 Plano</button>
        <button class="btn btn-secondary btn-sm" onclick="openAgendaForColab('${c.id}')">📅 Agendar</button>
      </div>
    </div>

    <div class="grid-2" style="gap:20px;margin-bottom:24px;">
      <div>
        <div class="card-title" style="margin-bottom:12px;">🧠 Perfil DISC</div>
        ${discSection}
      </div>
      <div>
        <div class="card-title" style="margin-bottom:12px;">📅 Agendamentos</div>
        ${agendasSection}
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <div class="card-header">
        <div class="card-title">💬 Histórico de Feedbacks</div>
        <button class="btn btn-primary btn-sm" onclick="openFeedbackForColab('${c.id}')">+ Novo</button>
      </div>
      ${feedbackSection}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">📋 Planos de Ação</div>
        <button class="btn btn-primary btn-sm" onclick="openPlanoForColab('${c.id}')">+ Novo</button>
      </div>
      ${planosSection}
    </div>
  `;
}

// ─── FEEDBACKS ────────────────────────────────────────────────────────────────
function renderFeedbacks() {
  const fbs = db.getFeedbacks().slice().reverse();
  const listEl = document.getElementById('feedbacks-list');
  const emptyEl = document.getElementById('feedbacks-empty');

  if (fbs.length === 0) {
    emptyEl.style.display = 'flex';
    listEl.innerHTML = '';
    return;
  }
  emptyEl.style.display = 'none';

  listEl.innerHTML = fbs.map(f => {
    const colab = db.getColaboradorById(f.colaborador_id);
    const avg = ((parseFloat(f.nota_performance)+parseFloat(f.nota_comportamento)+parseFloat(f.nota_compliance))/3).toFixed(1);
    return `
      <div class="timeline-item">
        <div class="timeline-meta">${colab?.nome || '—'} · ${colab?.cargo || ''} · ${f.data}</div>
        <div style="margin-bottom:6px;font-size:0.9rem"><strong>Fortes:</strong> ${f.pontos_fortes || '—'}</div>
        <div style="margin-bottom:8px;font-size:0.9rem"><strong>Melhoria:</strong> ${f.pontos_melhoria || '—'}</div>
        <div class="timeline-scores">
          <span class="score-chip">Performance: ${f.nota_performance}</span>
          <span class="score-chip">Comportamento: ${f.nota_comportamento}</span>
          <span class="score-chip">Compliance: ${f.nota_compliance}</span>
          <span class="score-chip">Média: ${avg}</span>
        </div>
      </div>`;
  }).join('');
}

// ─── RISCO ────────────────────────────────────────────────────────────────────
function renderRisco() {
  const colabs = db.getColaboradores();
  const emptyEl = document.getElementById('risco-empty');
  const content = document.getElementById('risco-content');

  if (colabs.length === 0) {
    emptyEl.style.display = 'flex';
    content.innerHTML = '';
    return;
  }
  emptyEl.style.display = 'none';

  const data = colabs.map(c => {
    const fbs = db.getFeedbacksByColaborador(c.id);
    const avg = fbs.length
      ? (fbs.reduce((s,f) => s + ((parseFloat(f.nota_performance)+parseFloat(f.nota_comportamento)+parseFloat(f.nota_compliance))/3),0)/fbs.length)
      : null;
    const risk = avg !== null ? Math.round(100 - (avg * 10)) : null;
    return { c, avg, risk, fbs };
  }).sort((a,b) => (b.risk||0) - (a.risk||0));

  content.innerHTML = `
    <div class="card">
      <div class="card-title" style="margin-bottom:16px">Análise de Risco Operacional por Colaborador</div>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${data.map(({c, avg, risk, fbs}) => {
          if (risk === null) return `
            <div style="display:flex;align-items:center;gap:16px;padding:14px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">
              <img src="${c.foto}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=7c3aed&color=fff&size=80'">
              <div style="flex:1">
                <div style="font-weight:600;font-size:0.9rem">${c.nome}</div>
                <div style="font-size:0.78rem;color:#64748b">${c.cargo}</div>
              </div>
              <span class="badge badge-blue">Sem dados</span>
            </div>`;
          const cls = risk >= 60 ? 'risk-high' : risk >= 35 ? 'risk-medium' : 'risk-low';
          const label = risk >= 60 ? '🔴 Alto' : risk >= 35 ? '🟡 Médio' : '🟢 Baixo';
          return `
            <div style="padding:14px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);" onclick="openPerfilColab('${c.id}')" style="cursor:pointer;">
              <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;cursor:pointer" onclick="openPerfilColab('${c.id}')">
                <img src="${c.foto}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=7c3aed&color=fff&size=80'">
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.9rem">${c.nome}</div>
                  <div style="font-size:0.78rem;color:#64748b">${c.cargo} · ${fbs.length} feedback${fbs.length!==1?'s':''}</div>
                </div>
                <div style="text-align:right">
                  <span class="badge ${riskBadgeCls(risk)}" style="margin-bottom:4px">${label}</span>
                  <div style="font-size:0.78rem;color:#94a3b8">Score: ${avg?.toFixed(1) || '—'}</div>
                </div>
              </div>
              <div class="risk-bar-wrap">
                <div class="risk-bar"><div class="risk-fill ${cls}" style="width:${risk}%"></div></div>
                <span style="font-size:0.78rem;color:#94a3b8;width:40px;text-align:right">${risk}%</span>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ─── PLANOS DE AÇÃO ───────────────────────────────────────────────────────────
function renderPlanos() {
  const planos = db.getPlanosAcao().slice().reverse();
  const emptyEl = document.getElementById('planos-empty');
  const listEl  = document.getElementById('planos-list');

  if (planos.length === 0) {
    emptyEl.style.display = 'flex';
    listEl.innerHTML = '';
    return;
  }
  emptyEl.style.display = 'none';

  listEl.innerHTML = `<div class="card"><div style="display:flex;flex-direction:column;gap:12px;">
    ${planos.map(p => {
      const c = db.getColaboradorById(p.colaborador_id);
      return `
        <div class="timeline-item">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <div>
              <div style="font-weight:600">${p.titulo}</div>
              <div style="font-size:0.8rem;color:#94a3b8;margin-top:4px">${c?.nome || '—'} · Prazo: ${p.prazo}</div>
              <div style="font-size:0.82rem;color:#64748b;margin-top:4px">${p.objetivo}</div>
            </div>
            <span class="badge ${p.status === 'Concluído' ? 'badge-green' : 'badge-yellow'}">${p.status}</span>
          </div>
          ${p.status !== 'Concluído' ? `<button class="btn btn-sm btn-secondary" style="margin-top:10px" onclick="concluirPlano('${p.id}')">✅ Concluir</button>` : ''}
        </div>`;
    }).join('')}
  </div></div>`;
}

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function renderAgenda() {
  const agendas = db.getAgendas().slice().reverse();
  const emptyEl = document.getElementById('agenda-empty');
  const listEl  = document.getElementById('agenda-list');

  if (agendas.length === 0) {
    emptyEl.style.display = 'flex';
    listEl.innerHTML = '';
    return;
  }
  emptyEl.style.display = 'none';

  listEl.innerHTML = `<div class="card"><div style="display:flex;flex-direction:column;gap:12px;">
    ${agendas.map(a => {
      const c = db.getColaboradorById(a.colaborador_id);
      return `
        <div class="timeline-item" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <div style="font-weight:600">${a.tipo}</div>
            <div style="font-size:0.8rem;color:#94a3b8;margin-top:4px">${c?.nome || '—'} · ${a.data_hora}</div>
            ${a.observacoes ? `<div style="font-size:0.8rem;color:#64748b;margin-top:4px">${a.observacoes}</div>` : ''}
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span class="badge ${a.status === 'Realizado' ? 'badge-green' : 'badge-blue'}">${a.status}</span>
            ${a.status !== 'Realizado' ? `<button class="btn btn-sm btn-secondary" onclick="concluirAgenda('${a.id}')">✅ Realizado</button>` : ''}
          </div>
        </div>`;
    }).join('')}
  </div></div>`;
}

// ─── MEU PERFIL ───────────────────────────────────────────────────────────────
function renderMeuPerfil() {
  const gestor = db.getGestor();
  if (!gestor) return;
  const disc = gestor.disc;
  const profile = disc ? DISC_PROFILES[disc.perfil_dominante] : null;

  document.getElementById('meu-perfil-content').innerHTML = `
    <div class="profile-hero" style="margin-bottom:24px;">
      <img src="${gestor.foto}" class="profile-avatar" alt="${gestor.nome}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(gestor.nome)}&background=7c3aed&color=fff&size=128'">
      <div class="profile-meta">
        <h2>${gestor.nome}</h2>
        <div style="color:#94a3b8;font-size:0.9rem;margin-bottom:8px">${gestor.cargo} · ${gestor.empresa}</div>
        <div style="color:#64748b;font-size:0.82rem;">${gestor.email}</div>
        ${disc ? `
        <div class="profile-meta-row" style="margin-top:12px;">
          <span class="badge" style="background:${profile.cor}22;color:${profile.cor};border-color:${profile.cor}55;">
            ${profile.emoji} Perfil ${profile.nome}
          </span>
        </div>` : ''}
      </div>
    </div>

    ${disc ? `
    <div class="card" style="margin-bottom:20px;">
      <div class="card-title" style="margin-bottom:16px">🧠 Seu Perfil Comportamental DISC</div>
      <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">
        <div style="text-align:center;padding:20px;background:${profile.cor}11;border-radius:14px;border:1px solid ${profile.cor}33;flex-shrink:0;min-width:140px;">
          <div style="font-size:3rem;margin-bottom:8px;">${profile.emoji}</div>
          <div style="font-size:1.2rem;font-weight:800;color:${profile.cor}">${profile.nome}</div>
          <div style="font-size:0.78rem;color:#94a3b8;margin-top:6px;">Perfil Dominante</div>
        </div>
        <div style="flex:1;min-width:220px;">
          <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin-bottom:16px;">${profile.descricao}</p>
          <div class="disc-bars-list">
            ${Object.entries(disc.percentuais).map(([k,v]) => `
              <div class="disc-bar-row">
                <label><span>${DISC_PROFILES[k].emoji} ${DISC_PROFILES[k].nome}</span><span>${v}%</span></label>
                <div class="bar"><div class="bar-fill bar-${k}" style="width:${v}%"></div></div>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;">
        <div>
          <div style="font-size:0.8rem;font-weight:600;text-transform:uppercase;color:#64748b;margin-bottom:8px;">Pontos Fortes</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${profile.pontos_fortes.map(p => `<span class="badge badge-green">${p}</span>`).join('')}
          </div>
        </div>
        <div>
          <div style="font-size:0.8rem;font-weight:600;text-transform:uppercase;color:#64748b;margin-bottom:8px;">Pontos de Atenção</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${profile.pontos_atencao.map(p => `<span class="badge badge-yellow">${p}</span>`).join('')}
          </div>
        </div>
      </div>
      <div style="margin-top:16px;padding:14px;background:rgba(124,58,237,0.08);border-radius:8px;border:1px solid rgba(124,58,237,0.2);font-size:0.85rem;color:#a78bfa;">
        💡 <strong>Seu estilo de liderança:</strong> ${profile.abordagem_feedback}
      </div>
    </div>` : '<div class="card" style="text-align:center;padding:32px;"><p style="color:#94a3b8">Perfil DISC não disponível.</p></div>'}

    <div class="card">
      <div class="card-title" style="margin-bottom:12px;">⚙️ Informações do Sistema</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:0.88rem;color:#94a3b8;">
        <div>Colaboradores cadastrados: <strong style="color:#f1f5f9">${db.getColaboradores().length}</strong></div>
        <div>Feedbacks registrados: <strong style="color:#f1f5f9">${db.getFeedbacks().length}</strong></div>
        <div>Planos de ação: <strong style="color:#f1f5f9">${db.getPlanosAcao().length}</strong></div>
        <div>Conta criada em: <strong style="color:#f1f5f9">${gestor.created_at?.split('T')[0] || '—'}</strong></div>
      </div>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
        <button class="btn btn-danger btn-sm" onclick="resetApp()">🗑️ Redefinir todos os dados</button>
      </div>
    </div>
  `;
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// Add collaborator
function openAddColaborador() {
  ['form-colab-nome','form-colab-cargo','form-colab-setor','form-colab-email','form-colab-telefone'].forEach(id => {
    document.getElementById(id).value = '';
  });
  openModal('modal-add-colab');
}

function submitAddColaborador() {
  const nome     = document.getElementById('form-colab-nome').value.trim();
  const cargo    = document.getElementById('form-colab-cargo').value.trim();
  const setor    = document.getElementById('form-colab-setor').value.trim();
  const email    = document.getElementById('form-colab-email').value.trim();
  const telefone = document.getElementById('form-colab-telefone').value.trim();

  if (!nome || !cargo || !setor) {
    showToast('Preencha nome, cargo e setor.', 'error');
    return;
  }

  db.addColaborador({
    nome, cargo, setor, email, telefone,
    foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=7c3aed&color=fff&size=128`
  });
  closeModal('modal-add-colab');
  showToast(`${nome} adicionado(a) com sucesso!`, 'success');
  renderView(currentView);
}

// Feedback
function openFeedbackForColab(id) {
  currentColabId = id;
  const colabs = db.getColaboradores();
  const sel = document.getElementById('form-fb-colab');
  sel.innerHTML = colabs.map(c => `<option value="${c.id}" ${c.id === id ? 'selected' : ''}>${c.nome}</option>`).join('');
  document.getElementById('form-fb-data').value = new Date().toISOString().split('T')[0];
  ['form-fb-perf','form-fb-comp','form-fb-compl','form-fb-pontos-fortes','form-fb-pontos-melhoria'].forEach(id => {
    document.getElementById(id).value = '';
  });
  openModal('modal-add-feedback');
}

function submitFeedback() {
  const colaborador_id   = document.getElementById('form-fb-colab').value;
  const nota_performance = document.getElementById('form-fb-perf').value;
  const nota_comportamento = document.getElementById('form-fb-comp').value;
  const nota_compliance  = document.getElementById('form-fb-compl').value;
  const pontos_fortes    = document.getElementById('form-fb-pontos-fortes').value.trim();
  const pontos_melhoria  = document.getElementById('form-fb-pontos-melhoria').value.trim();
  const data             = document.getElementById('form-fb-data').value;

  if (!nota_performance || !nota_comportamento || !nota_compliance) {
    showToast('Preencha todas as notas.', 'error');
    return;
  }

  db.addFeedback({ colaborador_id, nota_performance, nota_comportamento, nota_compliance, pontos_fortes, pontos_melhoria, data });
  closeModal('modal-add-feedback');
  showToast('Feedback registrado com sucesso!', 'success');
  renderView(currentView);
}

// DISC collaborator
function openDiscColab(id) {
  currentColabId = id;
  const engine = new DISCEngine(DISC_COLABORADOR_QUESTIONS);
  let qIndex = 0;

  function renderQ() {
    const q = DISC_COLABORADOR_QUESTIONS[qIndex];
    const total = DISC_COLABORADOR_QUESTIONS.length;
    const pct = Math.round(((qIndex + 1) / total) * 100);
    const letters = ['A','B','C','D'];

    document.getElementById('modal-disc-content').innerHTML = `
      <div class="disc-question-counter">Pergunta ${qIndex+1} de ${total}</div>
      <div class="disc-progress-bar"><div class="disc-progress-fill" style="width:${pct}%"></div></div>
      <div class="disc-question-text">${q.pergunta}</div>
      <div class="disc-options" id="disc-colab-opts">
        ${q.opcoes.map((op, i) => `
          <div class="disc-option ${engine.respostas[q.id] === op.tipo ? 'selected' : ''}" onclick="discColabSelect(this,'${q.id}','${op.tipo}')">
            <div class="disc-option-letter">${letters[i]}</div>
            <span>${op.texto}</span>
          </div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
        ${qIndex > 0 ? `<button class="btn btn-secondary btn-sm" onclick="discColabPrev()">← Anterior</button>` : ''}
        <button class="btn btn-primary btn-sm" id="disc-colab-next" onclick="discColabNext()" ${!engine.respostas[q.id] ? 'disabled' : ''}>
          ${qIndex === total-1 ? 'Ver Resultado →' : 'Próxima →'}
        </button>
      </div>
    `;

    window._discColabEngine = engine;
    window._discColabIndex  = qIndex;

    window.discColabSelect = (el, qId, tipo) => {
      document.querySelectorAll('#disc-colab-opts .disc-option').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      engine.registrarResposta(parseInt(qId), tipo);
      document.getElementById('disc-colab-next').disabled = false;
    };

    window.discColabNext = () => {
      if (!engine.respostas[q.id]) return;
      if (qIndex < total - 1) {
        qIndex++;
        renderQ();
      } else {
        // Show result
        const resultado = engine.calcularResultado();
        resultado.colaborador_id = currentColabId;
        db.saveDiscResult(resultado);
        showDiscResult(resultado);
      }
    };

    window.discColabPrev = () => {
      if (qIndex > 0) { qIndex--; renderQ(); }
    };
  }

  function showDiscResult(r) {
    const p = DISC_PROFILES[r.perfil_dominante];
    document.getElementById('modal-disc-content').innerHTML = `
      <div class="disc-result-card">
        <div class="disc-result-badge" style="color:${p.cor};border-color:${p.cor};background:${p.cor}1a;margin:0 auto 16px;">
          <span>${p.emoji}</span>
        </div>
        <div class="disc-result-name" style="color:${p.cor}">${p.nome}</div>
        <div class="disc-result-desc">${p.descricao}</div>
        <div class="disc-bars">
          ${Object.entries(r.percentuais).map(([k,v]) => `
            <div class="disc-bar-item">
              <label><span>${DISC_PROFILES[k].emoji} ${DISC_PROFILES[k].nome}</span><span>${v}%</span></label>
              <div class="bar"><div class="bar-fill bar-${k}" style="width:${v}%"></div></div>
            </div>`).join('')}
        </div>
        <div style="margin-top:16px;padding:14px;background:rgba(124,58,237,0.08);border-radius:8px;border:1px solid rgba(124,58,237,0.2);font-size:0.85rem;color:#a78bfa;text-align:left;">
          💡 ${p.abordagem_feedback}
        </div>
        <button class="btn btn-primary btn-full" style="margin-top:20px" onclick="closeModal('modal-disc');renderView(currentView)">Fechar</button>
      </div>`;
    showToast('Avaliação DISC salva!', 'success');
  }

  openModal('modal-disc');
  renderQ();
}

// Plano de ação
function openPlanoForColab(id) {
  currentPlanoColabId = id;
  ['form-plano-titulo','form-plano-objetivo','form-plano-prazo','form-plano-responsavel'].forEach(fid => {
    document.getElementById(fid).value = '';
  });
  openModal('modal-plano');
}

function submitPlano() {
  const titulo       = document.getElementById('form-plano-titulo').value.trim();
  const objetivo     = document.getElementById('form-plano-objetivo').value.trim();
  const prazo        = document.getElementById('form-plano-prazo').value;
  const responsavel  = document.getElementById('form-plano-responsavel').value.trim();

  if (!titulo || !objetivo || !prazo) {
    showToast('Preencha todos os campos obrigatórios.', 'error');
    return;
  }

  db.addPlanoAcao({ colaborador_id: currentPlanoColabId, titulo, objetivo, prazo, responsavel });
  closeModal('modal-plano');
  showToast('Plano de ação criado!', 'success');
  renderView(currentView);
}

function concluirPlano(id) {
  db.updatePlanoAcaoStatus(id, 'Concluído');
  showToast('Plano concluído!', 'success');
  renderView(currentView);
}

// Agenda
function openAgendaForColab(id) {
  currentAgendaColabId = id;
  document.getElementById('form-agenda-obs').value = '';
  document.getElementById('form-agenda-data').value = '';
  openModal('modal-agenda');
}

function submitAgenda() {
  const tipo         = document.getElementById('form-agenda-tipo').value;
  const data_hora    = document.getElementById('form-agenda-data').value;
  const observacoes  = document.getElementById('form-agenda-obs').value.trim();

  if (!data_hora) {
    showToast('Selecione a data e hora da sessão.', 'error');
    return;
  }

  db.addAgenda({ colaborador_id: currentAgendaColabId, tipo, data_hora, observacoes });
  closeModal('modal-agenda');
  showToast('Sessão agendada!', 'success');
  renderView(currentView);
}

function concluirAgenda(id) {
  db.updateAgendaStatus(id, 'Realizado');
  showToast('Sessão marcada como realizada!', 'success');
  renderView(currentView);
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ─── RESET ────────────────────────────────────────────────────────────────────
function resetApp() {
  if (confirm('Tem certeza? Todos os dados serão apagados permanentemente.')) {
    db.reset();
    location.reload();
  }
}

// Close modals on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(b => {
  b.addEventListener('click', e => {
    if (e.target === b) b.classList.add('hidden');
  });
});
