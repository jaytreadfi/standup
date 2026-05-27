import CornerBrackets from '@/components/chrome/CornerBrackets';
import SectionLabel from '@/components/chrome/SectionLabel';
import GhostNumber from '@/components/chrome/GhostNumber';
import cn from '@/lib/classnames';
import styles from './TerminalChrome.module.css';

export default function TerminalChrome({
  sceneId,
  sceneTotal = 1,
  label,
  ghostNumber,
  showCorners = true,
  bracketsStaggered = false,
  hideLabel = false,
  labelPosition = 'tl',
  className,
  children,
}) {
  return (
    <div className={cn(styles.root, className)}>
      {ghostNumber !== undefined && <GhostNumber value={ghostNumber} align="corner-tr" />}
      {showCorners && <CornerBrackets staggered={bracketsStaggered} />}
      {!hideLabel && label && (
        <SectionLabel index={sceneId} total={sceneTotal} label={label} position={labelPosition} />
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
