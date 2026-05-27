import { useAtomValue } from 'jotai';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import { collectedCluesAtom } from '@/mystery/state/mystery';
import { formatClock } from '@/mystery/engine/clock';
import styles from './RecentEvidencePanel.module.css';

export default function RecentEvidencePanel() {
  const clues = useAtomValue(collectedCluesAtom);
  const recent = clues.slice(-5).reverse();

  return (
    <div className={styles.root}>
      <TerminalChrome
        sceneId={3}
        sceneTotal={5}
        label="Recent Evidence"
        ghostNumber="EV"
        labelPosition="tl"
      >
        <div className={styles.body}>
          {recent.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyHead}>
                <span className={styles.emptyPrompt}>&gt; AWAITING DATA</span>
                <span className={styles.caret} aria-hidden="true">
                  &#9646;
                </span>
              </div>
              <div className={styles.emptyRule} aria-hidden="true">
                &#9472; &middot; &#9472; &middot; &#9472;
              </div>
              <div className={styles.emptySub}>
                Tag a hotspot to log it as evidence.
              </div>
            </div>
          )}
          {recent.length > 0 && (
            <div className={styles.list}>
              {recent.map((clue, idx) => {
                const idLabel = `EV-${String(idx + 1).padStart(2, '0')}`;
                const cluLabel =
                  typeof clue.id === 'string' ? clue.id.toUpperCase() : '';
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
