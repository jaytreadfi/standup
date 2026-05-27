import { getItem, setItem, removeItem } from '@/lib/safeStorage';

export const SCHEMA_VERSION = 2;
export const STATE_KEY = 'tread-mystery-state-v1';
export const ENDINGS_KEY = 'tread-mystery-endings-v1';

/**
 * Persists game state under a versioned envelope.
 * Caller must pre-serialize any non-plain values (e.g. Set → Array).
 * @param {object} state - Plain serializable game state.
 */
export function save(state) {
  setItem(STATE_KEY, { v: SCHEMA_VERSION, state });
}

/**
 * Loads saved game state.
 * Returns null when the key is absent or the schema version does not match.
 * A schema mismatch also wipes the stale key so the next save starts clean.
 * @returns {object|null}
 */
export function load() {
  try {
    const parsed = getItem(STATE_KEY);
    if (parsed === null) return null;
    if (parsed.v !== SCHEMA_VERSION) {
      removeItem(STATE_KEY);
      return null;
    }
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

/**
 * Removes the game state key. Does not touch the endings key.
 */
export function reset() {
  removeItem(STATE_KEY);
}

/**
 * Appends an ending ID to the persistent endings record, deduplicating.
 * Initializes the record if absent or corrupt.
 * @param {string} id - Ending identifier (e.g. 'A').
 */
export function recordEnding(id) {
  let reached;
  try {
    const parsed = getItem(ENDINGS_KEY);
    reached = Array.isArray(parsed?.reached) ? parsed.reached : [];
  } catch {
    reached = [];
  }

  if (!reached.includes(id)) {
    reached = [...reached, id];
  }

  setItem(ENDINGS_KEY, { v: SCHEMA_VERSION, reached });
}

/**
 * Returns all ending IDs that have been reached, or an empty array.
 * @returns {string[]}
 */
export function reachedEndings() {
  try {
    const parsed = getItem(ENDINGS_KEY);
    return Array.isArray(parsed?.reached) ? parsed.reached : [];
  } catch {
    return [];
  }
}
