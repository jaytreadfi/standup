/**
 * Defensive localStorage wrapper that short-circuits on environments where
 * storage is unavailable (private browsing with strict settings, sandboxed
 * iframes, or SecurityError-throwing contexts).
 *
 * All operations are no-ops when hasStorage() returns false.
 */

/** @type {boolean} Cached result of the feature probe, computed once at module load. */
const _hasStorage = (() => {
  try {
    const probe = '__tread_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
})();

/**
 * Returns whether localStorage is available in the current environment.
 * Result is computed once at module load and cached.
 *
 * @returns {boolean}
 */
export function hasStorage() {
  return _hasStorage;
}

/**
 * Retrieves and JSON-parses a value from localStorage.
 * Returns null on a missing key, a parse error, or a SecurityError.
 *
 * @param {string} key
 * @returns {unknown}
 */
export function getItem(key) {
  if (!_hasStorage) return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * JSON-stringifies value and stores it under key.
 * Returns true on success, false on QuotaExceededError or SecurityError.
 *
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean}
 */
export function setItem(key, value) {
  if (!_hasStorage) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn('[tread:safeStorage] localStorage quota exceeded — write dropped for key:', key);
    }
    return false;
  }
}

/**
 * Removes a key from localStorage. No-op on error or when storage is unavailable.
 *
 * @param {string} key
 * @returns {void}
 */
export function removeItem(key) {
  if (!_hasStorage) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently swallow — nothing meaningful to do if removal fails.
  }
}
