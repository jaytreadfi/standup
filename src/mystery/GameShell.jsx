import { useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  modeAtom,
  overlayAtom,
  mapOpenAtom,
  useTrackModeChanges,
  useTrackOverlayChanges,
} from '@/mystery/state/mystery';
import * as telemetry from '@/mystery/engine/telemetry';

import BootMode from '@/mystery/modes/BootMode.jsx';
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
import SystemStatusRow from '@/mystery/hud/SystemStatusRow.jsx';
import RosterPanel from '@/mystery/hud/RosterPanel.jsx';
import RecentEvidencePanel from '@/mystery/hud/RecentEvidencePanel.jsx';

import styles from './GameShell.module.css';

// Cinematic / focused modes — render full-screen, no HUD chrome.
const FULLSCREEN_MODES = {
  BOOT: BootMode,
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
  const setMode = useSetAtom(modeAtom);
  const overlay = useAtomValue(overlayAtom);
  const mapOpen = useAtomValue(mapOpenAtom);
  const shellRef = useRef(null);

  useTrackModeChanges();
  useTrackOverlayChanges();

  // While an overlay/map is open, mark the background HUD inert so the focus
  // trap is real: Tab can't reach controls behind the scrim and they're not
  // clickable. The overlays render as siblings of .shell, so they stay live.
  const overlayOpen = Boolean(overlay) || mapOpen;
  useEffect(() => {
    const el = shellRef.current;
    if (el) el.inert = overlayOpen;
  }, [overlayOpen]);

  // Auto-advance the boot splash into the cold-open briefing.
  useEffect(() => {
    if (mode === 'BOOT') {
      const t = setTimeout(() => setMode('COLD_OPEN'), 300);
      return () => clearTimeout(t);
    }
  }, [mode, setMode]);

  useEffect(() => {
    telemetry.event('shell_mounted', { ts: Date.now() });
  }, []);

  const FullscreenMode = FULLSCREEN_MODES[mode];
  if (FullscreenMode) {
    return (
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
    );
  }

  const ActiveMode = HUD_MODES[mode] || FreeRoamMode;

  return (
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
        <SystemStatusRow />
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
}
