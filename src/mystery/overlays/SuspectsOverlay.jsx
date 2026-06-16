import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import SpriteFrame from '@/components/chrome/SpriteFrame';
import { useGameActions } from '@/mystery/state/actions';
import { useDialogFocus } from './useDialogFocus';
import { suspicionByCharacterAtom, collectedCluesAtom } from '@/mystery/state/mystery';
import { suspects } from '@/mystery/data/characters';
import { badgeFor } from '@/mystery/engine/suspicion';
import { portraitUrl } from '@/mystery/data/scenes';
import styles from './SuspectsOverlay.module.css';

/** Suspicion tier from a raw score, for meter + badge coloring. */
function suspicionTier(raw) {
  const n = Number(raw) || 0;
  if (n >= 9) return 'danger';
  if (n >= 6) return 'warn';
  return 'mute';
}

/**
 * SuspectsOverlay — the suspect board.
 * Mounted by the lead when overlayAtom === 'SUSPECTS'.
 * Scrim + framed panel with a grid of suspect cards sorted by suspicion
 * (highest first), each with a portrait, role, and a suspicion meter.
 * A prominent accuse button at the bottom calls actions.beginAccusation().
 */
const MIN_CLUES_TO_ACCUSE = 3;

export default function SuspectsOverlay() {
  const actions = useGameActions();
  const panelRef = useDialogFocus();
  const suspicion = useAtomValue(suspicionByCharacterAtom);
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

  const ranked = [...suspects]
    .map((s) => {
      const heat = suspicion[s.id] ?? { raw: 0, value: 0 };
      return { ...s, raw: heat.raw ?? 0, value: heat.value ?? 0 };
    })
    .sort((a, b) => b.value - a.value || b.raw - a.raw);

  return (
    <motion.div
      className={styles.scrim}
      role="dialog"
      aria-modal="true"
      aria-label="Suspect board"
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
          label="Suspect Board"
          ghostNumber="SB"
          labelPosition="tl"
        >
          <div className={styles.body}>
            <button
              type="button"
              className={styles.close}
              onClick={() => actions.closeOverlay()}
              aria-label="Close suspect board"
            >
              [ X ] CLOSE
            </button>

            <div className={styles.grid}>
              {ranked.map((s) => {
                const tier = suspicionTier(s.raw);
                const pct = Math.round(Math.min(1, Math.max(0, s.value)) * 100);
                return (
                  <div key={s.id} className={styles.card} data-tier={tier}>
                    <div className={styles.cardHead}>
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
                        <span className={styles.name}>
                          {s.name.toUpperCase()}
                        </span>
                        <span className={styles.role}>{s.role}</span>
                      </span>
                      <span
                        className={styles.badge}
                        data-tier={tier}
                      >
                        {badgeFor(s.raw)}
                      </span>
                    </div>
                    <div className={styles.meter}>
                      <div className={styles.meterLabel}>
                        <span>SUSPICION</span>
                        <span className={styles.meterPct}>{pct}%</span>
                      </div>
                      <div
                        className={styles.meterTrack}
                        role="meter"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${s.name} suspicion`}
                      >
                        <div
                          className={styles.meterFill}
                          data-tier={tier}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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
