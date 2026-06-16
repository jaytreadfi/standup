/**
 * MapOverlay.jsx — redesigned schematic floor-plan navigation overlay.
 *
 * Opens over everything when mapOpenAtom is true (the lead mounts it gated on
 * that atom; this component assumes it is only rendered while open). The old CAD
 * floor-01.png is dropped — rooms are drawn as labeled schematic BLOCKS from
 * room.schematic {x,y,w,h} fractions inside a fixed 4:3 stage.
 *
 * Reads state via useAtomValue; mutates ONLY through the action layer.
 */

import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

import TerminalChrome from '@/components/chrome/TerminalChrome';
import { useGameActions } from '@/mystery/state/actions';
import { useDialogFocus } from './useDialogFocus';
import {
  currentRoomAtom,
  clockMinutesAtom,
  collectedCluesAtom,
} from '@/mystery/state/mystery';
import { rooms } from '@/mystery/data/rooms';
import { sceneUrl } from '@/mystery/data/scenes';
import { characters } from '@/mystery/data/characters';
import { roomByCharacter } from '@/mystery/engine/schedule';
import { formatClock, periodFor, periodLabel } from '@/mystery/engine/clock';

import styles from './MapOverlay.module.css';

export default function MapOverlay() {
  const actions = useGameActions();
  const panelRef = useDialogFocus();
  const currentRoom = useAtomValue(currentRoomAtom);
  const clockMinutes = useAtomValue(clockMinutesAtom);
  const collectedClues = useAtomValue(collectedCluesAtom);

  const period = periodFor(clockMinutes);

  // Close on ESC for keyboard parity with the on-screen [ ESC ] CLOSE button.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') actions.closeMap();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  // Who is in which room right now (by schedule + clock).
  const occupancy = roomByCharacter(characters, clockMinutes);
  const headcount = {};
  for (const c of characters) {
    const r = occupancy[c.id];
    if (r) headcount[r] = (headcount[r] ?? 0) + 1;
  }

  // Which clue ids the player has already collected (for found / un-found marks).
  const collectedIds = new Set(collectedClues.map((c) => c.id));

  const handleScrim = () => actions.closeMap();
  // Stop scrim-close when interacting with the framed panel itself.
  const stop = (e) => e.stopPropagation();

  return (
    <motion.div
      className={styles.scrim}
      role="dialog"
      aria-modal="true"
      aria-label="Floor plan navigation"
      onClick={handleScrim}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        ref={panelRef}
        className={styles.panel}
        onClick={stop}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: [0.76, 0, 0.24, 1] }}
      >
        <TerminalChrome label="Floor Plan · 01" ghostNumber="01">
          <div className={styles.inner} data-period={period}>
            <div className={styles.header}>
              <span className={styles.kicker}>
                <span className={styles.kickerGlyph} aria-hidden="true">▸</span>
                NAVIGATION · SELECT DESTINATION
              </span>
              <span className={styles.clock}>
                {formatClock(clockMinutes)} · {periodLabel(period)}
              </span>
            </div>

            <div className={styles.stageWrap}>
              <div className={styles.stage} aria-hidden={false}>
                {/* faint schematic grid backdrop */}
                <div className={styles.grid} aria-hidden="true" />

                {rooms.map((room) => {
                  const s = room.schematic;
                  if (!s) return null;

                  const isHere = room.id === currentRoom;
                  const people = headcount[room.id] ?? 0;

                  // Evidence: count examine targets that grant a clue, split
                  // by whether that clue is already collected.
                  const clueTargets = (room.examineTargets ?? []).filter((t) => t.clueId);
                  const total = clueTargets.length;
                  const found = clueTargets.filter((t) => collectedIds.has(t.clueId)).length;
                  const hasUnfound = found < total;

                  // The room's scene art for the current period, shown as the
                  // block's backdrop so the map reads as the rooms themselves.
                  const sceneSrc = sceneUrl(room.sceneAssetByPeriod?.[period]);

                  return (
                    <button
                      key={room.id}
                      type="button"
                      className={styles.block}
                      data-here={isHere || undefined}
                      data-unfound={hasUnfound || undefined}
                      style={{
                        left: `${s.x * 100}%`,
                        top: `${s.y * 100}%`,
                        width: `${s.w * 100}%`,
                        height: `${s.h * 100}%`,
                      }}
                      onClick={() => actions.travelTo(room.id)}
                      aria-label={
                        `${room.label}. ${people} person${people === 1 ? '' : 's'}. ` +
                        (total === 0
                          ? 'No evidence here.'
                          : `${found} of ${total} clue${total === 1 ? '' : 's'} found.`) +
                        (isHere ? ' You are here.' : ' Move here.')
                      }
                      aria-current={isHere ? 'location' : undefined}
                    >
                      {sceneSrc && (
                        <img
                          src={sceneSrc}
                          alt=""
                          aria-hidden="true"
                          className={styles.blockScene}
                          draggable="false"
                        />
                      )}
                      <span className={styles.blockScrim} aria-hidden="true" />

                      <span className={styles.blockHead}>
                        <span className={styles.blockShort}>{room.short}</span>
                        {total > 0 && (
                          <span
                            className={styles.evidence}
                            data-unfound={hasUnfound || undefined}
                            aria-hidden="true"
                          >
                            {hasUnfound ? '◦' : '●'}
                          </span>
                        )}
                      </span>

                      <span className={styles.blockLabel}>{room.label}</span>

                      {isHere && (
                        <span className={styles.here}>
                          <span className={styles.hereDot} aria-hidden="true" />
                          YOU ARE HERE
                        </span>
                      )}

                      {!isHere && (
                        <span className={styles.cost} aria-hidden="true">▸ MOVE</span>
                      )}

                      <span className={styles.dots} aria-hidden="true">
                        {people === 0 ? (
                          <span className={styles.empty}>—</span>
                        ) : people <= 4 ? (
                          Array.from({ length: people }).map((_, i) => (
                            <span key={i} className={styles.dot} />
                          ))
                        ) : (
                          <span className={styles.dotCount}>{people} PERSONS</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.footer}>
              <ul className={styles.legend}>
                <li className={styles.legendItem}>
                  <span className={styles.legendSwatchHere} aria-hidden="true" />
                  YOU ARE HERE
                </li>
                <li className={styles.legendItem}>
                  <span className={styles.dot} aria-hidden="true" />
                  PERSON ON FLOOR
                </li>
                <li className={styles.legendItem}>
                  <span className={styles.legendGlyphUnfound} aria-hidden="true">◦</span>
                  EVIDENCE UNFOUND
                </li>
                <li className={styles.legendItem}>
                  <span className={styles.legendGlyphFound} aria-hidden="true">●</span>
                  CLEARED
                </li>
              </ul>

              <button
                type="button"
                className={styles.close}
                onClick={() => actions.closeMap()}
              >
                <span className={styles.closeKey}>[ ESC ]</span> CLOSE
              </button>
            </div>
          </div>
        </TerminalChrome>
      </motion.div>
    </motion.div>
  );
}
