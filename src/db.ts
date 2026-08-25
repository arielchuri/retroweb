import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'retroweb.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS directory_sites (
    username TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_public INTEGER DEFAULT 1,
    FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
  );
`);

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface DirectorySite {
  username: string;
  title: string;
  description: string;
  updated_at: string;
}

export function getUser(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as User | undefined;
}

export function createUser(username: string, password: string): User {
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const res = stmt.run(username, password);
  return {
    id: Number(res.lastInsertRowid),
    username,
    password,
    created_at: new Date().toISOString(),
  };
}

export function updateDirectoryEntry(username: string, title?: string, description?: string): void {
  const stmt = db.prepare(`
    INSERT INTO directory_sites (username, title, description, updated_at, is_public)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
    ON CONFLICT(username) DO UPDATE SET
      title = COALESCE(excluded.title, directory_sites.title),
      description = COALESCE(excluded.description, directory_sites.description),
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(username, title || `${username}'s Home`, description || 'A cozy hand-crafted static web space.');
}

export function getAllDirectorySites(): DirectorySite[] {
  const stmt = db.prepare('SELECT * FROM directory_sites WHERE is_public = 1 ORDER BY updated_at DESC');
  return stmt.all() as DirectorySite[];
}

export function getRandomSite(excludeUsername?: string): string | null {
  const stmt = db.prepare(`
    SELECT username FROM directory_sites
    WHERE is_public = 1 AND username != ?
    ORDER BY RANDOM()
    LIMIT 1
  `);
  const row = stmt.get(excludeUsername || '') as { username: string } | undefined;
  return row ? row.username : null;
}
