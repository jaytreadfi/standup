import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import SpriteFrame from '@/components/chrome/SpriteFrame';
import CornerBrackets from '@/components/chrome/CornerBrackets';
import ScrambleText from '@/components/chrome/ScrambleText';

import { useGameActions } from '@/mystery/state/actions';
import { sceneUrl, portraitUrl } from '@/mystery/data/scenes';
import { characterById } from '@/mystery/data/characters';

import styles from './ColdOpenMode.module.css';

/**
 * ColdOpenMode — the opening group cutscene (modeAtom === 'COLD_OPEN').
 *
 * Read-only. After the owner's cinematic intro, the game picks up here: David
 * has called the whole team back to The Commons and tells them Yibo is dead in
 * the pantry. The cast reacts in their own voices; the player makes NO choices,
 * they only read.
 *
 * Plays NPC-style — one beat at a time, like talking to a character — reusing
 * the in-game DialogueMode look (speaker portrait + typewriter line over the
 * darkened Commons). Click / Space / Enter advances; on a spoken beat that's
 * still typing, it skip-reveals first. A single "[ WALK THE FLOOR ]" on the
 * final beat hands control to actions.beginShift(), everyone disperses, and the
 * intern starts the night.
 *
 * This cutscene is self-contained on purpose: it must NOT pull from
 * data/dialogue.david, whose private nodes carry David's steer-to-Poncho and the
 * probation threat. Those stay behind the one-on-one conversation during play.
 */

const EASE_QUART = [0.76, 0, 0.24, 1];

// Quick typewriter reveal. Returns the visible slice + a `done` flag and a
// `skip()` that snaps to the full string. Respects prefers-reduced-motion.
// (Replicated locally from DialogueMode so this cutscene stays self-contained.)
function useTypewriter(text, speed = 12) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  // skip() flips this so the in-flight rAF loop stops re-deriving count from
  // elapsed time on its next tick. Without it, skip()'s setCount(full) is
  // overwritten one frame later and the skip is a no-op.
  const skippedRef = useRef(false);

  const reduced = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    skippedRef.current = false;
    if (!text) {
      setCount(0);
      return undefined;
    }
    if (reduced) {
      setCount(text.length);
      return undefined;
    }
    setCount(0);
    const start = performance.now();
    const loop = (now) => {
      if (skippedRef.current) return;
      const elapsed = now - start;
      const next = Math.min(text.length, Math.floor(elapsed / speed));
      setCount(next);
      if (next < text.length) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, reduced]);

  const done = count >= (text?.length ?? 0);
  const skip = () => {
    skippedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setCount(text?.length ?? 0);
  };

  return { visible: text ? text.slice(0, count) : '', done, skip };
}

// The cold open, beat by beat. The first beat is the chapter title card; the
// rest is the group scene in The Commons. Speakers are character ids (resolved
// against characterById). `dir: true` beats are stage directions (no speaker,
// muted italic narration). The final `dir` beat hands off to the floor.
const BEATS = [
  { title: true },
  { speaker: 'david', text: 'Okay. Everyone’s here. I’m sorry to drag you back at this hour. It’s Yibo. I came up for my charger and he was on the pantry floor. He’s gone.' },
  { dir: true, text: 'A beat. Nobody moves.' },
  { speaker: 'sam', text: 'A fall. In the pantry. Sure. That man could hold his drink better than any of us.' },
  { speaker: 'dena', text: 'Hmm. but he said goodnight after the match. he was heading to the hotel, we all saw him say it. didn’t we? okay. it’s an accident. it has to be.' },
  { speaker: 'jay', text: 'Dude. He flew across the whole world to die in our pantry.' },
  { speaker: 'peem', text: 'I suppose someone should actually look. Properly. Before we decide what it was.' },
  { speaker: 'poncho', text: 'I was asleep in my car the whole time. Sam saw me. So whatever this is, it’s not me.' },
  { dir: true, text: 'Ching says nothing. She pulls her packed bag a little closer and watches David’s hands.' },
  { speaker: 'david', text: 'It looks like a fall. Okay? A fall. We just, we keep this in the family and we get it straight before the building wakes up at dawn and the whole floor walks through here. That’s all I’m asking. We owe him that much. New kid, you’ve got no history here, so go walk the floor, tell me there’s nothing to find. Everyone else, just stay where I put you. Please.' },
  { dir: true, text: 'Everyone rises and drifts out into the rooms. The intern is left alone in The Great Room. The sky through the glass is still black.' },
];

