import { useRef } from 'react';
import { motion } from 'framer-motion';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import ScrambleText from '@/components/chrome/ScrambleText';
import { useGameActions } from '@/mystery/state/actions';
import styles from './LandingMode.module.css';

/**
 * LandingMode — the title screen (modeAtom === 'LANDING').
 *
 * This is the very first thing the player sees: a brutalist terminal card with
 * the game name and a single way in. Deliberately spoiler-free — no victim, no
 * HUD, no stakes spelled out — so the cinematic intro slideshow can still open
 * on a bright, ordinary first day. The one action, [ ENTER GAME ], hands off to
 * actions.enterGame(), which advances the mode to INTRO.
 */

const EASE_QUART = [0.76, 0, 0.24, 1];

export default function LandingMode() {
  const actions = useGameActions();
  const enterBtnRef = useRef(null);

  return (
    <div className={styles.root}>
      <TerminalChrome ghostNumber="01" bracketsStaggered hideLabel>
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.center}>
          {/* Title block — kicker, scrambled name, accent rule. */}
          <motion.div
            className={styles.titleWrap}
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, delay: 0.12, ease: EASE_QUART }}
          >
            <div className={styles.kicker}>NIGHT DESK · CASE 01</div>
            <h1 className={styles.title}>
              <ScrambleText target="STANDUP" duration={560} />
            </h1>
            <motion.div
              className={styles.underline}
              initial={{ width: 0 }}
              animate={{ width: 180 }}
              transition={{ duration: 0.28, delay: 0.42, ease: EASE_QUART }}
              aria-hidden="true"
            />
          </motion.div>

          {/* The single way in. */}
          <motion.button
            ref={enterBtnRef}
            type="button"
            className={styles.enterBtn}
            onClick={() => actions.enterGame()}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6, ease: EASE_QUART }}
            onAnimationComplete={() => enterBtnRef.current?.focus()}
          >
            <span className={styles.enterBracket} aria-hidden="true">[</span>
            <span className={styles.enterLabel}>ENTER GAME</span>
            <span className={styles.enterBracket} aria-hidden="true">]</span>
          </motion.button>
        </div>
      </TerminalChrome>
    </div>
  );
}
