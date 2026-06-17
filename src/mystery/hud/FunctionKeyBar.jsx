import { useCallback, useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import * as log from '@/lib/log';
import * as telemetry from '@/mystery/engine/telemetry';
import { useGameActions } from '@/mystery/state/actions';
import { modeAtom, overlayAtom, mapOpenAtom, collectedCluesAtom } from '@/mystery/state/mystery';
import styles from './FunctionKeyBar.module.css';

const FLASH_MS = 140;
const MIN_CLUES_TO_ACCUSE = 3;

export default function FunctionKeyBar() {
  const actions = useGameActions();
  const mode = useAtomValue(modeAtom);
  const overlay = useAtomValue(overlayAtom);
  const mapOpen = useAtomValue(mapOpenAtom);
  const collectedClues = useAtomValue(collectedCluesAtom);

  const [flashing, setFlashing] = useState(null);
  const flashTimerRef = useRef(null);

  // Only the exploration surface accepts these actions.
  const inField = mode === 'FREE_ROAM';
  // ACCUSE is unavailable until you have enough evidence to file a 3-clue case —
  // mirrors the beginAccusation() guard so the key visibly reads as locked.
  const canAccuse = inField && collectedClues.length >= MIN_CLUES_TO_ACCUSE;

  // The bar shows only the three primary verbs. MAP lives on the scene itself and
  // SAVE was removed (no save in this build). Function-key hints are intentionally
  // not rendered, but the shortcuts stay wired (F1 map / F2 evidence / F3 suspects
  // / F4 accuse) for keyboard users and testing. `bar:false` = keyboard-only.
  const KEYS = [
    { key: 'F1', label: 'Map', bar: false, enabled: inField, active: mapOpen,
      run: () => (mapOpen ? actions.closeMap() : actions.openMap()) },
    { key: 'F2', label: 'Evidence', bar: true, enabled: inField, active: overlay === 'NOTEBOOK',
      run: () => (overlay === 'NOTEBOOK' ? actions.closeOverlay() : actions.openOverlay('NOTEBOOK')) },
    { key: 'F3', label: 'Suspects', bar: true, enabled: inField, active: overlay === 'SUSPECTS',
      run: () => (overlay === 'SUSPECTS' ? actions.closeOverlay() : actions.openOverlay('SUSPECTS')) },
    { key: 'F4', label: 'Accuse', bar: true, enabled: canAccuse, active: false,
      run: () => actions.beginAccusation() },
  ];

  const barKeys = KEYS.filter((k) => k.bar);

  const flashKey = useCallback((key) => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlashing(key);
    flashTimerRef.current = setTimeout(() => setFlashing(null), FLASH_MS);
  }, []);

  const trigger = useCallback(
    (entry, source) => {
      if (!entry.enabled) return;
      log.log(`[fkey] ${entry.key} ${entry.label}`);
      telemetry.event('fkey_press', { key: entry.key, label: entry.label });
      telemetry.event('action_click', { label: entry.label, source });
      flashKey(entry.key);
      entry.run();
    },
    [flashKey],
  );

  // Keep the latest KEYS in a ref so the keydown listener always sees current
  // enabled/active/run state without re-registering on every render. trigger is
  // stable (useCallback[flashKey]), so this effect attaches exactly once.
  const keysRef = useRef(KEYS);
  keysRef.current = KEYS;

  useEffect(() => {
    const handler = (e) => {
      const match = keysRef.current.find((k) => k.key === e.key.toUpperCase());
      if (!match || !match.enabled) return;
      e.preventDefault();
      trigger(match, 'keyboard');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [trigger]);

  useEffect(() => () => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
  }, []);

  return (
    <nav className={styles.row} aria-label="Primary actions">
      <ul className={styles.list}>
        {barKeys.map((k) => (
          <li key={k.key} className={styles.item}>
            <button
              type="button"
              className={styles.button}
              data-pressed={flashing === k.key || k.active ? 'true' : 'false'}
              disabled={!k.enabled}
              aria-keyshortcuts={k.key}
              aria-pressed={k.active ? 'true' : undefined}
              aria-label={k.label}
              title={k.key === 'F4' && !k.enabled ? `Log ${MIN_CLUES_TO_ACCUSE} clues before you can accuse` : undefined}
              onClick={() => trigger(k, 'mouse')}
            >
              <span aria-hidden="true" className={styles.bracket}>[</span>
              <span className={styles.label}>{k.label.toUpperCase()}</span>
              <span aria-hidden="true" className={styles.bracket}>]</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
