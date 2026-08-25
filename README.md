# RetroWeb — The No-JS Static Web Hosting & Neighborhood

> **"Hand-crafted HTML for humans. Zero tracking. Zero JavaScript. Forever simple."**

RetroWeb is a minimalist static web hosting service and community directory built for digital gardeners, writers, retro-computing enthusiasts, and anyone exhausted by the modern, bloated, tracker-infested web.

---

## 🏛 The Philosophy

1. **Strict No-JavaScript Constraint**: Hosted sites may only contain plain HTML, CSS, images, and text. No trackers, no cookie popups, no framework bloat, no client-side scripts.
2. **Authentic Netscape / Early-Web Aesthetic**: A cozy, tactile, beveled UI inspired by Netscape Navigator 3.0/4.0 and early NCSA Mosaic, celebrating the era when the web was built by real people.
3. **One-Time Donation / Pay-What-You-Want Business Model**: Users make a single one-time contribution (e.g. $3–$10 minimum) for lifetime hosting of a modest space (~10 MB). No recurring monthly SaaS subscriptions.
4. **Built-in Community Discovery**: Includes a curated public gallery/directory, a "Random Site Surfer" (`/surf`), and built-in webrings so personal sites are discovered and celebrated rather than lost in the algorithmic void.
5. **Ultra-Low Operating Overhead**: Because sites are purely static text and images with no client-side scripts or dynamic backend execution on views, operating costs are virtually $0–$5/month.

---

## 🛠 Core Features & MVP Scope

- [x] **Account System**: Simple email/password authentication.
- [x] **File Manager**: Upload, list, and delete `.html`, `.css`, `.txt`, `.png`, `.jpg`, `.gif`, `.svg`, and `.ico` files.
- [x] **No-JS Sanitizer**: Enforces the zero-script rule on upload (rejects `<script>`, `onclick`, `onload`, `javascript:` URIs, `<embed>`, `<object>`).
- [x] **Public Subdomains / Paths**: User sites served at `username.retroweb.site` (or `/u/username/`).
- [x] **Community Directory & Gallery**: Public index of active sites with title, description, and tags.
- [x] **Random Site Surfer (`/surf`)**: Instant random redirect button for exploring neighbor sites.
- [x] **Webring Badge Snippet**: Copy-pasteable HTML snippet for site footers.

---

## 📦 Directory Structure

```
projects/personal/retroweb/
├── README.md               # Vision, philosophy, and architecture overview
├── tasks.md                # GTD task checklist and development roadmap
├── spec.md                 # Technical specification and security rules
├── package.json            # Node.js dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── public/                 # Netscape-style UI templates and static assets
│   ├── index.html          # Homepage / manifesto
│   ├── directory.html      # Community gallery & site list
│   ├── dashboard.html      # Account file manager (upload/list/delete)
│   ├── login.html          # Retro login/signup page
│   └── netscape.css        # Authentic Netscape 3.0/4.0 beveled UI theme
└── src/
    ├── server.ts           # Express server with auth, file manager, and discovery
    ├── sanitizer.ts        # Strict HTML/CSS security & No-JS validator
    └── db.ts               # Minimal SQLite / in-memory store for users & sites
```

---

## 🚀 Quickstart

```bash
cd projects/personal/retroweb
npm install
npm run dev
```

Open `http://localhost:3000` to view the Netscape-styled portal and start creating sites!
