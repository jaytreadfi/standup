import { useAtomValue } from 'jotai';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import SpriteFrame from '@/components/chrome/SpriteFrame';
import {
  clockMinutesAtom,
  charactersInRoomAtom,
  suspicionByCharacterAtom,
} from '@/mystery/state/mystery';
import { characters } from '@/mystery/data/characters';
import { roomById } from '@/mystery/data/rooms';
import { roomByCharacter } from '@/mystery/engine/schedule';
import { badgeFor } from '@/mystery/engine/suspicion';
import { portraitUrl } from '@/mystery/data/scenes';
import styles from './RosterPanel.module.css';

/**
 * Suspicion tier from a 2-digit badge string.
 *  ≤5  = muted   (low / dormant)
 *  6-8 = warn    (rising)
 *  ≥9  = danger  (acute)
 */
function suspicionTier(value) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return 'mute';
  if (n >= 9) return 'danger';
  if (n >= 6) return 'warn';
  return 'mute';
}

/**
 * Status renderer. Composite forms like "SOFA · IDLE" or "ELEVATOR · 02:04"
 * split on the mid-dot: location reads in --color-text-dim, suffix in --color-text-muted.
 * Plain statuses render entirely in --color-text-dim.
 */
function StatusLine({ value }) {
  if (value && value.includes('·')) {
    const [location, ...rest] = value.split('·').map((s) => s.trim());
    const suffix = rest.join(' · ');
    return (
      <span className={styles.status}>
        <span className={styles.statusLocation}>{location}</span>
        <span className={styles.statusSep} aria-hidden="true">·</span>
        <span className={styles.statusSuffix}>{suffix}</span>
      </span>
    );
  }
  return (
    <span className={styles.status}>
      <span className={styles.statusLocation}>{value}</span>
    </span>
  );
}

export default function RosterPanel() {
  const clockMinutes = useAtomValue(clockMinutesAtom);
  const suspicion = useAtomValue(suspicionByCharacterAtom);
  // charactersInRoom is read live so the "active" stripe stays reactive to the clock.
  const charactersHere = useAtomValue(charactersInRoomAtom);

  const roomMap = roomByCharacter(characters, clockMinutes);
  const hereIds = new Set(charactersHere.map((c) => c.id));

  return (
    <div className={styles.root}>
      <TerminalChrome
        sceneId={2}
        sceneTotal={5}
        label="Roster"
        ghostNumber="08"
        labelPosition="tl"
      >
        <ul className={styles.list}>
          {characters.map((c) => {
            const room = roomMap[c.id];
            const status = (roomById[room]?.label ?? '—').toUpperCase();
            const raw = suspicion[c.id]?.raw ?? 0;
            const badge = badgeFor(raw);
            const active = hereIds.has(c.id);

            return (
              <li
                key={c.id}
                className={styles.row}
                data-active={active ? 'true' : 'false'}
              >
                <span className={styles.slot}>{c.slot}</span>
                <span className={styles.portraitWrap}>
                  <SpriteFrame
                    src={portraitUrl(c.id)}
                    cols={3}
                    rows={3}
                    col={0}
                    row={0}
                    size={32}
                    title={c.name}
                  />
                </span>
                <span className={styles.identity}>
                  <span className={styles.name}>{c.name.toUpperCase()}</span>
                  <StatusLine value={status} />
                </span>
                <span
                  className={styles.badge}
                  data-tier={suspicionTier(badge)}
                >
                  {badge}
                </span>
              </li>
            );
          })}
        </ul>
      </TerminalChrome>
    </div>
  );
}
