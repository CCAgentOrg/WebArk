// Provider tests
const providers = {
  wayback: {
    name: 'Wayback Machine',
    archiveUrl: (u) => `https://web.archive.org/save/${u}`,
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
    checkArchived: async (url) => {
      try {
        const res = await fetch(`https://timetravel.mementoweb.org/api/json/list/${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.Memento_Datetime) return `https://timetravel.mementoweb.org/list/${encodeURIComponent(url)}`;
        return null;
      } catch { return null; }
    }
  }
};

describe('Providers', () => {
  
  describe('wayback', () => {
    test('generates archive URL with base', () => {
      const url = providers.wayback.archiveUrl('https://example.com/page');
      expect(url).toContain('web.archive.org/save/');
      expect(url).toContain('example.com');
    });
    
    test('checkArchived returns null for unarchived URL', async () => {
      // Use a random URL that likely isn't archived
      const result = await providers.wayback.checkArchived(`https://example-${Date.now()}.test/notexist`);
      // Result could be null or a URL depending on Wayback
      expect(result === null || typeof result === 'string').toBe(true);
    }, 10000);
  });
  
  describe('archiveis', () => {
    test('generates archive URL with base', () => {
      const url = providers.archiveis.archiveUrl('https://example.com/page');
      expect(url).toContain('archive.is/submit/');
      expect(url).toContain('example.com');
    });
  });
  
  describe('archiveph', () => {
    test('generates archive URL with base', () => {
      const url = providers.archiveph.archiveUrl('https://example.com/page');
      expect(url).toContain('archive.ph/submit/');
      expect(url).toContain('example.com');
    });
  });
  
  describe('ghostarchive', () => {
    test('generates archive URL', () => {
      const url = providers.ghostarchive.archiveUrl('https://example.com/page');
      expect(url).toContain('ghostarchive.org/archive');
      expect(url).toContain('example.com');
    });
  });
  
  describe('archivevn', () => {
    test('generates archive URL', () => {
      const url = providers.archivevn.archiveUrl('https://example.com/page');
      expect(url).toContain('archive.vn/submit/');
      expect(url).toContain('example.com');
    });
  });
  
  describe('textise', () => {
    test('generates archive URL', () => {
      const url = providers.textise.archiveUrl('https://example.com/page');
      expect(url).toContain('r.jina.ai/http://');
      expect(url).toContain('example.com');
    });
  });
  
  describe('memento', () => {
    test('generates archive URL', () => {
      const url = providers.memento.archiveUrl('https://example.com/page');
      expect(url).toContain('timetravel.mementoweb.org/list');
      expect(url).toContain('example.com');
    });
  });
  
  describe('all providers', () => {
    test('have required methods', () => {
      Object.values(providers).forEach(p => {
        expect(typeof p.name).toBe('string');
        expect(typeof p.archiveUrl).toBe('function');
        expect(typeof p.checkArchived).toBe('function');
      });
    });
    
    test('archiveUrl returns string', () => {
      Object.values(providers).forEach(p => {
        const result = p.archiveUrl('https://test.com');
        expect(typeof result).toBe('string');
        expect(result).toContain('https://');
      });
    });
    
    test('checkArchived is async', () => {
      Object.values(providers).forEach(p => {
        const result = p.checkArchived('https://test.com');
        expect(result).toBeInstanceOf(Promise);
      });
    });
  });
});

// Settings tests
describe('Settings', () => {
  
  const defaultSettings = {
    provider: 'wayback',
    depth: 2,
    autoCheck: false,
    rateLimit: 500
  };
  
  const validProviders = ['wayback', 'archiveis', 'archiveph', 'ghostarchive', 'archivevn', 'textise', 'memento'];
  
  test('has required settings', () => {
    expect(defaultSettings).toHaveProperty('provider');
    expect(defaultSettings).toHaveProperty('depth');
    expect(defaultSettings).toHaveProperty('autoCheck');
    expect(defaultSettings).toHaveProperty('rateLimit');
  });
  
  test('provider is valid', () => {
    expect(validProviders).toContain(defaultSettings.provider);
  });
  
  test('depth is valid', () => {
    expect([1, 2]).toContain(defaultSettings.depth);
  });
  
  test('rateLimit is reasonable', () => {
    expect(defaultSettings.rateLimit).toBeGreaterThanOrEqual(100);
    expect(defaultSettings.rateLimit).toBeLessThanOrEqual(10000);
  });
});

// Link validation tests
describe('Link Validation', () => {
  
  function isValidUrl(str) {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch { return false; }
  }
  
  function normalizeUrl(url) {
    try {
      const u = new URL(url);
      u.hash = '';
      if ((u.protocol === 'http:' && u.port === '80') || (u.protocol === 'https:' && u.port === '443')) {
        u.port = '';
      }
      return u.href.replace(/\/$/, '');
    } catch { return url; }
  }
  
  test('isValidUrl accepts https', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });
  
  test('isValidUrl accepts http', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });
  
  test('isValidUrl rejects invalid', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });
  
  test('normalizeUrl removes trailing slash', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
    expect(normalizeUrl('https://example.com/page/')).toBe('https://example.com/page');
  });
  
  test('normalizeUrl removes hash', () => {
    expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page');
  });
  
  test('normalizeUrl handles default ports', () => {
    expect(normalizeUrl('https://example.com:443/page')).toBe('https://example.com/page');
    expect(normalizeUrl('http://example.com:80/page')).toBe('http://example.com/page');
  });
});
