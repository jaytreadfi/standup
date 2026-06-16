import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';

import TerminalChrome from '@/components/chrome/TerminalChrome';
import SpriteFrame from '@/components/chrome/SpriteFrame';

import { useGameActions } from '@/mystery/state/actions';
import {
  accusationAtom,
  collectedCluesAtom,
  suspicionByCharacterAtom,
} from '@/mystery/state/mystery';
import { suspects } from '@/mystery/data/characters';
import { clueById } from '@/mystery/data/clues';
import { badgeFor } from '@/mystery/engine/suspicion';

import davidPortrait from '@/assets/portraits/david.png';
import samPortrait from '@/assets/portraits/sam.png';
import jayPortrait from '@/assets/portraits/jay.png';
import peemPortrait from '@/assets/portraits/peem.png';
import denaPortrait from '@/assets/portraits/dena.png';
import ponchoPortrait from '@/assets/portraits/poncho.png';
import chingPortrait from '@/assets/portraits/ching.png';
import jamiePortrait from '@/assets/portraits/jamie.png';

import styles from './AccusationMode.module.css';

/**
 * AccusationMode — the "name them" screen (modeAtom === 'ACCUSATION').
 *
 * Top: SUSPECT BOARD — pick exactly one suspect.
 * Bottom: EVIDENCE — pick exactly three collected clues to enter into the record.
 * Confirm is one-shot, no take-backs; locked until 1 suspect + 3 clues are set.
 */

const PORTRAITS = {
  david: davidPortrait,
  sam: samPortrait,
  jay: jayPortrait,
  peem: peemPortrait,
  dena: denaPortrait,
  poncho: ponchoPortrait,
  ching: chingPortrait,
  jamie: jamiePortrait,
};

const REQUIRED_CLUES = 3;

const EASE_QUART = [0.76, 0, 0.24, 1];

/**
 * Suspicion tier from a raw score — mirrors RosterPanel's thresholds so the
 * board and the watchlist agree on who is hot.
 *  ≤5  = mute   (low / dormant)
 *  6-8 = warn   (rising)
 *  ≥9  = danger (acute)
 */
function suspicionTier(raw) {
  if (raw >= 9) return 'danger';
  if (raw >= 6) return 'warn';
  return 'mute';
}

export default function AccusationMode() {
  const actions = useGameActions();
  const { suspectId, selectedClueIds } = useAtomValue(accusationAtom);
  const collectedClues = useAtomValue(collectedCluesAtom);
  const suspicion = useAtomValue(suspicionByCharacterAtom);

  const clueCount = selectedClueIds.length;
  const hasEnoughEvidence = collectedClues.length >= REQUIRED_CLUES;
  const canConfirm = Boolean(suspectId) && clueCount === REQUIRED_CLUES;

  // Escape backs out of the accusation, for parity with every other surface's
  // [ ESC ] dismiss. cancelAccusation() returns to FREE_ROAM.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') actions.cancelAccusation();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  return (
    <div className={styles.root}>
      <TerminalChrome
        sceneId={4}
        sceneTotal={5}
        label="Accusation"
        ghostNumber="!!"
        bracketsStaggered
      >
        <div className={styles.scroll}>
          <header className={styles.head}>
            <h1 className={styles.title}>NAME THE SABOTEUR</h1>
            <p className={styles.warn}>
              <span className={styles.warnGlyph} aria-hidden="true">⚠</span>
              ONE SHOT · NO TAKE-BACKS
            </p>
          </header>

          {/* ---------- SUSPECT BOARD ---------- */}
          <section className={styles.section} aria-label="Suspect board">
            <div className={styles.sectionLabel}>
              <span className={styles.sectionGlyph} aria-hidden="true">▸</span>
              SUSPECT BOARD
              <span className={styles.sectionHint}>SELECT ONE</span>
            </div>

            <div className={styles.suspectGrid}>
              {suspects.map((s, i) => {
                const raw = suspicion[s.id]?.raw ?? 0;
                const tier = suspicionTier(raw);
                const isChosen = s.id === suspectId;
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    className={styles.suspectCard}
                    data-chosen={isChosen || undefined}
                    onClick={() => actions.setAccusedSuspect(s.id)}
                    aria-pressed={isChosen}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.04, ease: EASE_QUART }}
                  >
                    <span className={styles.cardTop}>
                      <span className={styles.slot}>{s.slot}</span>
                      <span
                        className={styles.suspBadge}
                        data-tier={tier}
                        title="Suspicion"
                      >
                        {badgeFor(raw)}
                      </span>
                    </span>
                    <span className={styles.portraitWrap}>
                      <SpriteFrame
                        src={PORTRAITS[s.id]}
                        cols={3}
                        rows={3}
                        col={0}
                        row={0}
                        size={72}
                        bordered={false}
                        title={s.name}
                      />
                      <span className={styles.chosenMark} aria-hidden="true">ACCUSED</span>
                    </span>
                    <span className={styles.identity}>
                      <span className={styles.name}>{s.name.toUpperCase()}</span>
                      <span className={styles.role}>{s.role}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* ---------- EVIDENCE ---------- */}
          <section className={styles.section} aria-label="Evidence selection">
            <div className={styles.sectionLabel}>
              <span className={styles.sectionGlyph} aria-hidden="true">▸</span>
              EVIDENCE
              <span className={styles.sectionHint} data-full={clueCount === REQUIRED_CLUES || undefined}>
                {clueCount}/{REQUIRED_CLUES}
              </span>
            </div>

            {!hasEnoughEvidence && (
              <p className={styles.note}>
                NOT ENOUGH EVIDENCE LOGGED. WALK THE FLOOR FOR MORE, OR CANCEL.
              </p>
            )}

            {collectedClues.length === 0 ? (
              <p className={styles.empty}>NO EVIDENCE COLLECTED.</p>
            ) : (
              <div className={styles.clueGrid}>
                {collectedClues.map((entry, i) => {
                  const clue = clueById[entry.id];
                  if (!clue) return null;
                  const isPicked = selectedClueIds.includes(entry.id);
                  const atCap = clueCount >= REQUIRED_CLUES;
                  const isDisabled = !isPicked && atCap;
                  return (
                    <motion.button
                      key={entry.id}
                      type="button"
                      className={styles.clueChip}
                      data-picked={isPicked || undefined}
                      disabled={isDisabled}
                      onClick={() => actions.toggleAccusationClue(entry.id)}
                      aria-pressed={isPicked}
                      title={clue.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03, ease: EASE_QUART }}
                    >
                      <span className={styles.clueMark} aria-hidden="true">
                        {isPicked ? '■' : '□'}
                      </span>
                      <span className={styles.clueBody}>
                        <span className={styles.clueLabel}>{clue.label}</span>
                        <span className={styles.clueWeight} data-weight={clue.weight}>
                          {clue.weight}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ---------- ACTIONS ---------- */}
          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => actions.cancelAccusation()}
            >
              [ CANCEL ]
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              disabled={!canConfirm}
              onClick={() => actions.confirmAccusation()}
            >
              [ CONFIRM ACCUSATION ]
            </button>
          </footer>
        </div>
      </TerminalChrome>
    </div>
  );
}
