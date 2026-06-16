/**
 * characters.js — the eight people on the floor.
 *
 * Pure data. Portrait resolution lives in data/scenes.js (portraitUrl(id)).
 *
 * schedule: ordered list of { at, room } breakpoints (at = elapsed minutes
 * since 9:00 AM). A character is in the room of the latest breakpoint whose
 * `at` <= current clock. See engine/schedule.js.
 *
 * slot: roster display id (D1..D8) — matches the elevator badge log clue.
 */

export const characters = [
  {
    id: 'david', name: 'David', slot: 'D1', role: 'CEO · the victim',
    schedule: [{ at: 0, room: 'office' }],
  },
  {
    id: 'sam', name: 'Sam', slot: 'D2', role: 'Deck owner',
    schedule: [{ at: 0, room: 'pantry' }, { at: 360, room: 'coworking' }, { at: 600, room: 'elevator' }],
  },
  {
    id: 'jay', name: 'Jay', slot: 'D3', role: 'Engineer',
    schedule: [{ at: 0, room: 'coworking' }],
  },
  {
    id: 'peem', name: 'Peem', slot: 'D4', role: 'Designer',
    schedule: [{ at: 0, room: 'printer' }, { at: 360, room: 'coworking' }],
  },
  {
    id: 'dena', name: 'Dena', slot: 'D5', role: 'Ops',
    schedule: [{ at: 0, room: 'pantry' }],
  },
  {
    id: 'poncho', name: 'Poncho', slot: 'D6', role: 'Analyst',
    schedule: [{ at: 0, room: 'coworking' }, { at: 360, room: 'sofa' }],
  },
  {
    id: 'ching', name: 'Ching', slot: 'D7', role: 'PM',
    schedule: [{ at: 0, room: 'sofa' }],
  },
  {
    id: 'jamie', name: 'Jamie', slot: 'D8', role: 'Intern lead',
    schedule: [{ at: 0, room: 'elevator' }, { at: 360, room: 'office' }],
  },
];

export const characterById = Object.fromEntries(characters.map((c) => [c.id, c]));

/** Suspects the player can accuse (everyone except the victim). */
export const suspects = characters.filter((c) => c.id !== 'david');
