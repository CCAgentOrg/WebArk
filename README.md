# 🗄️ WebArk

A privacy-first, serverless web archiver. Archive pages to multiple providers directly from your browser - no server required.

**Live:** https://ccagentorg.github.io/WebArk/

---

## Features

### 📦 Archive
- Archive URLs to 7 providers (Wayback Machine, archive.is, archive.ph, Ghostarchive, ArchiveVN, Textise, Memento)
- Background mode - archive without opening popups
- Rate limiting to avoid being blocked

### 🔍 Check Status
- See which providers have a page archived
- One-click archive for unarchived pages
- Check multiple URLs at once

### 🕷️ Crawl & Archive
- Discover pages at 1-2 depth levels
- Table view of all found links
- Filter internal/external links
- Skip top sites (Wikipedia, GitHub, etc.)
- Check status before archiving
- Archive all, unarchived only, or selected

### ⚙️ Settings
- Default provider
- Default depth (1 or 2)
- Auto-check status
- Background mode toggle
- Rate limit configuration

### 📜 History
- Tracks all archiving activity
- Persisted in browser localStorage

### 📱 PWA
- Install as web app
- Works offline
- Add to home screen

---

## Quick Start

### Live Version
Open: https://ccagentorg.github.io/WebArk/

### Local
```bash
npm install
npm test
```

---

## Usage Guide

### Single URL Archive
1. Go to **Archive** tab
2. Enter URL(s), one per line
3. Select provider
4. Click **Archive URLs**
5. Done! (Background mode: silent, Popup mode: opens tabs)

### Check if Page is Archived
1. Go to **Check Status** tab
2. Enter URL
3. Click **Check Archive Status**
4. See green (archived) or red (not archived)
5. Click **Archive** to save unarchived ones

### Crawl Site
1. Go to **Crawl** tab
2. Enter a page URL
3. Set depth:
   - **1 Level**: Just that page
   - **2 Levels**: Pages on same domain
4. Toggle **Include external links** if wanted
5. Toggle **Skip top sites** (enabled by default - skips Wikipedia, GitHub, etc.)
6. Click **🔍 Find Links**
7. Review the table - filter by Internal/External
8. Click **Check Status** to see what's already archived
9. Click **Archive All** or **Archive Unarchived**

---

## Providers

| Provider | Background | Status Check | Notes |
|----------|------------|--------------|-------|
| Wayback Machine | ✅ | ✅ | Best coverage, 50B+ pages |
| archive.is | ✅ | ✅ | Independent, privacy-focused |
| archive.ph | ✅ | ✅ | Fast, simple |
| Ghostarchive | ✅ | ✅ | Community archive |
| ArchiveVN | ✅ | ✅ | Vietnam-focused |
| Textise | ✅ | ✅ | Text-only (jina.ai) |
| Memento | ❌ | ✅ | Read-only aggregator |

---

## Privacy

**Why WebArk is private:**
- 🏃 Runs entirely in your browser
- 🔒 No account required  
- 📡 Direct to archive providers
- 💾 Data stays in your browser (localStorage)

**vs Traditional:**
- Traditional: URL → Your Server → Archive Provider
- WebArk: URL → Your Browser → Archive Provider

---

## Architecture

```
webark/
├── public/              # PWA (served by GitHub Pages)
│   ├── index.html       # Main app (~900 lines)
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
├── extension/           # Browser extension
│   ├── manifest.json
│   └── lib/
│       ├── storage.js   # IndexedDB wrapper
│       ├── archivers.js # Provider implementations
│       └── links.js     # Link extraction
├── server.js           # Optional Node.js server
├── tests/              # Jest tests
│   ├── storage.test.js
│   ├── archivers.test.js
│   ├── links.test.js
│   └── providers.test.js
└── README.md
```

---

## Testing

```bash
npm test
# 48+ tests covering:
# - Storage (IndexedDB)
# - Archivers (provider configs)
# - Link extraction & validation
# - Provider APIs
```

---

## Development

### Run locally
```bash
npm install
npx serve public    # Or any static server
```

### Build extension
```bash
npm run build
# Output: dist/webark-extension.zip
```

### Deploy to GitHub Pages
```bash
# Just push to master - auto-deploys
git push
```

---

## License

MIT - See LICENSE file
