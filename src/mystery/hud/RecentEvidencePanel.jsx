import { useAtomValue } from 'jotai';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import { collectedCluesAtom } from '@/mystery/state/mystery';
import { clueById } from '@/mystery/data/clues';
import { formatClock } from '@/mystery/engine/clock';
import styles from './RecentEvidencePanel.module.css';

export default function RecentEvidencePanel() {
  const clues = useAtomValue(collectedCluesAtom);
  const recent = clues.slice(-5).reverse();

  return (
    <div className={styles.root}>
      <TerminalChrome label="Recent Evidence" labelPosition="tl">
        <div className={styles.body}>
          {recent.length === 0 && (
            <p className={styles.empty}>Tag a hotspot to log evidence.</p>
          )}
          {recent.length > 0 && (
            <div className={styles.list}>
              {recent.map((clue, idx) => {
                // Stable EV number = the clue's global position in collection
                // order (newest first in this reversed slice), so it matches the
                // Case File's numbering instead of being a positional 1..5.
                const idLabel = `EV-${String(clues.length - idx).padStart(2, '0')}`;
                const cluLabel =
                  clueById[clue.id]?.label ??
                  (typeof clue.id === 'string' ? clue.id.toUpperCase() : '');
                const time =
                  typeof clue.atMinute === 'number'
                    ? formatClock(clue.atMinute)
                    : null;
                const source =
                  typeof clue.source === 'string' && clue.source.length > 0
                    ? clue.source.toUpperCase()
                    : null;
                const metaParts = [];
                if (time) metaParts.push(time);
                else if (typeof clue.atMinute === 'number')
                  metaParts.push(`@${clue.atMinute}m`);
                if (source) metaParts.push(source);

                const rowClass =
                  idx === 0 ? `${styles.row} ${styles.rowLatest}` : styles.row;

                return (
                  <div key={clue.id} className={rowClass}>
                    <div className={styles.rowHead}>
                      <span className={styles.id}>{idLabel}</span>
                      <span className={styles.sep} aria-hidden="true">
                        &middot;
                      </span>
                      <span className={styles.desc}>{cluLabel}</span>
                    </div>
                    {metaParts.length > 0 && (
                      <div className={styles.rowMeta}>
                        {metaParts.join(' · ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </TerminalChrome>
    </div>
  );
}
