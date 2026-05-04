const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const db = require('./db');
const simulator = require('./simulator');
const auth = require('./auth');
const reports = require('./reports');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// ===== PUBLIC: auth routes =====
auth.attachRoutes(app);

// ===== PUBLIC: login page + static assets =====
const publicFiles = ['/login.html', '/login.css', '/login.js'];
app.use((req, res, next) => {
  // protect index.html and api routes; allow login assets and other static assets
  if (publicFiles.includes(req.path)) return next();
  if (req.path.startsWith('/api/auth/')) return next();
  if (req.path === '/' || req.path === '/index.html') {
    const token = req.cookies?.chainops_token;
    if (!token) return res.redirect('/login.html');
  }
  next();
});

// API routes — protected
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth/')) return next();
  return auth.requireAuth(req, res, next);
});

reports.attachRoutes(app, auth.requireAuth);

// ===== PROTECTED API =====
app.get('/api/branches', (req, res) => {
  const userId = req.user.id;
  const rows = db.prepare(`
    SELECT b.id, b.name, b.city,
           p.uptime AS pos_uptime,
           p.kitchen_delay,
           p.active_orders,
           p.last_ping
    FROM branches b
    LEFT JOIN pos_status p ON p.branch_id = b.id
    WHERE b.owner_id = ?
    ORDER BY b.id
  `).all(userId);

  if (rows.length === 0) return res.json([]);

  const branchIds = rows.map(r => r.id);
  const placeholders = branchIds.map(() => '?').join(',');

  const today = new Date(); today.setHours(0,0,0,0);
  const isoDay = today.toISOString();
  
  const orderStats = db.prepare(`
    SELECT branch_id, COUNT(*) AS today_orders, AVG(prep_time) AS avg_prep_time
    FROM orders WHERE created_at >= ? AND branch_id IN (${placeholders}) GROUP BY branch_id
  `).all(isoDay, ...branchIds);

  const stockStats = db.prepare(`
    SELECT branch_id, COUNT(*) AS low_stock_count
    FROM stock WHERE level < threshold AND branch_id IN (${placeholders}) GROUP BY branch_id
  `).all(...branchIds);

  const orderMap = Object.fromEntries(orderStats.map(o => [o.branch_id, o]));
  const stockMap = Object.fromEntries(stockStats.map(s => [s.branch_id, s.low_stock_count]));

  res.json(rows.map(r => ({
    id: r.id, name: r.name, city: r.city,
    posUptime: r.pos_uptime,
    kitchenDelay: r.kitchen_delay,
    activeOrders: r.active_orders,
    todayOrders: orderMap[r.id]?.today_orders || 0,
    avgOrderTime: Math.round((orderMap[r.id]?.avg_prep_time || 0) * 10) / 10,
    lowStockCount: stockMap[r.id] || 0,
  })));
});

app.get('/api/stock', (req, res) => {
  const rows = db.prepare(`
    SELECT s.id, s.branch_id, b.name AS branch_name, s.item, s.level, s.threshold
    FROM stock s JOIN branches b ON b.id = s.branch_id
    WHERE b.owner_id = ?
    ORDER BY s.branch_id, s.item
  `).all(req.user.id);
  res.json(rows);
});

app.get('/api/stock/critical', (req, res) => {
  const rows = db.prepare(`
    SELECT s.branch_id, b.name AS branch_name, s.item, s.level, s.threshold
    FROM stock s JOIN branches b ON b.id = s.branch_id
    WHERE s.level < s.threshold AND b.owner_id = ? ORDER BY s.level ASC
  `).all(req.user.id);
  res.json(rows);
});

app.get('/api/alerts', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);
  const rows = db.prepare(`
    SELECT a.id, a.branch_id, b.name AS branch_name, a.level, a.title, a.created_at
    FROM alerts a LEFT JOIN branches b ON b.id = a.branch_id
    WHERE (b.owner_id = ? OR a.branch_id IS NULL)
    ORDER BY a.id DESC LIMIT ?
  `).all(req.user.id, limit);
  res.json(rows);
});

app.get('/api/orders/hourly', (req, res) => {
  const rows = db.prepare(`
    SELECT strftime('%H', o.created_at) AS hour, COUNT(*) AS count
    FROM orders o
    JOIN branches b ON o.branch_id = b.id
    WHERE o.created_at >= datetime('now', '-12 hours') AND b.owner_id = ?
    GROUP BY hour ORDER BY hour
  `).all(req.user.id);
  res.json(rows);
});

