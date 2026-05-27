import { useEffect, useRef, useState } from 'react';
import cn from '@/lib/classnames';
import styles from './ScrambleText.module.css';

// Slim-mono glyphs read as data, not static.
const GLYPHS = ['▌', '▎', '▏', '·'];
const REST_GLYPH = '·';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function ScrambleText({ target, duration = 480, autoStart = true, className }) {
  const reducedMotionRef = useRef(prefersReducedMotion());
  const [output, setOutput] = useState(() => {
    if (reducedMotionRef.current) return target;
    return target.split('').map(c => (c === ' ' ? ' ' : REST_GLYPH)).join('');
  });
  const rafRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!autoStart || startedRef.current) return;
    startedRef.current = true;

    // Reduced motion: render the final target immediately and skip animation.
    if (reducedMotionRef.current) {
      setOutput(target);
      return;
    }

    const start = performance.now();
    const lockTimes = target.split('').map((_, i) => (i / Math.max(target.length, 1)) * duration);
    let lastTick = 0;
    const TICK_MS = 30;

    const loop = (now) => {
      const elapsed = now - start;
      if (now - lastTick >= TICK_MS) {
        lastTick = now;
        const next = target.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (elapsed >= lockTimes[i]) return ch;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }).join('');
        setOutput(next);
      }
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setOutput(target);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, autoStart]);

  return <span className={cn(styles.root, className)} aria-label={target}>{output}</span>;
}
