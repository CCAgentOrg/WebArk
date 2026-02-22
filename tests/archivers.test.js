/**
 * WebArk - Archiver tests
 */

import {
  archiveUrl,
  getSnapshots,
  isValidUrl,
  getDomain
} from '../extension/lib/archivers.js';

// Mock fetch for Wayback API
global.fetch = jest.fn();

describe('Archivers', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  describe('isValidUrl', () => {
    test('valid https URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    test('valid http URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    test('invalid URL without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false);
    });

    test('invalid URL with other protocol', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
    });

    test('empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('getDomain', () => {
    test('extract domain from URL', () => {
      expect(getDomain('https://example.com/page')).toBe('example.com');
    });

    test('extract domain with subdomain', () => {
      expect(getDomain('https://www.example.com/page')).toBe('www.example.com');
    });

    test('handle invalid URL', () => {
      expect(getDomain('')).toBe('');
    });
  });

  describe('getSnapshots', () => {
    test('return snapshot when available', async () => {
      const mockResponse = {
        archived_snapshots: {
          closest: {
            url: 'https://web.archive.org/web/20230101000000/https://example.com',
            timestamp: '20230101000000',
            available: true
          }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const snapshots = await getSnapshots('https://example.com');

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].url).toContain('web.archive.org');
      expect(snapshots[0].available).toBe(true);
    });

    test('return empty array when no snapshots', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const snapshots = await getSnapshots('https://example.com');
      expect(snapshots).toHaveLength(0);
    });

    test('throw on API error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(getSnapshots('https://example.com')).rejects.toThrow('Wayback API error');
    });
  });

  describe('archiveUrl', () => {
    test('successful archive via Wayback', async () => {
      // First call: check availability
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          archived_snapshots: {
            closest: {
              url: 'https://web.archive.org/web/20230101000000/https://example.com',
              available: true
            }
          }
        })
      });

      const result = await archiveUrl('https://example.com');

      expect(result.provider).toBe('wayback');
      expect(result.snapshotUrl).toContain('web.archive.org');
    });

    test('fallback to archive.is when Wayback fails', async () => {
      // Wayback fails
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      // archive.is succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'archived at archive.is/abc123'
      });

      const result = await archiveUrl('https://example.com');

      expect(result.provider).toBe('archive.is');
    });
  });
});
