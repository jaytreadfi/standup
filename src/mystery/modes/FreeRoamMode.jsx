import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';

import SpriteFrame from '@/components/chrome/SpriteFrame';
import { useGameActions } from '@/mystery/state/actions';
import {
  currentRoomAtom,
  clockMinutesAtom,
  collectedCluesAtom,
  charactersInRoomAtom,
} from '@/mystery/state/mystery';
import { periodFor, formatClock, periodLabel } from '@/mystery/engine/clock';
import { roomById, rooms } from '@/mystery/data/rooms';
import { sceneUrl, portraitUrl } from '@/mystery/data/scenes';
import styles from './FreeRoamMode.module.css';

const EASE_QUART = [0.76, 0, 0.24, 1];

/**
 * FreeRoamMode — scene-primary point-and-click view.
 *
 * Full-bleed scene art for the current room + time period is the canvas.
 * EXAMINE reticles and TALK markers float over it; a MAP button bottom-right
 * opens the navigation overlay. Clicking empty scene does nothing — only the
 * interactive overlays carry pointer events.
 */
export default function FreeRoamMode() {
  const actions = useGameActions();

  const currentRoom = useAtomValue(currentRoomAtom);
  const clockMinutes = useAtomValue(clockMinutesAtom);
  const collectedClues = useAtomValue(collectedCluesAtom);
  const charactersHere = useAtomValue(charactersInRoomAtom);

  const room = roomById[currentRoom];
  const period = periodFor(clockMinutes);
  const label = room?.label ?? currentRoom?.toUpperCase() ?? 'OFFICE';
  const sceneKey = room?.sceneAssetByPeriod?.[period];
  const sceneSrc = sceneKey ? sceneUrl(sceneKey) : null;

  const collectedClueIds = new Set(collectedClues.map((c) => c.id));
  const examineTargets = room?.examineTargets ?? [];

  // Warm the cache for every room's art at the current period so travelling
  // (every room is adjacent) shows the scene instantly instead of popping in
  // after a multi-hundred-KB fetch. Re-runs when the period flips day/dusk/night.
  useEffect(() => {
    const imgs = rooms
      .map((r) => r.sceneAssetByPeriod?.[period])
      .filter(Boolean)
      .map((key) => sceneUrl(key))
      .filter(Boolean)
      .map((src) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
        return img;
      });
    return () => {
      imgs.forEach((img) => {
        img.src = '';
      });
    };
  }, [period]);

  return (
    <div className={styles.root} data-period={period}>
      {/* ---- Full-bleed scene art (or NO FEED placeholder) ---- */}
      {sceneSrc ? (
        <motion.img
          key={sceneSrc}
          src={sceneSrc}
          alt={`${label} — ${period}`}
          className={styles.scene}
          draggable="false"
          decoding="async"
          initial={{ opacity: 0, scale: 1.015 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: EASE_QUART }}
        />
      ) : (
        <div className={styles.noFeed} role="img" aria-label={`${label} — no feed`}>
          <span className={styles.noFeedRoom}>{label}</span>
          <span className={styles.noFeedTag}>NO FEED</span>
        </div>
      )}

      {/* ---- Vignette / scrim so HUD text stays legible ---- */}
      <div className={styles.scrim} aria-hidden="true" />

      {/* ---- Prominent scene clock, top-right ---- */}
      <div
        className={styles.sceneClock}
        data-period={period}
        role="timer"
        aria-label={`Time ${formatClock(clockMinutes)}, ${periodLabel(period)}`}
      >
        <span className={styles.clockTime}>{formatClock(clockMinutes)}</span>
        <span className={styles.clockPeriod}>{periodLabel(period)}</span>
      </div>

      {/* ---- EXAMINE hotspots ---- */}
      <div className={styles.hotspotLayer}>
        {examineTargets.map((target, i) => {
          const logged = target.clueId ? collectedClueIds.has(target.clueId) : false;
          return (
            <motion.button
              key={target.id}
              type="button"
              className={styles.hotspot}
              data-logged={logged || undefined}
              style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}
              onClick={() => actions.openExamine(target.id)}
              aria-label={`Examine ${target.label}${logged ? ' (logged)' : ''}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.28, delay: 0.12 + i * 0.07, ease: EASE_QUART }}
            >
              <span className={styles.hintBox} aria-hidden="true">
                {logged ? '✓' : '?'}
              </span>
              <span className={styles.hotspotLabel}>
                {logged ? 'LOGGED · ' : ''}
                {target.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ---- TALK markers for characters present ---- */}
      <div className={styles.talkLayer}>
        {charactersHere.map((char, i) => {
          const count = charactersHere.length;
          // Spread evenly across the lower third; single marker sits center.
          const frac = count === 1 ? 0.5 : 0.18 + (i * (0.64 / (count - 1)));
          const portrait = portraitUrl(char.id);
          return (
            <motion.button
              key={char.id}
              type="button"
              className={styles.talkMarker}
              style={{ left: `${frac * 100}%` }}
              onClick={() => actions.startDialogue(char.id)}
              aria-label={`Talk to ${char.name}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16 + i * 0.08, ease: EASE_QUART }}
            >
              <span className={styles.talkAvatar} aria-hidden="true">
                <span className={styles.talkPulse} />
                {portrait ? (
                  <SpriteFrame
                    src={portrait}
                    cols={3}
                    rows={3}
                    col={0}
                    row={0}
                    size={56}
                    bordered={false}
                  />
                ) : (
                  <span className={styles.talkGlyph}>◆</span>
                )}
              </span>
              <span className={styles.talkName}>{char.name}</span>
              <span className={styles.talkVerb}>TALK</span>
            </motion.button>
          );
        })}
      </div>

      {/* ---- CURRENT LOCATION caption, bottom-left ---- */}
      <div className={styles.locationBlock}>
        <span className={styles.locationLabel}>
          <span className={styles.locationGlyph}>▸</span> CURRENT LOCATION
        </span>
        <span className={styles.locationValue}>{label}</span>
      </div>

      {/* ---- MAP button, bottom-right ---- */}
      <motion.button
        type="button"
        className={styles.mapButton}
        onClick={() => actions.openMap()}
        aria-label="Open floor map"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: EASE_QUART }}
      >
        <span className={styles.mapGlyph} aria-hidden="true">▸</span> MAP
      </motion.button>
    </div>
  );
}
