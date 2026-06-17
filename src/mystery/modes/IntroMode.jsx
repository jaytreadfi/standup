import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useGameActions } from '@/mystery/state/actions';
import { SLIDES } from '@/mystery/data/intro';
import { introUrl } from '@/mystery/data/scenes';

import styles from './IntroMode.module.css';

const EASE_QUART = [0.76, 0, 0.24, 1];

// Per-slide hold: longer captions linger so they stay readable. Slow, diary-
// paced so each scene breathes — clamp(5200 + caption.length * 60, 6500, 14000) ms.
function slideDuration(caption) {
  const raw = 5200 + (caption?.length ?? 0) * 60;
  return Math.min(14000, Math.max(6500, raw));
}

/**
 * IntroMode — the cinematic POV slideshow (modeAtom === 'INTRO').
 *
 * The intern's first-day monologue as a full-bleed, auto-advancing slideshow.
 * Each still gets a slow Ken-Burns push (disabled under prefers-reduced-motion)
 * and a bottom scrim so the subtitle stays legible. A thin progress bar fills
 * over each slide's hold. Click / Space / ArrowRight jumps ahead one slide;
 * "SKIP" and Escape end the whole intro. Advancing past the final slide, and
 * skipping, both call actions.endIntro() to hand off to the cold open.
 *
 * Read-only and robust: a missing image just shows the caption on black.
 */
export default function IntroMode() {
  const actions = useGameActions();
  const [index, setIndex] = useState(0);
  const rootRef = useRef(null);
  // endIntro() flips the mode out from under us; guard against a late timer or
  // double-advance firing the transition more than once.
  const endedRef = useRef(false);

  const reduced = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const slide = SLIDES[index] ?? null;
  const url = slide ? introUrl(slide.key) : null;
  const duration = slide ? slideDuration(slide.caption) : 4200;

  const endIntro = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    actions.endIntro();
  }, [actions]);

  // Advance one slide; past the last slide hands off to the cold open. Read the
  // live index via a ref so this stays a stable callback without nesting the
  // endIntro() side effect inside a setState updater.
  const indexRef = useRef(0);
  indexRef.current = index;
  const advance = useCallback(() => {
    if (indexRef.current >= SLIDES.length - 1) {
      endIntro();
    } else {
      setIndex((i) => i + 1);
    }
  }, [endIntro]);

  // Auto-advance timer, reset on every slide.
  useEffect(() => {
    if (!slide) return undefined;
    const id = setTimeout(advance, duration);
    return () => clearTimeout(id);
  }, [index, slide, duration, advance]);

  // Keyboard: Esc skips the whole intro; Space / ArrowRight / Enter advance one
  // slide. Bound to the focused stage (below), so it doesn't leak when the mode
  // unmounts and satisfies the click-needs-a-key-handler a11y rule.
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        endIntro();
      } else if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      }
    },
    [advance, endIntro],
  );

  // Pull focus into the stage so keyboard control works immediately on entry.
  useEffect(() => {
    rootRef.current?.focus?.();
  }, []);

  return (
    <div
      className={styles.root}
      ref={rootRef}
      tabIndex={-1}
      onClick={advance}
      onKeyDown={onKeyDown}
      role="button"
      aria-label="Advance intro"
    >
      {/* Crossfading full-bleed still. Keyed on index so AnimatePresence runs
       * the exit fade of the outgoing slide against the incoming one. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={index}
          className={styles.slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_QUART }}
        >
          {url ? (
            <motion.div
              className={styles.image}
              style={{ backgroundImage: `url(${url})` }}
              initial={{ scale: reduced ? 1 : 1.0 }}
              animate={{ scale: reduced ? 1 : 1.06 }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              aria-hidden="true"
            />
          ) : (
            <div className={styles.imageFallback} aria-hidden="true" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom letterbox/scrim so the subtitle reads over any frame. */}
      <div className={styles.scrim} aria-hidden="true" />

      {/* Progress bar — fills over the current slide's hold, restarts each slide. */}
      <div className={styles.progressTrack} aria-hidden="true">
        <motion.div
          key={index}
          className={styles.progressFill}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      </div>

      {/* Small on-scene clock, top-left. */}
      <div className={styles.timeLabel}>{slide?.time ?? ''}</div>

      {/* Skip the whole intro. Stop the click from also advancing one slide. */}
      <button
        type="button"
        className={styles.skip}
        onClick={(e) => {
          e.stopPropagation();
          endIntro();
        }}
      >
        <span className={styles.skipLabel}>SKIP</span>
        <span className={styles.skipArrow} aria-hidden="true">
          ▸
        </span>
      </button>

      {/* Subtitle, bottom-center, in a polite live region so SR users hear it. */}
      <div className={styles.captionWrap}>
        <p className={styles.caption} aria-live="polite">
          {slide?.caption ?? ''}
        </p>
      </div>
    </div>
  );
}
