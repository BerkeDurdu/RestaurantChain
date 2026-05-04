const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

const db = new Database(path.join(__dirname, 'chainops.db'));
db.pragma('journal_mode = WAL');

// ===== SCHEMA =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'manager',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER DEFAULT 1,
    name TEXT NOT NULL,
    city TEXT NOT NULL
  );
`);

try {
  db.exec('ALTER TABLE branches ADD COLUMN owner_id INTEGER DEFAULT 1');
} catch (err) {
  // Column likely already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    prep_time INTEGER NOT NULL,
    status TEXT NOT NULL,
    revenue REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    item TEXT NOT NULL,
    level INTEGER NOT NULL,
    threshold INTEGER NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    level TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS pos_status (
    branch_id INTEGER PRIMARY KEY,
    uptime REAL NOT NULL,
    kitchen_delay INTEGER NOT NULL,
    active_orders INTEGER NOT NULL,
    last_ping TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
  CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
  CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);
`);

// ===== SEED DATA =====
const BRANCHES = [
  { id: 1, name: 'Kadıköy Şubesi', city: 'İstanbul' },
  { id: 2, name: 'Çankaya Şubesi', city: 'Ankara' },
  { id: 3, name: 'Konak Şubesi', city: 'İzmir' },
  { id: 4, name: 'Nilüfer Şubesi', city: 'Bursa' },
  { id: 5, name: 'Muratpaşa Şubesi', city: 'Antalya' },
  { id: 6, name: 'Şehitkamil Şubesi', city: 'Gaziantep' },
];

const STOCK_ITEMS = ['Et', 'Tavuk', 'Patates', 'Domates', 'Peynir', 'Ekmek', 'Kola', 'Soğan'];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateBootstrapPassword() {
  return crypto.randomBytes(12).toString('base64url');
}

function ensureBootstrapAdmin() {
  const admin = db.prepare('SELECT id, username, password_hash FROM users WHERE id = 1').get();

  if (!admin) {
    const password = generateBootstrapPassword();
    db.prepare('INSERT INTO users (id, username, password_hash, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(1, 'admin', bcrypt.hashSync(password, 10), 'Sistem Yöneticisi', 'admin', new Date().toISOString());
    console.log(`[DB] Created bootstrap admin account (id=1). Password: ${password}`);
    return;
  }

  if (admin.username === 'admin' && bcrypt.compareSync('admin123', admin.password_hash)) {
    const password = generateBootstrapPassword();
    db.prepare('UPDATE users SET password_hash = ?, full_name = ?, role = ? WHERE id = 1')
      .run(bcrypt.hashSync(password, 10), 'Sistem Yöneticisi', 'admin');
    console.log(`[DB] Rotated legacy admin password. New password: ${password}`);
  }
}

function rotateLegacyManagerPassword() {
  const manager = db.prepare('SELECT id, password_hash FROM users WHERE username = ?').get('manager');
  if (!manager || !bcrypt.compareSync('manager123', manager.password_hash)) return;

  const password = generateBootstrapPassword();
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), manager.id);
  console.log(`[DB] Rotated legacy manager password. New password: ${password}`);
}

function seedBranches() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM branches').get().c;
  if (count > 0) return;

  const insertBranch = db.prepare('INSERT INTO branches (id, name, city) VALUES (?, ?, ?)');
  const insertStock = db.prepare('INSERT INTO stock (branch_id, item, level, threshold) VALUES (?, ?, ?, ?)');
  const insertPos = db.prepare('INSERT INTO pos_status (branch_id, uptime, kitchen_delay, active_orders, last_ping) VALUES (?, ?, ?, ?, ?)');

  const tx = db.transaction(() => {
    BRANCHES.forEach(b => {
      insertBranch.run(b.id, b.name, b.city);
      STOCK_ITEMS.forEach(item => {
        insertStock.run(b.id, item, 40 + rand(0, 60), 25);
      });
      insertPos.run(b.id, 98 + Math.random() * 2, rand(0, 5), 10 + rand(0, 25), new Date().toISOString());
    });
  });
  tx();
  console.log('[DB] Seeded 6 branches');
}

function seedHistoricalOrders() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  if (count > 0) return;

  console.log('[DB] Seeding 365 days of historical orders... (this takes ~10s)');
  const insertOrder = db.prepare('INSERT INTO orders (branch_id, created_at, prep_time, status, revenue) VALUES (?, ?, ?, ?, ?)');

  const now = Date.now();
  const DAYS = 365;
  let total = 0;

  const tx = db.transaction(() => {
    for (let day = DAYS; day >= 0; day--) {
      const dayStart = new Date(now - day * 24 * 3600 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayOfWeek = dayStart.getDay();
      // Weekend boost
      const dayMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0;
      // Seasonal trend (more orders in summer months)
      const month = dayStart.getMonth();
      const seasonMult = (month >= 5 && month <= 8) ? 1.2 : 1.0;

      BRANCHES.forEach(b => {
        const branchBase = 80 + b.id * 15; // bigger branches do more orders
        const dailyCount = Math.floor(branchBase * dayMultiplier * seasonMult * (0.85 + Math.random() * 0.3));

        for (let i = 0; i < dailyCount; i++) {
          // Order time distribution: peak at 12-14 and 19-21
          let hour;
          const r = Math.random();
          if (r < 0.35) hour = 11 + rand(0, 3);   // lunch peak
          else if (r < 0.75) hour = 18 + rand(0, 3); // dinner peak
          else hour = 9 + rand(0, 13);                // spread

          const minute = rand(0, 59);
          const second = rand(0, 59);
          const t = new Date(dayStart);
          t.setHours(hour, minute, second);

          const prep = 10 + rand(0, 20);
          const revenue = 80 + rand(20, 250); // ₺
          insertOrder.run(b.id, t.toISOString(), prep, 'completed', revenue);
          total++;
        }
      });
    }
  });
  tx();
  console.log(`[DB] Seeded ${total.toLocaleString()} historical orders`);
}

function seedInitialAlerts() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM alerts').get().c;
  if (count > 0) return;
  db.prepare('INSERT INTO alerts (branch_id, level, title, created_at) VALUES (?, ?, ?, ?)')
    .run(null, 'info', 'Sistem başlatıldı — tüm şubeler izleme altında', new Date().toISOString());
}

ensureBootstrapAdmin();
rotateLegacyManagerPassword();
seedBranches();
seedHistoricalOrders();
seedInitialAlerts();

module.exports = db;
module.exports.STOCK_ITEMS = STOCK_ITEMS;
