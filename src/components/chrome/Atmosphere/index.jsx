import { useEffect, useState } from 'react';
import styles from './Atmosphere.module.css';

/**
 * Atmosphere
 * Global, extremely subtle atmospheric overlay.
 * Three layers: vignette, scanlines, slow accent sweep.
 * Sits above shell content, below modals/overlays/toasts/flash.
 * Decorative only: aria-hidden, pointer-events: none.
 */
export default function Atmosphere() {
  const [motion, setMotion] = useState('on');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setMotion(mql.matches ? 'off' : 'on');
    apply();
    if (mql.addEventListener) {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
    mql.addListener(apply);
    return () => mql.removeListener(apply);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={styles.atmosphere}
      data-motion={motion}
    >
      <div className={styles.vignette} />
      <div className={styles.scanlines} />
      <div className={styles.sweep} />
    </div>
  );
}
