# WebArk Development Guide

This file provides context for developers or AI agents working on WebArk.

## Project Overview

- **Name**: WebArk (formerly ArchiveBox)
- **Type**: PWA + Browser Extension
- **Tech Stack**: Plain JavaScript (no framework), Jest for testing
- **Hosting**: GitHub Pages (serverless)

## Key Files

| File | Purpose |
|------|---------|
| `public/index.html` | Main PWA - all UI & logic (~900 lines) |
| `extension/lib/storage.js` | IndexedDB wrapper for extension |
| `extension/lib/archivers.js` | Provider configs for extension |
| `tests/*.test.js` | Unit tests |

## Architecture

### PWA (public/index.html)
Single HTML file with embedded CSS and JS. Contains:
- Tab navigation (About, Archive, Crawl, History, Settings)
- Provider configs (Wayback, archive.is, etc.)
- Link finding (Wayback CDX + AllOrigins proxy)
- Background archiving (POST to provider APIs)
- LocalStorage for settings/history

### Extension (extension/lib/)
Browser extension version with:
- `storage.js` - IndexedDB for persistence
- `archivers.js` - Same providers as PWA
- Manifest V3 compatible

## Adding a New Provider

1. Add to `providers` object in `public/index.html`:
```javascript
newprovider: {
  name: 'New Provider',
  archiveUrl: (u) => `https://provider.example/save?url=${encodeURIComponent(u)}`,
  backgroundArchive: async (url) => {
    // POST to save API if available
    return { success: true, archivedUrl: '...' };
  },
  checkArchived: async (url) => {
    // Check if already archived
    return archivedUrl || null;
  }
}
```

2. Add button in HTML (find `provider-btn` elements)
3. Add to Settings dropdown
4. Add test in `tests/providers.test.js`

## Testing

```bash
npm test
# Runs all tests in tests/
# Uses Jest with ES modules support
```

### Test Patterns
- Mock-free tests (real API calls with timeout)
- Sync tests for utilities
- Provider URL generation tests

## Deployment

### GitHub Pages
1. Push to `master` branch
2. Workflow: `.github/workflows/pages.yml`
3. Source: `public/` folder

### CI
- `.github/workflows/ci.yml` - runs tests + builds extension

## Common Tasks

### Add a new feature
1. Edit `public/index.html`
2. Add tests in `tests/`
3. Push - auto-deploys to GitHub Pages

### Fix a bug
1. Reproduce locally
2. Fix in source
3. Add/update tests
4. Push

### Add provider
1. Add to providers object
2. Add UI button
3. Add to settings dropdown
4. Add test

## External APIs Used

| API | Purpose |
|-----|---------|
| `archive.org/wayback/available` | Check Wayback status |
| `web.archive.org/cdx/search/cdx` | Find archived links |
| `archive.is/submit/` | archive.is save API |
| `archive.ph/submit/` | archive.ph save API |
| `api.allorigins.win` | Proxy for link extraction |
| `r.jina.ai` | Text extraction |

## Notes

- No build step required (plain JS)
- Service worker for offline support
- localStorage for settings/history
- IndexedDB for extension storage

## Contact

- Repo: https://github.com/CCAgentOrg/WebArk
- Issues: Open on GitHub
