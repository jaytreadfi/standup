import { canOpenOverlay } from '@/mystery/engine/canOpenOverlay';

describe('canOpenOverlay', () => {
  // null overlay (close) is always permitted regardless of mode
  describe('null overlay — always true', () => {
    const modes = ['FREE_ROAM', 'DIALOGUE', 'BOOT', 'COLD_OPEN', 'ACCUSATION', 'ENDING'];
    for (const mode of modes) {
      it(`returns true for ${mode} × null`, () => {
        expect(canOpenOverlay(mode, null)).toBe(true);
      });
    }
  });

  // FREE_ROAM allows every overlay
  describe('FREE_ROAM mode', () => {
    it('allows NOTEBOOK', () => expect(canOpenOverlay('FREE_ROAM', 'NOTEBOOK')).toBe(true));
    it('allows LOCKER',   () => expect(canOpenOverlay('FREE_ROAM', 'LOCKER')).toBe(true));
    it('allows SUSPECTS', () => expect(canOpenOverlay('FREE_ROAM', 'SUSPECTS')).toBe(true));
    it('allows EXAMINE',  () => expect(canOpenOverlay('FREE_ROAM', 'EXAMINE')).toBe(true));
  });

  // DIALOGUE allows NOTEBOOK/LOCKER/SUSPECTS but not EXAMINE
  describe('DIALOGUE mode', () => {
    it('allows NOTEBOOK', () => expect(canOpenOverlay('DIALOGUE', 'NOTEBOOK')).toBe(true));
    it('allows LOCKER',   () => expect(canOpenOverlay('DIALOGUE', 'LOCKER')).toBe(true));
    it('allows SUSPECTS', () => expect(canOpenOverlay('DIALOGUE', 'SUSPECTS')).toBe(true));
    it('blocks EXAMINE',  () => expect(canOpenOverlay('DIALOGUE', 'EXAMINE')).toBe(false));
  });

  // Locked-out modes: BOOT, COLD_OPEN, ACCUSATION, ENDING — all false
  describe('locked-out modes block all overlays', () => {
    const blockedModes = ['BOOT', 'COLD_OPEN', 'ACCUSATION', 'ENDING'];
    const overlays = ['NOTEBOOK', 'LOCKER', 'SUSPECTS', 'EXAMINE'];

    for (const mode of blockedModes) {
      for (const overlay of overlays) {
        it(`blocks ${mode} × ${overlay}`, () => {
          expect(canOpenOverlay(mode, overlay)).toBe(false);
        });
      }
    }
  });

  // Unknown mode + valid overlay defaults to false
  describe('unknown mode', () => {
    it('returns false for unknown mode with NOTEBOOK', () => {
      expect(canOpenOverlay('UNKNOWN_MODE', 'NOTEBOOK')).toBe(false);
    });

    it('returns false for unknown mode with EXAMINE', () => {
      expect(canOpenOverlay('UNKNOWN_MODE', 'EXAMINE')).toBe(false);
    });
  });
});
