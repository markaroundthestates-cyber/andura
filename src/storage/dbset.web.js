// React Native WEB (Metro, platform=web) throwing setter — sibling of dbset.js.
//
// Metro picks dbset.web.js for the web platform. Expo web runs in a browser, so
// the backing store is `localStorage` — byte-identical to the Vite/Vitest
// dbset.js variant. Throws (QuotaExceededError / unknown) PROPAGATE to DB.set so
// the MED-CODE-22 quota contract holds. Vite/Vitest still resolve dbset.js.

/**
 * @param {string} key
 * @param {string} value  pre-serialized JSON string
 * @returns {void}
 */
export function dbSetRaw(key, value) {
  localStorage.setItem(key, value);
}
