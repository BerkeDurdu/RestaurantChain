// ===== STATE (filled from API) =====
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const state = {
  branches: [],
  alerts: [],
  hourlyOrders: [],
  stockCritical: [],
  summary: {},
  user: null,
  reportRange: 'today',
  reportData: null,
};

// ===== AUTH =====
async function loadUser() {
  try {
    const r = await fetch('/api/auth/me');
    if (!r.ok) throw new Error('not authed');
    state.user = await r.json();
    document.getElementById('userName').textContent = state.user.full_name;
    document.getElementById('userRole').textContent = state.user.role;
  } catch {
    window.location.href = '/login.html';
  }
}

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

// ===== TABS =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ===== CLOCK =====
function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('tr-TR');
}
setInterval(updateClock, 1000); updateClock();

// ===== API =====
async function fetchJSON(url) {
  const r = await fetch(url);
  if (r.status === 401) { window.location.href = '/login.html'; throw new Error('unauthorized'); }
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

async function loadAll() {
  try {
    const [branches, summary, alerts, hourly, stockCritical, stockAll] =
      await Promise.all([
        fetchJSON('/api/branches'),
        fetchJSON('/api/summary'),
        fetchJSON('/api/alerts?limit=30'),
        fetchJSON('/api/orders/hourly'),
        fetchJSON('/api/stock/critical'),
        fetchJSON('/api/stock'),
      ]);
    state.branches = branches;
    state.summary = summary;
    state.alerts = alerts;
    state.hourlyOrders = hourly;
    state.stockCritical = stockCritical;
    state.stockAll = stockAll;
    setSystemStatus(true);
    renderAll();
  } catch (err) {
    console.error('Load failed', err);
    setSystemStatus(false);
  }
}

function setSystemStatus(online) {
  const el = document.getElementById('systemStatus');
  if (online) {
    el.style.background = 'rgba(46, 204, 113, 0.12)';
    el.style.borderColor = 'rgba(46, 204, 113, 0.3)';
    el.style.color = 'var(--success)';
    el.innerHTML = '<span class="dot"></span><span>API Bağlı</span>';
  } else {
    el.style.background = 'rgba(231, 76, 60, 0.12)';
    el.style.borderColor = 'rgba(231, 76, 60, 0.3)';
    el.style.color = 'var(--danger)';
    el.innerHTML = '<span class="dot" style="background:var(--danger);box-shadow:0 0 8px var(--danger)"></span><span>API Bağlantısı Yok</span>';
  }
}

// ===== KPIs =====
function updateKPIs() {
  const s = state.summary;
  document.getElementById('kpiOrders').textContent = (s.todayOrders || 0).toLocaleString('tr-TR');
  document.getElementById('kpiAvgTime').textContent = (s.avgPrepTime || 0).toFixed(1);
  document.getElementById('kpiBusy').textContent = s.busiestBranch || '—';
  document.getElementById('kpiBusyOrders').textContent = `${s.busiestActiveOrders || 0} aktif sipariş`;
  document.getElementById('kpiUptime').textContent = (s.avgPosUptime || 0).toFixed(2);

  const trendEl = document.getElementById('kpiAvgTrend');
  if (s.avgPrepTime > 22) { trendEl.textContent = '⚠ hedefin üzerinde'; trendEl.className = 'kpi-trend down'; }
  else { trendEl.textContent = '✓ hedef içinde'; trendEl.className = 'kpi-trend up'; }

  const upEl = document.getElementById('kpiUptimeTrend');
  if (s.avgPosUptime >= 99) { upEl.textContent = '✓ stabil'; upEl.className = 'kpi-trend up'; }
  else { upEl.textContent = '⚠ izleniyor'; upEl.className = 'kpi-trend down'; }

  document.getElementById('kpiAlerts').textContent = s.criticalAlerts || 0;
  document.getElementById('alertBadge').textContent = s.activeAlerts || 0;
}

// ===== BRANCH TABLE =====
function renderBranchTable() {
  const tbody = document.getElementById('branchTbody');
  tbody.innerHTML = state.branches.map(b => {
    const status = b.posUptime < 97 ? 'bad' : (b.kitchenDelay > 5 ? 'warn' : 'ok');
    const statusText = status === 'ok' ? 'Normal' : status === 'warn' ? 'Yavaşlama' : 'Sorunlu';
    const delayClass = b.kitchenDelay > 5 ? 'bad' : b.kitchenDelay > 2 ? 'warn' : 'ok';
    return `
      <tr>
        <td><b>${escapeHtml(b.name)}</b><br><span style="color:var(--muted);font-size:11px">${escapeHtml(b.city)}</span></td>
        <td><span class="status-tag ${status}">${statusText}</span></td>
        <td>${b.activeOrders}</td>
        <td>${b.avgOrderTime} dk</td>
        <td><span class="status-tag ${delayClass}">${b.kitchenDelay} dk</span></td>
        <td>${b.posUptime.toFixed(2)}%</td>
      </tr>
    `;
  }).join('');
}

// ===== BRANCH CARDS =====
function renderBranchCards() {
  const c = document.getElementById('branchCards');
  c.innerHTML = state.branches.map(b => {
    const status = b.posUptime < 97 ? 'bad' : (b.kitchenDelay > 5 ? 'warn' : 'ok');
    const statusText = status === 'ok' ? 'Normal' : status === 'warn' ? 'Yavaşlama' : 'Sorunlu';
    return `
      <div class="branch-card">
        <div class="branch-card-head">
          <div>
            <div class="branch-name">${escapeHtml(b.name)}</div>
            <div class="branch-city">${escapeHtml(b.city)}</div>
          </div>
          <span class="status-tag ${status}">${statusText}</span>
        </div>
        <div class="branch-metrics">
          <div class="branch-metric"><div class="lbl">Aktif Sipariş</div><div class="val">${b.activeOrders}</div></div>
          <div class="branch-metric"><div class="lbl">Ort. Süre</div><div class="val">${b.avgOrderTime} dk</div></div>
          <div class="branch-metric"><div class="lbl">Mutfak Gecikme</div><div class="val">${b.kitchenDelay} dk</div></div>
          <div class="branch-metric"><div class="lbl">POS Uptime</div><div class="val">${b.posUptime.toFixed(1)}%</div></div>
          <div class="branch-metric"><div class="lbl">Bugünkü Sipariş</div><div class="val">${b.todayOrders}</div></div>
          <div class="branch-metric"><div class="lbl">Düşük Stok</div><div class="val">${b.lowStockCount}</div></div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== STOCK =====
function renderStock() {
  const tbody = document.getElementById('stockTbody');
  tbody.innerHTML = state.stockCritical.length === 0
    ? '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px">Kritik seviye altında stok yok ✓</td></tr>'
    : state.stockCritical.map(c => `
      <tr>
        <td>${escapeHtml(c.branch_name)}</td>
        <td>${escapeHtml(c.item)}</td>
        <td><b style="color:var(--danger)">${c.level}</b></td>
        <td>${c.threshold}</td>
        <td><span class="status-tag bad">Kritik</span></td>
      </tr>
    `).join('');
}

// ===== ALERTS =====
function renderAlerts() {
  const feed = document.getElementById('alertFeed');
  if (state.alerts.length === 0) {
    feed.innerHTML = '<p style="color:var(--muted);text-align:center;padding:24px">Aktif uyarı yok ✓</p>';
    return;
  }
  feed.innerHTML = state.alerts.map(a => {
    const icon = a.level === 'critical' ? '🚨' : a.level === 'warning' ? '⚠️' : 'ℹ️';
    const time = new Date(a.created_at).toLocaleTimeString('tr-TR');
    return `
      <div class="alert-item ${escapeHtml(a.level)}">
        <div class="alert-icon">${icon}</div>
        <div class="alert-body">
          <div class="alert-title">${escapeHtml(a.title)}</div>
          <div class="alert-meta">${escapeHtml(a.branch_name || 'Merkez')} · ${time}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== CHARTS =====
let hourlyChart, branchChart, stockChart;

function initCharts() {
  Chart.defaults.color = '#8b95ad';
  Chart.defaults.borderColor = '#2d3548';

  hourlyChart = new Chart(document.getElementById('hourlyChart'), {
    type: 'line',
    data: { labels: [], datasets: [{
      label: 'Sipariş', data: [],
      borderColor: '#4f8cff', backgroundColor: 'rgba(79,140,255,0.15)',
      fill: true, tension: 0.35, pointRadius: 3,
    }]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
  });

  branchChart = new Chart(document.getElementById('branchChart'), {
    type: 'doughnut',
    data: { labels: [], datasets: [{
      data: [],
      backgroundColor: ['#4f8cff','#8b5cf6','#2ecc71','#f39c12','#e74c3c','#06b6d4'],
      borderWidth: 0,
    }]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } } },
  });

  stockChart = new Chart(document.getElementById('stockChart'), {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 100 } },
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
    },
  });
}

