# RetroWeb — Task Roadmap

## Phase 1: MVP Core (Complete ✅)
- [x] Create project structure and repository files.
- [x] Design authentic Netscape Navigator 3.0/4.0 stylesheet (`public/netscape.css`) with 3D embossed borders, classic system typography, and beveled toolbars.
- [x] Build No-JS HTML sanitizer (`src/sanitizer.ts`) to enforce the zero-script constraint.
- [x] Implement lightweight SQLite/JSON persistence for user accounts and site metadata (`src/db.ts`).
- [x] Build Express application with login, signup, file upload, list, delete, and static site serving (`src/server.ts`).
- [x] Build community directory gallery (`public/directory.html`) and random site surfer route (`/surf`).
- [x] Create webring HTML snippet for users to embed in their footers.

## Phase 2: Production Hosting & Deployment
- [ ] Connect Cloudflare R2 for object storage (or S3-compatible backend).
- [ ] Implement Wildcard DNS & SSL routing for `username.retroweb.site`.
- [ ] Integrate Stripe Checkout for one-time donation / pay-what-you-want token gate ($3–$10 min).
- [ ] Add RSS / Atom feed generator for the Community Directory (`/feed.xml`).

## Phase 3: Community & Nostalgia Polish
- [ ] Add opt-in retro visitor counter badge for hosted pages (`<img src="https://retroweb.site/counter/username.png">`).
- [ ] Server-rendered pure HTML guestbook widget for hosted sites.
- [ ] 88x31 community button generator.
