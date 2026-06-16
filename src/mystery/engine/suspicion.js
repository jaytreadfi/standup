/**
 * suspicion.js — turn collected evidence into per-suspect heat.
 *
 * Pure functions. A suspect's raw score is the summed weight of every collected
 * clue that implicates them. We expose both the raw integer (for the 2-digit
 * roster badge) and a 0..1 normalized value (for meters).
 */

import { clueById, WEIGHT_VALUE } from '@/mystery/data/clues';

/** Max raw score a single suspect could accrue, for normalization. */
function maxPossibleScore(clues, suspectId) {
  return clues.reduce(
    (sum, c) => sum + (c.evidenceAgainst.includes(suspectId) ? WEIGHT_VALUE[c.weight] : 0),
    0,
  );
}

/**
 * The largest max-possible score across ALL suspects. We normalize every
 * suspect's meter against this single global ceiling so the meter reflects
 * RELATIVE heat: the most-implicated suspect can reach ~1.0, while a suspect
 * tied to one weak clue reads low — instead of every implicated suspect pegging
 * 100% against their own private max (which hid the real culprit).
 */
function globalMaxScore(clues, suspects) {
  return Math.max(1, ...suspects.map((s) => maxPossibleScore(clues, s.id)));
}

/**
 * Raw suspicion score (summed clue weight) for one suspect from collected clue ids.
 * @param {string[]} collectedClueIds
 * @param {string} suspectId
 * @returns {number}
 */
export function rawScoreFor(collectedClueIds, suspectId) {
  return collectedClueIds.reduce((sum, id) => {
    const clue = clueById[id];
    if (clue && clue.evidenceAgainst.includes(suspectId)) return sum + WEIGHT_VALUE[clue.weight];
    return sum;
  }, 0);
}

/**
 * Map of suspectId → { raw, normalized (0..1) } from collected clue ids.
 * @param {string[]} collectedClueIds
 * @param {Array} clues - full clue catalogue (for normalization)
 * @param {Array} suspects - suspects to score
 * @returns {Record<string, { raw: number, value: number }>}
 */
export function suspicionByCharacter(collectedClueIds, clues, suspects) {
  const globalMax = globalMaxScore(clues, suspects);
  const out = {};
  for (const s of suspects) {
    const raw = rawScoreFor(collectedClueIds, s.id);
    out[s.id] = { raw, value: Math.min(1, raw / globalMax) };
  }
  return out;
}

/** Format a raw score as a clamped 2-digit roster badge string. */
export function badgeFor(raw) {
  const n = Math.max(0, Math.min(99, Math.round(raw)));
  return String(n).padStart(2, '0');
}