function updateCharts() {
  // hourly
  hourlyChart.data.labels = state.hourlyOrders.map(h => `${h.hour}:00`);
  hourlyChart.data.datasets[0].data = state.hourlyOrders.map(h => h.count);
  hourlyChart.update('none');

  // branch distribution
  branchChart.data.labels = state.branches.map(b => b.name);
  branchChart.data.datasets[0].data = state.branches.map(b => b.todayOrders);
  branchChart.update('none');

  // stock per branch per item
  if (!state.stockAll) return;
  const items = [...new Set(state.stockAll.map(s => s.item))];
  stockChart.data.labels = items;
  const colors = ['#4f8cff','#8b5cf6','#2ecc71','#f39c12','#e74c3c','#06b6d4'];
  stockChart.data.datasets = state.branches.map((b, i) => ({
    label: b.name,
    data: items.map(item => {
      const row = state.stockAll.find(s => s.branch_id === b.id && s.item === item);
      return row ? row.level : 0;
    }),
    backgroundColor: colors[i % colors.length],
  }));
  stockChart.update('none');
}

function renderAll() {
  updateKPIs();
  renderBranchTable();
  renderBranchCards();
  renderStock();
  renderAlerts();
  updateCharts();
}

// ===== REPORTS =====
let reportTrendChart, reportBranchChart;

