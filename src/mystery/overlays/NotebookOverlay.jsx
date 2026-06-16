import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import { useGameActions } from '@/mystery/state/actions';
import { useDialogFocus } from './useDialogFocus';
import { collectedCluesAtom, objectiveAtom } from '@/mystery/state/mystery';
import { clueById } from '@/mystery/data/clues';
import { roomById } from '@/mystery/data/rooms';
import { formatClock } from '@/mystery/engine/clock';
import styles from './NotebookOverlay.module.css';

/** Map a clue weight to the visual tier used for its tag color. */
function weightTier(weight) {
  if (weight === 'HEAVY') return 'heavy';
  if (weight === 'CORE') return 'core';
  return 'weak';
}

/**
 * NotebookOverlay — the case file / evidence ledger.
 * Mounted by the lead when overlayAtom === 'NOTEBOOK'.
 * Full-screen scrim + framed panel. Scrim click and the close button both
 * call actions.closeOverlay().
 */
export default function NotebookOverlay() {
  const actions = useGameActions();
  const panelRef = useDialogFocus();
  const objective = useAtomValue(objectiveAtom);
  const collected = useAtomValue(collectedCluesAtom);

  // Close on Escape, for parity with the Map/Examine overlays.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') actions.closeOverlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  const entries = collected
    .map((entry) => {
      const clue = clueById[entry.id];
      if (!clue) return null;
      return { ...entry, clue };
    })
    .filter(Boolean);

  return (
    <motion.div
      className={styles.scrim}
      role="dialog"
      aria-modal="true"
      aria-label="Case file"
      onClick={() => actions.closeOverlay()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: [0.76, 0, 0.24, 1] }}
      >
        <TerminalChrome
          sceneId={1}
          sceneTotal={1}
          label="Case File"
          ghostNumber="CF"
          labelPosition="tl"
        >
          <div className={styles.body}>
            <button
              type="button"
              className={styles.close}
              onClick={() => actions.closeOverlay()}
              aria-label="Close case file"
            >
              [ X ] CLOSE
            </button>

            <div className={styles.objective}>
              <span className={styles.objectiveLabel}>&gt; OBJECTIVE</span>
              <p className={styles.objectiveText}>{objective}</p>
            </div>

            <div className={styles.ledgerHead}>
              <span className={styles.ledgerTitle}>EVIDENCE LOGGED</span>
              <span className={styles.ledgerCount}>
                {String(entries.length).padStart(2, '0')}
              </span>
            </div>

            {entries.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyPrompt}>&gt; NO EVIDENCE LOGGED YET</span>
                <span className={styles.emptyRule} aria-hidden="true">
                  &#9472; &middot; &#9472; &middot; &#9472;
                </span>
                <span className={styles.emptySub}>
                  Examine hotspots across the floor to log evidence.
                </span>
              </div>
            ) : (
              <ul className={styles.list}>
                {entries.map((entry, idx) => {
                  const { clue } = entry;
                  const tier = weightTier(clue.weight);
                  const source = roomById[clue.source]?.label ?? clue.source;
                  const time =
                    typeof entry.atMinute === 'number'
                      ? formatClock(entry.atMinute)
                      : null;
                  return (
                    <li key={entry.id} className={styles.entry}>
                      <div className={styles.entryHead}>
                        <span className={styles.entryId}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className={styles.entryLabel}>{clue.label}</span>
                        <span
                          className={styles.weightTag}
                          data-weight={tier}
                        >
                          {clue.weight}
                        </span>
                      </div>
                      <p className={styles.entryDesc}>{clue.description}</p>
                      <div className={styles.entryMeta}>
                        <span className={styles.metaSource}>
                          {(source ?? '—').toUpperCase()}
                        </span>
                        {time && (
                          <>
                            <span className={styles.metaSep} aria-hidden="true">
                              ·
                            </span>
                            <span className={styles.metaTime}>{time}</span>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </TerminalChrome>
      </motion.div>
    </motion.div>
  );
}
