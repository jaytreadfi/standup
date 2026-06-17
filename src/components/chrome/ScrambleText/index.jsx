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

// Placeholder scramble for a target string (spaces preserved).
function scrambleOf(target) {
  return target.split('').map((c) => (c === ' ' ? ' ' : REST_GLYPH)).join('');
}

export default function ScrambleText({ target, duration = 480, autoStart = true, className }) {
  const reducedMotionRef = useRef(prefersReducedMotion());
  const [output, setOutput] = useState(() =>
    reducedMotionRef.current || !autoStart ? target : scrambleOf(target),
  );

  useEffect(() => {
    // Resolve to the real text immediately when we can't (or shouldn't) animate:
    // reduced motion, autoStart off, or a hidden/throttled tab where rAF is
    // suspended and the scramble would otherwise freeze on placeholder glyphs.
    if (
      !autoStart ||
      reducedMotionRef.current ||
      (typeof document !== 'undefined' && document.hidden)
    ) {
      setOutput(target);
      return undefined;
    }

    // Re-animate cleanly whenever the target changes: start from a fresh scramble
    // of THIS target (no stale text from a previous run).
    setOutput(scrambleOf(target));

    // Safety net: requestAnimationFrame is throttled/suspended in background or
    // headless tabs (and the instant a macOS screenshot grabs focus), which can
    // freeze the scramble on placeholder glyphs. This timer guarantees the final
    // text always lands even if rAF never ticks again.
    const fallback = setTimeout(() => setOutput(target), duration + 120);

    const start = performance.now();
    const lockTimes = target.split('').map((_, i) => (i / Math.max(target.length, 1)) * duration);
    let lastTick = 0;
    let raf = 0;
    const TICK_MS = 30;

    const loop = (now) => {
      const elapsed = now - start;
      if (now - lastTick >= TICK_MS) {
        lastTick = now;
        setOutput(
          target
            .split('')
            .map((ch, i) => {
              if (ch === ' ') return ' ';
              if (elapsed >= lockTimes[i]) return ch;
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join(''),
        );
      }
      if (elapsed < duration) {
        raf = requestAnimationFrame(loop);
      } else {
        setOutput(target);
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [target, duration, autoStart]);

  return (
    <span className={cn(styles.root, className)} aria-label={target}>
      {output}
    </span>
  );
}
