/**
 * characters.js — the people on the floor the night Yibo died.
 *
 * Pure data. Portrait resolution lives in data/scenes.js (portraitUrl(id)).
 *
 * Yibo is the victim (dead: true, no schedule) — the visiting cofounder, present
 * in the roster as the body (DECEASED), excluded from the suspect board. Everyone
 * else — including David, the killer — is a living, accusable suspect.
 *
 * schedule: ordered list of { at, room } breakpoints (at = elapsed minutes
 * since the shift clock's zero). A character is in the room of the latest
 * breakpoint whose `at` <= current clock. The night is static — everyone is
 * pinned to one room with an `at: 0` breakpoint. See engine/schedule.js.
 *
 * slot: roster display id (D1..D7, V1 for the visitor) — matches the badge log.
 */

export const characters = [
  {
    id: 'yibo', name: 'Yibo', slot: 'V1', role: 'Cofounder · victim',
    dead: true,
    schedule: [],
  },
  {
    id: 'david', name: 'David', slot: 'D1', role: 'Founder · CEO',
    schedule: [{ at: 0, room: 'office' }],
  },
  {
    id: 'peem', name: 'Peem', slot: 'D2', role: 'Project Lead',
    schedule: [{ at: 0, room: 'printer' }],
  },
  {
    id: 'poncho', name: 'Poncho', slot: 'D3', role: 'Engineer',
    schedule: [{ at: 0, room: 'elevator' }],
  },
  {
    id: 'jay', name: 'Jay', slot: 'D4', role: 'Marketing',
    schedule: [{ at: 0, room: 'coworking' }],
  },
  {
    id: 'ching', name: 'Ching', slot: 'D5', role: 'Product Design',
    schedule: [{ at: 0, room: 'sofa' }],
  },
  {
    id: 'dena', name: 'Dena', slot: 'D6', role: 'Data Analyst',
    schedule: [{ at: 0, room: 'pantry' }],
  },
  {
    id: 'sam', name: 'Sam', slot: 'D7', role: 'Office Admin',
    schedule: [{ at: 0, room: 'elevator' }],
  },
];

export const characterById = Object.fromEntries(characters.map((c) => [c.id, c]));

/** The murder victim. */
export const victim = characterById.yibo;

/** Living suspects the player can accuse (everyone except the victim). */
export const suspects = characters.filter((c) => !c.dead);
