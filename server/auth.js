const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('[Auth] JWT_SECRET not set; using an ephemeral in-memory secret.');
}
const COOKIE_NAME = 'chainops_token';
const TOKEN_EXPIRES = '7d';
const COOKIE_MAX_AGE_MS = 7 * 24 * 3600 * 1000;

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function attachRoutes(app) {
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ id: user.id, username: user.username, full_name: user.full_name, role: user.role });
  });

  app.post('/api/auth/register', (req, res) => {
    const { username, password, full_name } = req.body || {};
    if (!username || !password || !full_name) {
      return res.status(400).json({ error: 'Tüm alanlar gerekli' });
    }
    if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });

    const exists = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username);
    if (exists) return res.status(409).json({ error: 'Bu kullanıcı adı zaten kayıtlı' });

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, password_hash, full_name, role, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(username, hash, full_name, 'manager', new Date().toISOString());

    const user = { id: result.lastInsertRowid, username, full_name, role: 'manager' };
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json(user);
  });

  app.post('/api/auth/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      full_name: req.user.full_name,
      role: req.user.role,
    });
  });
}

module.exports = { attachRoutes, requireAuth };
