/**
 * @fileoverview Clock engine for Tread Office.
 *
 * The in-game day begins at 9:00 AM (minute 0). The workday budget runs
 * through 5:00 PM (minute 480). The clock continues past that, cycling
 * through dusk and night until sunrise at minute 1410 (next-day 9:00 AM).
 *
 * All exports are pure functions or plain constants — no side effects,
 * no external imports.
 */

/**
 * Time costs (in minutes) for each player action.
 *
 * @type {{ TRAVEL: number, EXAMINE: number, DIALOGUE_NODE: number, OVERLAY_OPEN: number, ACCUSATION_OPEN: number }}
 */
export const TIME_COSTS = {
  TRAVEL: 5,
  EXAMINE: 10,
  DIALOGUE_NODE: 15,
  OVERLAY_OPEN: 0,
  ACCUSATION_OPEN: 0,
};

/**
 * The minute at which sunrise occurs (next-day 9:00 AM).
 *
 * @type {number}
 */
export const SUNRISE_MINUTE = 1410;

/**
 * The number of minutes in the standard 9 AM – 5 PM workday budget.
 *
 * @type {number}
 */
export const DAY_BUDGET_MINUTES = 480;

/**
 * Advances the clock by the cost of the given action.
 *
 * @param {number} currentMinutes - Current elapsed minutes since 9:00 AM.
 * @param {string} action - A key from TIME_COSTS.
 * @returns {number} Updated elapsed minutes.
 * @throws {Error} If action is not a recognized TIME_COSTS key.
 *
 * @example
 * advance(0, 'TRAVEL')       // 5
 * advance(75, 'OVERLAY_OPEN') // 75
 */
export function advance(currentMinutes, action) {
  if (!Object.prototype.hasOwnProperty.call(TIME_COSTS, action)) {
    throw new Error(
      `Unknown action "${action}". Must be one of: ${Object.keys(TIME_COSTS).join(', ')}.`
    );
  }
  return currentMinutes + TIME_COSTS[action];
}

/**
 * Formats elapsed minutes as a 12-hour wall-clock string.
 *
 * The clock starts at 9:00 AM. Minutes are added to that base, then the
 * result is wrapped modulo 24 hours so next-day times display correctly.
 * Hours and minutes are zero-padded to two digits. Midnight is "12:00 AM"
 * and noon is "12:00 PM".
 *
 * @param {number} minutes - Elapsed minutes since 9:00 AM (day start).
 * @returns {string} Formatted time string, e.g. "09:00 AM", "01:15 PM".
 *
 * @example
 * formatClock(0)    // '09:00 AM'
 * formatClock(75)   // '10:15 AM'
 * formatClock(180)  // '12:00 PM'
 * formatClock(240)  // '01:00 PM'
 * formatClock(900)  // '12:00 AM'
 * formatClock(1410) // '09:00 AM'
 */
export function formatClock(minutes) {
  const MINUTES_PER_DAY = 24 * 60;
  const BASE_MINUTES = 9 * 60; // 9:00 AM

  const totalMinutes = (BASE_MINUTES + minutes) % MINUTES_PER_DAY;

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
 * Returns the time-of-day period for the given elapsed minutes.
 *
 * @param {number} minutes - Elapsed minutes since 9:00 AM.
 * @returns {'morning' | 'dusk' | 'night'}
 *
 * @example
 * periodFor(0)   // 'morning'
 * periodFor(360) // 'dusk'
 * periodFor(600) // 'night'
 */
export function periodFor(minutes) {
  if (minutes >= 600) return 'night';
  if (minutes >= 360) return 'dusk';
  return 'morning';
}

/**
 * Returns true once the clock has reached or passed sunrise (minute 1410).
 *
 * @param {number} minutes - Elapsed minutes since 9:00 AM.
 * @returns {boolean}
 *
 * @example
 * isPastSunrise(1410) // true
 * isPastSunrise(1409) // false
 */
export function isPastSunrise(minutes) {
  return minutes >= SUNRISE_MINUTE;
}
