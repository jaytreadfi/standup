/**
 * actions.js — the single action layer (game "verbs").
 *
 * Every interactive view calls into useGameActions() rather than poking atoms
 * directly, so all clock costs, telemetry, sunrise checks, and mode transitions
 * live in one place. Uses jotai's store.get/set inside callbacks to always read
 * fresh state (no stale closures).
 */

import { useMemo } from 'react';
import { useStore } from 'jotai';

import * as clock from '@/mystery/engine/clock';
import * as telemetry from '@/mystery/engine/telemetry';
import * as saveLoad from '@/mystery/engine/saveLoad';
import { canOpenOverlay } from '@/mystery/engine/canOpenOverlay';

import { roomById, examineTargetById } from '@/mystery/data/rooms';
import { clueById } from '@/mystery/data/clues';
import { dialogue as dialogueData, COLD_OPEN_CHARACTER } from '@/mystery/data/dialogue';
import { resolveEnding } from '@/mystery/data/endings';

import {
  modeAtom,
  overlayAtom,
  mapOpenAtom,
  clockMinutesAtom,
  currentRoomAtom,
  flagsAtom,
  collectedCluesAtom,
  dialogueAtom,
  examineAtom,
  endingAtom,
  accusationAtom,
  objectiveAtom,
} from '@/mystery/state/mystery';

const MAX_ACCUSATION_CLUES = 3;

// You must have logged at least this many clues before the accusation screen is
// reachable — otherwise CONFIRM (which needs 3 selected) is permanently
// unreachable and the player is dropped onto a dead-end screen.
const MIN_CLUES_TO_ACCUSE = MAX_ACCUSATION_CLUES;

const DEFAULT_OBJECTIVE = 'Identify who gutted the deck. Sunrise: 06:00.';

const FRESH_STATE = {
  mode: 'COLD_OPEN',
  overlay: null,
  mapOpen: false,
  clockMinutes: 0,
  currentRoom: 'coworking',
  flags: new Set(),
  collectedClues: [],
  dialogue: null,
  examine: null,
  ending: null,
  accusation: { suspectId: null, selectedClueIds: [] },
  objective: DEFAULT_OBJECTIVE,
};

