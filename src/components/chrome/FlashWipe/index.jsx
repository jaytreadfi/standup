import { AnimatePresence, motion } from 'framer-motion';
import styles from './FlashWipe.module.css';

const FLASH_DURATION_MS = 180;
const PEAK_OPACITY = 0.85;

const flashVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, PEAK_OPACITY, 0],
    transition: { duration: FLASH_DURATION_MS / 1000, times: [0, 0.3, 1] },
  },
  exit: { opacity: 0 },
};

export default function FlashWipe({ active = false }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="flash"
          className={styles.flash}
          variants={flashVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}

// Imperative API: programmatically trigger a flash.
// Usage: import { flash } from '@/components/chrome/FlashWipe';
// flash(); // fires a 180ms accent flash, cleans up after itself.
let portalRoot = null;
let activeCount = 0;

function teardownPortalIfIdle() {
  if (activeCount <= 0 && portalRoot && portalRoot.childNodes.length === 0) {
    if (portalRoot.parentNode) portalRoot.parentNode.removeChild(portalRoot);
    portalRoot = null;
    activeCount = 0;
  }
}

export function flash() {
  if (typeof document === 'undefined') return;
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'flashwipe-root';
    document.body.appendChild(portalRoot);
  }
  const el = document.createElement('div');
  el.className = styles.flash;
  el.setAttribute('aria-hidden', 'true');
  el.style.opacity = '0';
  portalRoot.appendChild(el);
  activeCount += 1;

  // Two-phase ramp matching the declarative variant: 0 → PEAK_OPACITY (30%) → 0.
  requestAnimationFrame(() => {
    el.style.transition = `opacity ${FLASH_DURATION_MS * 0.3}ms ease-out`;
    el.style.opacity = String(PEAK_OPACITY);
    setTimeout(() => {
      el.style.transition = `opacity ${FLASH_DURATION_MS * 0.7}ms ease-in`;
      el.style.opacity = '0';
      setTimeout(() => {
        if (portalRoot && el.parentNode === portalRoot) {
          portalRoot.removeChild(el);
        }
        activeCount = Math.max(0, activeCount - 1);
        teardownPortalIfIdle();
      }, FLASH_DURATION_MS * 0.7);
    }, FLASH_DURATION_MS * 0.3);
  });
}
