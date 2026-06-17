import { useRef } from 'react';
import { motion } from 'framer-motion';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import ScrambleText from '@/components/chrome/ScrambleText';
import { useGameActions } from '@/mystery/state/actions';
import styles from './ColdOpenMode.module.css';

/**
 * ColdOpenMode — the opening group cutscene (modeAtom === 'COLD_OPEN').
 *
 * Read-only. After the owner's cinematic intro, the game picks up here: David
 * has called the whole team back to The Commons and tells them Yibo is dead in
 * the pantry. The cast reacts in their own voices; the player makes NO choices,
 * they only read. A single "[ WALK THE FLOOR ]" hands control to
 * actions.beginShift(), everyone disperses, and the intern starts the night.
 *
 * This cutscene is self-contained on purpose: it must NOT pull from
 * data/dialogue.david, whose private nodes carry David's steer-to-Poncho and the
 * probation threat. Those stay behind the one-on-one conversation during play.
 */

const EASE_QUART = [0.76, 0, 0.24, 1];

// Terminal preamble — TREAD/OS dispatch framing above the cutscene.
const PREAMBLE = [
  '> TREAD/OS · FLOOR 40 · 03:10',
  '> COFOUNDER DOWN · PANTRY · KEEP IT QUIET',
  '> THE GREAT ROOM OPENS AT DAWN',
  '> OPERATOR: INTERN · UNVERIFIED',
];

// The group scene in The Commons. `dir: true` lines are stage directions
// (no speaker tag, muted italic); everything else is a spoken line.
const CUTSCENE = [
  { speaker: 'DAVID', text: 'Okay. Everyone’s here. I’m sorry to drag you back at this hour. It’s Yibo. I came up for my charger and he was on the pantry floor. He’s gone.' },
  { dir: true, text: 'A beat. Nobody moves.' },
  { speaker: 'SAM', text: 'A fall. In the pantry. Sure. That man could hold his drink better than any of us.' },
  { speaker: 'DENA', text: 'Hmm. but he said goodnight after the match. he was heading to the hotel, we all saw him say it. didn’t we? okay. it’s an accident. it has to be.' },
  { speaker: 'JAY', text: 'Dude. He flew across the whole world to die in our pantry.' },
  { speaker: 'PEEM', text: 'I suppose someone should actually look. Properly. Before we decide what it was.' },
  { speaker: 'PONCHO', text: 'I was asleep in my car the whole time. Sam saw me. So whatever this is, it’s not me.' },
  { dir: true, text: 'Ching says nothing. She pulls her packed bag a little closer and watches David’s hands.' },
  { speaker: 'DAVID', text: 'It looks like a fall. Okay? A fall. We just, we keep this in the family and we get it straight before the building wakes up at dawn and the whole floor walks through here. That’s all I’m asking. We owe him that much. New kid, you’ve got no history here, so go walk the floor, tell me there’s nothing to find. Everyone else, just stay where I put you. Please.' },
  { dir: true, text: 'Everyone rises and drifts out into the rooms. The intern is left alone in The Great Room. The sky through the glass is still black.' },
];

export default function ColdOpenMode() {
  const actions = useGameActions();
  const beginBtnRef = useRef(null);

  // Reveal the cutscene after the title; the button lands after the last line.
  const briefStart = 0.45;
  const briefStep = 0.13;
  const afterBrief = briefStart + CUTSCENE.length * briefStep;

  return (
    <div className={styles.root}>
      <TerminalChrome ghostNumber="04" bracketsStaggered hideLabel>
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.center}>
          {/* Preamble — terminal dispatch lines, staggered fade-up. */}
          <div className={styles.preamble}>
            {PREAMBLE.map((line, i) => (
              <motion.div
                key={line}
                className={styles.preline}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 + i * 0.07, ease: EASE_QUART }}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Title — slammed in, scrambled. */}
          <motion.div
            className={styles.titleWrap}
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, delay: 0.28, ease: EASE_QUART }}
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
          </motion.div>

          {/* The cutscene — the team in The Commons, revealed line by line. */}
          <div
            className={styles.brief}
            style={{ gap: 'var(--space-4)', maxWidth: 640, maxHeight: '46vh', overflowY: 'auto', paddingRight: 'var(--space-2)' }}
          >
            {CUTSCENE.map((line, i) =>
              line.dir ? (
                <motion.div
                  key={i}
                  className={styles.briefLine}
                  style={{ gridTemplateColumns: '1fr' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: briefStart + i * briefStep, ease: EASE_QUART }}
                >
                  <span className={styles.spoken} style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                    {line.text}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key={i}
                  className={styles.briefLine}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: briefStart + i * briefStep, ease: EASE_QUART }}
                >
                  <span className={styles.speaker}>{line.speaker}</span>
                  <span className={styles.spoken}>{line.text}</span>
                </motion.div>
              ),
            )}
          </div>

          {/* Mission line — the stakes, condensed to a single quiet directive. */}
          <motion.div
            className={styles.mission}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.32, delay: afterBrief, ease: EASE_QUART }}
          >
            <span className={styles.missionGlyph} aria-hidden="true">▸</span>
            <span className={styles.missionText}>
              Walk the floor. Read what’s left. Name the killer before dawn opens the doors.
            </span>
          </motion.div>

          {/* The single decisive action. */}
          <motion.button
            ref={beginBtnRef}
            type="button"
            className={styles.beginBtn}
            onClick={() => actions.beginShift()}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: afterBrief + 0.15, ease: EASE_QUART }}
            onAnimationComplete={() => beginBtnRef.current?.focus()}
          >
            <span className={styles.beginBracket} aria-hidden="true">[</span>
            <span className={styles.beginLabel}>WALK THE FLOOR</span>
            <span className={styles.beginBracket} aria-hidden="true">]</span>
          </motion.button>
        </div>
      </TerminalChrome>
    </div>
  );
}
