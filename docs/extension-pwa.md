# ArchiveBox — Extension + PWA Design

**Date:** 2026-02-22  
**Status:** Design Draft  
**Goal:** Eliminate server, use browser extension + PWA only

---

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│ Browser Extension   │     │ Local PWA          │
│ (Capture + Archive) │────▶│ (Store + Display)  │
└─────────────────────┘     └─────────────────────┘
         │                           │
         ▼                           ▼
   IndexedDB <──────────────▶ IndexedDB
   (Shared Storage)           (Same DB)
```

**No server needed.** All data stays in browser.

---

## Components

### 1. Browser Extension

**Permissions needed:**
- `activeTab` — capture current page
- `storage` — save to IndexedDB
- `scripting` — extract page content
- `webNavigation` — track page visits

**Core features:**
- Capture current page (HTML + assets)
- Archive via multiple providers (Wayback, archive.is, ghostarchive, etc.)
- Save to local IndexedDB
- Show archive status (pending/success/failed)

**Archive strategy (try in order):**
1. Wayback Machine (`web.archive.org`)
2. archive.is
3. ghostarchive
4. archive.ph
5. Perma.cc (if key configured)

### 2. Local PWA

**Permissions:**
- `storage` — read/write IndexedDB
- No server calls

**Core features:**
- View all saved archives
- Search/filter archives
- View archived page (via embed/iframe)
- Export/backup archives
- Delete archives

### 3. Shared Storage

**IndexedDB Schema:**

```js
// Database: ArchiveBoxDB
// Object stores:

archives {
  id: string (UUID),
  url: string,
  title: string,
  timestamp: ISO date,
  snapshot: {
    provider: string,
    snapshot_url: string,
    archived_at: ISO date
  },
  status: 'pending' | 'success' | 'failed',
  error: string?,
  tags: string[],
  created_at: ISO date
}

settings {
  key: string,
  value: any
}
```

---

## Extension → PWA Communication

**Option A: Shared IndexedDB**
- Extension writes to DB
- PWA reads from same DB
- Works if same origin

**Option B: Extension API**
- PWA calls `chrome.runtime.sendMessage()`
- Extension responds with data

---

## Viewing Archives

Since we can't fetch arbitrary URLs from browser (CORS), use embed methods:

```js
// Wayback embed
const waybackUrl = `https://web.archive.org/web/${timestamp}/${url}`;

// archive.is embed
const archiveIsUrl = `https://archive.is/${snapshotId}/${url}`;

// iframe embedding
<iframe src={archiveUrl}></iframe>
```

**Challenge:** Not all sites work in iframe (X-Frame-Options)

**Solution:** Use Wayback's "embed" mode or redirect to archive URL

---

## File Structure

```
archive-box/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── popup/                 # Extension popup UI
│   ├── popup.html
│   └── popup.js
├── content.js             # Page capture script
├── lib/
│   ├── archivers.js      # Multi-provider archive logic
│   ├── storage.js        # IndexedDB wrapper
│   └── providers/
│       ├── wayback.js
│       ├── archiveis.js
│       └── ...
├── pwa/                  # Local PWA (optional)
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── README.md
```

---

## Offline Support

- Extension works offline
- PWA works offline (after first load)
- All data in IndexedDB
- No network required after initial setup

---

## Privacy

| | Server-based | Extension+PWA |
|--|--------------|---------------|
| URLs tracked | Server sees all | Local only |
| Data storage | Server/cloud | Your browser |
| Network | Internet-exposed | Local |
| CORS issues | Server handles | N/A |

---

## Migration from Server

1. Export data from server (JSON)
2. Import into IndexedDB
3. Switch to extension for new captures

---

## Open Questions

1. **Storage limits:** IndexedDB has ~unlimited in Chrome, varies by browser
2. **Cross-device sync:** Need solution? (chrome.storage.sync limited)
3. **Large pages:** Compression before saving?
4. **Images/assets:** Save locally or link to archive?

---

## Next Steps

1. Create extension manifest
2. Implement page capture
3. Add Wayback/archive.is integration
4. Build PWA UI
5. Test locally
