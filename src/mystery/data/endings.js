/**
 * endings.js — the four outcomes and the resolver that picks one.
 *
 * Pure data + pure function. No side effects (recording the ending to storage
 * happens in actions.js).
 *
 *   A — you name David with hard proof (≥2 CORE/HEAVY clues against him).
 *   B — you name David, but the case is too thin to hold.
 *   C — you name anyone else: you were steered, the killer walks.
 *   D — sunrise hits before you make the call (handled by the timeout path).
 */

import { clueById, WEIGHT_VALUE, TRUE_CULPRIT } from './clues';

export const endings = {
  A: {
    id: 'A',
    title: 'YOU NAMED HIM',
    verdict: 'THE TRUTH, UGLY',
    body: 'You lay it all on his desk — the scrubbed badge, the wiped glass, the clipping back in his drawer — and watch the warmth drain out of his face. He’ll have lawyers by noon and you’ll have a target on your back by Monday. But the report says David. Sam gets a name on the thing that killed them. Some nights, ugly is the best you get.',
    tone: 'success',
  },
  B: {
    id: 'B',
    title: 'NO PROOF',
    verdict: 'RIGHT, AND ALONE',
    body: 'You point at David and you’re right and you both know it. But it’s an intern’s word against the man who signs the checks, and you brought a hunch to a knife fight. Security walks you out before the sun’s up. The truth rides down forty floors with you and gets out at the lobby, alone.',
    tone: 'warn',
  },
  C: {
    id: 'C',
    title: 'STEERED WRONG',
    verdict: 'THE KILLER WALKS',
    body: 'You point exactly where you were told to point. The wrong wrists get the cuffs, the floor exhales, and David rests a heavy, grateful hand on your shoulder. Somewhere over the river, a phone with the truth on it slips under the water. You closed the case. You just closed it on the wrong person — and he made sure you’d be the one to do it.',
    tone: 'danger',
  },
  D: {
    id: 'D',
    title: 'FIRST SHIFT',
    verdict: 'OUT OF TIME',
    body: 'Six o’clock. The lights come up, the coffee machine coughs to life, and a body on the floor quietly becomes a story about a sad accident. You never said the word. By the time anyone asks the right question, the man who knows the answer will be three explanations ahead. He counts on people like you running out of night.',
    tone: 'danger',
  },
};

/**
 * Resolve an ending from an accusation.
 * @param {{ suspectId: string|null, selectedClueIds: string[] }} accusation
 * @returns {{ id: 'A'|'B'|'C', ...}} one of endings A/B/C (D is the sunrise
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
