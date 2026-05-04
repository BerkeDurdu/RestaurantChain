const db = require('./db');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const insertOrder = db.prepare('INSERT INTO orders (branch_id, created_at, prep_time, status, revenue) VALUES (?, ?, ?, ?, ?)');
const insertAlert = db.prepare('INSERT INTO alerts (branch_id, level, title, created_at) VALUES (?, ?, ?, ?)');
const updatePos = db.prepare('UPDATE pos_status SET uptime = ?, kitchen_delay = ?, active_orders = ?, last_ping = ? WHERE branch_id = ?');
const updateStock = db.prepare('UPDATE stock SET level = ? WHERE id = ?');
const getBranches = db.prepare('SELECT * FROM branches');
const getPos = db.prepare('SELECT * FROM pos_status WHERE branch_id = ?');
const getStockForBranch = db.prepare('SELECT * FROM stock WHERE branch_id = ?');

function tick() {
  const now = new Date().toISOString();
  const branches = getBranches.all();

  const tx = db.transaction(() => {
    branches.forEach(b => {
      const pos = getPos.get(b.id);

      // simulate POS metrics drift
      const newUptime = Math.max(90, Math.min(100, pos.uptime + (Math.random() - 0.5) * 0.4));
      const newDelay = Math.max(0, Math.min(15, pos.kitchen_delay + rand(-1, 2)));
      const newActive = Math.max(0, pos.active_orders + rand(-3, 5));
      updatePos.run(newUptime, newDelay, newActive, now, b.id);

      // generate new orders (1-3 per tick per branch)
      const orderCount = rand(1, 3);
      for (let i = 0; i < orderCount; i++) {
        const prep = 10 + rand(0, 20) + (newDelay > 5 ? 5 : 0);
        const revenue = 80 + rand(20, 250);
        insertOrder.run(b.id, now, prep, 'completed', revenue);
      }

      // decrease stock
      const stocks = getStockForBranch.all(b.id);
      stocks.forEach(s => {
        let level = Math.max(0, s.level - rand(0, 2));
        if (level < 5) level = 60 + rand(0, 40); // simulate restock
        updateStock.run(level, s.id);
      });

      // generate alerts
      if (newDelay > 8 && Math.random() < 0.4) {
        insertAlert.run(b.id, 'critical', `Kitchen delay ${newDelay} dk — kritik eşik aşıldı`, now);
      } else if (newUptime < 95 && Math.random() < 0.3) {
        insertAlert.run(b.id, 'critical', `POS sistem uptime düştü: ${newUptime.toFixed(1)}%`, now);
      } else if (Math.random() < 0.08) {
        const lowStock = stocks.find(s => s.level < s.threshold);
        if (lowStock) insertAlert.run(b.id, 'warning', `Düşük stok: ${lowStock.item} (${lowStock.level} adet)`, now);
      }
    });

    // prune old alerts (keep last 50)
    db.prepare(`DELETE FROM alerts WHERE id NOT IN (SELECT id FROM alerts ORDER BY id DESC LIMIT 50)`).run();
  });

  tx();
}

function start(intervalMs = 3000) {
  console.log(`[Simulator] Starting POS simulator (tick = ${intervalMs}ms)`);
  setInterval(tick, intervalMs);
}

module.exports = { start, tick };
