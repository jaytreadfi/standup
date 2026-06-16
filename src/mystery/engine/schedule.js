/**
 * schedule.js — where everyone is, minute by minute.
 *
 * Pure functions over characters[].schedule. No side effects, no imports of
 * React/Jotai. Consumed by derived atoms and the roster.
 */

/**
 * The room a character occupies at the given clock minute.
 * Returns the room of the latest schedule breakpoint whose `at` <= clock.
 * @param {{ at: number, room: string }[]} schedule
 * @param {number} clockMinutes
 * @returns {string|null}
 */
export function currentRoomOf(schedule, clockMinutes) {
  if (!Array.isArray(schedule) || schedule.length === 0) return null;
  let room = schedule[0].room;
  for (const entry of schedule) {
    if (clockMinutes >= entry.at) room = entry.room;
    else break;
  }
  return room;
}

/**
 * All characters present in a room at a given minute.
 * @param {Array} characters
 * @param {number} clockMinutes
 * @param {string} roomId
 * @returns {Array} characters in that room
 */
export function charactersInRoom(characters, clockMinutes, roomId) {
  return characters.filter((c) => currentRoomOf(c.schedule, clockMinutes) === roomId);
}

/**
 * Map of characterId → current roomId at the given minute.
 * @param {Array} characters
 * @param {number} clockMinutes
 * @returns {Record<string, string|null>}
 */
export function roomByCharacter(characters, clockMinutes) {
  const out = {};
  for (const c of characters) out[c.id] = currentRoomOf(c.schedule, clockMinutes);
  return out;
}