export function useGameActions() {
  const store = useStore();

  return useMemo(
    () => {
      const get = (a) => store.get(a);
      const set = (a, v) => store.set(a, v);

      /** Advance the clock by an action's cost and force the ending at sunrise. */
      function advanceClock(action) {
        const next = clock.advance(get(clockMinutesAtom), action);
        set(clockMinutesAtom, next);
        if (clock.isPastSunrise(next) && get(modeAtom) !== 'ENDING') {
          forceEnding('D');
        }
        return next;
      }

      function forceEnding(id) {
        set(endingAtom, id);
        set(overlayAtom, null);
        set(mapOpenAtom, false);
        set(dialogueAtom, null);
        set(examineAtom, null);
        set(modeAtom, 'ENDING');
        saveLoad.recordEnding(id);
        telemetry.event(telemetry.EVENT_NAMES.ENDING_REACHED, { id });
      }

      /** Append a clue if new. Returns true when newly collected. */
      function collectClue(clueId, source) {
        if (!clueById[clueId]) return false;
        const current = get(collectedCluesAtom);
        if (current.some((c) => c.id === clueId)) return false;
        set(collectedCluesAtom, [
          ...current,
          { id: clueId, atMinute: get(clockMinutesAtom), source: source ?? null },
        ]);
        telemetry.event(telemetry.EVENT_NAMES.CLUE_COLLECTED, { id: clueId, source });
        return true;
      }

      function setFlag(name) {
        const flags = get(flagsAtom);
        if (flags.has(name)) return;
        const next = new Set(flags);
        next.add(name);
        set(flagsAtom, next);
        telemetry.event(telemetry.EVENT_NAMES.FLAG_SET, { name });
      }

      return {
        // ---- navigation ----
        openMap() {
          if (get(modeAtom) !== 'FREE_ROAM') return;
          // Mutually exclusive with the info/examine overlays — never stack scrims.
          set(overlayAtom, null);
          set(examineAtom, null);
          set(mapOpenAtom, true);
        },
        closeMap() {
          set(mapOpenAtom, false);
        },
        travelTo(roomId) {
          set(mapOpenAtom, false);
          if (!roomById[roomId] || roomId === get(currentRoomAtom)) return;
          const from = get(currentRoomAtom);
          set(currentRoomAtom, roomId);
          advanceClock('TRAVEL');
          telemetry.event(telemetry.EVENT_NAMES.ROOM_ENTER, { from, to: roomId });
        },

        // ---- examine ----
        openExamine(targetId) {
          const target = examineTargetById[targetId];
          if (!target) return;
          if (!canOpenOverlay(get(modeAtom), 'EXAMINE')) return;
          set(examineAtom, { targetId, roomId: target.roomId });
          set(overlayAtom, 'EXAMINE');
          // First inspection of an EVIDENCE hotspot costs time and yields the
          // clue; re-reading it is free. Flavor-only hotspots (no clueId) are
          // always free to read — ambient detail shouldn't be punished with a
          // 30-minute penalty for zero payoff.
          const firstTime = !get(flagsAtom).has(`seen:${targetId}`);
          if (firstTime) {
            setFlag(`seen:${targetId}`);
            if (target.clueId) {
              advanceClock('EXAMINE');
              collectClue(target.clueId, target.roomId);
            }
          }
        },
        closeExamine() {
          set(examineAtom, null);
          set(overlayAtom, null);
        },

        // ---- info overlays (notebook / suspects) ----
        openOverlay(name) {
          if (!canOpenOverlay(get(modeAtom), name)) return;
          // Mutually exclusive with the MAP overlay — never stack scrims.
          set(mapOpenAtom, false);
          set(overlayAtom, name);
        },
        closeOverlay() {
          set(overlayAtom, null);
        },

        // ---- dialogue ----
        startDialogue(characterId) {
          const tree = dialogueData[characterId];
          if (!tree) return;
          set(overlayAtom, null);
          set(mapOpenAtom, false);
          set(dialogueAtom, { characterId, nodeId: tree.start });
          set(modeAtom, 'DIALOGUE');
          telemetry.event(telemetry.EVENT_NAMES.MODE_CHANGE, { to: 'DIALOGUE', characterId });
        },
        chooseDialogue(choice) {
          const d = get(dialogueAtom);
          if (!d) return;
          telemetry.event(telemetry.EVENT_NAMES.DIALOGUE_CHOICE, {
            characterId: d.characterId,
            label: choice?.label,
          });
          if (choice?.setFlag) setFlag(choice.setFlag);
          if (choice?.grantClue) collectClue(choice.grantClue, d.characterId);
          advanceClock('DIALOGUE_NODE');
          // If that clock tick crossed sunrise, advanceClock already forced the
          // timeout ending (mode → ENDING, dialogue cleared). Bail before the
          // writes below would clobber it back to FREE_ROAM / a stale node.
          if (get(modeAtom) === 'ENDING') return;
          if (choice?.to) {
            set(dialogueAtom, { characterId: d.characterId, nodeId: choice.to });
          } else {
            set(dialogueAtom, null);
            set(modeAtom, 'FREE_ROAM');
          }
        },
        endDialogue() {
          set(dialogueAtom, null);
          set(modeAtom, 'FREE_ROAM');
        },

        // ---- cold open ----
        beginShift() {
          set(modeAtom, 'FREE_ROAM');
        },

        // ---- accusation ----
        beginAccusation() {
          // Guard: you can only enter the accusation screen once you have enough
          // evidence to actually file a 3-clue accusation. Otherwise CONFIRM is
          // unreachable and the screen is a dead end (CANCEL the only way out).
          if (get(collectedCluesAtom).length < MIN_CLUES_TO_ACCUSE) return;
          set(overlayAtom, null);
          set(mapOpenAtom, false);
          set(accusationAtom, { suspectId: null, selectedClueIds: [] });
          set(modeAtom, 'ACCUSATION');
        },
        setAccusedSuspect(suspectId) {
          set(accusationAtom, { ...get(accusationAtom), suspectId });
        },
        toggleAccusationClue(clueId) {
          const acc = get(accusationAtom);
          const has = acc.selectedClueIds.includes(clueId);
          let next;
          if (has) {
            next = acc.selectedClueIds.filter((id) => id !== clueId);
          } else {
            if (acc.selectedClueIds.length >= MAX_ACCUSATION_CLUES) return;
            next = [...acc.selectedClueIds, clueId];
          }
          set(accusationAtom, { ...acc, selectedClueIds: next });
        },
        confirmAccusation() {
          const acc = get(accusationAtom);
          telemetry.event(telemetry.EVENT_NAMES.ACCUSATION_ATTEMPT, acc);
          const result = resolveEnding(acc);
          forceEnding(result.id);
        },
        cancelAccusation() {
          set(modeAtom, 'FREE_ROAM');
        },

        // ---- lifecycle ----
        restart() {
          saveLoad.reset();
          set(modeAtom, FRESH_STATE.mode);
          set(overlayAtom, FRESH_STATE.overlay);
          set(mapOpenAtom, FRESH_STATE.mapOpen);
          set(clockMinutesAtom, FRESH_STATE.clockMinutes);
          set(currentRoomAtom, FRESH_STATE.currentRoom);
          set(flagsAtom, new Set());
          set(collectedCluesAtom, []);
          set(dialogueAtom, FRESH_STATE.dialogue);
          set(examineAtom, FRESH_STATE.examine);
          set(endingAtom, FRESH_STATE.ending);
          set(accusationAtom, { suspectId: null, selectedClueIds: [] });
          set(objectiveAtom, FRESH_STATE.objective);
        },

        // expose for views that need ad-hoc effects
        collectClue,
        setFlag,
      };
    },
    [store],
  );
}

export { COLD_OPEN_CHARACTER };
