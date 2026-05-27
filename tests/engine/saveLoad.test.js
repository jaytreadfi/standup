import {
  save,
  load,
  reset,
  recordEnding,
  reachedEndings,
  STATE_KEY,
  ENDINGS_KEY,
  SCHEMA_VERSION,
} from '@/mystery/engine/saveLoad';

describe('saveLoad', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('load() returns null when storage is empty', () => {
    expect(load()).toBeNull();
  });

  it('save() then load() round-trips state correctly', () => {
    save({ mode: 'FREE_ROAM' });
    expect(load()).toEqual({ mode: 'FREE_ROAM' });
  });

  it('save() writes a versioned envelope to localStorage', () => {
    save({ mode: 'FREE_ROAM' });
    const raw = localStorage.getItem(STATE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed.v).toBe(SCHEMA_VERSION);
    expect(parsed.state).toEqual({ mode: 'FREE_ROAM' });
  });

  it('load() returns null and removes key on schema version mismatch', () => {
    localStorage.setItem(STATE_KEY, JSON.stringify({ v: 99, state: {} }));
    expect(load()).toBeNull();
    expect(localStorage.getItem(STATE_KEY)).toBeNull();
  });

  it('reset() removes STATE_KEY but leaves ENDINGS_KEY untouched', () => {
    save({ mode: 'FREE_ROAM' });
    localStorage.setItem(ENDINGS_KEY, JSON.stringify({ v: 1, reached: ['A'] }));
    reset();
    expect(localStorage.getItem(STATE_KEY)).toBeNull();
    expect(localStorage.getItem(ENDINGS_KEY)).not.toBeNull();
  });

  it('recordEnding() then reachedEndings() returns the recorded ID', () => {
    recordEnding('A');
    expect(reachedEndings()).toEqual(['A']);
  });

  it('recordEnding() deduplicates repeated IDs', () => {
    recordEnding('A');
    recordEnding('A');
    expect(reachedEndings()).toEqual(['A']);
  });

  it('recordEnding() preserves insertion order across multiple IDs', () => {
    recordEnding('A');
    recordEnding('C');
    expect(reachedEndings()).toEqual(['A', 'C']);
  });

  it('reachedEndings() returns empty array when storage is empty', () => {
    expect(reachedEndings()).toEqual([]);
  });

  it('load() returns null and does not throw on corrupt JSON in STATE_KEY', () => {
    localStorage.setItem(STATE_KEY, 'not-json{{{');
    expect(() => load()).not.toThrow();
    expect(load()).toBeNull();
  });
});
