# 🗄️ Archive Box

Multi-provider URL archiver with PWA and Telegram bot. Optimized for 256MB deployment.

## Features

- **11 Archive Providers**: Wayback, archive.is, ghostarchive, archive.ph, CC0, Shivers, Perma.cc, Textise, Memento, View-Source, ArchiveVN
- **PWA**: Installable web app, works offline
- **Telegram Bot**: Deploy and use via Telegram
- **API**: RESTful API for integrations
- **256MB Optimized**: Minimal deps, lean Node.js

## Quick Start

```bash
# Install
npm install

# Run server
node server.js

# With Telegram bot
TELEGRAM_BOT_TOKEN=xxx node server.js --bot
```

## Usage

### Web (PWA)
1. Open http://localhost:3000
2. Enter URLs
3. Click "Archive URLs"

### Telegram
1. Get token from @BotFather
2. Start bot: `TELEGRAM_BOT_TOKEN=xxx node server.js --bot`
3. Send URLs to bot

### API

```bash
# Create job
curl -X POST http://localhost:3000/api/archive \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://example.com"]}'

# Get result
curl http://localhost:3000/api/archive/{job-id}
```

## Deploy to Fly.io

```bash
# Build
docker build -t archive-box .

# Run
docker run -p 3000:8080 -e TELEGRAM_BOT_TOKEN=xxx archive-box
```

Or use Fly.io CLI:
```bash
fly launch
fly secrets set TELEGRAM_BOT_TOKEN=xxx
fly deploy
```

## Providers

| Provider | Key | Status |
|----------|-----|--------|
| Wayback Machine | `wayback` | ✅ |
| archive.is | `archive.is` | ✅ |
| ghostarchive | `ghostarchive` | ✅ |
| archive.ph | `archive.ph` | ✅ |
| CC0 Archive | `cc0` | ✅ |
| Shivers | `shivers` | ✅ |
| Perma.cc | `perma` | ⚠️ Auth |
| Textise | `textise` | ✅ |
| Memento | `memento` | ✅ |
| View-Source | `view-source` | ✅ |
| ArchiveVN | `archivevn` | ✅ |

## Files

```
archive-box/
├── server.js      # Main server (API + PWA + Bot)
├── public/        # PWA static files
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
├── Dockerfile     # Deploy to Fly.io
├── test.mjs       # Tests
└── README.md
```

## Testing

```bash
npm test
```
