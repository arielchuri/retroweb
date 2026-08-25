# RetroWeb Technical Specification

## 1. Zero-JS Security Model
To maintain safety, privacy, and aesthetic purity, uploaded HTML files pass through a strict parser:

### Forbidden Elements & Attributes
- **Tags**: `<script>`, `<noscript>`, `<object>`, `<embed>`, `<applet>`, `<iframe>` (unless explicitly whitelisted video embeds), `<base>`.
- **Inline Event Handlers**: Any attribute starting with `on*` (`onload`, `onclick`, `onmouseover`, `onerror`, etc.) is stripped.
- **URI Schemes**: `javascript:`, `vbscript:`, `data:text/html` URLs in `href` or `src` attributes are removed.
- **Meta Tags**: `<meta http-equiv="refresh">` pointing to external sites is disallowed.

### Allowed File Extensions
- **Markup & Styling**: `.html`, `.htm`, `.css`, `.txt`, `.md`.
- **Images & Graphics**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg` (sanitized), `.ico`, `.webp`.
- **Audio (Optional)**: `.mid`, `.midi`, `.mp3`, `.wav`.

---

## 2. Business Model & Storage Quotas
- **Pricing**: One-time donation ($3 minimum, suggested $5–$15) per account.
- **Storage Limit**: 10 MB per user (sufficient for ~200+ rich HTML/CSS pages and dozens of compressed images).
- **Bandwidth**: Unlimited fair-use static caching via Cloudflare CDN.

---

## 3. Community Discovery Mechanics
- **Directory Index**: Extracted from `<title>` and `<meta name="description">` inside `index.html`.
- **Random Surfer (`/surf`)**: Queries the database for a random active user site and issues an HTTP 302 redirect.
- **Webring Integration**: Provides an embedded navigation bar link:
  ```html
  <table border="1" cellpadding="4" align="center" style="background:#c0c0c0; border:2px outset #ffffff;">
    <tr>
      <td><b>[RetroWeb Neighborhood]</b></td>
      <td><a href="https://retroweb.site/surf?from=USERNAME">⟵ Random Site ⟶</a></td>
      <td><a href="https://retroweb.site/directory">Directory</a></td>
    </tr>
  </table>
  ```
