import { useAtomValue } from 'jotai';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  modeAtom,
  overlayAtom,
  mapOpenAtom,
  announceAtom,
  alertAtom,
  useTrackModeChanges,
  useTrackOverlayChanges,
} from '@/mystery/state/mystery';
import { useGameClock } from '@/mystery/state/actions';
import * as telemetry from '@/mystery/engine/telemetry';

import LandingMode from '@/mystery/modes/LandingMode.jsx';
import IntroMode from '@/mystery/modes/IntroMode.jsx';
import ColdOpenMode from '@/mystery/modes/ColdOpenMode.jsx';
import FreeRoamMode from '@/mystery/modes/FreeRoamMode.jsx';
import DialogueMode from '@/mystery/modes/DialogueMode.jsx';
import AccusationMode from '@/mystery/modes/AccusationMode.jsx';
import EndingMode from '@/mystery/modes/EndingMode.jsx';

import MapOverlay from '@/mystery/overlays/MapOverlay.jsx';
import ExamineOverlay from '@/mystery/overlays/ExamineOverlay.jsx';
import NotebookOverlay from '@/mystery/overlays/NotebookOverlay.jsx';
import SuspectsOverlay from '@/mystery/overlays/SuspectsOverlay.jsx';

import TerminalStatusRow from '@/mystery/hud/TerminalStatusRow.jsx';
import FunctionKeyBar from '@/mystery/hud/FunctionKeyBar.jsx';
import RosterPanel from '@/mystery/hud/RosterPanel.jsx';
import RecentEvidencePanel from '@/mystery/hud/RecentEvidencePanel.jsx';

import styles from './GameShell.module.css';

// Visually-hidden but screen-reader-available. Standard sr-only clip pattern.
const SR_ONLY = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Off-screen aria-live regions driven by the action layer. Mounted ABOVE the
 * fullscreen/HUD branch split so it survives mode changes (a freshly-mounted
 * live region won't re-announce), letting the forced sunrise ending and routine
 * evidence/travel updates reach assistive tech.
 */
function Announcer() {
  const polite = useAtomValue(announceAtom);
  const assertive = useAtomValue(alertAtom);
  return (
    <>
      <div aria-live="polite" aria-atomic="true" style={SR_ONLY}>
        {polite}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" style={SR_ONLY}>
        {assertive}
      </div>
    </>
  );
}

// Cinematic / focused modes — render full-screen, no HUD chrome.
const FULLSCREEN_MODES = {
  LANDING: LandingMode,
  INTRO: IntroMode,
  COLD_OPEN: ColdOpenMode,
  ACCUSATION: AccusationMode,
  ENDING: EndingMode,
};

// Exploration modes — render inside the terminal HUD (status rows + sidebar + F-keys).
const HUD_MODES = {
  FREE_ROAM: FreeRoamMode,
  DIALOGUE: DialogueMode,
};

export default function GameShell() {
  const mode = useAtomValue(modeAtom);
  const overlay = useAtomValue(overlayAtom);
  const mapOpen = useAtomValue(mapOpenAtom);
  const shellRef = useRef(null);

  useTrackModeChanges();
  useTrackOverlayChanges();
  useGameClock();

  // While an overlay/map is open, mark the background HUD inert so the focus
  // trap is real: Tab can't reach controls behind the scrim and they're not
  // clickable. The overlays render as siblings of .shell, so they stay live.
  const overlayOpen = Boolean(overlay) || mapOpen;
  useEffect(() => {
    const el = shellRef.current;
    if (el) el.inert = overlayOpen;
  }, [overlayOpen]);

  useEffect(() => {
    telemetry.event('shell_mounted', { ts: Date.now() });
  }, []);

  const FullscreenMode = FULLSCREEN_MODES[mode];
  const ActiveMode = HUD_MODES[mode] || FreeRoamMode;

  const content = FullscreenMode ? (
    <div className={styles.fullscreenShell}>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          className={styles.fullscreenFrame}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <FullscreenMode />
        </motion.div>
      </AnimatePresence>
    </div>
  ) : (
    <>
      <div className={styles.shell} ref={shellRef}>
        <TerminalStatusRow />
        <div className={styles.body}>
          <main className={styles.modeArea}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                className={styles.modeFrame}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <ActiveMode />
              </motion.div>
            </AnimatePresence>
          </main>
          <aside className={styles.sidebar}>
            <RosterPanel />
            <RecentEvidencePanel />
          </aside>
        </div>
        <FunctionKeyBar />
      </div>

      {/* Overlay + map layer — rendered as a SIBLING of .shell so the
          `.shell > *` relative/z-index rule can't clobber their fixed scrims.
          Each overlay self-renders a fixed full-screen scrim. */}
      <AnimatePresence>
        {overlay === 'EXAMINE' && <ExamineOverlay key="examine" />}
        {overlay === 'NOTEBOOK' && <NotebookOverlay key="notebook" />}
        {overlay === 'SUSPECTS' && <SuspectsOverlay key="suspects" />}
        {mapOpen && <MapOverlay key="map" />}
      </AnimatePresence>
    </>
  );

  // MotionConfig honors prefers-reduced-motion for framer's WAAPI transforms
  // (the CSS @media rule alone doesn't cover those). Announcer sits above the
  // branch split so its live regions persist across mode changes.
  return (
    <MotionConfig reducedMotion="user">
      <Announcer />
      {content}
    </MotionConfig>
  );
}
