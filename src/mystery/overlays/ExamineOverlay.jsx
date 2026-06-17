import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';

import TerminalChrome from '@/components/chrome/TerminalChrome';
import ScrambleText from '@/components/chrome/ScrambleText';
import FlashWipe from '@/components/chrome/FlashWipe';

import { useGameActions } from '@/mystery/state/actions';
import { useDialogFocus } from './useDialogFocus';
import { examineAtom, clockMinutesAtom } from '@/mystery/state/mystery';
import { examineTargetById, roomById } from '@/mystery/data/rooms';
import { clueById } from '@/mystery/data/clues';
import { sceneUrl, evidenceUrl } from '@/mystery/data/scenes';
import { periodFor } from '@/mystery/engine/clock';

import styles from './ExamineOverlay.module.css';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * TypedReadout — a quick, skippable typewriter reveal for the flavor body.
 * Unlike <ScrambleText> (white-space: pre, single line) this wraps naturally
 * across the inspector readout column. Click the panel or press a key to skip
 * straight to the full text.
 */
function TypedReadout({ text, onDone }) {
  const reducedRef = useRef(prefersReducedMotion());
  const [count, setCount] = useState(() => (reducedRef.current ? text.length : 0));
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setCount(text.length);
    if (onDone) onDone();
  };

  // Expose a skip handle to the parent via a custom event on the node.
  useEffect(() => {
    doneRef.current = false;
    setCount(reducedRef.current ? text.length : 0);
    if (reducedRef.current) {
      doneRef.current = true;
      if (onDone) onDone();
      return undefined;
    }
    // ~14ms/char, capped so even long flavor reads land in well under a second.
    const total = Math.min(620, text.length * 14);
    const start = performance.now();
    let raf = 0;
    const loop = (now) => {
      const t = Math.min(1, (now - start) / total);
      const n = Math.floor(t * text.length);
      setCount(n);
      if (t < 1) {
        raf = requestAnimationFrame(loop);
      } else {
        finish();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const shown = text.slice(0, count);
  const isTyping = count < text.length;

  return (
    // Click-to-skip is a mouse-only enhancement: the readout auto-completes in
    // well under a second and the overlay closes on Escape, so keyboard users
    // are never blocked by the typewriter — no keyboard handler is needed here.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <p
      className={styles.readout}
      data-typing={isTyping || undefined}
      onClick={finish}
      title="Click to reveal"
    >
      {shown}
      {isTyping && <span className={styles.caret} aria-hidden="true" />}
    </p>
  );
}

export default function ExamineOverlay() {
  const actions = useGameActions();
  const panelRef = useDialogFocus();
  const examine = useAtomValue(examineAtom);
  const clockMinutes = useAtomValue(clockMinutesAtom);

  const target = examine ? examineTargetById[examine.targetId] : null;
  const roomId = examine?.roomId ?? target?.roomId ?? null;
  const room = roomId ? roomById[roomId] : null;
  const clue = target?.clueId ? clueById[target.clueId] : null;

  // Evidence callout reveals a beat after the panel slams in, for weight.
  const [showEvidence, setShowEvidence] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  // Sofa note: the card shows the jacket on the sofa; this toggles to the
  // close-up of the note in the pocket.
  const [zoomed, setZoomed] = useState(false);

  // ESC to close.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        actions.closeExamine();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  // Stage the evidence reveal (orange flash → slot/label) shortly after mount.
  useEffect(() => {
    setShowEvidence(false);
    setFlashOn(false);
    setZoomed(false);
    if (!clue) return undefined;
    const reduced = prefersReducedMotion();
    const delay = reduced ? 0 : 420;
    const t = setTimeout(() => {
      setShowEvidence(true);
      if (!reduced) {
        setFlashOn(true);
        // FlashWipe is a single 180ms pulse; reset the trigger after it plays.
        setTimeout(() => setFlashOn(false), 220);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [clue, examine?.targetId]);

  if (!examine || !target) return null;

  // Resolve the scene art for the room being inspected.
  const period = periodFor(clockMinutes);
  const sceneKey = room?.sceneAssetByPeriod?.[period] ?? null;
  const art = sceneKey ? sceneUrl(sceneKey) : null;

  // Dedicated clue art, if this hotspot carries one (otherwise we fall back to a
  // zoomed crop of the room). The sofa note has a second close-up reachable via
  // the zoom toggle.
  const baseImg = evidenceUrl(target.image);
  const zoomImg = evidenceUrl(target.zoomImage);
  const showZoom = zoomed && Boolean(zoomImg);
  const evidenceImg = showZoom ? zoomImg : baseImg;
  const evidenceFit = showZoom
    ? target.zoomFit ?? 'contain'
    : target.imageFit ?? 'cover';

  // Detail crop framing derived from the hotspot position, so the inspected
  // crop centers on the thing examined. Scale up for a "zoomed-in" detail feel.
  const ZOOM = 2.1;
  const fx = typeof target.x === 'number' ? target.x : 0.5;
  const fy = typeof target.y === 'number' ? target.y : 0.5;

  return (
    <motion.div
      className={styles.scrim}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onClick={actions.closeExamine}
      role="dialog"
      aria-modal="true"
      aria-label={`Inspecting ${target.label}`}
    >
      <FlashWipe active={flashOn} />

      <motion.div
        ref={panelRef}
        className={styles.panel}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.2, ease: [0.85, 0, 0.15, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <TerminalChrome
          label="Inspector"
          bracketsStaggered
          className={styles.chrome}
        >
          <div className={styles.layout}>
            {/* LEFT / TOP — framed, zoomed crop of the scene art. */}
            <div className={styles.viewport} data-period={period}>
              <div className={styles.crop}>
                {evidenceImg ? (
                  target.imageAspect ? (
                    <div className={styles.evidenceFit}>
                      <img
                        src={evidenceImg}
                        className={styles.evidenceFramed}
                        style={{ aspectRatio: target.imageAspect, objectFit: evidenceFit }}
                        alt={`${target.label}${showZoom ? ' detail' : ''}`}
                        draggable="false"
                      />
                    </div>
                  ) : (
                    <img
                      src={evidenceImg}
                      className={styles.evidenceImg}
                      style={{ objectFit: evidenceFit }}
                      alt={`${target.label}${showZoom ? ' detail' : ''}`}
                      draggable="false"
                    />
                  )
                ) : art ? (
                  <div
                    className={styles.cropImg}
                    style={{
                      backgroundImage: `url(${art})`,
                      backgroundSize: `${ZOOM * 100}%`,
                      backgroundPosition: `${fx * 100}% ${fy * 100}%`,
                    }}
                    role="img"
                    aria-label={`${room?.label ?? 'Scene'} detail`}
                  />
                ) : (
                  <div className={styles.cropMissing} aria-hidden="true">
                    NO SIGNAL
                  </div>
                )}
                {/* Reticle pins on a room-crop detail; hidden over full clue art. */}
                {!evidenceImg && (
                  <span className={styles.reticle} aria-hidden="true">
                    <span className={styles.rTL} />
                    <span className={styles.rTR} />
                    <span className={styles.rBL} />
                    <span className={styles.rBR} />
                  </span>
                )}
                <span className={styles.scan} aria-hidden="true" />
              </div>
              <div className={styles.viewportMeta}>
                <span className={styles.metaInfo}>
                  <span className={styles.metaRoom}>{room?.label ?? '—'}</span>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.metaPeriod}>{period.toUpperCase()}</span>
                </span>
                {zoomImg && (
                  <button
                    type="button"
                    className={styles.zoomBtn}
                    onClick={() => setZoomed((z) => !z)}
                  >
                    {showZoom ? '◂ BACK' : `${target.zoomLabel ?? 'ZOOM IN'} ▸`}
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT / BOTTOM — heading + readout + evidence verdict. */}
            <div className={styles.readoutCol}>
              <div className={styles.headBlock}>
                <div className={styles.headText}>
                  <span className={styles.eyebrow}>CLOSE INSPECTION</span>
                  <h2 className={styles.title}>
                    <ScrambleText target={target.label} duration={420} />
                  </h2>
                </div>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={actions.closeExamine}
                  aria-label="Close inspector"
                >
                  ESC
                </button>
              </div>

              <div className={styles.body}>
                <TypedReadout
                  key={examine.targetId}
                  text={target.flavor ?? ''}
                />
              </div>

              <div className={styles.verdict}>
                {clue ? (
                  showEvidence ? (
                    <motion.div
                      className={styles.evidence}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: [0.85, 0, 0.15, 1] }}
                    >
                      <div className={styles.evidenceHead}>
                        <span className={styles.evidenceCheck}>✓</span>
                        <ScrambleText
                          target="EVIDENCE LOGGED"
                          duration={360}
                          className={styles.evidenceLogged}
                        />
                      </div>
                      <div className={styles.evidenceRow}>
                        <span className={styles.evidenceLabel}>{clue.label}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className={styles.evidencePending} aria-hidden="true">
                      <span className={styles.pendingTick}>·</span> ANALYZING…
                    </div>
                  )
                ) : (
                  <div className={styles.noEvidence}>
                    {target.image ? 'BACKSTORY' : 'NOTHING OF NOTE'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TerminalChrome>
      </motion.div>
    </motion.div>
  );
}