app.get('/api/summary', (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const isoDay = today.toISOString();
  const userId = req.user.id;

  const orderTotal = db.prepare('SELECT COUNT(*) AS c FROM orders o JOIN branches b ON o.branch_id = b.id WHERE o.created_at >= ? AND b.owner_id = ?').get(isoDay, userId).c;
  const avgPrep = db.prepare('SELECT AVG(o.prep_time) AS a FROM orders o JOIN branches b ON o.branch_id = b.id WHERE o.created_at >= ? AND b.owner_id = ?').get(isoDay, userId).a || 0;
  const avgUptime = db.prepare('SELECT AVG(p.uptime) AS u FROM pos_status p JOIN branches b ON p.branch_id = b.id WHERE b.owner_id = ?').get(userId).u || 0;
  
  const activeAlerts = db.prepare(`SELECT COUNT(*) AS c FROM alerts a LEFT JOIN branches b ON a.branch_id = b.id WHERE a.created_at >= datetime('now', '-15 minutes') AND (b.owner_id = ? OR a.branch_id IS NULL)`).get(userId).c;
  const criticalAlerts = db.prepare(`SELECT COUNT(*) AS c FROM alerts a LEFT JOIN branches b ON a.branch_id = b.id WHERE a.level = 'critical' AND a.created_at >= datetime('now', '-15 minutes') AND (b.owner_id = ? OR a.branch_id IS NULL)`).get(userId).c;

  const busiest = db.prepare(`
    SELECT b.name, p.active_orders FROM branches b JOIN pos_status p ON p.branch_id = b.id
    WHERE b.owner_id = ?
    ORDER BY p.active_orders DESC LIMIT 1
  `).get(userId);

  res.json({
    todayOrders: orderTotal,
    avgPrepTime: Math.round(avgPrep * 10) / 10,
    avgPosUptime: Math.round(avgUptime * 100) / 100,
    activeAlerts, criticalAlerts,
    busiestBranch: busiest?.name || '—',
    busiestActiveOrders: busiest?.active_orders || 0,
  });
});

app.post('/api/orders', (req, res) => {
  const branchId = Number(req.body.branch_id);
  const prepTime = Number(req.body.prep_time);
  const revenue = req.body.revenue === undefined ? 100 : Number(req.body.revenue);

  if (!Number.isInteger(branchId) || branchId <= 0 || !Number.isFinite(prepTime) || prepTime <= 0) {
    return res.status(400).json({ error: 'branch_id and prep_time required' });
  }
  if (!Number.isFinite(revenue) || revenue < 0) {
    return res.status(400).json({ error: 'Invalid revenue' });
  }

  const branch = db.prepare('SELECT id FROM branches WHERE id = ? AND owner_id = ?').get(branchId, req.user.id);
  if (!branch) return res.status(403).json({ error: 'Yetkisiz işlem' });

  const result = db.prepare('INSERT INTO orders (branch_id, created_at, prep_time, status, revenue) VALUES (?, ?, ?, ?, ?)')
    .run(branchId, new Date().toISOString(), prepTime, 'completed', revenue);
  res.json({ id: result.lastInsertRowid });
});

app.post('/api/branches', (req, res) => {
  const { name, city } = req.body;
  if (!name || !city) return res.status(400).json({ error: 'Ad ve şehir gerekli' });
  
  const result = db.prepare('INSERT INTO branches (owner_id, name, city) VALUES (?, ?, ?)').run(req.user.id, name, city);
  const branchId = result.lastInsertRowid;
  
  db.prepare('INSERT INTO pos_status (branch_id, uptime, kitchen_delay, active_orders, last_ping) VALUES (?, 100, 0, 0, ?)').run(branchId, new Date().toISOString());
  
  res.json({ id: branchId, name, city });
});

app.post('/api/stock', (req, res) => {
  const { branch_id, item, level, threshold } = req.body;
  if (!branch_id || !item) return res.status(400).json({ error: 'Gerekli alanlar eksik' });
  
  const branch = db.prepare('SELECT id FROM branches WHERE id = ? AND owner_id = ?').get(branch_id, req.user.id);
  if (!branch) return res.status(403).json({ error: 'Yetkisiz işlem' });
  
  const result = db.prepare('INSERT INTO stock (branch_id, item, level, threshold) VALUES (?, ?, ?, ?)').run(branch_id, item, level || 0, threshold || 10);
  res.json({ id: result.lastInsertRowid, branch_id, item });
});

// ===== STATIC FILES (after auth gate) =====
app.use((req, res, next) => {
  if (req.path === '/server' || req.path.startsWith('/server/')) return res.status(404).end();
  if (req.path === '/package.json' || req.path === '/package-lock.json') return res.status(404).end();
  if (/\.db(-wal|-shm)?$/i.test(req.path)) return res.status(404).end();
  next();
});

app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`[Server] ChainOps API running at http://localhost:${PORT}`);
  simulator.start(3000);
});
