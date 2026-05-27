import { cn } from '@/lib/classnames';
import styles from './SectionLabel.module.css';

function SectionLabel({ index, total, label, position = 'tl' }) {
  const paddedIndex = String(index).padStart(2, '0');
  const paddedTotal = String(total).padStart(2, '0');

  return (
    <span className={cn(styles.root, styles[position])}>
      <span className={styles.index}>{paddedIndex}</span>
      <span className={styles.sep}>/</span>
      <span className={styles.total}>{paddedTotal}</span>
      <span className={styles.dot}>·</span>
      <span className={styles.text}>{String(label).toUpperCase()}</span>
    </span>
  );
}

export default SectionLabel;
