# WebArk Features & Competition Comparison

## WebArk Features

### Core Features
| Feature | Status | Description |
|---------|--------|-------------|
| Multi-Provider Archive | ✅ | 8 providers: Wayback, archive.is, archive.ph, Ghostarchive, ArchiveVN, Textise, Memento, Local |
| Check Archive Status | ✅ | See which providers have a page archived |
| Crawl & Archive | ✅ | Find and archive pages at 1-2 depth levels |
| Background Mode | ✅ | Archive without opening popups (API-based) |
| Local Archiving | ✅ | Save to IndexedDB - fully offline |
| PWA | ✅ | Installable, works offline |
| History | ✅ | Track all archiving activity |
| Settings | ✅ | Customizable defaults |

### Crawl Features
| Feature | Status | Description |
|---------|--------|-------------|
| 1-Level Crawl | ✅ | Single page |
| 2-Level Crawl | ✅ | Site-wide (same domain) |
| Include External Links | ✅ | Option to include external sites |
| Skip Top Sites | ✅ | Skip Wikipedia, GitHub, etc. |
| Table View | ✅ | See all links before archiving |
| Selective Archive | ✅ | Choose which links to archive |
| Check Before Archive | ✅ | See what's already archived |

### Privacy Features
| Feature | Status | Description |
|---------|--------|-------------|
| No Account Required | ✅ | Just open in browser |
| No Server Required | ✅ | Runs entirely client-side |
| Local Storage Only | ✅ | Data stays in your browser |
| Direct to Providers | ✅ | No middleman |

---

## Competition Comparison

### WebArk vs ArchiveBox (Server)

| Aspect | WebArk | ArchiveBox (Server) |
|--------|--------|-------------------|
| **Setup** | None (just open URL) | Requires Docker/hosting |
| **Storage** | IndexedDB (browser) | Local filesystem |
| **Providers** | 8 built-in | 30+ (configurable) |
| **Telegram Bot** | Optional server | Built-in |
| **API** | None (browser-only) | REST API |
| **Offline** | Yes (PWA) | No |
| **Maintenance** | None | Self-hosted |

### WebArk vs Wayback Machine (web.archive.org)

| Aspect | WebArk | Wayback Machine |
|--------|--------|----------------|
| **Bulk Archive** | ✅ Multiple URLs | ❌ One at a time |
| **Crawl Site** | ✅ 1-2 levels | ❌ Manual |
| **Check Status** | ✅ Multiple providers | ❌ Wayback only |
| **Local Copy** | ✅ IndexedDB | ❌ External only |
| **Providers** | ✅ Multiple | ❌ Wayback only |
| **No Account** | ✅ | ⚠️ Optional account |

### WebArk vs archive.is

| Aspect | WebArk | archive.is |
|--------|--------|------------|
| **Bulk Archive** | ✅ Multiple URLs | ⚠️ Limited |
| **Crawl Site** | ✅ | ❌ |
| **Check Status** | ✅ 8 providers | ❌ archive.is only |
| **Local Copy** | ✅ IndexedDB | ❌ |
| **Open Source** | ✅ MIT | ❌ |

### WebArk vs Perma.cc

| Aspect | WebArk | Perma.cc |
|--------|--------|----------|
| **Free** | ✅ | ❌ (institution required) |
| **No Account** | ✅ | ❌ |
| **Bulk Archive** | ✅ | ⚠️ Limited |
| **Crawl Site** | ✅ | ❌ |
| **Self-Hosted Option** | ❌ | ✅ (for institutions) |

### WebArk vs SingleFile (Browser Extension)

| Aspect | WebArk | SingleFile |
|--------|--------|------------|
| **Multi-Provider** | ✅ 8 providers | ❌ Local only |
| **Archive to Wayback** | ✅ | ❌ |
| **Crawl Sites** | ✅ | ❌ |
| **Check Status** | ✅ | ❌ |
| **Open Source** | ✅ MIT | ✅ MPL |

---

## Why WebArk?

### Pros
1. **Zero Setup** - Just open in browser
2. **Privacy** - No account, runs locally
3. **Multi-Provider** - 8 options for redundancy
4. **Crawl** - Find pages automatically
5. **Local Option** - Fully offline archiving
6. **Open Source** - MIT licensed

### Limitations
1. Can't archive password-protected pages
2. Can't handle complex JS/rendering
3. No server-side features (Telegram bot requires separate server)
4. Storage limited to browser quota

### Use Cases
- ✅ Personal web archiving
- ✅ Research (bulk URL capture)
- ✅ Site mirroring (with crawl)
- ✅ Offline reading (local archives)
- ✅ Privacy-sensitive archiving

---

## Feature Requests & Roadmap

### Future Ideas
- [ ] Export/Import archives (ZIP)
- [ ] Search within local archives
- [ ] Browser extension version
- [ ] Chrome Web Store release
- [ ] Firefox Add-on release

---

## Conclusion

WebArk fills the gap between complex self-hosted solutions (ArchiveBox) and basic web tools (Wayback). It's designed for:
- Users who want **simple, private** web archiving
- No server setup required
- Multiple providers for redundancy
- Bulk operations (crawl, multi-URL)

For enterprise/institutional needs, consider Perma.cc or self-hosted ArchiveBox.
