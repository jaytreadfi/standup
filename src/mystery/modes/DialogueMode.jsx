import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';

import SpriteFrame from '@/components/chrome/SpriteFrame';
import CornerBrackets from '@/components/chrome/CornerBrackets';

import { useGameActions } from '@/mystery/state/actions';
import { dialogueAtom, currentRoomAtom, clockMinutesAtom } from '@/mystery/state/mystery';

import { roomById } from '@/mystery/data/rooms';
import { sceneUrl, portraitUrl } from '@/mystery/data/scenes';
import { characterById } from '@/mystery/data/characters';
import { dialogue as dialogueData } from '@/mystery/data/dialogue';
import { periodFor } from '@/mystery/engine/clock';

import styles from './DialogueMode.module.css';

const EASE_QUART = [0.76, 0, 0.24, 1];

// Quick typewriter reveal. Returns the visible slice + a `done` flag and a
// `skip()` that snaps to the full string. Respects prefers-reduced-motion.
function useTypewriter(text, speed = 14) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  const reduced = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
  const skip = () => setCount(text?.length ?? 0);

  return { visible: text ? text.slice(0, count) : '', done, skip };
}

function LeaveButton({ onLeave }) {
  return (
    <button type="button" className={styles.leave} onClick={onLeave}>
      <span className={styles.leaveKey}>[ ESC ]</span>
      <span className={styles.leaveText}>LEAVE</span>
    </button>
  );
}

export default function DialogueMode() {
  const actions = useGameActions();
  const dlg = useAtomValue(dialogueAtom);
  const currentRoom = useAtomValue(currentRoomAtom);
  const clockMinutes = useAtomValue(clockMinutesAtom);
  const rootRef = useRef(null);

  const characterId = dlg?.characterId;
  const nodeId = dlg?.nodeId;

  const tree = characterId ? dialogueData[characterId] : null;
  const node = tree?.nodes?.[nodeId] ?? null;
  const speaker = characterId ? characterById[characterId] : null;

  // Background = the current room scene art for the active period, heavily darkened.
  const period = periodFor(clockMinutes);
  const room = roomById[currentRoom];
  const bgUrl = room ? sceneUrl(room.sceneAssetByPeriod?.[period]) : null;

  const { visible, done, skip } = useTypewriter(node?.text ?? '');

  // Always-available leave. Escape key also exits.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') actions.endDialogue();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  // Pull keyboard focus into the conversation on entry and on every node change,
  // so it never strands on <body> after the TALK marker that opened this mode
  // unmounts. While the line types, the first focusable is the skippable
  // dialogue box (Enter reveals); once revealed, it's the first choice.
  useEffect(() => {
    const focusable = rootRef.current?.querySelector(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus?.();
  }, [nodeId]);

  // Guard: malformed/missing node — render a minimal stub, never crash.
  if (!node) {
    return (
      <div className={styles.root} ref={rootRef}>
        <div
          className={styles.bg}
          style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined}
          aria-hidden="true"
        />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.stub}>
          <div className={styles.stubEllipsis}>...</div>
          <LeaveButton onLeave={actions.endDialogue} />
        </div>
      </div>
    );
  }

  const portrait = portraitUrl(characterId);
  const name = (speaker?.name ?? characterId ?? '').toUpperCase();
  const role = speaker?.role ?? '';

  return (
    <div className={styles.root} ref={rootRef}>
      {/* Room scene art, heavily darkened — "in conversation here". */}
      <div
        className={styles.bg}
        style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined}
        aria-hidden="true"
      />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.stage}>
        {/* Character panel — portrait (frame 0,0 of the 3x3 sheet) + name/role. */}
        <motion.aside
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

        {/* Conversation column — dialogue box + choices. */}
        <motion.div
          className={styles.convo}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06, ease: EASE_QUART }}
        >
          <div
            className={styles.dialogueBox}
            onClick={!done ? skip : undefined}
            data-skippable={!done || undefined}
            role={!done ? 'button' : undefined}
            tabIndex={!done ? 0 : undefined}
            onKeyDown={
              !done
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      skip();
                    }
                  }
                : undefined
            }
            aria-label={!done ? 'Reveal full line' : undefined}
          >
            <CornerBrackets />
            <p className={styles.text}>
              {visible}
              {!done && <span className={styles.caret} aria-hidden="true" />}
            </p>
            {!done && <span className={styles.skipHint}>ENTER ▸ SKIP</span>}
          </div>

          <div className={styles.choices}>
            {node.choices?.map((choice, i) => (
              <motion.button
                key={`${choice.label}-${i}`}
                type="button"
                className={styles.choice}
                onClick={() => actions.chooseDialogue(choice)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: done ? 1 : 0.35, y: 0 }}
                transition={{ duration: 0.2, delay: 0.04 * i, ease: EASE_QUART }}
                disabled={!done}
              >
                <span className={styles.choiceBracket} aria-hidden="true">
                  [{String(i + 1).padStart(2, '0')}]
                </span>
                <span className={styles.choiceLabel}>{choice.label}</span>
                <span className={styles.choiceArrow} aria-hidden="true">
                  ▸
                </span>
              </motion.button>
            ))}
          </div>

          <LeaveButton onLeave={actions.endDialogue} />
        </motion.div>
      </div>
    </div>
  );
}
