/**
 * @fileoverview Clock engine for Tread Office.
 *
 * The case opens on a normal workday morning — 09:00 AM (START_MINUTE = 0) —
 * the morning the team arrives to find Yibo dead on the floor. The clock then
 * runs in real time across a full 24-hour day, through afternoon and dusk into
 * night, to the deadline at 09:00 AM the next morning (DEADLINE_MINUTE = 1440),
 * when David's board call connects and the "accident" story sets for good.
 *
 * Time keeps ticking on its own; player actions (travel, examine, talk) do NOT
 * cost minutes. A real-time ticker (state/actions.js → useGameClock) advances
 * the clock by GAME_MINUTES_PER_REAL_SECOND every CLOCK_TICK_MS while the player
 * is free-roaming, and pauses inside dialogue, overlays, and menus. The rate is
 * 1 in-game minute per real second, so the whole day burns in ~24 real minutes
 * and the scene art walks day → dusk → night as you play.
 *
 * All exports are pure functions or plain constants — no side effects.
 */

/**
 * The minute the workday opens (09:00 AM). The clock's arithmetic origin is also
 * 9:00 AM, so the day starts at minute 0. formatClock(0) === '09:00 AM'.
 * @type {number}
 */
export const START_MINUTE = 0;

/**
 * The minute the deadline lands — 24 hours after the start, i.e. 09:00 AM the
 * next day, when David takes the board call. formatClock(1440) === '09:00 AM'.
 * @type {number}
 */
export const DEADLINE_MINUTE = 1440;

/**
 * Length of the playable day in in-game minutes (a full 24 hours).
 * @type {number}
 */
export const DAY_LENGTH_MINUTES = DEADLINE_MINUTE - START_MINUTE;

/**
 * Real wall-clock seconds it takes to burn the whole day — a full untouched
 * playthrough runs ~24 real minutes before the deadline forces the timeout.
 * @type {number}
 */
export const REAL_SECONDS_PER_DAY = 1440;

/**
 * In-game minutes the clock advances per real second of free-roam. Exactly 1 —
 * one real second is one in-game minute.
 * @type {number}
 */
export const GAME_MINUTES_PER_REAL_SECOND = DAY_LENGTH_MINUTES / REAL_SECONDS_PER_DAY;

/**
 * How often the real-time ticker fires, in milliseconds.
 * @type {number}
 */
export const CLOCK_TICK_MS = 1000;

/**
 * Formats elapsed minutes as a 12-hour wall-clock string.
 *
 * The clock's origin is 09:00 AM (minute 0). Minutes are added to that base,
 * then wrapped modulo 24 hours so next-day times display correctly. Hours and
 * minutes are zero-padded to two digits. Midnight is "12:00 AM" and noon is
 * "12:00 PM".
 *
 * @param {number} minutes - Elapsed minutes since the 09:00 AM start.
 * @returns {string} Formatted time string, e.g. "09:00 AM", "03:00 PM".
 *
 * @example
 * formatClock(0)    // '09:00 AM' (START_MINUTE)
 * formatClock(360)  // '03:00 PM'
 * formatClock(900)  // '12:00 AM' (midnight)
 * formatClock(1440) // '09:00 AM' (deadline, next day)
 */
export function formatClock(minutes) {
  const MINUTES_PER_DAY = 24 * 60;
  const BASE_MINUTES = 9 * 60; // 09:00 AM origin

  // Corrupt or hand-edited persisted clocks can arrive as NaN/Infinity or a
  // negative number. Guard so the HUD shows a sentinel instead of "NaN:NaN".
  if (!Number.isFinite(minutes)) return '--:-- --';

  // Math.floor + true modulo (JS % keeps the dividend's sign) so any negative
  // elapsed value still wraps into a valid 0–1439 minute-of-day. Floor also
  // drops any fractional minutes the real-time ticker might accumulate.
  const m = Math.floor(minutes);
  const totalMinutes =
    (((BASE_MINUTES + m) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  const period = hour24 < 12 ? 'AM' : 'PM';

  // Convert 24-hour to 12-hour: hour 0 and 12 both display as 12.
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const hh = String(hour12).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');

  return `${hh}:${mm} ${period}`;
}

/**
 * Returns the time-of-day period for the given elapsed minutes — the key that
 * selects each room's scene art. Over the day the player walks through all
 * three: morning (09:00–14:59), dusk (15:00–18:59), night (19:00 onward).
 *
 * @param {number} minutes - Elapsed minutes since the 09:00 AM start.
 * @returns {'morning' | 'dusk' | 'night'}
 */
export function periodFor(minutes) {
  if (minutes >= 600) return 'night';
  if (minutes >= 360) return 'dusk';
  return 'morning';
}

/**
 * Human display label for a period. The 'morning' art key covers the whole
 * 09:00–15:00 daytime block, surfaced as "DAY" to avoid a "02:10 PM · MORNING"
 * HUD mismatch.
 *
 * @param {'morning'|'dusk'|'night'} period
 * @returns {string}
 */
export const PERIOD_LABEL = { morning: 'DAY', dusk: 'DUSK', night: 'NIGHT' };

export function periodLabel(period) {
  return PERIOD_LABEL[period] ?? String(period).toUpperCase();
}

/**
 * Returns true once the clock has reached or passed the deadline (DEADLINE_MINUTE).
 *
 * @param {number} minutes - Elapsed minutes since the 09:00 AM start.
 * @returns {boolean}
 */
export function isPastDeadline(minutes) {
  return minutes >= DEADLINE_MINUTE;
}
