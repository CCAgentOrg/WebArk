/**
 * WebArk - Storage module tests
 */

import {
  openDB,
  getAllArchives,
  getArchive,
  saveArchive,
  deleteArchive,
  searchArchives,
  getSetting,
  setSetting
} from '../extension/lib/storage.js';

describe('Storage', () => {
  const testArchive = {
    id: 'test-123',
    url: 'https://example.com',
    title: 'Example',
    createdAt: new Date().toISOString(),
    status: 'success'
  };

  beforeEach(async () => {
    // Clear test data
    const db = await openDB();
    const tx = db.transaction('archives', 'readwrite');
    const store = tx.objectStore('archives');
    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = resolve;
      request.onerror = reject;
    });

    const settingsTx = db.transaction('settings', 'readwrite');
    const settingsStore = settingsTx.objectStore('settings');
    await new Promise((resolve, reject) => {
      const request = settingsStore.clear();
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  });

  describe('Archives', () => {
    test('saveArchive and getArchive', async () => {
      await saveArchive(testArchive);
      const result = await getArchive('test-123');

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
      expect(result.title).toBe('Example');
    });

    test('getAllArchives returns all archives', async () => {
      await saveArchive(testArchive);
      await saveArchive({ ...testArchive, id: 'test-456', url: 'https://example2.com' });

      const results = await getAllArchives();
      expect(results.length).toBe(2);
    });

    test('deleteArchive removes archive', async () => {
      await saveArchive(testArchive);
      await deleteArchive('test-123');

      const result = await getArchive('test-123');
      expect(result).toBeUndefined();
    });

    test('searchArchives finds by URL', async () => {
      await saveArchive(testArchive);
      await saveArchive({ ...testArchive, id: 'test-456', url: 'https://other.com' });

      const results = await searchArchives('example');
      expect(results.length).toBe(1);
      expect(results[0].url).toBe('https://example.com');
    });

    test('searchArchives finds by title', async () => {
      await saveArchive(testArchive);

      const results = await searchArchives('Example');
      expect(results.length).toBe(1);
    });
  });

  describe('Settings', () => {
    test('setSetting and getSetting', async () => {
      await setSetting('theme', 'dark');
      const value = await getSetting('theme');

      expect(value).toBe('dark');
    });

    test('getSetting returns undefined for missing key', async () => {
      const value = await getSetting('nonexistent');
      expect(value).toBeUndefined();
    });
  });
});
