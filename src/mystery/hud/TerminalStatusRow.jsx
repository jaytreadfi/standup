import { useAtomValue } from 'jotai';
import { clockMinutesAtom, objectiveAtom } from '@/mystery/state/mystery';
import { formatClock } from '@/mystery/engine/clock';
import styles from './TerminalStatusRow.module.css';

function sceneIndexForMinute(min) {
  if (min < 180) return 1;
  if (min < 360) return 2;
  if (min < 600) return 3;
  if (min < 1200) return 4;
  return 5;
}

export default function TerminalStatusRow() {
  const clockMinutes = useAtomValue(clockMinutesAtom);
  const objective = useAtomValue(objectiveAtom);
  const sceneIdx = sceneIndexForMinute(clockMinutes);
  const sceneStr = `SCENE ${String(sceneIdx).padStart(2, '0')}/05`;
  const nowStr = formatClock(clockMinutes).toUpperCase();

  return (
    <header className={styles.row} role="status" aria-live="polite">
      <div className={styles.zone}>
        <span className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandText}>TREAD</span>
        </span>
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.meta}>CASE 01/01</span>
      </div>

      <div className={`${styles.zone} ${styles.zoneCenter}`}>
        <span className={styles.meta}>{sceneStr}</span>
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.meta}>FLOOR 01</span>
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.objCell}>
          <span className={styles.objLabel}>OBJ</span>
          <span className={styles.objValue} title={objective}>
            {objective.toUpperCase()}
          </span>
        </span>
      </div>

      <div className={`${styles.zone} ${styles.zoneRight}`}>
        <span className={styles.clockCell}>
          <span className={styles.pulse} aria-hidden="true" />
          <span className={styles.clockLabel}>NOW</span>
          <span className={styles.clockValue}>{nowStr}</span>
        </span>
        <span className={styles.pipe} aria-hidden="true">|</span>
        <span className={styles.sunriseCell}>
          <span className={styles.clockLabel}>SUNRISE</span>
          <span className={styles.sunriseValue}>06:00:00</span>
        </span>
      </div>
    </header>
  );
}
