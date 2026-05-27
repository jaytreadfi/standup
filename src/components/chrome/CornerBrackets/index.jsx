import { motion } from 'framer-motion';
import styles from './CornerBrackets.module.css';

const SLAM_EASE = [0.85, 0, 0.15, 1];

const CORNERS = [
  { key: 'tl', className: 'tl', from: { x: -4, y: -4 } },
  { key: 'tr', className: 'tr', from: { x: 4, y: -4 } },
  { key: 'bl', className: 'bl', from: { x: -4, y: 4 } },
  { key: 'br', className: 'br', from: { x: 4, y: 4 } },
];

/**
 * @param {{ staggered?: boolean }} props
 */
export default function CornerBrackets({ staggered = false }) {
  return (
    <div className={styles.root} aria-hidden="true">
      {CORNERS.map((corner, idx) => (
        <motion.div
          key={corner.key}
          className={`${styles.bracket} ${styles[corner.className]}`}
          initial={{ opacity: 0, x: corner.from.x, y: corner.from.y }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{
            duration: 0.2,
            ease: SLAM_EASE,
            delay: staggered ? idx * 0.06 : 0,
          }}
        >
          <div className={styles.armH} />
          <div className={styles.armV} />
          <div className={styles.tailH} />
          <div className={styles.tailV} />
        </motion.div>
      ))}
    </div>
  );
}
