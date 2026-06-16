/**
 * characters.js — the people on the floor the night of the murder.
 *
 * Pure data. Portrait resolution lives in data/scenes.js (portraitUrl(id)).
 *
 * Sam is the victim (dead: true, no schedule) — present in the roster as the
 * body, excluded from the suspect board. Everyone else (including David, the
 * killer) is a living, accusable suspect.
 *
 * schedule: ordered list of { at, room } breakpoints (at = elapsed minutes
 * since the shift clock's zero). A character is in the room of the latest
 * breakpoint whose `at` <= current clock. See engine/schedule.js.
 *
 * slot: roster display id (D1..D7) — matches the elevator badge log.
 */

export const characters = [
  {
    id: 'david', name: 'David', slot: 'D1', role: 'Founder',
    schedule: [{ at: 0, room: 'office' }],
  },
  {
    id: 'sam', name: 'Sam', slot: 'D2', role: 'Quant · victim',
    dead: true,
    schedule: [],
  },
  {
    id: 'jay', name: 'Jay', slot: 'D3', role: 'Engineer',
    schedule: [{ at: 0, room: 'coworking' }],
  },
  {
    id: 'peem', name: 'Peem', slot: 'D4', role: 'Designer',
    schedule: [{ at: 0, room: 'printer' }],
  },
  {
    id: 'dena', name: 'Dena', slot: 'D5', role: 'Office Ops',
    schedule: [{ at: 0, room: 'pantry' }],
  },
  {
    id: 'poncho', name: 'Poncho', slot: 'D6', role: 'Analyst',
    schedule: [{ at: 0, room: 'elevator' }],
  },
  {
    id: 'ching', name: 'Ching', slot: 'D7', role: 'Producer',
    schedule: [{ at: 0, room: 'sofa' }],
  },
];

export const characterById = Object.fromEntries(characters.map((c) => [c.id, c]));

/** The murder victim. */
export const victim = characterById.sam;

/** Living suspects the player can accuse (everyone except the victim). */
export const suspects = characters.filter((c) => !c.dead);
