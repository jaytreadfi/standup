import { describe, it, expect } from 'vitest';
import { resolveEnding, endings } from '@/mystery/data/endings';
import { clues, clueById, TRUE_CULPRIT, PATSY, WEIGHT_VALUE } from '@/mystery/data/clues';
import { suspects, characters, victim } from '@/mystery/data/characters';

const suspectIds = new Set(suspects.map((s) => s.id));

describe('case wiring — "Last One Out"', () => {
  it('the killer is David and is an accusable suspect', () => {
    expect(TRUE_CULPRIT).toBe('david');
    expect(suspectIds.has('david')).toBe(true);
  });

  it('the victim is Sam and is excluded from the suspect board', () => {
    expect(victim.id).toBe('sam');
    expect(victim.dead).toBe(true);
    expect(suspectIds.has('sam')).toBe(false);
  });

  it('Jamie has been removed entirely', () => {
    expect(characters.find((c) => c.id === 'jamie')).toBeUndefined();
  });

  it('every clue implicates a real, living suspect', () => {
    for (const c of clues) {
      for (const id of c.evidenceAgainst) {
        expect(suspectIds.has(id)).toBe(true);
      }
    }
  });

  it('the case is solvable: at least two CORE/HEAVY clues implicate the killer', () => {
    const strongVsKiller = clues.filter(
      (c) => WEIGHT_VALUE[c.weight] >= WEIGHT_VALUE.CORE && c.evidenceAgainst.includes(TRUE_CULPRIT),
    );
    expect(strongVsKiller.length).toBeGreaterThanOrEqual(2);
  });

  it('the patsy exists and carries a red-herring clue, but is not the killer', () => {
    expect(PATSY).toBe('poncho');
    expect(suspectIds.has(PATSY)).toBe(true);
    expect(PATSY).not.toBe(TRUE_CULPRIT);
    const herring = clues.filter((c) => c.evidenceAgainst.includes(PATSY));
    expect(herring.length).toBeGreaterThanOrEqual(1);
    // the patsy is never implicated by a strong clue
    expect(herring.every((c) => WEIGHT_VALUE[c.weight] < WEIGHT_VALUE.CORE)).toBe(true);
  });
});

describe('resolveEnding', () => {
  it('A — name David with ≥2 strong clues against him', () => {
    expect(resolveEnding({ suspectId: 'david', selectedClueIds: ['shredded-letter', 'scrubbed-badge', 'the-body'] }))
      .toBe(endings.A);
  });

  it('B — name David but with fewer than 2 strong clues against him', () => {
    // the-body is CORE-vs-david; the other two are a weak herring + a non-david clue
    expect(resolveEnding({ suspectId: 'david', selectedClueIds: ['the-body', 'owed-note', 'ching-motive'] }))
      .toBe(endings.B);
  });

  it('C — accuse the patsy Poncho (steered wrong), regardless of clues', () => {
    expect(resolveEnding({ suspectId: 'poncho', selectedClueIds: ['shredded-letter', 'scrubbed-badge', 'the-body'] }))
      .toBe(endings.C);
  });

  it('C — accuse any other innocent', () => {
    expect(resolveEnding({ suspectId: 'ching', selectedClueIds: ['ching-motive'] })).toBe(endings.C);
  });

  it('ignores unknown clue ids when scoring', () => {
    expect(resolveEnding({ suspectId: 'david', selectedClueIds: ['nope', 'shredded-letter', 'scrubbed-badge'] }))
      .toBe(endings.A);
    // the two real strong clues still carry it
    expect(clueById['shredded-letter'].evidenceAgainst).toContain('david');
  });
});
