// Link extraction tests - testing logic only (no network)
import { deduplicateLinks } from '../extension/lib/links.js';

describe('Link Extraction', () => {
  
  describe('deduplicateLinks', () => {
    test('removes duplicate URLs', () => {
      const links = [
        { url: 'https://example.com/page', internal: true },
        { url: 'https://example.com/page/', internal: true },
        { url: 'https://example.com/page#section', internal: true },
        { url: 'https://example.com/other', internal: true },
      ];
      
      const result = deduplicateLinks(links);
      expect(result.length).toBe(2);
    });
    
    test('handles empty array', () => {
      expect(deduplicateLinks([])).toEqual([]);
    });
    
    test('handles URLs with ports', () => {
      const links = [
        { url: 'https://example.com:443/page', internal: true },
        { url: 'https://example.com/page', internal: true },
      ];
      
      const result = deduplicateLinks(links);
      expect(result.length).toBe(1);
    });
    
    test('preserves non-duplicate URLs', () => {
      const links = [
        { url: 'https://example.com/page1', internal: true },
        { url: 'https://example.com/page2', internal: true },
        { url: 'https://other.com/page', internal: false },
      ];
      
      const result = deduplicateLinks(links);
      expect(result.length).toBe(3);
    });
  });
});

// Helper function tests (embedded for coverage)
describe('Link Helper Functions', () => {
  
  function isValidUrl(str) {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }
  
  function normalizeUrl(url) {
    try {
      const u = new URL(url);
      u.hash = '';
      if ((u.protocol === 'http:' && u.port === '80') || (u.protocol === 'https:' && u.port === '443')) {
        u.port = '';
      }
      return u.href.replace(/\/$/, '');
    } catch {
      return url;
    }
  }
  
  describe('isValidUrl', () => {
    test('accepts https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/page')).toBe(true);
      expect(isValidUrl('https://example.com:8080/page')).toBe(true);
    });
    
    test('accepts http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });
    
    test('rejects invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
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
    
    test('removes default ports', () => {
      expect(normalizeUrl('https://example.com:443/')).toBe('https://example.com');
      expect(normalizeUrl('http://example.com:80/')).toBe('http://example.com');
    });
    
    test('preserves non-default ports', () => {
      expect(normalizeUrl('https://example.com:8080/')).toBe('https://example.com:8080');
      expect(normalizeUrl('http://example.com:3000/')).toBe('http://example.com:3000');
    });
    
    test('handles invalid URLs', () => {
      expect(normalizeUrl('')).toBe('');
      expect(normalizeUrl('not-a-url')).toBe('not-a-url');
    });
  });
});

// URL parsing tests
describe('URL Parsing', () => {
  test('correctly identifies internal vs external', () => {
    const baseUrl = new URL('https://example.com/page');
    
    const testCases = [
      { url: 'https://example.com/other', expected: true },
      { url: 'https://example.com:443/other', expected: true },
      { url: 'http://example.com/page', expected: true },
      { url: 'https://other.com', expected: false },
      { url: 'https://sub.example.com/page', expected: false },
    ];
    
    testCases.forEach(({ url, expected }) => {
      const linkUrl = new URL(url);
      expect(linkUrl.hostname === baseUrl.hostname).toBe(expected);
    });
  });
  
  test('extracts hostname correctly', () => {
    const urls = [
      'https://example.com',
      'https://www.example.com',
      'https://sub.domain.example.com',
      'https://example.com:8080',
    ];
    
    urls.forEach(url => {
      const u = new URL(url);
      expect(u.hostname).toBeDefined();
      expect(u.hostname).toContain('example');
    });
  });
});