function initReportCharts() {
  reportTrendChart = new Chart(document.getElementById('reportTrendChart'), {
    type: 'line',
    data: { labels: [], datasets: [{
      label: 'Sipariş', data: [],
      borderColor: '#4f8cff', backgroundColor: 'rgba(79,140,255,0.15)',
      fill: true, tension: 0.3, pointRadius: 2,
    }]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
  });

  reportBranchChart = new Chart(document.getElementById('reportBranchChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{
      label: 'Sipariş', data: [],
      backgroundColor: ['#4f8cff','#8b5cf6','#2ecc71','#f39c12','#e74c3c','#06b6d4'],
    }]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
  });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('tr-TR');
}

function rangeQuery() {
  if (state.reportRange === 'custom') {
    const from = document.getElementById('customFrom').value;
    const to = document.getElementById('customTo').value;
    if (!from || !to) return null;
    return `from=${from}&to=${to}`;
  }
  return `range=${state.reportRange}`;
}

async function loadReports() {
  const q = rangeQuery();
  if (!q) return;
  try {
    const [summary, ts, byBranch] = await Promise.all([
      fetchJSON(`/api/reports/summary?${q}`),
      fetchJSON(`/api/reports/timeseries?${q}`),
      fetchJSON(`/api/reports/by-branch?${q}`),
    ]);

    document.getElementById('reportMeta').textContent =
      `${fmtDate(summary.start)} → ${fmtDate(summary.end)} · ${ts.bucket} bazlı toplulaştırma`;

    const t = summary.totals;
    document.getElementById('repOrders').textContent = (t.order_count || 0).toLocaleString('tr-TR');
    document.getElementById('repRevenue').textContent = Math.round(t.revenue || 0).toLocaleString('tr-TR');
    document.getElementById('repAvgPrep').textContent = (t.avg_prep || 0).toFixed(1);
    const avgTicket = t.order_count ? (t.revenue / t.order_count) : 0;
    document.getElementById('repAvgTicket').textContent = Math.round(avgTicket).toLocaleString('tr-TR');

    // trend chart
    reportTrendChart.data.labels = ts.data.map(d => d.bucket);
    reportTrendChart.data.datasets[0].data = ts.data.map(d => d.order_count);
    reportTrendChart.update();

    // branch comparison
    reportBranchChart.data.labels = byBranch.data.map(b => b.name);
    reportBranchChart.data.datasets[0].data = byBranch.data.map(b => b.order_count);
    reportBranchChart.update();

    // table
    const total = byBranch.data.reduce((s, b) => s + b.order_count, 0) || 1;
    document.getElementById('repBranchTbody').innerHTML = byBranch.data.map(b => `
      <tr>
        <td><b>${escapeHtml(b.name)}</b></td>
        <td>${escapeHtml(b.city)}</td>
        <td>${(b.order_count || 0).toLocaleString('tr-TR')}</td>
        <td>${(b.avg_prep || 0).toFixed(1)} dk</td>
        <td>${Math.round(b.revenue || 0).toLocaleString('tr-TR')} ₺</td>
        <td>%${((b.order_count / total) * 100).toFixed(1)}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Report load failed', err);
  }
}

function bindReportControls() {
  document.querySelectorAll('.range-btn[data-range]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.reportRange = btn.dataset.range;
      loadReports();
    });
  });

  document.getElementById('applyCustom').addEventListener('click', () => {
    const from = document.getElementById('customFrom').value;
    const to = document.getElementById('customTo').value;
    if (!from || !to) { alert('Lütfen tarih aralığı seçin'); return; }
    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('applyCustom').classList.add('active');
    state.reportRange = 'custom';
    loadReports();
  });

  // default custom dates: last 30 days
  const today = new Date();
  const lastMonth = new Date(); lastMonth.setMonth(lastMonth.getMonth() - 1);
  document.getElementById('customTo').value = today.toISOString().slice(0, 10);
  document.getElementById('customFrom').value = lastMonth.toISOString().slice(0, 10);

  // load reports when tab opens
  document.querySelector('.tab[data-tab=reports]').addEventListener('click', loadReports);
}

// ===== MODALS & FORMS =====
function bindModals() {
  const branchModal = document.getElementById('branchModal');
  const productModal = document.getElementById('productModal');

  document.getElementById('addBranchBtn')?.addEventListener('click', () => branchModal.classList.add('active'));
  document.getElementById('closeBranchModal')?.addEventListener('click', () => branchModal.classList.remove('active'));
  document.getElementById('addProductBtn')?.addEventListener('click', () => {
    const select = document.getElementById('newProductBranch');
    select.innerHTML = state.branches.map(b => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join('');
    if (state.branches.length === 0) {
      select.innerHTML = '<option disabled selected>Önce şube ekleyin</option>';
    }
    productModal.classList.add('active');
  });
  document.getElementById('closeProductModal')?.addEventListener('click', () => productModal.classList.remove('active'));

  // Form submits
  document.getElementById('submitBranchBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('newBranchName').value;
    const city = document.getElementById('newBranchCity').value;
    if (!name || !city) return alert('Lütfen tüm alanları doldurun');
    
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, city })
      });
      if (!res.ok) throw new Error('Hata oluştu');
      branchModal.classList.remove('active');
      document.getElementById('newBranchName').value = '';
      document.getElementById('newBranchCity').value = '';
      loadAll();
    } catch (e) {
      alert(e.message);
    }
  });

  document.getElementById('submitProductBtn')?.addEventListener('click', async () => {
    const branch_id = document.getElementById('newProductBranch').value;
    const item = document.getElementById('newProductName').value;
    const level = document.getElementById('newProductLevel').value;
    const threshold = document.getElementById('newProductThreshold').value;
    if (!branch_id || !item) return alert('Lütfen geçerli değerler girin');
    
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id, item, level, threshold })
      });
      if (!res.ok) throw new Error('Hata oluştu');
      productModal.classList.remove('active');
      document.getElementById('newProductName').value = '';
      loadAll();
    } catch (e) {
      alert(e.message);
    }
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadUser();
  initCharts();
  initReportCharts();
  bindReportControls();
  bindModals();
  loadAll();
  loadReports();
  setInterval(loadAll, 3000);
});
