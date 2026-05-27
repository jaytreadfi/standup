import { cn } from '@/lib/classnames';
import styles from './GhostNumber.module.css';

function GhostNumber({ value, align = 'corner-tr' }) {
  return (
    <div className={cn(styles.root, styles[align])} aria-hidden="true">
      {String(value)}
    </div>
  );
}

export default GhostNumber;
