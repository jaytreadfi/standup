import { useAtom, useAtomValue } from 'jotai';
import TerminalChrome from '@/components/chrome/TerminalChrome';
import { currentRoomAtom, clockMinutesAtom } from '@/mystery/state/mystery';
import { periodFor, formatClock } from '@/mystery/engine/clock';
import { rooms, roomById } from '@/mystery/data/rooms';
import * as telemetry from '@/mystery/engine/telemetry';
import floorPlanUrl from '@/assets/floorplan/floor-01.png';
import styles from './FreeRoamMode.module.css';

export default function FreeRoamMode() {
  const [currentRoom, setCurrentRoom] = useAtom(currentRoomAtom);
  const clockMinutes = useAtomValue(clockMinutesAtom);
  const period = periodFor(clockMinutes);
  const label = roomById[currentRoom]?.label ?? currentRoom?.toUpperCase() ?? 'OFFICE';

  const handleNavigate = (roomId) => {
    if (roomId === currentRoom) return;
    setCurrentRoom(roomId);
    telemetry.event(telemetry.EVENT_NAMES.ROOM_ENTER, { from: currentRoom, to: roomId });
  };

  return (
    <div className={styles.root}>
      <TerminalChrome
        sceneId={1}
        sceneTotal={5}
        label="Floor Plan"
        ghostNumber="01"
      >
        <div className={styles.canvas} data-period={period}>
          <div className={styles.mapBox}>
            <img
              src={floorPlanUrl}
              alt="Tread office floor plan"
              className={styles.floorPlan}
              draggable="false"
            />
            <div className={styles.hotspotLayer}>
              {rooms.map((room) => {
                if (!room.mapPosition) return null;
                const isActive = room.id === currentRoom;
                return (
                  <button
                    key={room.id}
                    type="button"
                    className={styles.hotspot}
                    data-active={isActive || undefined}
                    style={{
                      left: `${room.mapPosition.x * 100}%`,
                      top: `${room.mapPosition.y * 100}%`,
                    }}
                    onClick={() => handleNavigate(room.id)}
                    aria-label={`Go to ${room.label}`}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    <span className={styles.reticle} aria-hidden="true">
                      <span className={styles.cornerTL} />
                      <span className={styles.cornerTR} />
                      <span className={styles.cornerBL} />
                      <span className={styles.cornerBR} />
                      <span className={styles.activeFrame} />
                      <span className={styles.activeDot} />
                    </span>
                    <span className={styles.hotspotLabel}>{room.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.locationBlock}>
            <span className={styles.locationLabel}>
              <span className={styles.locationGlyph}>▸</span> CURRENT LOCATION
            </span>
            <span className={styles.locationValue}>{label}</span>
            <span className={styles.locationMeta}>
              {formatClock(clockMinutes)} · {period.toUpperCase()}
            </span>
          </div>
        </div>
      </TerminalChrome>
    </div>
  );
}
