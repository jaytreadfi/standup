/**
 * endings.js — the four outcomes and the resolver that picks one.
 *
 * Pure data + pure function. No side effects (recording the ending to storage
 * happens in actions.js).
 *
 *   A — clean conviction: accused the true culprit with ≥2 strong (CORE/HEAVY)
 *       clues that implicate them.
 *   B — right hunch, weak case: accused the culprit but without the hard proof.
 *   C — wrong call: accused the wrong person.
 *   D — out of time: sunrise hit before any accusation was made.
 */

import { clueById, WEIGHT_VALUE, TRUE_CULPRIT } from './clues';

export const endings = {
  A: {
    id: 'A',
    title: 'CASE CLOSED',
    verdict: 'CLEAN CONVICTION',
    body: 'You laid it out cold: the badge, the shredded slide, the deleted history — all of it Sam. By sunrise, security had their box packed. David keeps his deck. You keep your badge.',
    tone: 'success',
  },
  B: {
    id: 'B',
    title: 'NAMED, NOT NAILED',
    verdict: 'RIGHT PERSON · THIN PROOF',
    body: 'You pointed at Sam and you were right — but the case was circumstantial. Legal "advised caution." Sam walks with a warning and a grudge. The deck survives; the truth doesn’t fully land.',
    tone: 'warn',
  },
  C: {
    id: 'C',
    title: 'WRONG CALL',
    verdict: 'FALSE ACCUSATION',
    body: 'You named the wrong person with the whole floor watching. The real saboteur exhales. David’s deck is still gutted, and now there’s one more mess with your name on it.',
    tone: 'danger',
  },
  D: {
    id: 'D',
    title: 'SUNRISE',
    verdict: 'OUT OF TIME',
    body: 'The board files in at 06:00. You never made the call. The deck goes up broken, the saboteur sips their coffee, and the standup moves on without an answer.',
    tone: 'danger',
  },
};

/**
 * Resolve an ending from an accusation.
 * @param {{ suspectId: string|null, selectedClueIds: string[] }} accusation
 * @returns {{ id: 'A'|'B'|'C', ...}} one of endings A/B/C (D is handled by the
 *   sunrise timeout path, not here).
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
