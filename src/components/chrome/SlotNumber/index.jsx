import { useEffect, useRef, useState } from 'react';
import cn from '@/lib/classnames';
import styles from './SlotNumber.module.css';

const TICK_MS = 80;
const LOCK_FLASH_MS = 200;

export default function SlotNumber({ value, duration = 480, padTo = 1, className }) {
  const [display, setDisplay] = useState(() => String(value).padStart(padTo, '0'));
  const [locked, setLocked] = useState(false);
  const rafRef = useRef(null);
  const lockTimerRef = useRef(null);

  useEffect(() => {
    const final = String(value).padStart(padTo, '0');
    const digits = Math.max(String(Math.abs(value)).length, padTo);
    const start = performance.now();
    let lastTick = start;
    setLocked(false);

    const cancelRaf = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };

    const lockOn = () => {
      // Briefly highlight the final value, then transition back via CSS.
      setLocked(true);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => setLocked(false), LOCK_FLASH_MS);
    };

    const loop = (now) => {
      const elapsed = now - start;
      if (elapsed >= duration) {
        setDisplay(final);
        cancelRaf();
        lockOn();
        return;
      }
      // Only update when the 80ms quantum has elapsed — same pacing, smoother under load.
      if (now - lastTick >= TICK_MS) {
        lastTick = now;
        const max = Math.pow(10, digits) - 1;
        const rand = Math.floor(Math.random() * (max + 1));
        setDisplay(String(rand).padStart(digits, '0'));
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    cancelRaf();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelRaf();
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    };
  }, [value, duration, padTo]);

  return (
    <span
      className={cn(styles.root, locked && styles.locked, className)}
      aria-label={String(value)}
    >
      {display}
    </span>
  );
}
