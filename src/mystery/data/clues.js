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
 * who keep telling you it was an accident.
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
    description: 'Sam, on the bullpen floor. A defensive bruise on the forearm, a chair knocked the wrong way, and Sam’s phone — gone. Nobody stages a fall and pockets the phone. This was murder.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'coworking',
  },
  {
    id: 'retrieved-proof',
    label: 'RETRIEVED PROOF',
    description: 'In David’s desk drawer: a burner phone and a yellowed clipping about a hit-and-run, years back, never solved. The thing Sam was holding over him — back in his hands tonight.',
    weight: 'HEAVY',
    evidenceAgainst: ['david'],
    source: 'office',
  },
  {
    id: 'two-glasses',
    label: 'TWO GLASSES',
    description: 'Two whiskey glasses by the pantry sink, set down around 2 a.m. One still has Sam’s prints. The other is wiped clean — too clean.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'pantry',
  },
  {
    id: 'shredded-letter',
    label: 'SHREDDED LETTER',
    description: 'Confetti in the shredder, reassembled: the clipping and a note in Sam’s hand — "last time. then it’s done." Sam printed the proof to end it. Someone fed it to the blades.',
    weight: 'HEAVY',
    evidenceAgainst: ['david'],
    source: 'printer',
  },
  {
    id: 'scrubbed-badge',
    label: 'SCRUBBED BADGE LOG',
    description: 'The access log shows badge #D2 (Sam) in, never out. And a gap where #D1 — David’s — was deleted, with a re-entry at 01:55. David swore he left at midnight.',
    weight: 'HEAVY',
    evidenceAgainst: ['david'],
    source: 'elevator',
  },
  {
    id: 'owed-note',
    label: 'PONCHO’S IOU',
    description: 'A crumpled IOU in Poncho’s jacket on the lounge — a lot of money owed to Sam. Looks damning. It’s also dated weeks back, and already torn down the middle.',
    weight: 'WEAK',
    evidenceAgainst: ['poncho'],
    source: 'sofa',
  },

  // ---- dialogue-granted ----
  {
    id: 'witness-argument',
    label: 'THE ARGUMENT',
    description: 'Jay heard David and Sam tearing into each other in the office near midnight — "years ago," through the glass. Not a work fight. And David told everyone he’d gone home.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'jay',
  },
  {
    id: 'earwitness-thud',
    label: 'THE THUD',
    description: 'Peem heard it from the printer nook around 2 a.m. — a thud in the bullpen, then a tall, calm figure walking, not running, to the elevator.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'peem',
  },
  {
    id: 'ching-motive',
    label: 'CHING’S SECRET',
    description: 'Sam was bleeding Ching too — something personal. A real motive. But Ching had a bag packed and a cab booked for half four — after the murder, headed away from it.',
    weight: 'WEAK',
    evidenceAgainst: ['ching'],
    source: 'ching',
  },
];

export const clueById = Object.fromEntries(clues.map((c) => [c.id, c]));
