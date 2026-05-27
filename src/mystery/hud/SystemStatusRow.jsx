import { useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { clockMinutesAtom } from '@/mystery/state/mystery';
import { formatClock, periodFor } from '@/mystery/engine/clock';
import styles from './SystemStatusRow.module.css';

const IS_DEV = import.meta.env.DEV;

function shiftLabel(minutes) {
  const period = periodFor(minutes);
  if (period === 'morning') return 'SHIFT 1';
  if (period === 'dusk') return 'DUSK';
  return minutes >= 1200 ? 'NIGHT 2' : 'NIGHT 1';
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function SystemStatusRow() {
  const clockMinutes = useAtomValue(clockMinutesAtom);

  // Seed values — drift gently from these every 3s (±2) unless reduced motion.
  const seed = useMemo(
    () => ({
      cpu: 2 + Math.floor(Math.random() * 8),
      mem: 30 + Math.floor(Math.random() * 40),
    }),
    []
  );

  const [cpu, setCpu] = useState(seed.cpu);
  const [mem, setMem] = useState(seed.mem);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const id = window.setInterval(() => {
      setCpu((prev) => clamp(prev + (Math.floor(Math.random() * 5) - 2), 1, 14));
      setMem((prev) => clamp(prev + (Math.floor(Math.random() * 5) - 2), 20, 80));
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const cpuStr = String(cpu).padStart(2, '0');
  const memStr = String(mem).padStart(2, '0');
  const shift = shiftLabel(clockMinutes);
  const savedAt = formatClock(clockMinutes);

  const rightItems = [
    <span key="cpu" className={styles.metric}>
      <span className={styles.label}>CPU</span>
      <span className={styles.num}>{cpuStr}</span>
    </span>,
    <span key="mem" className={styles.metric}>
      <span className={styles.label}>MEM</span>
      <span className={styles.num}>{memStr}%</span>
    </span>,
    ...(IS_DEV
      ? [
          <span key="build" className={styles.metric}>
            <span className={styles.label}>BUILD</span>
            <span>DEV</span>
          </span>,
        ]
      : []),
    <span key="shift" className={styles.metric}>
      {shift}
    </span>,
    <span key="save" className={styles.metric}>
      <span className={`${styles.dot} ${styles.dotSave}`} aria-hidden="true">
        ●
      </span>
      <span>AUTOSAVED</span>
      <span className={styles.num}>{savedAt}</span>
    </span>,
  ];

  return (
    <footer className={styles.row} role="contentinfo">
      <span className={styles.left}>
        <span className={`${styles.dot} ${styles.dotOnline}`} aria-hidden="true">
          ●
        </span>
        <span>ONLINE</span>
      </span>
      <span className={styles.right}>
        {rightItems.map((node, i) => (
          <span key={node.key ?? i} className={styles.cell}>
            {node}
            {i < rightItems.length - 1 && (
              <span className={styles.pipe} aria-hidden="true">
                |
              </span>
            )}
          </span>
        ))}
      </span>
    </footer>
  );
}
