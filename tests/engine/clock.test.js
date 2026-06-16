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
  it('equals 0 (09:00 AM — the workday opens)', () => {
    expect(START_MINUTE).toBe(0);
  });

  it('formats as 09:00 AM', () => {
    expect(formatClock(START_MINUTE)).toBe('09:00 AM');
  });
});

describe('DEADLINE_MINUTE', () => {
  it('equals 1440 (09:00 AM next day — 24 hours later)', () => {
    expect(DEADLINE_MINUTE).toBe(1440);
  });

  it('formats as 09:00 AM, matching the board-call deadline string', () => {
    expect(formatClock(DEADLINE_MINUTE)).toBe('09:00 AM');
  });
});

describe('real-time day window', () => {
  it('the day is a full 24 hours long (09:00 → 09:00 next day)', () => {
    expect(DAY_LENGTH_MINUTES).toBe(1440);
  });

  it('burns the day in ~24 real minutes', () => {
    expect(REAL_SECONDS_PER_DAY).toBe(1440);
  });

  it('advances exactly one in-game minute per real second', () => {
    expect(GAME_MINUTES_PER_REAL_SECOND).toBe(1);
  });

  it('a full untouched playthrough crosses the deadline right at the budget', () => {
    const elapsed = START_MINUTE + GAME_MINUTES_PER_REAL_SECOND * REAL_SECONDS_PER_DAY;
    expect(elapsed).toBe(DEADLINE_MINUTE);
    expect(isPastDeadline(elapsed)).toBe(true);
  });

  it('ticks on a one-second cadence', () => {
    expect(CLOCK_TICK_MS).toBe(1000);
  });

  it('walks the scene art from morning into night across the day', () => {
    expect(periodFor(START_MINUTE)).toBe('morning');
    expect(periodFor(360)).toBe('dusk');
    expect(periodFor(600)).toBe('night');
  });
});

describe('formatClock', () => {
  it('formats minute 0 as 09:00 AM', () => {
    expect(formatClock(0)).toBe('09:00 AM');
  });

  it('formats minute 75 as 10:15 AM', () => {
    expect(formatClock(75)).toBe('10:15 AM');
  });

  it('formats minute 180 as 12:00 PM (noon)', () => {
    expect(formatClock(180)).toBe('12:00 PM');
  });

  it('formats minute 240 as 01:00 PM', () => {
    expect(formatClock(240)).toBe('01:00 PM');
  });

  it('formats minute 360 as 03:00 PM', () => {
    expect(formatClock(360)).toBe('03:00 PM');
  });

  it('formats minute 900 as 12:00 AM (midnight)', () => {
    expect(formatClock(900)).toBe('12:00 AM');
  });

  it('formats minute 1200 as 05:00 AM (next day, deep in the night)', () => {
    expect(formatClock(1200)).toBe('05:00 AM');
  });

  it('formats minute 1440 as 09:00 AM (full 24h cycle; the deadline)', () => {
    expect(formatClock(1440)).toBe('09:00 AM');
  });
});

describe('periodFor', () => {
  it('returns morning at minute 0', () => {
    expect(periodFor(0)).toBe('morning');
  });

  it('returns morning at minute 359 (last morning minute)', () => {
    expect(periodFor(359)).toBe('morning');
  });

  it('returns dusk at minute 360 (dusk start)', () => {
    expect(periodFor(360)).toBe('dusk');
  });

  it('returns dusk at minute 599 (last dusk minute)', () => {
    expect(periodFor(599)).toBe('dusk');
  });

  it('returns night at minute 600 (night start)', () => {
    expect(periodFor(600)).toBe('night');
  });
});

describe('isPastDeadline', () => {
  it('returns false at minute 0 (workday start)', () => {
    expect(isPastDeadline(0)).toBe(false);
  });

  it('returns false at minute 1439 (one before the deadline)', () => {
    expect(isPastDeadline(1439)).toBe(false);
  });

  it('returns true at minute 1440 (the deadline)', () => {
    expect(isPastDeadline(1440)).toBe(true);
  });
});
