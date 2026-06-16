/**
 * canOpenOverlay — overlay permission lookup for Tread Office.
 * Pure function. No imports.
 *
 * Modes:   'BOOT' | 'COLD_OPEN' | 'FREE_ROAM' | 'DIALOGUE' | 'ACCUSATION' | 'ENDING'
 * Overlays: 'NOTEBOOK' | 'SUSPECTS' | 'EXAMINE' | null
 */

/** @type {{ [mode: string]: { [overlay: string]: boolean } }} */
export const OVERLAY_RULES = {
  FREE_ROAM: {
    NOTEBOOK: true,
    SUSPECTS: true,
    EXAMINE:  true,
  },
  DIALOGUE: {
    NOTEBOOK: true,
    SUSPECTS: true,
    EXAMINE:  false, // cannot examine while in conversation
  },
  BOOT: {
    NOTEBOOK: false,
    SUSPECTS: false,
    EXAMINE:  false,
  },
  COLD_OPEN: {
    NOTEBOOK: false,
    SUSPECTS: false,
    EXAMINE:  false,
  },
  ACCUSATION: {
    NOTEBOOK: false,
    SUSPECTS: false,
    EXAMINE:  false,
  },
  ENDING: {
    NOTEBOOK: false,
    SUSPECTS: false,
    EXAMINE:  false,
  },
};

/**
 * Returns true if the given overlay can be opened in the given mode.
 * A null overlay (closing) is always permitted.
 * Unknown mode/overlay combinations default to false (defensive).
 *
 * @param {string} mode - Current game mode.
 * @param {string|null} overlay - Overlay to open, or null to close.
 * @returns {boolean}
 */
export function canOpenOverlay(mode, overlay) {
  if (overlay === null) return true;

  const modeRules = OVERLAY_RULES[mode];
  if (modeRules === undefined) return false;

  return modeRules[overlay] ?? false;
}
