import { useCallback, useEffect, useRef, useState } from 'react';
import * as log from '@/lib/log';
import * as telemetry from '@/mystery/engine/telemetry';
import styles from './FunctionKeyBar.module.css';

const KEYS = [
  { key: 'F1', label: 'Probe', enabled: true },
  { key: 'F2', label: 'Evidence', enabled: true },
  { key: 'F3', label: 'Notes', enabled: true },
  { key: 'F4', label: 'Suspects', enabled: true },
  { key: 'F5', label: 'Save', enabled: true },
];

const FLASH_MS = 140;

export default function FunctionKeyBar() {
  const [flashing, setFlashing] = useState(null);
  const flashTimerRef = useRef(null);

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
      // Real handlers wired in Phase 6 (overlay open/close).
    },
    [flashKey],
  );

  useEffect(() => {
    const handler = (e) => {
      const match = KEYS.find((k) => k.key === e.key.toUpperCase());
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
        {KEYS.map((k) => (
          <li key={k.key} className={styles.item}>
            <button
              type="button"
              className={styles.button}
              data-pressed={flashing === k.key ? 'true' : 'false'}
              disabled={!k.enabled}
              aria-keyshortcuts={k.key}
              aria-label={`${k.label} (${k.key})`}
              onClick={() => trigger(k, 'mouse')}
            >
              <span aria-hidden="true" className={styles.bracket}>[</span>
              <span className={styles.label}>{k.label.toUpperCase()}</span>
              <span aria-hidden="true" className={styles.bracket}>]</span>
              <span aria-hidden="true" className={styles.shortcut}>{k.key}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
