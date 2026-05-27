import { getItem, setItem, removeItem } from '@/lib/safeStorage';

export const TELEMETRY_KEY = 'tread-mystery-telemetry-v1';
export const TELEMETRY_VERSION = 1;
export const MAX_EVENTS = 1000;

export const EVENT_NAMES = Object.freeze({
  MODE_CHANGE: 'mode_change',
  OVERLAY_CHANGE: 'overlay_change',
  CLUE_COLLECTED: 'clue_collected',
  DIALOGUE_CHOICE: 'dialogue_choice',
  FLAG_SET: 'flag_set',
  ROOM_ENTER: 'room_enter',
  ACCUSATION_ATTEMPT: 'accusation_attempt',
  ENDING_REACHED: 'ending_reached',
});

/** @returns {{ v: number, events: Array }} */
function readStore() {
  try {
    const raw = getItem(TELEMETRY_KEY);
    if (!raw) return { v: TELEMETRY_VERSION, events: [] };
    const parsed = JSON.parse(raw);
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      parsed.v !== TELEMETRY_VERSION ||
      !Array.isArray(parsed.events)
    ) {
      return { v: TELEMETRY_VERSION, events: [] };
    }
    return parsed;
  } catch {
    return { v: TELEMETRY_VERSION, events: [] };
  }
}

/**
 * Appends a telemetry event to the ring buffer.
 * @param {string} name
 * @param {object} [payload]
 */
export function event(name, payload) {
  if (import.meta.env.DEV) {
    console.log('[telemetry]', name, payload);
  }

  const store = readStore();
  store.events.push({ name, ts: Date.now(), payload });

  if (store.events.length > MAX_EVENTS) {
    store.events = store.events.slice(store.events.length - MAX_EVENTS);
  }

  setItem(TELEMETRY_KEY, JSON.stringify(store));
}

/**
 * Returns the stored events array.
 * @returns {Array}
 */
export function dump() {
  return readStore().events;
}

/**
 * Wipes all telemetry data from storage.
 */
export function clear() {
  removeItem(TELEMETRY_KEY);
}
