import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';

import TerminalChrome from '@/components/chrome/TerminalChrome';
import ScrambleText from '@/components/chrome/ScrambleText';
import FlashWipe from '@/components/chrome/FlashWipe';

import { useGameActions } from '@/mystery/state/actions';
import { endingAtom } from '@/mystery/state/mystery';
import { endings } from '@/mystery/data/endings';

import styles from './EndingMode.module.css';

/**
 * EndingMode — the verdict card (modeAtom === 'ENDING').
 *
 * Reads endingAtom ('A'|'B'|'C'|'D') → endings[id], tone-colors the whole card
 * (success/warn/danger), fires a FlashWipe on mount for the gut-punch, and
 * offers a single "[ RUN IT BACK ]" to restart the case.
 */

const EASE_QUART = [0.76, 0, 0.24, 1];

// Tone → CSS variable name for the accent color of this ending.
const TONE_VAR = {
  success: '--color-success',
  warn: '--color-warn',
  danger: '--color-danger',
};

export default function EndingMode() {
  const actions = useGameActions();
  const endingId = useAtomValue(endingAtom);
  const ending = (endingId && endings[endingId]) || endings.D;

  const toneColor = `var(${TONE_VAR[ending.tone] ?? '--color-accent'})`;
  const restartBtnRef = useRef(null);

  // FlashWipe on mount — one accent burst as the verdict lands.
  const [flashing, setFlashing] = useState(false);
  useEffect(() => {
    setFlashing(true);
    const t = setTimeout(() => setFlashing(false), 220);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.root} style={{ '--tone': toneColor }}>
      <FlashWipe active={flashing} />

      <TerminalChrome
        label="Verdict"
        bracketsStaggered
      >
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.center}>
          {/* Case stamp — the ending id, faint eyebrow. */}
          <motion.div
            className={styles.stamp}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: EASE_QUART }}
          >
            CASE OUTCOME · {ending.id}
          </motion.div>

          {/* Title — big, scrambled, toned. */}
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.34, delay: 0.16, ease: EASE_QUART }}
          >
            <ScrambleText target={ending.title} duration={560} className={styles.titleText} />
          </motion.h1>

          {/* Verdict line — toned rule above, label below. */}
          <motion.div
            className={styles.verdictWrap}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.28, ease: EASE_QUART }}
          >
            <motion.div
              className={styles.rule}
              initial={{ width: 0 }}
              animate={{ width: 220 }}
              transition={{ duration: 0.32, delay: 0.3, ease: EASE_QUART }}
              aria-hidden="true"
            />
            <div className={styles.verdict}>{ending.verdict}</div>
          </motion.div>

          {/* Body — the resolution prose, the readable payoff. */}
          <motion.p
            className={styles.body}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.38, ease: EASE_QUART }}
          >
            {ending.body}
          </motion.p>

          {/* Restart. */}
          <motion.button
            ref={restartBtnRef}
            type="button"
            className={styles.restartBtn}
            onClick={() => actions.restart()}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.5, ease: EASE_QUART }}
            onAnimationComplete={() => restartBtnRef.current?.focus()}
          >
            [ RUN IT BACK ]
          </motion.button>
        </div>
      </TerminalChrome>
    </div>
  );
}