export default function ColdOpenMode() {
  const actions = useGameActions();
  const rootRef = useRef(null);
  const [index, setIndex] = useState(0);

  const beat = BEATS[index];
  const isFinal = index === BEATS.length - 1;
  const isSpoken = !beat.title && !beat.dir;

  const { visible, done, skip } = useTypewriter(isSpoken ? beat.text : '');

  // Background = the Commons night scene, heavily darkened (matches DialogueMode).
  const bgUrl = sceneUrl('coworking-night');

  // Single advance gesture. On a spoken beat mid-reveal, skip first; otherwise
  // step to the next beat. The final beat advances only via [ WALK THE FLOOR ].
  function advance() {
    if (isSpoken && !done) {
      skip();
      return;
    }
    if (isFinal) return;
    setIndex((i) => Math.min(i + 1, BEATS.length - 1));
  }

  // Keyboard advance lives on each beat's own focused control (titleStage /
  // dirStage / dialogueBox onKeyDown below), NOT on a window listener — a window
  // listener double-fired with the focused control's handler (preventDefault
  // doesn't stop the native bubble), advancing two beats per press.

  // Pull focus to the active advance control on every beat change so keyboard
  // users always have something live to act on and the live region is announced.
  useEffect(() => {
    const focusable = rootRef.current?.querySelector(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus?.();
  }, [index]);

  const speaker = isSpoken ? characterById[beat.speaker] : null;
  const portrait = isSpoken ? portraitUrl(beat.speaker) : null;
  const name = (speaker?.name ?? beat.speaker ?? '').toUpperCase();
  const role = speaker?.role ?? '';

  return (
    <div className={styles.root} ref={rootRef}>
      {/* Commons night scene art, heavily darkened — "we're all here". */}
      <div
        className={styles.bg}
        style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined}
        aria-hidden="true"
      />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      {/* ---------- Title beat: chapter card ---------- */}
      {beat.title && (
        <div
          className={styles.titleStage}
          role="button"
          tabIndex={0}
          onClick={advance}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              advance();
            }
          }}
          aria-label="Begin the cutscene"
        >
          <motion.div
            className={styles.titleWrap}
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, ease: EASE_QUART }}
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
            <span className={styles.titleHint}>▸ CLICK TO CONTINUE</span>
          </motion.div>
        </div>
      )}

      {/* ---------- Stage-direction beat: centered narration card ---------- */}
      {beat.dir && (
        <div
          className={styles.dirStage}
          role={isFinal ? undefined : 'button'}
          tabIndex={isFinal ? undefined : 0}
          onClick={isFinal ? undefined : advance}
          onKeyDown={
            isFinal
              ? undefined
              : (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    advance();
                  }
                }
          }
          aria-label={isFinal ? undefined : 'Continue'}
        >
          <motion.div
            key={index}
            className={styles.dirCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_QUART }}
          >
            <p className={styles.dirText} aria-live="polite">
              {beat.text}
            </p>
          </motion.div>

          {isFinal ? (
            <motion.button
              type="button"
              className={styles.beginBtn}
              onClick={() => actions.beginShift()}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18, ease: EASE_QUART }}
            >
              <span className={styles.beginBracket} aria-hidden="true">[</span>
              <span className={styles.beginLabel}>WALK THE FLOOR</span>
              <span className={styles.beginBracket} aria-hidden="true">]</span>
            </motion.button>
          ) : (
            <span className={styles.next} aria-hidden="true">▸ NEXT</span>
          )}
        </div>
      )}

      {/* ---------- Spoken beat: portrait + typewriter line ---------- */}
      {isSpoken && (
        <div className={styles.stage}>
          {/* Character panel — portrait (frame 0,0 of the 3x3 sheet) + name/role. */}
          <motion.aside
            key={`char-${index}`}
            className={styles.charPanel}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, ease: EASE_QUART }}
          >
            <div className={styles.portraitFrame}>
              <CornerBrackets staggered />
              {portrait ? (
                <SpriteFrame
                  src={portrait}
                  cols={3}
                  rows={3}
                  col={0}
                  row={0}
                  size={200}
                  bordered={false}
                  className={styles.portrait}
                  title={name}
                />
              ) : (
                <div className={styles.portraitFallback} aria-hidden="true">
                  {name.slice(0, 1) || '?'}
                </div>
              )}
              <span className={styles.scanline} aria-hidden="true" />
            </div>
            <div className={styles.identity}>
              <span className={styles.idTag}>▸ SUBJECT</span>
              <span className={styles.name}>{name}</span>
              <span className={styles.role}>{role}</span>
            </div>
          </motion.aside>

          {/* Line column — typewriter dialogue box. Click/Space/Enter advances. */}
          <motion.div
            key={`convo-${index}`}
            className={styles.convo}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06, ease: EASE_QUART }}
          >
            <div
              className={styles.dialogueBox}
              onClick={advance}
              data-skippable={!done || undefined}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  advance();
                }
              }}
              aria-label={done ? 'Continue' : 'Reveal full line'}
            >
              <CornerBrackets />
              <p className={styles.text} aria-live="polite">
                {visible}
                {!done && <span className={styles.caret} aria-hidden="true" />}
              </p>
              {!done ? (
                <span className={styles.skipHint}>ENTER ▸ SKIP</span>
              ) : (
                <span className={styles.nextHint}>▸ NEXT</span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
