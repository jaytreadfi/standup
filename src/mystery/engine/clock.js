/**
 * @fileoverview Clock engine for Tread Office.
 *
 * The case opens deep in the night, at 03:10 AM (START_MINUTE = 0), the moment
 * David has called the team back to the floor and the intern starts walking it.
 * The clock then runs in real time through the dead of night and the pre-dawn
 * grey to the deadline at 06:00 AM (DEADLINE_MINUTE = 170), when The Great Room
 * (the shared coworking floor) opens for the day, the other members start coming
 * in, and the "accident" story sets for good.
 *
 * Time keeps ticking on its own; player actions (travel, examine, talk) do NOT
 * cost minutes. A real-time ticker (state/actions.js → useGameClock) advances
 * the clock by GAME_MINUTES_PER_REAL_SECOND every CLOCK_TICK_MS while the player
 * is free-roaming, and pauses inside dialogue, overlays, and menus. The whole
 * night burns in ~24 real minutes of free-roam, and the scene art walks night →
 * pre-dawn → dawn as the deadline approaches.
 *
 * All exports are pure functions or plain constants — no side effects.
 */

/**
 * The minute the playable night opens (03:10 AM). The clock's arithmetic origin
 * is 03:10 AM, so the night starts at minute 0. formatClock(0) === '03:10 AM'.
 * @type {number}
 */
export const START_MINUTE = 0;

/**
 * The minute the deadline lands — 170 minutes after the start, i.e. 06:00 AM,
 * when The Great Room opens and the floor fills. formatClock(170) === '06:00 AM'.
 * @type {number}
 */
export const DEADLINE_MINUTE = 170;

/**
 * Length of the playable night in in-game minutes (03:10 → 06:00).
 * @type {number}
 */
export const DAY_LENGTH_MINUTES = DEADLINE_MINUTE - START_MINUTE;

/**
 * Real wall-clock seconds it takes to burn the whole night of free-roam — a full
 * untouched playthrough runs ~24 real minutes before the deadline forces the
 * timeout. Tune this number to make the race to dawn looser or tighter; nothing
 * else depends on it.
 * @type {number}
 */
export const REAL_SECONDS_PER_DAY = 1440;

/**
 * In-game minutes the clock advances per real second of free-roam. The night is
 * 170 in-game minutes spread across REAL_SECONDS_PER_DAY real seconds.
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
 * The clock's origin is 03:10 AM (minute 0). Minutes are added to that base,
 * then wrapped modulo 24 hours so times display correctly. Hours and minutes are
 * zero-padded to two digits.
 *
 * @param {number} minutes - Elapsed minutes since the 03:10 AM start.
 * @returns {string} Formatted time string, e.g. "03:10 AM", "06:00 AM".
 *
 * @example
 * formatClock(0)   // '03:10 AM' (START_MINUTE)
 * formatClock(50)  // '04:00 AM'
 * formatClock(110) // '05:00 AM'
 * formatClock(170) // '06:00 AM' (deadline — The Great Room opens)
 */
export function formatClock(minutes) {
  const MINUTES_PER_DAY = 24 * 60;
  const BASE_MINUTES = 3 * 60 + 10; // 03:10 AM origin

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
 * selects each room's scene art. Over the night the player walks through all
 * three: night (03:10–04:39), pre-dawn (04:40–05:39), dawn (05:40 onward). The
 * bulk of the playable window is night; the brightening art is the deadline
 * closing in.
 *
 * @param {number} minutes - Elapsed minutes since the 03:10 AM start.
 * @returns {'morning' | 'dusk' | 'night'}
 */
export function periodFor(minutes) {
  if (minutes >= 150) return 'morning';
  if (minutes >= 90) return 'dusk';
  return 'night';
}

/**
 * Human display label for a period. The art keys are reused from the original
 * day build, so 'morning' art stands in for first light (DAWN) and 'dusk' art
 * for the pre-dawn grey.
 *
 * @param {'morning'|'dusk'|'night'} period
 * @returns {string}
 */
export const PERIOD_LABEL = { morning: 'DAWN', dusk: 'PRE-DAWN', night: 'NIGHT' };

export function periodLabel(period) {
  return PERIOD_LABEL[period] ?? String(period).toUpperCase();
}

/**
 * Returns true once the clock has reached or passed the deadline (DEADLINE_MINUTE,
 * 06:00 AM — The Great Room opens).
 *
 * @param {number} minutes - Elapsed minutes since the 03:10 AM start.
 * @returns {boolean}
 */
export function isPastDeadline(minutes) {
  return minutes >= DEADLINE_MINUTE;
}
