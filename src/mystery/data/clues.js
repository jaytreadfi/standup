/**
 * clues.js — the evidence catalogue for the single Tread Office case.
 *
 * Pure data. Clues are granted by examining hotspots (see rooms.js examineTargets)
 * or by dialogue. Each clue points at one or more suspects and carries a weight
 * that drives suspicion scoring and the accusation outcome.
 *
 * weight: 'WEAK' | 'CORE' | 'HEAVY'  → numeric strength in WEIGHT_VALUE.
 * evidenceAgainst: suspect ids this clue implicates.
 */

export const WEIGHT_VALUE = { WEAK: 1, CORE: 2, HEAVY: 3 };

/** The true saboteur for this case. The whole evidence trail converges here. */
export const TRUE_CULPRIT = 'sam';

export const clues = [
  {
    id: 'usb-drive',
    label: 'UNLABELED USB',
    description: 'A warm, unlabeled USB drive left in a coworking dock — last written to overnight.',
    weight: 'CORE',
    evidenceAgainst: ['poncho', 'sam'],
    source: 'coworking',
  },
  {
    id: 'deleted-slides',
    label: 'DELETED SLIDES',
    description: 'David’s laptop history: 14 deck slides deleted at 02:14, after hours.',
    weight: 'CORE',
    evidenceAgainst: ['sam'],
    source: 'office',
  },
  {
    id: 'coffee-ring',
    label: 'ESPRESSO RING',
    description: 'A fresh 2 a.m. espresso ring in the pantry — someone was on the floor overnight.',
    weight: 'WEAK',
    evidenceAgainst: ['dena', 'sam'],
    source: 'pantry',
  },
  {
    id: 'alibi-note',
    label: 'ALIBI NOTE',
    description: 'An unsigned note begging someone to cover the morning standup.',
    weight: 'WEAK',
    evidenceAgainst: ['ching', 'jay'],
    source: 'sofa',
  },
  {
    id: 'shredded-printout',
    label: 'SHREDDED SLIDE 9',
    description: 'Slide 9 — the kill-shot metric — printed and run through the shredder.',
    weight: 'HEAVY',
    evidenceAgainst: ['sam'],
    source: 'printer',
  },
  {
    id: 'late-badge',
    label: 'BADGE #D2 · 02:02',
    description: 'Elevator badge log: Sam’s badge (#D2) entered at 02:02 and left at 02:31.',
    weight: 'HEAVY',
    evidenceAgainst: ['sam'],
    source: 'elevator',
  },
];

export const clueById = Object.fromEntries(clues.map((c) => [c.id, c]));
