# RetroWeb — Project Handoff & Developer Guide

This document contains everything you or an AI agent needs to instantly resume development on **RetroWeb**.

---

## 🎯 Executive Summary & Mission
RetroWeb is a minimalist static web hosting service and community neighborhood with a strict **No-JavaScript** constraint and an authentic **Netscape Navigator 3.0 / 4.0** visual aesthetic.

* **GitHub Repository**: [https://github.com/arielchuri/retroweb](https://github.com/arielchuri/retroweb)
* **Local Path**: `/Users/arielchuri/Life/projects/personal/retroweb`
* **Current Status**: Functional working MVP prototype (Auth, File Manager, Upload Sanitizer, Directory Gallery, Random Surfer, and Static Serving).

---

## ⚡ Quickstart (Resume Work)

```bash
# 1. Navigate to project
cd /Users/arielchuri/Life/projects/personal/retroweb

# 2. Install dependencies (if not already installed)
npm install

# 3. Start local development server (with tsx hot-reload)
npm run dev

# 4. Open in browser
open http://localhost:8088
```

---

## 🏗 Key File Index

| File | Purpose |
| :--- | :--- |
| `src/server.ts` | Main Express server (auth, file uploads/deletions, static routing, `/directory`, `/surf`). |
| `src/sanitizer.ts` | Strict HTML/CSS security validator (uses `cheerio` to strip `<script>`, `on*` inline handlers, and `javascript:` URIs). |
| `src/db.ts` | SQLite database layer (`better-sqlite3`) managing `users` and `directory_sites`. |
| `public/netscape.css` | Authentic Netscape Navigator 3.0/4.0 stylesheet (3D beveled borders, classic serif fonts, retro toolbar buttons). |
| `public/index.html` | Homepage / manifesto. |
| `public/directory.html` | Community gallery listing member sites. |
| `public/dashboard.html` | Logged-in user file manager (upload, list, delete). |
| `public/login.html` | Account access & registration. |
| `data/sites/<username>/` | Local storage directory for user static assets. |

---

## 🔌 Next Steps & Production Roadmap

### 1. Cloudflare R2 / S3 Object Storage Adapter
* *Current state*: User files are stored in `data/sites/<username>/`.
* *Next action*: Replace local disk writes in `src/server.ts` with Cloudflare R2 presigned URLs or S3 SDK (`@aws-sdk/client-s3`) so storage scales infinitely with $0 egress fees.

### 2. Stripe One-Time Donation Gate
* *Current state*: Registration is free on the local prototype.
* *Next action*: Integrate Stripe Checkout (`stripe.checkout.sessions.create`) for a $3–$10 one-time donation upon registration, storing `is_paid = 1` in SQLite.

### 3. Wildcard Subdomains & Custom Domains
* *Current state*: Sites are served at `/u/<username>/`.
* *Next action*: Configure a wildcard DNS record (`*.retroweb.site`) and add subdomain routing middleware in Express / Cloudflare Workers.

### 4. Community Badges & Feeds
* Add an RSS feed for the directory (`/feed.xml`).
* Add a server-generated visitor counter endpoint (`/counter/<username>.png`).

---

## 🔒 Security Invariants (Do Not Break)
1. **Zero-JS Invariant**: Never serve un-sanitized HTML files. All HTML must pass through `sanitizeHtml()` in `src/sanitizer.ts`.
2. **Path Traversal Protection**: Ensure `path.basename()` is always applied to uploaded filenames to prevent directory traversal attacks.
3. **Strict Content-Security-Policy**: The server sets `script-src 'none'; object-src 'none';` headers on all `/u/:username` requests.
