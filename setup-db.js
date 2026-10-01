const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const config = require('./config.json');
require('dotenv').config();

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'attendance.db');
const db = new Database(dbPath);

function seedDatabase() {
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

  for (const group of config.groups || []) {
    const existingGroup = db.prepare('SELECT id FROM groups WHERE id = ?').get(group.id);
    if (!existingGroup) {
      db.prepare('INSERT INTO groups (id, name) VALUES (?, ?)').run(group.id, group.name);
    }

    for (const student of group.students || []) {
      const existingStudent = db.prepare('SELECT id FROM students WHERE group_id = ? AND name = ?').get(group.id, student.name);
      if (!existingStudent) {
        db.prepare('INSERT INTO students (group_id, name) VALUES (?, ?)').run(group.id, student.name);
      }
    }
  }

  const adminLogin = process.env.ADMIN_LOGIN;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const managerLogin = process.env.MANAGER_LOGIN;
  const managerPassword = process.env.MANAGER_PASSWORD;
  const defaultStarostaPassword = process.env.STAROSTA_DEFAULT_PASSWORD || 'change_me';

  if (adminLogin && adminPassword) {
    const exists = db.prepare('SELECT id FROM users WHERE login = ?').get(adminLogin);
    if (!exists) {
      db.prepare('INSERT INTO users (login, password_hash, role, name, group_id) VALUES (?, ?, ?, ?, ?)')
        .run(adminLogin, bcrypt.hashSync(adminPassword, 10), 'admin', 'Администратор', null);
    }
  }

  if (managerLogin && managerPassword) {
    const exists = db.prepare('SELECT id FROM users WHERE login = ?').get(managerLogin);
    if (!exists) {
      db.prepare('INSERT INTO users (login, password_hash, role, name, group_id) VALUES (?, ?, ?, ?, ?)')
        .run(managerLogin, bcrypt.hashSync(managerPassword, 10), 'manager', 'Менеджер', null);
    }
  }

  for (const group of config.groups || []) {
    const starosta = group.starosta;
    if (!starosta || !starosta.login) continue;
    const exists = db.prepare('SELECT id FROM users WHERE login = ?').get(starosta.login);
    if (!exists) {
      db.prepare('INSERT INTO users (login, password_hash, role, name, group_id) VALUES (?, ?, ?, ?, ?)')
        .run(starosta.login, bcrypt.hashSync(defaultStarostaPassword, 10), 'starosta', starosta.name, group.id);
    }
  }

  console.log('Database initialized successfully.');
}

seedDatabase();
