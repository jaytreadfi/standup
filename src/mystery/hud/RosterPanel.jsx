import TerminalChrome from '@/components/chrome/TerminalChrome';
import SpriteFrame from '@/components/chrome/SpriteFrame';
import davidPortrait from '@/assets/portraits/david.png';
import samPortrait from '@/assets/portraits/sam.png';
import jayPortrait from '@/assets/portraits/jay.png';
import peemPortrait from '@/assets/portraits/peem.png';
import denaPortrait from '@/assets/portraits/dena.png';
import ponchoPortrait from '@/assets/portraits/poncho.png';
import chingPortrait from '@/assets/portraits/ching.png';
import jamiePortrait from '@/assets/portraits/jamie.png';
import styles from './RosterPanel.module.css';

const ROSTER_STUB = [
  { id: 'david',  slot: 'D1', name: 'David',  status: 'OFFICE',           badge: '00', portrait: davidPortrait,  active: false },
  { id: 'sam',    slot: 'D2', name: 'Sam',    status: 'PANTRY',           badge: '02', portrait: samPortrait,    active: false },
  { id: 'jay',    slot: 'D3', name: 'Jay',    status: 'COWORKING',        badge: '04', portrait: jayPortrait,    active: true  },
  { id: 'peem',   slot: 'D4', name: 'Peem',   status: 'PRINTER',          badge: '06', portrait: peemPortrait,   active: false },
  { id: 'dena',   slot: 'D5', name: 'Dena',   status: 'PANTRY',           badge: '01', portrait: denaPortrait,   active: false },
  { id: 'poncho', slot: 'D6', name: 'Poncho', status: 'COWORKING',        badge: '03', portrait: ponchoPortrait, active: false },
  { id: 'ching',  slot: 'D7', name: 'Ching',  status: 'SOFA · IDLE',      badge: '05', portrait: chingPortrait,  active: false },
  { id: 'jamie',  slot: 'D8', name: 'Jamie',  status: 'ELEVATOR · 02:04', badge: '08', portrait: jamiePortrait,  active: false },
];

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
          {ROSTER_STUB.map((row) => (
            <li
              key={row.id}
              className={styles.row}
              data-active={row.active ? 'true' : 'false'}
            >
              <span className={styles.slot}>{row.slot}</span>
              <span className={styles.portraitWrap}>
                <SpriteFrame
                  src={row.portrait}
                  cols={3}
                  rows={3}
                  col={0}
                  row={0}
                  size={32}
                  title={row.name}
                />
              </span>
              <span className={styles.identity}>
                <span className={styles.name}>{row.name.toUpperCase()}</span>
                <StatusLine value={row.status} />
              </span>
              <span
                className={styles.badge}
                data-tier={suspicionTier(row.badge)}
              >
                {row.badge}
              </span>
            </li>
          ))}
        </ul>
      </TerminalChrome>
    </div>
  );
}
