# 🗄️ WebArk

A privacy-first, serverless web archiver. Archive pages to multiple providers directly from your browser - no server required.

**Live:** https://ccagentorg.github.io/WebArk/

## Features

- **7 Archive Providers**: Wayback Machine, archive.is, archive.ph, Ghostarchive, ArchiveVN, Textise, Memento
- **Check Status**: See which providers have a page archived
- **Crawl & Archive**: Find and archive pages at 1-2 depth levels
- **Background Mode**: Archive without opening popups (via API)
- **Skip Top Sites**: Automatically skip Wikipedia, GitHub, etc.
- **History**: Track your archiving activity
- **PWA**: Installable web app, works offline
- **Serverless**: Runs entirely in the browser

## Quick Start

### Live Version
Just open: https://ccagentorg.github.io/WebArk/

### Local Development
```bash
# Install
npm install

# Run server (optional - works without server)
node server.js

# Run tests
npm test
```

## Usage

### Archive URLs
1. Enter URLs (one per line)
2. Select provider
3. Click "Archive URLs"

### Check Status
1. Enter a URL
2. Click "Check Archive Status"
3. See which providers have it archived

### Crawl & Archive
1. Enter a page URL
2. Set depth (1 level = single page, 2 levels = site-wide)
3. Click "Find Links" to discover pages
4. Click "Check Status" to see what's archived
5. Click "Archive All" or "Archive Unarchived"

## Settings

- **Default Provider**: Provider selected by default
- **Default Depth**: Crawl depth (1 or 2 levels)
- **Auto-check Status**: Automatically check when finding links
- **Background Mode**: Archive without popups (where supported)
- **Rate Limit**: Delay between requests (ms)

## Providers

| Provider | Background Mode | Check Status |
|----------|-----------------|--------------|
| Wayback Machine | ✅ | ✅ |
| archive.is | ✅ | ✅ |
| archive.ph | ✅ | ✅ |
| Ghostarchive | ✅ | ✅ |
| ArchiveVN | ✅ | ✅ |
| Textise | ✅ | ✅ |
| Memento | ❌ (read-only) | ✅ |

## Browser Extension

Build a browser extension from the `extension/` folder:

```bash
npm run build
# Creates dist/webark-extension.zip
```

Load as unpacked extension in Chrome/Edge.

## Architecture

```
webark/
├── public/              # PWA (served by GitHub Pages or any static host)
│   ├── index.html       # Main app
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
├── extension/           # Browser extension
│   ├── manifest.json
│   └── lib/
├── server.js            # Optional Node.js server (for Telegram bot)
└── tests/              # Unit tests
```

## Privacy

| Aspect | Third-Party Services | WebArk (Browser) |
|--------|---------------------|------------------|
| **URLs you archive** | Visible to provider | Local only |
| **Data storage** | Provider's servers | Your browser |
| **Network** | Through providers | Direct to providers |
| **Account** | May require | None needed |

**Why WebArk:**
- Privacy: Runs entirely in your browser
- No account required
- No server to deploy (GitHub Pages)
- No rate limits from us

## Testing

```bash
npm test
# Runs: storage, archivers, links, providers tests
```

## License

MIT
