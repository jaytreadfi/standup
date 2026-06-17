import { useRef } from 'react';
import { motion } from 'framer-motion';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import ScrambleText from '@/components/chrome/ScrambleText';
import { useGameActions } from '@/mystery/state/actions';
import { dialogue } from '@/mystery/data/dialogue';
import styles from './ColdOpenMode.module.css';

/**
 * ColdOpenMode — the cinematic briefing beat (modeAtom === 'COLD_OPEN').
 *
 * Staged reveal of David's briefing: Yibo's body on the floor, the new hire,
 * the board call deadline. Lines are drawn straight from data/dialogue.david
 * so the cold open stays consistent with the in-room conversation. Ends on a
 * single decisive "[ BEGIN SHIFT ]" that hands control back to actions.beginShift().
 */

const EASE_QUART = [0.76, 0, 0.24, 1];

// Pull David's verbatim briefing from the dialogue tree so the cold open and
// the in-room conversation never drift apart.
const DAVID_A = dialogue.david.nodes.a.text;
const DAVID_B = dialogue.david.nodes.b.text;

// Terminal preamble — TREAD/OS dispatch framing above the briefing copy.
const PREAMBLE = [
  '> TREAD/OS · FLOOR 40 · 09:00',
  '> BODY ON FLOOR · BOARD CALL 09:00 TMRW',
  '> OPERATOR: NEW HIRE · UNVERIFIED',
];

// The briefing body, attributed to David, revealed line by line.
const BRIEF = [
  { speaker: 'DAVID', text: DAVID_A },
  { speaker: 'DAVID', text: DAVID_B },
];

export default function ColdOpenMode() {
  const actions = useGameActions();
  const beginBtnRef = useRef(null);

  return (
    <div className={styles.root}>
      <TerminalChrome ghostNumber="04" bracketsStaggered hideLabel>
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.center}>
          {/* Preamble — terminal dispatch lines, staggered fade-up. */}
          <div className={styles.preamble}>
            {PREAMBLE.map((line, i) => (
              <motion.div
                key={line}
                className={styles.preline}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 + i * 0.07, ease: EASE_QUART }}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Title — slammed in, scrambled. */}
          <motion.div
            className={styles.titleWrap}
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, delay: 0.28, ease: EASE_QUART }}
          >
            <div className={styles.kicker}>NIGHT DESK · CASE 01</div>
            <h1 className={styles.title}>
              <ScrambleText target="YIBO IS DEAD" duration={520} />
            </h1>
            <motion.div
              className={styles.underline}
              initial={{ width: 0 }}
              animate={{ width: 180 }}
              transition={{ duration: 0.28, delay: 0.5, ease: EASE_QUART }}
              aria-hidden="true"
            />
          </motion.div>

          {/* Briefing — David's lines, revealed sequentially. */}
          <div className={styles.brief}>
            {BRIEF.map((line, i) => (
              <motion.div
                key={i}
                className={styles.briefLine}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.45 + i * 0.28, ease: EASE_QUART }}
              >
                <span className={styles.speaker}>{line.speaker}</span>
                <span className={styles.spoken}>{line.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Mission line — the stakes, condensed to a single quiet directive. */}
          <motion.div
            className={styles.mission}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.32, delay: 0.85, ease: EASE_QUART }}
          >
            <span className={styles.missionGlyph} aria-hidden="true">▸</span>
            <span className={styles.missionText}>
              Walk the floor. Read what’s left. Name the killer before he buries it.
            </span>
          </motion.div>

          {/* The single decisive action. */}
          <motion.button
            ref={beginBtnRef}
            type="button"
            className={styles.beginBtn}
            onClick={() => actions.beginShift()}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.0, ease: EASE_QUART }}
            onAnimationComplete={() => beginBtnRef.current?.focus()}
          >
            <span className={styles.beginBracket} aria-hidden="true">[</span>
            <span className={styles.beginLabel}>BEGIN SHIFT</span>
            <span className={styles.beginBracket} aria-hidden="true">]</span>
          </motion.button>
        </div>
      </TerminalChrome>
    </div>
  );
}
