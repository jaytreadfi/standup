import { useAtomValue } from 'jotai';
import { objectiveAtom } from '@/mystery/state/mystery';
import styles from './TerminalStatusRow.module.css';

/**
 * TerminalStatusRow — the top banner, pared down to the one thing that matters:
 * the current objective. All the old terminal chrome (brand, case/scene/floor
 * counters, live clock, board-call deadline) was redundant clutter and has been
 * removed; the clock now lives prominently on the scene itself.
 */
export default function TerminalStatusRow() {
  const objective = useAtomValue(objectiveAtom);

  return (
    <header className={styles.row} role="status" aria-live="polite">
      <span className={styles.label} aria-hidden="true">OBJ</span>
      <p className={styles.objective}>{objective}</p>
    </header>
  );
}
