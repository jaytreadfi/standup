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
import { START_MINUTE } from '@/mystery/engine/clock';
import { charactersInRoom } from '@/mystery/engine/schedule';
import { suspicionByCharacter } from '@/mystery/engine/suspicion';
import { characters, suspects } from '@/mystery/data/characters';
import { clues } from '@/mystery/data/clues';

// ---------------------------------------------------------------------------
// Bootstrap: read persisted state once at module load time.
// ---------------------------------------------------------------------------

const _loaded = saveLoad.load();

const _initial = _loaded ?? {
  mode: 'BOOT',
  overlay: null,
  clockMinutes: START_MINUTE,
  currentRoom: 'coworking',
  flags: [],
  collectedClues: [],
  dialogue: null,
  examine: null,
  ending: null,
  accusation: { suspectId: null, selectedClueIds: [] },
  objective: 'Yibo’s dead on the bullpen floor. Name the killer before David buries it — the board calls at 09:00 tomorrow.',
};

if (_loaded) {
  telemetry.event('hydrated', { source: 'localStorage' });
}

// ---------------------------------------------------------------------------
// Writeable atoms — export each individually.
// ---------------------------------------------------------------------------

/** @type {import('jotai').PrimitiveAtom<'BOOT'|'COLD_OPEN'|'FREE_ROAM'|'DIALOGUE'|'ACCUSATION'|'ENDING'>} */
export const modeAtom = atom(_initial.mode);

/** @type {import('jotai').PrimitiveAtom<'NOTEBOOK'|'SUSPECTS'|'EXAMINE'|null>} */
export const overlayAtom = atom(_initial.overlay);

/** @type {import('jotai').PrimitiveAtom<number>} */
export const clockMinutesAtom = atom(_initial.clockMinutes ?? START_MINUTE);

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

/** @type {import('jotai').PrimitiveAtom<{characterId: string, nodeId: string}|null>} */
export const dialogueAtom = atom(_initial.dialogue ?? null);

/** @type {import('jotai').PrimitiveAtom<{targetId: string, roomId: string}|null>} */
export const examineAtom = atom(_initial.examine ?? null);

/** @type {import('jotai').PrimitiveAtom<'A'|'B'|'C'|'D'|null>} */
export const endingAtom = atom(_initial.ending ?? null);

/** @type {import('jotai').PrimitiveAtom<{suspectId: string|null, selectedClueIds: string[]}>} */
export const accusationAtom = atom(
  _initial.accusation ?? { suspectId: null, selectedClueIds: [] },
);

/**
 * Whether the floor-plan MAP overlay is open. Navigation surface, distinct from
 * the info overlays (overlayAtom). Transient — not persisted.
 * @type {import('jotai').PrimitiveAtom<boolean>}
 */
export const mapOpenAtom = atom(false);

/** @type {import('jotai').PrimitiveAtom<string>} */
export const objectiveAtom = atom(
  _initial.objective ?? 'Yibo’s dead on the bullpen floor. Name the killer before David buries it — the board calls at 09:00 tomorrow.',
);

/**
 * Transient screen-reader announcement channels — NOT persisted, set by the
 * action layer and rendered into visually-hidden aria-live regions by the
 * <Announcer> in GameShell. `announceAtom` is polite (evidence logged, room
 * changes); `alertAtom` is assertive (the forced sunrise ending). Kept as two
 * atoms so routine and urgent messages never share a politeness.
 * @type {import('jotai').PrimitiveAtom<string>}
 */
export const announceAtom = atom('');
/** @type {import('jotai').PrimitiveAtom<string>} */
export const alertAtom = atom('');

// ---------------------------------------------------------------------------
// Derived (read-only) atoms — stubs; real logic lands in later phases.
// ---------------------------------------------------------------------------

/**
 * CharacterId → { raw, value } suspicion, derived from collected clues.
 */
export const suspicionByCharacterAtom = atom((get) =>
  suspicionByCharacter(
    get(collectedCluesAtom).map((c) => c.id),
    clues,
    suspects,
  ),
);

/**
 * Characters currently present in the active room (by schedule + clock).
 */
export const charactersInRoomAtom = atom((get) =>
  charactersInRoom(characters, get(clockMinutesAtom), get(currentRoomAtom)),
);

/**
 * Characters who just left the active room. Reserved for a later "just left"
 * hint; empty for this slice.
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
  const accusation = useAtomValue(accusationAtom);
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
        accusation,
        objective,
      });
    }, 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode, overlay, clockMinutes, currentRoom, flags, collectedClues, dialogue, examine, ending, accusation, objective]);
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
