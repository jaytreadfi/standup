import { useAtom, useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import {
  modeAtom,
  overlayAtom,
  useTrackModeChanges,
  useTrackOverlayChanges,
} from '@/mystery/state/mystery';
import * as telemetry from '@/mystery/engine/telemetry';

import BootMode from '@/mystery/modes/BootMode.jsx';
import FreeRoamMode from '@/mystery/modes/FreeRoamMode.jsx';

import TerminalStatusRow from '@/mystery/hud/TerminalStatusRow.jsx';
import FunctionKeyBar from '@/mystery/hud/FunctionKeyBar.jsx';
import SystemStatusRow from '@/mystery/hud/SystemStatusRow.jsx';
import RosterPanel from '@/mystery/hud/RosterPanel.jsx';
import RecentEvidencePanel from '@/mystery/hud/RecentEvidencePanel.jsx';

import styles from './GameShell.module.css';

const MODE_COMPONENTS = {
  BOOT: BootMode,
  FREE_ROAM: FreeRoamMode,
  // COLD_OPEN, DIALOGUE, ACCUSATION, ENDING land in later phases. Falls back to FreeRoamMode.
};

export default function GameShell() {
  const [mode, setMode] = useAtom(modeAtom);
  const overlay = useAtomValue(overlayAtom);

  useTrackModeChanges();
  useTrackOverlayChanges();

  // Auto-advance from BOOT → FREE_ROAM after a brief beat.
  useEffect(() => {
    if (mode === 'BOOT') {
      const t = setTimeout(() => setMode('FREE_ROAM'), 300);
      return () => clearTimeout(t);
    }
  }, [mode, setMode]);

  // Telemetry for initial mount
  useEffect(() => {
    telemetry.event('shell_mounted', { ts: Date.now() });
  }, []);

  // Global keydown for F1-F4 (Phase 1: stubbed — see hud/FunctionKeyBar)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        // overlay closing handled by overlay components in Phase 6; here we no-op.
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const ActiveMode = MODE_COMPONENTS[mode] || FreeRoamMode;

  return (
    <div className={styles.shell}>
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
      {/* Overlay router — Phase 1 stubs only. Real overlays in Phase 6. */}
      {overlay && <div className={styles.overlayStub} aria-hidden="true">{`Overlay: ${overlay}`}</div>}
    </div>
  );
}
