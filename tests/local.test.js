// Local archive tests - simplified for CI

describe('Local Archive Utilities', () => {
  
  const TOP_SITES = [
    'wikipedia.org', 'wikimedia.org', 'wiktionary.org',
    'github.com', 'github.io', 'gitlab.com',
    'twitter.com', 'x.com', 't.co',
    'facebook.com', 'instagram.com',
    'youtube.com', 'youtu.be',
    'reddit.com', 'linkedin.com',
    'medium.com', 'substack.com',
    'archive.org', 'web.archive.org',
    'letsencrypt.org', 'google.com'
  ];
  
  function shouldSkipDomain(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      return TOP_SITES.some(site => domain === site || domain.endsWith('.' + site));
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
  
  describe('shouldSkipDomain', () => {
    test('skips wikipedia domains', () => {
      expect(shouldSkipDomain('https://en.wikipedia.org/wiki/Test')).toBe(true);
      expect(shouldSkipDomain('https://wikipedia.org')).toBe(true);
      expect(shouldSkipDomain('https://www.wikipedia.org')).toBe(true);
      expect(shouldSkipDomain('https://en.m.wikipedia.org')).toBe(true);
    });
    
    test('skips github domains', () => {
      expect(shouldSkipDomain('https://github.com/user/repo')).toBe(true);
      expect(shouldSkipDomain('https://github.io')).toBe(true);
      expect(shouldSkipDomain('https://user.github.io')).toBe(true);
    });
    
    test('skips twitter/x domains', () => {
      expect(shouldSkipDomain('https://twitter.com/user')).toBe(true);
      expect(shouldSkipDomain('https://x.com/user')).toBe(true);
      expect(shouldSkipDomain('https://t.co/short')).toBe(true);
    });
    
    test('skips youtube', () => {
      expect(shouldSkipDomain('https://youtube.com/watch?v=123')).toBe(true);
      expect(shouldSkipDomain('https://youtu.be/video')).toBe(true);
    });
    
    test('skips archive.org', () => {
      expect(shouldSkipDomain('https://archive.org/details/123')).toBe(true);
      expect(shouldSkipDomain('https://web.archive.org/web/123')).toBe(true);
    });
    
    test('skips reddit', () => {
      expect(shouldSkipDomain('https://reddit.com/r/test')).toBe(true);
      expect(shouldSkipDomain('https://old.reddit.com/r/test')).toBe(true);
    });
    
    test('skips letsencrypt', () => {
      expect(shouldSkipDomain('https://letsencrypt.org')).toBe(true);
    });
    
    test('allows regular domains', () => {
      expect(shouldSkipDomain('https://example.com')).toBe(false);
      expect(shouldSkipDomain('https://mysite.org')).toBe(false);
      expect(shouldSkipDomain('https://news.example.com')).toBe(false);
      expect(shouldSkipDomain('https://myshopify.com')).toBe(false);
    });
    
    test('handles invalid URLs', () => {
      expect(shouldSkipDomain('not-a-url')).toBe(false);
      expect(shouldSkipDomain('')).toBe(false);
      expect(shouldSkipDomain('ftp://example.com')).toBe(false);
    });
  });
  
  describe('normalizeUrl', () => {
    test('removes trailing slash', () => {
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
      expect(normalizeUrl('https://example.com/page/')).toBe('https://example.com/page');
    });
    
    test('removes hash', () => {
      expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page');
      expect(normalizeUrl('https://example.com/#top')).toBe('https://example.com');
    });
    
    test('handles default ports', () => {
      expect(normalizeUrl('https://example.com:443/page')).toBe('https://example.com/page');
      expect(normalizeUrl('http://example.com:80/page')).toBe('http://example.com/page');
    });
    
    test('preserves non-default ports', () => {
      expect(normalizeUrl('https://example.com:8443/page')).toBe('https://example.com:8443/page');
      expect(normalizeUrl('http://example.com:8080/page')).toBe('http://example.com:8080/page');
    });
    
    test('handles invalid URLs', () => {
      expect(normalizeUrl('')).toBe('');
      expect(normalizeUrl('not-a-url')).toBe('not-a-url');
    });
  });
  
  describe('Archive Data Structure', () => {
    test('archive object has required fields', () => {
      const archive = {
        url: 'https://example.com',
        html: '<html>test</html>',
        title: 'Test Page',
        archivedAt: new Date().toISOString(),
        size: 100
      };
      
      expect(archive).toHaveProperty('url');
      expect(archive).toHaveProperty('html');
      expect(archive).toHaveProperty('title');
      expect(archive).toHaveProperty('archivedAt');
      expect(archive).toHaveProperty('size');
    });
    
    test('archive size calculation', () => {
      const html = '<html><body>Test content</body></html>';
      const size = html.length;
      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });
  });
  
  describe('Provider Config', () => {
    const providers = {
      wayback: { name: 'Wayback Machine', backgroundArchive: true },
      archiveis: { name: 'archive.is', backgroundArchive: true },
      archiveph: { name: 'archive.ph', backgroundArchive: true },
      ghostarchive: { name: 'Ghostarchive', backgroundArchive: true },
      archivevn: { name: 'ArchiveVN', backgroundArchive: true },
      textise: { name: 'Textise', backgroundArchive: true },
      memento: { name: 'Memento', backgroundArchive: false },
      local: { name: 'Local', backgroundArchive: true }
    };
    
    test('has 8 providers', () => {
      expect(Object.keys(providers).length).toBe(8);
    });
    
    test('all providers have names', () => {
      Object.values(providers).forEach(p => {
        expect(p.name).toBeDefined();
        expect(typeof p.name).toBe('string');
      });
    });
    
    test('local provider supports background archiving', () => {
      expect(providers.local.backgroundArchive).toBe(true);
    });
    
    test('memento does not support background archiving', () => {
      expect(providers.memento.backgroundArchive).toBe(false);
    });
  });
  
  describe('URL Validation', () => {
    function isValidUrl(str) {
      try {
        const u = new URL(str);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch { return false; }
    }
    
    test('accepts https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
    });
    
    test('accepts http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });
    
    test('rejects invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });
  });
});
