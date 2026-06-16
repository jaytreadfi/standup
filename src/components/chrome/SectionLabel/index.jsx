import { cn } from '@/lib/classnames';
import styles from './SectionLabel.module.css';

function SectionLabel({ index, total, label, position = 'tl' }) {
  // Guard against a missing index/total so a caller that omits them never
  // renders the literal string "UNDEFINED".
  const hasCounter = index !== undefined && index !== null;
  const hasTotal = total !== undefined && total !== null;

  return (
    <span className={cn(styles.root, styles[position])}>
      {hasCounter && (
        <>
          <span className={styles.index}>{String(index).padStart(2, '0')}</span>
          {hasTotal && (
            <>
              <span className={styles.sep}>/</span>
              <span className={styles.total}>{String(total).padStart(2, '0')}</span>
            </>
          )}
          <span className={styles.dot}>·</span>
        </>
      )}
      <span className={styles.text}>{String(label).toUpperCase()}</span>
    </span>
  );
}

export default SectionLabel;
