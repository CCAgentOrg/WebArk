/**
 * WebArk - Jest setup for IndexedDB mock
 */

const mockArchives = new Map();
const mockSettings = new Map();

global.indexedDB = {
  open: (name, version) => ({
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
    result: {
      transaction: (store, mode) => ({
        objectStore: (s) => ({
          get: (key) => ({ onsuccess: null, onerror: null, result: (s === 'archives' ? mockArchives : mockSettings).get(key) }),
          getAll: () => ({ onsuccess: null, onerror: null, result: Array.from((s === 'archives' ? mockArchives : mockSettings).values()) }),
          put: (item) => { (s === 'archives' ? mockArchives : mockSettings).set(item.key || item.id, item); return { onsuccess: null, onerror: null }; },
          delete: (key) => { (s === 'archives' ? mockArchives : mockSettings).delete(key); return { onsuccess: null, onerror: null }; },
          clear: () => { (s === 'archives' ? mockArchives : mockSettings).clear(); return { onsuccess: null, onerror: null }; }
        })
      }),
      objectStoreNames: {
        contains: (name) => name === 'archives' || name === 'settings'
      }
    }
  })
};
