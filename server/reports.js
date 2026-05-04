const db = require('./db');

function parseRange(req) {
  const { range, from, to } = req.query;
  let start, end;
  end = new Date();

  if (range === 'today') {
    start = new Date(); start.setHours(0,0,0,0);
  } else if (range === 'week') {
    start = new Date(); start.setDate(start.getDate() - 7); start.setHours(0,0,0,0);
  } else if (range === 'month') {
    start = new Date(); start.setMonth(start.getMonth() - 1); start.setHours(0,0,0,0);
  } else if (range === 'year') {
    start = new Date(); start.setFullYear(start.getFullYear() - 1); start.setHours(0,0,0,0);
  } else if (from && to) {
    start = new Date(from);
    end = new Date(to); end.setHours(23,59,59,999);
  } else {
    start = new Date(); start.setHours(0,0,0,0);
  }
  return { start: start.toISOString(), end: end.toISOString(), range: range || 'custom' };
}

function pickGroupFormat(start, end) {
  // decide bucket by span
  const spanDays = (new Date(end) - new Date(start)) / (24 * 3600 * 1000);
  if (spanDays <= 2) return { fmt: '%Y-%m-%d %H:00', label: 'hour' };
  if (spanDays <= 90) return { fmt: '%Y-%m-%d', label: 'day' };
  if (spanDays <= 365) return { fmt: '%Y-W%W', label: 'week' };
  return { fmt: '%Y-%m', label: 'month' };
}

function attachRoutes(app, requireAuth) {
  // Summary stats for a date range
  app.get('/api/reports/summary', requireAuth, (req, res) => {
    const { start, end, range } = parseRange(req);
    const userId = req.user.id;

    const totals = db.prepare(`
      SELECT COUNT(o.id) AS order_count,
             COALESCE(AVG(o.prep_time), 0) AS avg_prep,
             COALESCE(SUM(o.revenue), 0) AS revenue,
             COALESCE(MIN(o.prep_time), 0) AS min_prep,
             COALESCE(MAX(o.prep_time), 0) AS max_prep
      FROM orders o
      JOIN branches b ON o.branch_id = b.id
      WHERE o.created_at >= ? AND o.created_at <= ? AND b.owner_id = ?
    `).get(start, end, userId);

    const byBranch = db.prepare(`
      SELECT b.id, b.name, b.city,
             COUNT(o.id) AS order_count,
             COALESCE(AVG(o.prep_time), 0) AS avg_prep,
             COALESCE(SUM(o.revenue), 0) AS revenue
      FROM branches b
      LEFT JOIN orders o ON o.branch_id = b.id AND o.created_at >= ? AND o.created_at <= ?
      WHERE b.owner_id = ?
      GROUP BY b.id
      ORDER BY order_count DESC
    `).all(start, end, userId);

    res.json({ range, start, end, totals, byBranch });
  });

  // Time-series data for a date range, auto-bucketed
  app.get('/api/reports/timeseries', requireAuth, (req, res) => {
    const { start, end, range } = parseRange(req);
    const { fmt, label } = pickGroupFormat(start, end);
    const userId = req.user.id;

    const rows = db.prepare(`
      SELECT strftime(?, o.created_at) AS bucket,
             COUNT(o.id) AS order_count,
             COALESCE(AVG(o.prep_time), 0) AS avg_prep,
             COALESCE(SUM(o.revenue), 0) AS revenue
      FROM orders o
      JOIN branches b ON o.branch_id = b.id
      WHERE o.created_at >= ? AND o.created_at <= ? AND b.owner_id = ?
      GROUP BY bucket
      ORDER BY bucket ASC
    `).all(fmt, start, end, userId);

    res.json({ range, start, end, bucket: label, data: rows });
  });

  // Per-branch comparison for a date range
  app.get('/api/reports/by-branch', requireAuth, (req, res) => {
    const { start, end, range } = parseRange(req);
    const userId = req.user.id;
    const rows = db.prepare(`
      SELECT b.id, b.name, b.city,
             COUNT(o.id) AS order_count,
             COALESCE(AVG(o.prep_time), 0) AS avg_prep,
             COALESCE(SUM(o.revenue), 0) AS revenue
      FROM branches b
      LEFT JOIN orders o ON o.branch_id = b.id AND o.created_at >= ? AND o.created_at <= ?
      WHERE b.owner_id = ?
      GROUP BY b.id
      ORDER BY order_count DESC
    `).all(start, end, userId);
    res.json({ range, start, end, data: rows });
  });
}

module.exports = { attachRoutes };
