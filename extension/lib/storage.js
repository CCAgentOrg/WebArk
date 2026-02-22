/**
 * WebArk - Storage module (IndexedDB wrapper)
 */

// Database name and version
const DB_NAME = 'WebArkDB';
const DB_VERSION = 1;

/**
 * Open IndexedDB database
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Archives store
      if (!db.objectStoreNames.contains('archives')) {
        const store = db.createObjectStore('archives', { keyPath: 'id' });
        store.createIndex('url', 'url', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Get all archives
 */
export async function getAllArchives() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('archives', 'readonly');
    const store = tx.objectStore('archives');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get archive by ID
 */
export async function getArchive(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('archives', 'readonly');
    const store = tx.objectStore('archives');
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Save archive
 */
export async function saveArchive(archive) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('archives', 'readwrite');
    const store = tx.objectStore('archives');
    const request = store.put(archive);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Delete archive
 */
export async function deleteArchive(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('archives', 'readwrite');
    const store = tx.objectStore('archives');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Search archives by URL
 */
export async function searchArchives(query) {
  const archives = await getAllArchives();
  const lowerQuery = query.toLowerCase();

  return archives.filter(a =>
    a.url.toLowerCase().includes(lowerQuery) ||
    (a.title && a.title.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get setting
 */
export async function getSetting(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.value);
  });
}

/**
 * Set setting
 */
export async function setSetting(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const request = store.put({ key, value });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
