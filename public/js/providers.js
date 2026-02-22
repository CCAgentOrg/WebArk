    const providers = {
      wayback: {
        name: 'Wayback Machine',
        archiveUrl: (u) => `https://web.archive.org/save/${u}`,
        backgroundArchive: async (url) => {
          try {
            const res = await fetch('https://web.archive.org/save/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `url=${encodeURIComponent(url)}`
            });
            const jobUrl = res.url || `https://web.archive.org/web/*/${url}`;
            return { success: true, archivedUrl: jobUrl };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        checkArchived: async (url) => {
          try {
            const res = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            return data.archived_snapshots?.closest?.available === true ? data.archived_snapshots.closest.url : null;
          } catch { return null; }
        }
      },
      archiveis: {
        name: 'archive.is',
        archiveUrl: (u) => `https://archive.is/submit/?url=${encodeURIComponent(u)}`,
        backgroundArchive: async (url) => {
          try {
            const res = await fetch('https://archive.is/submit/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `url=${encodeURIComponent(url)}`
            });
            const jobUrl = res.url || `https://archive.is/${encodeURIComponent(url)}`;
            return { success: true, archivedUrl: jobUrl };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        checkArchived: async (url) => {
          try {
            const res = await fetch(`https://archive.is/${encodeURIComponent(url)}`, { method: 'HEAD', redirect: 'manual' });
            if (res.type === 'opaqueredirect' || res.status === 302) {
              return `https://archive.is/${encodeURIComponent(url)}`;
            }
            return null;
          } catch { return null; }
        }
      },
      archiveph: {
        name: 'archive.ph',
        archiveUrl: (u) => `https://archive.ph/submit/?url=${encodeURIComponent(u)}`,
        backgroundArchive: async (url) => {
          try {
            const res = await fetch('https://archive.ph/submit/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `url=${encodeURIComponent(url)}`
            });
            const jobUrl = res.url || `https://archive.ph/${encodeURIComponent(url)}`;
            return { success: true, archivedUrl: jobUrl };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        checkArchived: async (url) => {
          try {
            const res = await fetch(`https://archive.ph/${encodeURIComponent(url)}`, { method: 'HEAD', redirect: 'manual' });
            if (res.type === 'opaqueredirect' || res.status === 302) {
              return `https://archive.ph/${encodeURIComponent(url)}`;
            }
            return null;
          } catch { return null; }
        }
      },
      ghostarchive: {
        name: 'Ghostarchive',
        archiveUrl: (u) => `https://ghostarchive.org/archive?url=${encodeURIComponent(u)}`,
        backgroundArchive: async (url) => {
          try {
            const res = await fetch(`https://ghostarchive.org/archive?url=${encodeURIComponent(url)}`);
            return { success: res.ok, archivedUrl: res.url };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        checkArchived: async (url) => {
          try {
            const res = await fetch(`https://ghostarchive.org/archive?url=${encodeURIComponent(url)}`);
            if (res.ok) return `https://ghostarchive.org/archive?url=${encodeURIComponent(url)}`;
            return null;
          } catch { return null; }
        }
      },
      archivevn: {
        name: 'ArchiveVN',
        archiveUrl: (u) => `https://archive.vn/submit/?url=${encodeURIComponent(u)}`,
        backgroundArchive: async (url) => {
          try {
            const res = await fetch('https://archive.vn/submit/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `url=${encodeURIComponent(url)}`
            });
            const jobUrl = res.url || `https://archive.vn/${encodeURIComponent(url)}`;
            return { success: true, archivedUrl: jobUrl };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        checkArchived: async (url) => {
          try {
            const res = await fetch(`https://archive.vn/${encodeURIComponent(url)}`, { method: 'HEAD', redirect: 'manual' });
            if (res.type === 'opaqueredirect' || res.status === 302) {
              return `https://archive.vn/${encodeURIComponent(url)}`;
            }
            return null;
          } catch { return null; }
        }
      },
      textise: {
        name: 'Textise',
        archiveUrl: (u) => `https://r.jina.ai/http://${u.replace(/^https?:\/\//, '')}`,
        backgroundArchive: async (url) => {
          try {
            const textUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
            const res = await fetch(textUrl);
            if (res.ok) {
              return { success: true, archivedUrl: textUrl };
            }
            return { success: false, error: 'Failed to fetch' };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        checkArchived: async (url) => {
          try {
            const res = await fetch(`https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`);
            if (res.ok) return `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
            return null;
          } catch { return null; }
        }
      },
      memento: {
        name: 'Memento',
        archiveUrl: (u) => `https://timetravel.mementoweb.org/list/${encodeURIComponent(u)}`,
        backgroundArchive: async (url) => {
          return { success: false, error: 'Memento is read-only' };
        },
        checkArchived: async (url) => {
          try {
            const res = await fetch(`https://timetravel.mementoweb.org/api/json/list/${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.Memento_Datetime) return `https://timetravel.mementoweb.org/list/${encodeURIComponent(url)}`;
            return null;
          } catch { return null; }
        }
      },
      local: {
        name: '📱 Local',
        archiveUrl: (u) => `javascript:alert('View in History tab')`,
        backgroundArchive: async (url) => {
          return await archiveLocally(url);
        },
        checkArchived: async (url) => {
          return await checkLocalArchive(url);
        }
      }
    };
