import cn from '@/lib/classnames';
import styles from './SpriteFrame.module.css';

/**
 * SpriteFrame — renders one cell of a sprite sheet via background-image + background-position.
 * GPU does the cropping; switching cells is one style update.
 *
 * The container is `size × size`. The full sheet is scaled to (cols*size × rows*size)
 * and positioned so only the (col, row) cell shows.
 *
 * @param {object} props
 * @param {string} props.src                Path/import of the sprite sheet image.
 * @param {number} [props.cols=3]           Columns in the sheet.
 * @param {number} [props.rows=3]           Rows in the sheet.
 * @param {number} [props.col=0]            Which column (0-indexed) to show.
 * @param {number} [props.row=0]            Which row (0-indexed) to show.
 * @param {number} [props.size=80]          Pixel size of the rendered cell (height + width).
 * @param {boolean} [props.bordered=true]   Render a 1px inner frame border.
 * @param {string} [props.state]            Optional state hook: 'dim' | 'hot' | undefined.
 * @param {string} [props.className]
 * @param {string} [props.title]            Optional title attr (alt-equivalent for div).
 */
export default function SpriteFrame({
  src,
  cols = 3,
  rows = 3,
  col = 0,
  row = 0,
  size = 80,
  bordered = true,
  state,
  className,
  title,
}) {
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url(${src})`,
    backgroundSize: `${cols * size}px ${rows * size}px`,
    backgroundPosition: `${-col * size}px ${-row * size}px`,
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div
      role="img"
      aria-label={title}
      title={title}
      data-state={state}
      className={cn(styles.root, bordered && styles.bordered, className)}
      style={style}
    />
  );
}
