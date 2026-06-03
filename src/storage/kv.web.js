// React Native WEB (Metro, platform=web) KV adapter — sibling of kv.js.
//
// Metro picks `kv.web.js` over `kv.js` for the web platform. Expo web runs in a
// browser, so the web backing store is `localStorage` — byte-identical behavior
// to the Vite/Vitest `kv.js` variant. Vite/Vitest still resolve kv.js, NOT this.
//
// Mirrors env.web.js: a thin platform sibling that keeps the shared interface
// stable while the native graph (kv.native.js) swaps in MMKV.

/**
 * @type {{ getItem: (name: string) => string | null, setItem: (name: string, value: string) => void, removeItem: (name: string) => void, keys: () => string[], clearAll: () => void }}
 */
export const kv = {
  getItem(name) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null;
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(name, value);
    } catch {
      /* quota / disabled — silent */
    }
  },
  removeItem(name) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
    } catch {
      /* disabled — silent */
    }
  },
  /**
   * Enumerate every stored key — localStorage walk (Expo web). Sibling of kv.js.
   * @returns {string[]}
   */
  keys() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k !== null) out.push(k);
      }
      return out;
    } catch {
      return [];
    }
  },
  /** Wipe the entire keyspace (Expo web: localStorage.clear). Sibling of kv.js. */
  clearAll() {
    try {
      if (typeof localStorage !== 'undefined') localStorage.clear();
    } catch {
      /* disabled — silent */
    }
  },
};
