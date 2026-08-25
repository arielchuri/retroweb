import express from 'express';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { sanitizeHtml, isAllowedFileExtension } from './sanitizer.js';
import {
  getUser,
  createUser,
  getAllDirectorySites,
  getRandomSite,
  updateDirectoryEntry,
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Directories
const publicDir = path.resolve(__dirname, '../public');
const sitesDir = path.resolve(__dirname, '../data/sites');
if (!fs.existsSync(sitesDir)) {
  fs.mkdirSync(sitesDir, { recursive: true });
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('retro-secret-key-1996'));
app.use(express.static(publicDir));

// Multer memory storage for uploads to allow sanitizing before disk write
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per upload
});

// Helper: Get user site directory
function getUserDir(username: string): string {
  const dir = path.join(sitesDir, username);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Helper: Format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ── Auth Routes ─────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { username, password, action } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password required.');
  }

  const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const existing = getUser(cleanUser);

  if (action === 'register') {
    if (existing) {
      return res.status(400).send('Username already taken. <a href="/login">Try again</a>');
    }
    createUser(cleanUser, password);
    // Scaffold default index.html
    const userDir = getUserDir(cleanUser);
    const defaultIndex = `<!DOCTYPE html>
<html>
<head>
  <title>${cleanUser}'s Homepage</title>
  <meta name="description" content="Welcome to my slice of the clean web!">
</head>
<body bgcolor="#ffffff" text="#000000" link="#0000ee" vlink="#551a8b">
  <h1>Welcome to ${cleanUser}'s Web Space</h1>
  <hr>
  <p>This is my hand-crafted homepage on RetroWeb. Zero JavaScript, 100% human.</p>
  <p>Check back soon for updates!</p>
  <hr>
  <div align="center">
    <p>[ <a href="/surf">← Random Neighbor Site →</a> | <a href="/directory">Directory</a> ]</p>
  </div>
</body>
</html>`;
    fs.writeFileSync(path.join(userDir, 'index.html'), defaultIndex, 'utf8');
    updateDirectoryEntry(cleanUser, `${cleanUser}'s Homepage`, 'Welcome to my slice of the clean web!');
  } else {
    if (!existing || existing.password !== password) {
      return res.status(401).send('Invalid credentials. <a href="/login">Back</a>');
    }
  }

  res.cookie('auth_user', cleanUser, { httpOnly: true });
  res.redirect('/dashboard');
});

app.get('/api/auth/logout', (_req, res) => {
  res.clearCookie('auth_user');
  res.redirect('/');
});

// ── Dashboard & File Management ─────────────────────────────────────────────

app.get('/dashboard', (req, res) => {
  const username = req.cookies.auth_user;
  if (!username) return res.redirect('/login.html');

  const userDir = getUserDir(username);
  const files = fs.readdirSync(userDir);
  let totalBytes = 0;

  const fileRows = files.map(file => {
    const stats = fs.statSync(path.join(userDir, file));
    totalBytes += stats.size;
    return `
      <tr>
        <td><a href="/u/${username}/${file}" target="_blank"><b>${file}</b></a></td>
        <td>${formatBytes(stats.size)}</td>
        <td>${stats.mtime.toLocaleDateString()}</td>
        <td>
          <form method="POST" action="/api/files/delete" style="display:inline;" onsubmit="return confirm('Delete ${file}?');">
            <input type="hidden" name="filename" value="${file}">
            <button type="submit" class="btn" style="color:#cc0000;">✕ Delete</button>
          </form>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="4"><i>No files uploaded yet.</i></td></tr>';

  let html = fs.readFileSync(path.join(publicDir, 'dashboard.html'), 'utf8');
  html = html.replace(/%%USERNAME%%/g, username);
  html = html.replace('%%FILE_ROWS%%', fileRows);
  html = html.replace('%%USED_STORAGE%%', formatBytes(totalBytes));

  res.send(html);
});

app.post('/api/files/upload', upload.array('files'), (req, res) => {
  const username = req.cookies.auth_user;
  if (!username) return res.redirect('/login.html');

  const userDir = getUserDir(username);
  const uploadedFiles = req.files as Express.Multer.File[];
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return res.redirect('/dashboard');
  }

  for (const file of uploadedFiles) {
    const filename = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '');
    if (!isAllowedFileExtension(filename)) {
      continue; // Skip disallowed extensions
    }

    const filePath = path.join(userDir, filename);

    // If it's HTML, sanitize it with the No-JS validator
    if (filename.endsWith('.html') || filename.endsWith('.htm')) {
      const rawHtml = file.buffer.toString('utf8');
      const sanitized = sanitizeHtml(rawHtml);
      fs.writeFileSync(filePath, sanitized.cleanHtml, 'utf8');

      // If it's index.html, update directory title and description
      if (filename === 'index.html') {
        updateDirectoryEntry(username, sanitized.title, sanitized.description);
      }
    } else {
      // Direct binary save (CSS, images, icons, etc.)
      fs.writeFileSync(filePath, file.buffer);
    }
  }

  res.redirect('/dashboard');
});

app.post('/api/files/delete', (req, res) => {
  const username = req.cookies.auth_user;
  if (!username) return res.redirect('/login.html');

  const filename = path.basename(req.body.filename);
  const filePath = path.join(getUserDir(username), filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  res.redirect('/dashboard');
});

// ── Community Discovery & Random Surfer ──────────────────────────────────────

app.get('/directory', (_req, res) => {
  const sites = getAllDirectorySites();
  const rows = sites.map(s => `
    <tr>
      <td><a href="/u/${s.username}/"><b>${s.title || s.username}</b></a></td>
      <td>~${s.username}</td>
      <td>${s.description || '<i>No description</i>'}</td>
      <td>${new Date(s.updated_at).toLocaleDateString()}</td>
    </tr>
  `).join('');

  let html = fs.readFileSync(path.join(publicDir, 'directory.html'), 'utf8');
  html = html.replace('<!-- Server-rendered or populated by template -->', rows);
  html = html.replace('Total Members: 3', `Total Members: ${sites.length}`);
  res.send(html);
});

app.get('/surf', (req, res) => {
  const fromUser = typeof req.query.from === 'string' ? req.query.from : undefined;
  const targetUser = getRandomSite(fromUser);

  if (targetUser) {
    res.redirect(`/u/${targetUser}/`);
  } else {
    res.redirect('/directory');
  }
});

// ── User Site Serving ───────────────────────────────────────────────────────

app.use('/u/:username', (req, res, next) => {
  const username = req.params.username.toLowerCase();
  const userDir = path.join(sitesDir, username);

  if (!fs.existsSync(userDir)) {
    return res.status(404).send(`<h1>404 Not Found</h1><p>Site ~${username} does not exist.</p><p><a href="/directory">Browse directory</a></p>`);
  }

  // Strict CSP to enforce zero-JS execution even if something bypassed
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline'; script-src 'none'; object-src 'none';");
  express.static(userDir, { index: 'index.html' })(req, res, next);
});

// Aliases for convenience
app.get('/login', (_req, res) => res.sendFile(path.join(publicDir, 'login.html')));

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌐 RetroWeb Server running at http://localhost:${PORT}`);
  console.log(`⚡ Zero-JS Static Hosting & Community Neighborhood`);
  console.log(`======================================================\n`);
});
