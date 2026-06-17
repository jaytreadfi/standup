/**
 * clues.js — the evidence catalogue for "Last One Out".
 *
 * Pure data. Clues are granted by examining hotspots (see rooms.js examineTargets)
 * or by dialogue. Each clue points at one or more suspects and carries a weight
 * that drives suspicion scoring and the accusation outcome.
 *
 * The evidence reads "accident / look at Poncho" on the surface and resolves to
 * David once the player actually looks. evidenceAgainst reflects the TRUTH: the
 * suspicion meter is a truth-tracker, and the misdirection is carried by the
 * people (David, Dena) who keep telling you it was an accident.
 *
 * The motive is the company. Yibo, the absentee cofounder who wrote the core
 * engine, flew in, pulled the real numbers, and found David faking the growth
 * for a new raise while quietly diluting him. Yibo came to pull his code and burn
 * the round down. David got there first.
 *
 * weight: 'WEAK' | 'CORE' | 'HEAVY'  -> numeric strength in WEIGHT_VALUE.
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
    description: 'Yibo on the pantry floor by the counter where he and David were drinking after the match. The gash above his temple lines up with the hard counter corner a little too neatly, and his laptop and phone, the things glued to his hands, are gone. Good whiskey on his breath. He did not drink alone, and nobody tidies up after a man who just slips. This was murder, dressed as a bad night.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'pantry',
  },
  {
    id: 'retrieved-proof',
    label: "YIBO'S LAPTOP",
    description: 'David’s bottom drawer sits proud of the desk, won’t close. Half-shoved under it: Yibo’s laptop, still warm. On it, the raw growth numbers that do not match the deck David has been showing investors, and the reversion clause that hands the core engine back to whoever wrote it. The two things that could end David’s raise, back in David’s hands the same night Yibo dies.',
    weight: 'HEAVY',
    evidenceAgainst: ['david'],
    source: 'office',
  },
  {
    id: 'two-glasses',
    label: 'TWO GLASSES',
    description: 'Two whiskey glasses by the pantry sink, set down around two, poured from Yibo’s airport-gift bottle that nobody can find now. One glass still has Yibo’s prints, the one David never thought to touch. The other is wiped clean, and rinsed again later on David’s word. Too clean. They argued in the office near midnight, then carried the bottle in here to finish it founder to founder once the match was over. One of them never left the room standing.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'pantry',
  },
  {
    id: 'shredded-letter',
    label: 'SHREDDED PRINTOUT',
    description: 'Confetti in the shredder, reassembled: the real metrics next to the deck’s faked ones, and a line in Yibo’s hand, “the round is a lie. I’m pulling the engine. Y.” Yibo printed the proof to end it tonight. Someone fed it to the blades.',
    weight: 'HEAVY',
    evidenceAgainst: ['david'],
    source: 'printer',
  },
  {
    id: 'scrubbed-badge',
    label: 'SCRUBBED BADGE LOG',
    description: 'The access log shows guest badge V1 (Yibo) up at 21:40, never down, so Yibo never left the floor. The other members all badged out after the final, leaving only the team. And a hole where D1, David’s badge, should be. Deleted, with a quiet re-entry stamp at 01:50. David told everyone he headed home at eleven with the rest. He wiped his own entry, but the reader stamped him fresh on the way back up and that copy only clears with admin keys. Only two badges can edit this log: admin’s, and his.',
    weight: 'HEAVY',
    evidenceAgainst: ['david'],
    source: 'elevator',
  },
  {
    id: 'owed-note',
    label: "PONCHO'S GRUDGE",
    description: 'In Poncho’s jacket on the lounge: a printout of a thread where he tells Yibo the rewrite happens “over my dead body.” Looks like a motive. It is also three weeks old, and scrawled across the bottom in Poncho’s hand: “we’re good. beers on me. P.”',
    weight: 'WEAK',
    evidenceAgainst: ['poncho'],
    source: 'sofa',
  },

  // ---- dialogue-granted ----
  {
    id: 'witness-argument',
    label: 'THE ARGUMENT',
    description: 'Jay came back to re-cut the launch video, his render died around eleven, and he doubled back for a cable near midnight. Through the office glass he heard David and Yibo tearing into each other: “the numbers are a lie and you know it.” Not a work fight. Proof both men were in the building long after David swore he had gone home.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'jay',
  },
  {
    id: 'earwitness-thud',
    label: 'THE THUD',
    description: 'Peem stayed latest at the printer finishing the raise deck and heard it around 2 a.m. A thud out toward the pantry, then dead air. A moment later a tall, calm figure walked, not ran, to the elevator. The figure walked away from Peem, who had just waved Jay off, which is exactly why Peem is not it.',
    weight: 'CORE',
    evidenceAgainst: ['david'],
    source: 'peem',
  },
  {
    id: 'ching-motive',
    label: "CHING'S SECRET",
    description: 'Yibo had something on Ching, a quiet jump to a rival studio with work that was not hers to take, and held it over her. A real motive. But her bag was packed and her cab was booked and timestamped. She was already fleeing town tonight, reaching for an exit, not a weapon.',
    weight: 'WEAK',
    evidenceAgainst: ['ching'],
    source: 'ching',
  },
];

export const clueById = Object.fromEntries(clues.map((c) => [c.id, c]));
