/**
 * mystery.js — canonical Jotai state for Tread Office.
 *
 * Atoms are granular and pure. Persistence is handled by usePersistMystery(),
 * which must be called once from <GameShell> or <MysteryPage>.
 *
 * Telemetry events are emitted only from hooks, never from inside atoms.
 */

import { atom, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';

import * as saveLoad from '@/mystery/engine/saveLoad';
import * as telemetry from '@/mystery/engine/telemetry';
import { canOpenOverlay as canOpenOverlayFn } from '@/mystery/engine/canOpenOverlay';

// ---------------------------------------------------------------------------
// Bootstrap: read persisted state once at module load time.
// ---------------------------------------------------------------------------

const _loaded = saveLoad.load();

const _initial = _loaded ?? {
  mode: 'BOOT',
  overlay: null,
  clockMinutes: 0,
  currentRoom: 'coworking',
  flags: [],
  collectedClues: [],
  dialogue: null,
  examine: null,
  ending: null,
  objective: 'Identify who gutted the deck. Sunrise: 06:00.',
};

if (_loaded) {
  telemetry.event('hydrated', { source: 'localStorage' });
}

// ---------------------------------------------------------------------------
// Writeable atoms — export each individually.
// ---------------------------------------------------------------------------

/** @type {import('jotai').PrimitiveAtom<'BOOT'|'COLD_OPEN'|'FREE_ROAM'|'DIALOGUE'|'ACCUSATION'|'ENDING'>} */
export const modeAtom = atom(_initial.mode);

/** @type {import('jotai').PrimitiveAtom<'NOTEBOOK'|'LOCKER'|'SUSPECTS'|'EXAMINE'|null>} */
export const overlayAtom = atom(_initial.overlay);

/** @type {import('jotai').PrimitiveAtom<number>} */
export const clockMinutesAtom = atom(_initial.clockMinutes);

/** @type {import('jotai').PrimitiveAtom<string>} */
export const currentRoomAtom = atom(_initial.currentRoom ?? 'coworking');

/** @type {import('jotai').PrimitiveAtom<Set<string>>} */
export const flagsAtom = atom(
  new Set(Array.isArray(_initial.flags) ? _initial.flags : []),
);

/** @type {import('jotai').PrimitiveAtom<Array<{id: string, atMinute: number, source: string}>>} */
export const collectedCluesAtom = atom(
  Array.isArray(_initial.collectedClues) ? _initial.collectedClues : [],
);

/** @type {import('jotai').PrimitiveAtom<{storyId: string, currentText: string, choices: Array, history: Array}|null>} */
export const dialogueAtom = atom(_initial.dialogue ?? null);

/** @type {import('jotai').PrimitiveAtom<{hotspotId: string}|null>} */
export const examineAtom = atom(_initial.examine ?? null);

/** @type {import('jotai').PrimitiveAtom<'A'|'B'|'C'|'D'|null>} */
export const endingAtom = atom(_initial.ending ?? null);

/** @type {import('jotai').PrimitiveAtom<string>} */
export const objectiveAtom = atom(
  _initial.objective ?? 'Identify who gutted the deck. Sunrise: 06:00.',
);

// ---------------------------------------------------------------------------
// Derived (read-only) atoms — stubs; real logic lands in later phases.
// ---------------------------------------------------------------------------

/**
 * CharacterId → suspicion value 0..1.
 * Implemented by engine/suspicion.js in Phase 6.
 */
export const suspicionByCharacterAtom = atom(() => ({}));

/**
 * Characters currently present in the active room.
 * Implemented by engine/schedule.js in Phase 7.
 */
export const charactersInRoomAtom = atom(() => []);

/**
 * Characters who just left the active room.
 * Implemented by engine/schedule.js in Phase 7.
 */
export const justLeftFromRoomAtom = atom(() => []);

/**
 * Returns a curried predicate: (overlay: string|null) => boolean.
 * Uses the live modeAtom value so callers re-render on mode transitions.
 */
export const canOpenOverlayAtom = atom((get) => {
  const mode = get(modeAtom);
  return (overlay) => canOpenOverlayFn(mode, overlay);
});

// ---------------------------------------------------------------------------
// Persistence hook — call once from <GameShell> or <MysteryPage>.
// ---------------------------------------------------------------------------

/**
 * Subscribes to all writeable atoms and debounces saves to localStorage.
 * Must be called inside a component that is inside <Provider>.
 */
export function usePersistMystery() {
  const mode = useAtomValue(modeAtom);
  const overlay = useAtomValue(overlayAtom);
  const clockMinutes = useAtomValue(clockMinutesAtom);
  const currentRoom = useAtomValue(currentRoomAtom);
  const flags = useAtomValue(flagsAtom);
  const collectedClues = useAtomValue(collectedCluesAtom);
  const dialogue = useAtomValue(dialogueAtom);
  const examine = useAtomValue(examineAtom);
  const ending = useAtomValue(endingAtom);
  const objective = useAtomValue(objectiveAtom);

  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      saveLoad.save({
        mode,
        overlay,
        clockMinutes,
        currentRoom,
        flags: [...flags], // Set → Array for JSON serialization
        collectedClues,
        dialogue,
        examine,
        ending,
        objective,
      });
    }, 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode, overlay, clockMinutes, currentRoom, flags, collectedClues, dialogue, examine, ending, objective]);
}

// ---------------------------------------------------------------------------
// Telemetry hooks — emit events on state transitions without polluting atoms.
// ---------------------------------------------------------------------------

/**
 * Watches modeAtom and fires telemetry.event('mode_change', { from, to })
 * on every transition. Call once from <GameShell>.
 */
export function useTrackModeChanges() {
  const mode = useAtomValue(modeAtom);
  const prevRef = useRef(mode);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== mode) {
      telemetry.event('mode_change', { from: prev, to: mode });
      prevRef.current = mode;
    }
  }, [mode]);
}

/**
 * Watches overlayAtom and fires telemetry.event('overlay_change', { from, to })
 * on every transition. Call once from <GameShell>.
 */
export function useTrackOverlayChanges() {
  const overlay = useAtomValue(overlayAtom);
  const prevRef = useRef(overlay);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== overlay) {
      telemetry.event('overlay_change', { from: prev, to: overlay });
      prevRef.current = overlay;
    }
  }, [overlay]);
}
