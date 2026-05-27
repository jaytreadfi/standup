import { motion } from 'framer-motion';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import ScrambleText from '@/components/chrome/ScrambleText';
import styles from './BootMode.module.css';

// AAA cold-open beat. Total runtime ~280ms so all motion completes before
// GameShell auto-advances at 300ms. Sequence:
//   t=0     brand slam-in (opacity, y, subtle scale 0.985→1)  300ms quart
//   t=0     subhead scramble (280ms, finishes inside the beat)
//   t=0..120 corner ticks pulse on (CSS keyframes)
//   t=20    bootline 1 fade-up
//   t=80    bootline 2 fade-up
//   t=140   bootline 3 fade-up
//   t=100   accent underline slides in under brand (200ms)
const EASE_QUART = [0.76, 0, 0.24, 1];

const BOOTLINES = [
  '> NODE TREAD/OS-04 ONLINE',
  '> FLOOR 01 · 09:00',
  '> AWAITING OPERATOR',
];

export default function BootMode() {
  return (
    <div className={styles.root}>
      <TerminalChrome sceneId={0} sceneTotal={5} label="Boot" ghostNumber="00" bracketsStaggered>
        {/* Decorative ghost glyph — anchored to corner so it bleeds in at the
         * edge rather than dominating center. Mirrors GhostNumber motif. */}
        <div className={styles.ghostGlyph} aria-hidden="true">0</div>

        {/* Four absolute-corner accent ticks that pulse on once during boot. */}
        <span className={`${styles.tick} ${styles.tickTL}`} aria-hidden="true" />
        <span className={`${styles.tick} ${styles.tickTR}`} aria-hidden="true" />
        <span className={`${styles.tick} ${styles.tickBL}`} aria-hidden="true" />
        <span className={`${styles.tick} ${styles.tickBR}`} aria-hidden="true" />

        <div className={styles.center}>
          <motion.div
            className={styles.brandWrap}
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE_QUART }}
          >
            <div className={styles.brand}>TREAD/OS</div>
            {/* Underline flourish — slides from left under the brand */}
            <motion.div
              className={styles.underline}
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 0.2, delay: 0.1, ease: EASE_QUART }}
              aria-hidden="true"
            />
            <div className={styles.subhead}>
              <ScrambleText target="INITIALIZING SHIFT" duration={280} />
            </div>
          </motion.div>

          {/* Terminal bootlines — sequential fade-up, staggered 60ms */}
          <div className={styles.bootlines}>
            {BOOTLINES.map((line, i) => (
              <motion.div
                key={line}
                className={styles.bootline}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: 0.02 + i * 0.06, ease: EASE_QUART }}
              >
                {line}
              </motion.div>
            ))}
          </div>
        </div>
      </TerminalChrome>
    </div>
  );
}
