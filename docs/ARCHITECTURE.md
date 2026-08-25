# RetroWeb Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│   (Uploads HTML/CSS/Images via Netscape-style Dashboard)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP POST /api/files/upload
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Upload Handler (Express)                  │
│                     (multer in-memory)                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                Is file .html / .htm ?
               ├── YES ────────┐
               │               ▼
               │       ┌────────────────────────────────┐
               │       │    HTML Sanitizer (cheerio)    │
               │       │  - Strip <script>, <iframe>   │
               │       │  - Strip on* event handlers    │
               │       │  - Strip javascript: URLs      │
               │       │  - Extract <title> & <meta>    │
               │       └───────────────┬────────────────┘
               │                       │ Clean HTML + Metadata
               ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Storage Layer (data/sites/)                │
│             /data/sites/<username>/index.html               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Directory & Database (SQLite)                 │
│         Table: directory_sites (title, description)         │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │
┌──────────────────────────────┴──────────────────────────────┐
│              Public Web Surfer & Directory Routes           │
│  - GET /directory  -> HTML Table of Active Sites            │
│  - GET /surf       -> 302 Redirect to Random ~username/     │
│  - GET /u/:user    -> Static Server with CSP script-src none│
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE directory_sites (
  username TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_public INTEGER DEFAULT 1,
  FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
);
```
