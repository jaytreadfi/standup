/**
 * endings.js — the four outcomes and the resolver that picks one.
 *
 * Pure data + pure function. No side effects (recording the ending to storage
 * happens in actions.js).
 *
 *   A — you name David with hard proof (≥2 CORE/HEAVY clues against him).
 *   B — you name David, but the case is too thin to hold.
 *   C — you name anyone else: you were steered, the killer walks.
 *   D — deadline hits before you make the call (handled by the timeout path).
 */

import { clueById, WEIGHT_VALUE, TRUE_CULPRIT } from './clues';

export const endings = {
  A: {
    id: 'A',
    title: 'YOU NAMED HIM',
    verdict: 'THE TRUTH, UGLY',
    body: 'You lay it all on his desk — the scrubbed badge, the wiped glass, Yibo’s laptop back in his drawer with the real numbers glowing on it — and watch the warmth drain out of his face. He’ll have lawyers by noon, the raise is dead, and you’ll be off the team by Monday. But the report says David. Yibo gets a name on the thing that killed him. Some nights, ugly is the best you get.',
    tone: 'success',
  },
  B: {
    id: 'B',
    title: 'NO PROOF',
    verdict: 'RIGHT, AND ALONE',
    body: 'You point at David and you’re right and you both know it. But it’s a first-week hire’s word against the man who signs the checks, and you brought a hunch to a knife fight. He walks you to the elevator himself, hand warm on your shoulder. The truth rides down forty floors with you and gets out at the lobby, alone.',
    tone: 'warn',
  },
  C: {
    id: 'C',
    title: 'STEERED WRONG',
    verdict: 'THE KILLER WALKS',
    body: 'You point exactly where you were told to point. Poncho gets walked out of the building he practically lived in, the floor exhales, and David rests a heavy, grateful hand on your shoulder. The raise closes on Friday. Somewhere a laptop full of the truth gets wiped and dropped off a Chao Phraya bridge. You closed the case — on the wrong person — and he made sure you’d be the one to do it.',
    tone: 'danger',
  },
  D: {
    id: 'D',
    title: 'BOARD CALL',
    verdict: 'OUT OF TIME',
    body: 'Nine o’clock, a full day and a night later. The board dials in, David takes it smiling, and a cofounder on the floor quietly becomes a story about jet lag and one drink too many. You walked the floor from morning into the dark and out the other side, and never said the word. By the time anyone asks the right question, the man who knows the answer will be three explanations ahead. He counts on people like you running out of day.',
    tone: 'danger',
  },
};

/**
 * Resolve an ending from an accusation.
 * @param {{ suspectId: string|null, selectedClueIds: string[] }} accusation
 * @returns {{ id: 'A'|'B'|'C', ...}} one of endings A/B/C (D is the deadline
 *   timeout path, handled in actions.js, not here).
 */
export function resolveEnding({ suspectId, selectedClueIds = [] }) {
  if (suspectId !== TRUE_CULPRIT) return endings.C;

  const strongAgainst = selectedClueIds.filter((id) => {
    const clue = clueById[id];
    if (!clue) return false;
    const strong = WEIGHT_VALUE[clue.weight] >= WEIGHT_VALUE.CORE;
    return strong && clue.evidenceAgainst.includes(TRUE_CULPRIT);
  });

  return strongAgainst.length >= 2 ? endings.A : endings.B;
}
