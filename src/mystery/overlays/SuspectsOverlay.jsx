import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import SpriteFrame from '@/components/chrome/SpriteFrame';
import { useGameActions } from '@/mystery/state/actions';
import { useDialogFocus } from './useDialogFocus';
import { collectedCluesAtom } from '@/mystery/state/mystery';
import { suspects } from '@/mystery/data/characters';
import { portraitUrl } from '@/mystery/data/scenes';
import styles from './SuspectsOverlay.module.css';

/**
 * SuspectsOverlay — the suspects panel.
 * Mounted by the lead when overlayAtom === 'SUSPECTS'.
 *
 * A plain lineup of the people on the floor — NO guilt meter, no ranking, no
 * suspicion score. The panel doesn't tell you who did it; you weigh the
 * evidence yourself (the case file, F2) and decide. A prominent accuse button
 * at the bottom calls actions.beginAccusation().
 */
const MIN_CLUES_TO_ACCUSE = 3;

export default function SuspectsOverlay() {
  const actions = useGameActions();
  const panelRef = useDialogFocus();
  const collected = useAtomValue(collectedCluesAtom);
  const canAccuse = collected.length >= MIN_CLUES_TO_ACCUSE;

  // Close on Escape, for parity with the Map/Examine overlays.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') actions.closeOverlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  return (
    <motion.div
      className={styles.scrim}
      role="dialog"
      aria-modal="true"
      aria-label="Suspects"
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
          label="Suspects"
          labelPosition="tl"
        >
          <div className={styles.body}>
            <button
              type="button"
              className={styles.close}
              onClick={() => actions.closeOverlay()}
              aria-label="Close suspects"
            >
              ESC
            </button>

            <p className={styles.note}>
              Everyone still on the floor. This panel won’t name them for you.
              Weigh the evidence and decide.
            </p>

            <div className={styles.grid}>
              {suspects.map((s) => (
                <div key={s.id} className={styles.card}>
                  <span className={styles.portraitWrap}>
                    <SpriteFrame
                      src={portraitUrl(s.id)}
                      cols={3}
                      rows={3}
                      col={0}
                      row={0}
                      size={48}
                      title={s.name}
                    />
                  </span>
                  <span className={styles.identity}>
                    <span className={styles.name}>{s.name.toUpperCase()}</span>
                    <span className={styles.role}>{s.role}</span>
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={styles.accuse}
              onClick={() => actions.beginAccusation()}
              disabled={!canAccuse}
              title={canAccuse ? undefined : `Log at least ${MIN_CLUES_TO_ACCUSE} pieces of evidence first.`}
            >
              {canAccuse ? '[ READY TO ACCUSE ]' : `[ NEED ${MIN_CLUES_TO_ACCUSE}+ EVIDENCE ]`}
            </button>
          </div>
        </TerminalChrome>
      </motion.div>
    </motion.div>
  );
}
