import { describe, it, expect } from 'vitest';
import {
  formatClock,
  periodFor,
  isPastDeadline,
  START_MINUTE,
  DEADLINE_MINUTE,
  DAY_LENGTH_MINUTES,
  REAL_SECONDS_PER_DAY,
  GAME_MINUTES_PER_REAL_SECOND,
  CLOCK_TICK_MS,
} from '@/mystery/engine/clock';

describe('START_MINUTE', () => {
  it('equals 0 (03:10 AM — the night opens, David has called everyone back)', () => {
    expect(START_MINUTE).toBe(0);
  });

  it('formats as 03:10 AM', () => {
    expect(formatClock(START_MINUTE)).toBe('03:10 AM');
  });
});

describe('DEADLINE_MINUTE', () => {
  it('equals 170 (06:00 AM — The Great Room opens, 2h50m later)', () => {
    expect(DEADLINE_MINUTE).toBe(170);
  });

  it('formats as 06:00 AM, the dawn deadline', () => {
    expect(formatClock(DEADLINE_MINUTE)).toBe('06:00 AM');
  });
});

describe('real-time night window', () => {
  it('the night is 170 in-game minutes long (03:10 → 06:00)', () => {
    expect(DAY_LENGTH_MINUTES).toBe(170);
  });

  it('burns the night in ~24 real minutes of free-roam', () => {
    expect(REAL_SECONDS_PER_DAY).toBe(1440);
  });

  it('spreads 170 in-game minutes across the real-time budget', () => {
    expect(GAME_MINUTES_PER_REAL_SECOND).toBeCloseTo(170 / 1440, 6);
  });

  it('a full untouched playthrough crosses the deadline right at the budget', () => {
    const elapsed = START_MINUTE + GAME_MINUTES_PER_REAL_SECOND * REAL_SECONDS_PER_DAY;
    expect(elapsed).toBeCloseTo(DEADLINE_MINUTE, 6);
    expect(isPastDeadline(DEADLINE_MINUTE)).toBe(true);
  });

  it('ticks on a one-second cadence', () => {
    expect(CLOCK_TICK_MS).toBe(1000);
  });

  it('walks the scene art from night through pre-dawn into dawn', () => {
    expect(periodFor(START_MINUTE)).toBe('night');
    expect(periodFor(90)).toBe('dusk');
    expect(periodFor(150)).toBe('morning');
  });
});

describe('formatClock', () => {
  it('formats minute 0 as 03:10 AM', () => {
    expect(formatClock(0)).toBe('03:10 AM');
  });

  it('formats minute 20 as 03:30 AM', () => {
    expect(formatClock(20)).toBe('03:30 AM');
  });

  it('formats minute 50 as 04:00 AM', () => {
    expect(formatClock(50)).toBe('04:00 AM');
  });

  it('formats minute 110 as 05:00 AM', () => {
    expect(formatClock(110)).toBe('05:00 AM');
  });

  it('formats minute 170 as 06:00 AM (the deadline)', () => {
    expect(formatClock(170)).toBe('06:00 AM');
  });

  it('drops fractional minutes the ticker accumulates', () => {
    expect(formatClock(50.9)).toBe('04:00 AM');
  });

  it('shows a sentinel for a corrupt (non-finite) clock', () => {
    expect(formatClock(NaN)).toBe('--:-- --');
  });
});

describe('periodFor', () => {
  it('returns night at minute 0', () => {
    expect(periodFor(0)).toBe('night');
  });

  it('returns night at minute 89 (last night minute)', () => {
    expect(periodFor(89)).toBe('night');
  });

  it('returns dusk (pre-dawn) at minute 90', () => {
    expect(periodFor(90)).toBe('dusk');
  });

  it('returns dusk at minute 149 (last pre-dawn minute)', () => {
    expect(periodFor(149)).toBe('dusk');
  });

  it('returns morning (dawn) at minute 150', () => {
    expect(periodFor(150)).toBe('morning');
  });
});

describe('isPastDeadline', () => {
  it('returns false at minute 0 (night opens)', () => {
    expect(isPastDeadline(0)).toBe(false);
  });

  it('returns false at minute 169 (one before the deadline)', () => {
    expect(isPastDeadline(169)).toBe(false);
  });

  it('returns true at minute 170 (the deadline — doors open)', () => {
    expect(isPastDeadline(170)).toBe(true);
  });
});
