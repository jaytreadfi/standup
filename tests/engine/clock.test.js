import {
  TIME_COSTS,
  advance,
  formatClock,
  periodFor,
  isPastSunrise,
  SUNRISE_MINUTE,
} from '@/mystery/engine/clock';

describe('TIME_COSTS', () => {
  it('exports TIME_COSTS with the expected action costs', () => {
    expect(TIME_COSTS.TRAVEL).toBe(5);
    expect(TIME_COSTS.EXAMINE).toBe(10);
    expect(TIME_COSTS.DIALOGUE_NODE).toBe(15);
    expect(TIME_COSTS.OVERLAY_OPEN).toBe(0);
    expect(TIME_COSTS.ACCUSATION_OPEN).toBe(0);
  });
});

describe('SUNRISE_MINUTE', () => {
  it('equals 1410', () => {
    expect(SUNRISE_MINUTE).toBe(1410);
  });
});

describe('advance', () => {
  it('returns 5 for TRAVEL from minute 0', () => {
    expect(advance(0, 'TRAVEL')).toBe(5);
  });

  it('returns 10 for EXAMINE from minute 0', () => {
    expect(advance(0, 'EXAMINE')).toBe(10);
  });

  it('returns 15 for DIALOGUE_NODE from minute 0', () => {
    expect(advance(0, 'DIALOGUE_NODE')).toBe(15);
  });

  it('returns unchanged minutes for OVERLAY_OPEN (0 cost)', () => {
    expect(advance(75, 'OVERLAY_OPEN')).toBe(75);
  });

  it('returns unchanged minutes for ACCUSATION_OPEN (0 cost)', () => {
    expect(advance(0, 'ACCUSATION_OPEN')).toBe(0);
  });

  it('throws for an unrecognized action', () => {
    expect(() => advance(0, 'BOGUS')).toThrow();
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

  it('formats minute 1410 as 08:30 AM (sunrise threshold; 9 AM start + 23h30m)', () => {
    expect(formatClock(1410)).toBe('08:30 AM');
  });

  it('formats minute 1440 as 09:00 AM (full 24h cycle from 9 AM start)', () => {
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

describe('isPastSunrise', () => {
  it('returns false at minute 0', () => {
    expect(isPastSunrise(0)).toBe(false);
  });

  it('returns false at minute 1409 (one before sunrise)', () => {
    expect(isPastSunrise(1409)).toBe(false);
  });

  it('returns true at minute 1410 (sunrise)', () => {
    expect(isPastSunrise(1410)).toBe(true);
  });
});
