/**
 * endings.js — the four outcomes and the resolver that picks one.
 *
 * Pure data + pure function. No side effects (recording the ending to storage
 * happens in actions.js).
 *
 *   A — you name David with hard proof (≥2 CORE/HEAVY clues against him).
 *   B — you name David, but the case is too thin to hold.
 *   C — you name anyone else: you were steered, the killer walks.
 *   D — dawn hits before you make the call: The Great Room opens (handled by the
 *       timeout path).
 */

import { clueById, WEIGHT_VALUE, TRUE_CULPRIT } from './clues';

export const endings = {
  A: {
    id: 'A',
    title: 'YOU NAMED HIM',
    verdict: 'THE TRUTH, UGLY',
    body: 'You lay it all down before the doors open. The scrubbed badge. The wiped glass. Yibo’s laptop back in his drawer with the real numbers glowing on it. The warmth drains out of his face. He’ll have lawyers by noon, the raise is dead, and you’re off the team by Monday. But the report says David. Yibo gets a name on the thing that killed him. Some nights, ugly is the best you get.',
    tone: 'success',
  },
  B: {
    id: 'B',
    title: 'NO PROOF',
    verdict: 'RIGHT, AND ALONE',
    body: 'You point at David and you’re right and you both know it. But it’s a first-week intern’s word against the man who signs the checks, and the sky is already going grey. You brought a hunch to a knife fight. He walks you to the lift himself, easy and unhurried, holds the door. The truth rides down forty floors with you and gets out at the lobby, alone.',
    tone: 'warn',
  },
  C: {
    id: 'C',
    title: 'STEERED WRONG',
    verdict: 'THE KILLER WALKS',
    body: 'You point exactly where you were told to point. Poncho gets walked out of the building he practically lived in, the floor exhales, and David rests a heavy, grateful hand on your shoulder. The raise closes Friday. Somewhere a laptop full of the truth gets wiped and dropped off a Chao Phraya bridge. You closed the case on the wrong person, and he made sure you’d be the one to do it. He keeps the company. You keep the badge.',
    tone: 'danger',
  },
  D: {
    id: 'D',
    title: 'DOORS OPEN',
    verdict: 'OUT OF TIME',
    body: 'Dawn. The Great Room unlocks on the building’s schedule, not yours. Staff prop the doors, the cleaners reach the pantry, and the other members and offices start coming in with their coffees and their stand-up meetings. A cofounder dead on a shared kitchen floor quietly becomes a story about jet lag and one drink too many. You walked this floor from deep night into first light and never said the word. By the time the right question gets asked, the man who knows the answer is already three explanations ahead.',
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
