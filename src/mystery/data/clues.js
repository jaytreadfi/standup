/**
 * clues.js — the evidence catalogue for "Last One Out".
 *
 * Pure data. Clues are granted by examining hotspots (see rooms.js examineTargets)
 * or by dialogue. Each clue points at one or more suspects and carries a weight
 * that drives suspicion scoring and the accusation outcome.
 *
 * The evidence reads "accident / look at Poncho" on the surface and resolves to
 * David once the player actually looks. evidenceAgainst reflects the TRUTH — the
 * suspicion meter is a truth-tracker; the misdirection is carried by the people
 * (David, Dena) who keep telling you it was an accident.
 *
 * The motive is the company: Yibo — the absentee cofounder who wrote the core
 * engine — flew in, pulled the real numbers, and found David faking the growth
 * for a new raise while quietly diluting him. Yibo came to pull his code and burn
 * the round down. David got there first.
 *
 * weight: 'WEAK' | 'CORE' | 'HEAVY'  → numeric strength in WEIGHT_VALUE.
 */

export const WEIGHT_VALUE = { WEAK: 1, CORE: 2, HEAVY: 3 };

/** The killer. The whole evidence trail converges here. */
export const TRUE_CULPRIT = 'david';

/** The innocent the killer steers you toward. Used for the "steered wrong" ending. */
export const PATSY = 'poncho';

export const clues = [
  {
    id: 'the-body',
    label: 'THE BODY',
    description: 'Yibo, between the desks. A gash above the temple that matches the desk corner a little too neatly, a chair shoved wrong, and his laptop and phone — gone. Nobody tidies up after a man who just trips. This was murder, dressed as a bad night.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'coworking',
  },
  {
    id: 'retrieved-proof',
    label: "YIBO'S LAPTOP",
    description: "Half-shoved under David's desk: Yibo's laptop, still warm. On it, the raw growth numbers and the reversion clause that hands the core engine back to whoever wrote it. The two things that could end David's raise — back in David's hands tonight.",
    weight: 'HEAVY',
    evidenceAgainst: ['david'],
    source: 'office',
  },
  {
    id: 'two-glasses',
    label: 'TWO GLASSES',
    description: "Two whiskey glasses by the pantry sink, set down around 2 a.m. — Yibo's airport-gift bottle, the one nobody can find now. One glass still has Yibo's prints. The other is wiped clean. Too clean.",
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'pantry',
  },
  {
    id: 'shredded-letter',
    label: 'SHREDDED PRINTOUT',
    description: 'Confetti in the shredder, reassembled: the real metrics next to the deck’s faked ones, and a line in Yibo’s hand — "the round is a lie. I’m pulling the engine. — Y." Yibo printed the proof to end it. Someone fed it to the blades.',
    weight: 'HEAVY',
    evidenceAgainst: ['david'],
    source: 'printer',
  },
  {
    id: 'scrubbed-badge',
    label: 'SCRUBBED BADGE LOG',
    description: 'The access log shows guest badge V1 (Yibo) up at 21:40, never down. And a hole where D1 — David’s — should be, deleted, with a quiet re-entry stamp at 01:55. David told everyone he karted home with the rest. Only two badges can edit this log: admin’s, and his.',
    weight: 'HEAVY',
    evidenceAgainst: ['david'],
    source: 'elevator',
  },
  {
    id: 'owed-note',
    label: "PONCHO'S GRUDGE",
    description: "In Poncho's jacket on the lounge: a printout of a thread where he tells Yibo the rewrite happens “over my dead body.” Looks like a motive. It’s also three weeks old, and scrawled across the bottom in Poncho’s hand: “we’re good. beers on me. —P.”",
    weight: 'WEAK',
    evidenceAgainst: ['poncho'],
    source: 'sofa',
  },

  // ---- dialogue-granted ----
  {
    id: 'witness-argument',
    label: 'THE ARGUMENT',
    description: 'Jay heard David and Yibo tearing into each other in the office near midnight — "the numbers are a lie and you know it," through the glass. Not a work fight. And David swore to everyone he’d gone home.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'jay',
  },
  {
    id: 'earwitness-thud',
    label: 'THE THUD',
    description: 'Peem heard it from the printer nook around 2 a.m. — a thud in the bullpen, then dead air. A moment later a tall, calm figure walked, not ran, to the elevator.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'peem',
  },
  {
    id: 'ching-motive',
    label: "CHING'S SECRET",
    description: 'Yibo had something on Ching — a quiet jump to a rival studio, with work that wasn’t hers to take. A real motive. But Ching had a bag packed and a cab booked, already halfway out the door — reaching for an exit, not a weapon.',
    weight: 'WEAK',
    evidenceAgainst: ['ching'],
    source: 'ching',
  },
];

export const clueById = Object.fromEntries(clues.map((c) => [c.id, c]));
