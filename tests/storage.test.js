/**
 * WebArk - Storage module tests
 * Note: These tests require a browser environment with IndexedDB
 * For CI, we test the pure logic only
 */

import {
  isValidUrl,
  getDomain
} from '../extension/lib/archivers.js';

describe('Storage Logic', () => {
  describe('URL validation (used by storage)', () => {
    test('isValidUrl works correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    test('getDomain extracts correctly', () => {
      expect(getDomain('https://example.com/page')).toBe('example.com');
      expect(getDomain('https://www.test.org/path')).toBe('www.test.org');
      expect(getDomain('')).toBe('');
    });
  });
});
