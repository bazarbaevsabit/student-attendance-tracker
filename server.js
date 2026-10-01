const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'attendance.db');

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
const config = require('./config.json');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      group_id TEXT NULL
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      starosta_user_id INTEGER NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      name TEXT NOT NULL,
      UNIQUE(group_id, name)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      UNIQUE(group_id, student_id, date)
    );
  `);

  const groups = config.groups || [];
  for (const group of groups) {
    const existing = db.prepare('SELECT id FROM groups WHERE id = ?').get(group.id);
    if (!existing) {
      db.prepare('INSERT INTO groups (id, name, starosta_user_id) VALUES (?, ?, NULL)').run(group.id, group.name);
    }

    for (const student of group.students || []) {
      const existingStudent = db.prepare('SELECT id FROM students WHERE group_id = ? AND name = ?').get(group.id, student.name);
      if (!existingStudent) {
        db.prepare('INSERT INTO students (group_id, name) VALUES (?, ?)').run(group.id, student.name);
      }
    }
  }
}

function upsertUser({ login, name, role, groupId, password }) {
  const existing = db.prepare('SELECT id FROM users WHERE login = ?').get(login);
  if (existing) {
    db.prepare('UPDATE users SET password_hash = ?, role = ?, name = ?, group_id = ? WHERE login = ?')
      .run(bcrypt.hashSync(password, 10), role, name, groupId || null, login);
    return;
  }

  db.prepare('INSERT INTO users (login, password_hash, role, name, group_id) VALUES (?, ?, ?, ?, ?)')
    .run(login, bcrypt.hashSync(password, 10), role, name, groupId || null);
}

function createSeedUsers() {
  if (!process.env.ADMIN_LOGIN || !process.env.ADMIN_PASSWORD) {
    return;
  }

  upsertUser({
    login: process.env.ADMIN_LOGIN,
    name: 'Администратор',
    role: 'admin',
    groupId: null,
    password: process.env.ADMIN_PASSWORD
  });

  if (process.env.MANAGER_LOGIN && process.env.MANAGER_PASSWORD) {
    upsertUser({
      login: process.env.MANAGER_LOGIN,
      name: 'Менеджер',
      role: 'manager',
      groupId: null,
      password: process.env.MANAGER_PASSWORD
    });
  }

  const starostaPassword = process.env.STAROSTA_DEFAULT_PASSWORD || 'change_me';
  for (const group of config.groups || []) {
    const login = group.starosta && group.starosta.login;
    if (!login) continue;
    upsertUser({
      login,
      name: group.starosta.name,
      role: 'starosta',
      groupId: group.id,
      password: starostaPassword
    });
  }
}

initDb();
createSeedUsers();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function getAuthUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    const user = db.prepare('SELECT * FROM users WHERE login = ?').get(decoded.login);
    return user || null;
  } catch (error) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  req.user = user;
  return next();
}

app.post('/api/auth/login', (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) {
    return res.status(400).json({ success: false, message: 'Логин и пароль обязательны' });
  }

  const user = db.prepare('SELECT * FROM users WHERE login = ?').get(login);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
  }

  const token = jwt.sign({ login: user.login, role: user.role }, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: '8h'
  });

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      login: user.login,
      name: user.name,
      role: user.role,
      groupId: user.group_id
    }
  });
});

app.get('/api/me', requireAuth, (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    login: user.login,
    name: user.name,
    role: user.role,
    groupId: user.group_id,
    groupName: user.group_id ? db.prepare('SELECT name FROM groups WHERE id = ?').get(user.group_id)?.name : null
  });
});

app.get('/api/groups', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM groups ORDER BY name ASC').all();
  const groups = rows.map(group => {
    const starostaUser = group.starosta_user_id ? db.prepare('SELECT * FROM users WHERE id = ?').get(group.starosta_user_id) : null;
    const students = db.prepare('SELECT * FROM students WHERE group_id = ? ORDER BY name ASC').all(group.id);
    return {
      id: group.id,
      name: group.name,
      starosta: starostaUser ? { id: starostaUser.id, name: starostaUser.name, login: starostaUser.login } : null,
      students
    };
  });

  res.json(groups);
});

app.get('/api/groups/:groupId/students', requireAuth, (req, res) => {
  const { groupId } = req.params;
  const user = req.user;

  if (user.role === 'starosta' && user.group_id !== groupId) {
    return res.status(403).json({ success: false, message: 'Нет доступа к этой группе' });
  }

  const students = db.prepare('SELECT * FROM students WHERE group_id = ? ORDER BY name ASC').all(groupId);
  return res.json(students);
});

app.get('/api/attendance', requireAuth, (req, res) => {
  const { groupId } = req.query;
  const user = req.user;

  let query = 'SELECT * FROM attendance ORDER BY date DESC';
  const params = [];

  if (user.role === 'starosta') {
    query = 'SELECT * FROM attendance WHERE group_id = ? ORDER BY date DESC';
    params.push(user.group_id);
  } else if (groupId) {
    query = 'SELECT * FROM attendance WHERE group_id = ? ORDER BY date DESC';
    params.push(groupId);
  }

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.post('/api/attendance', requireAuth, (req, res) => {
  const { groupId, studentId, date, status } = req.body || {};
  if (!groupId || !studentId || !date || !status) {
    return res.status(400).json({ success: false, message: 'Неверные данные' });
  }

  const user = req.user;
  if (user.role === 'starosta' && user.group_id !== groupId) {
    return res.status(403).json({ success: false, message: 'Нет доступа к этой группе' });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (date > today) {
    return res.status(400).json({ success: false, message: 'Нельзя отметить будущую дату' });
  }

  db.prepare(`
    INSERT INTO attendance (group_id, student_id, date, status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(group_id, student_id, date)
    DO UPDATE SET status = excluded.status
  `).run(groupId, Number(studentId), date, status);

  return res.json({ success: true });
});

app.get('/api/summary', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT g.name AS group_name, s.name AS student_name, COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absent_days
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id
    LEFT JOIN groups g ON g.id = s.group_id
    GROUP BY s.id, s.name, g.name
    ORDER BY g.name ASC, s.name ASC
  `).all();

  return res.json(rows);
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
