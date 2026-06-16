/**
 * rooms.js — canonical room data for the office, the night of the murder.
 *
 * Pure data. No imports from React, Jotai, or engine modules.
 * Engine + view layers consume this; this consumes nothing (asset KEYS only;
 * resolution to URLs happens in data/scenes.js).
 *
 * Six rooms of the floor:
 *   coworking → the bullpen, where Sam's body is
 *   office    → David's enclosed office
 *   pantry    → kitchen / pantry
 *   sofa      → lounge / reception
 *   printer   → printer nook
 *   elevator  → lobby / the only way out
 *
 * Each room carries:
 *   sceneAssetByPeriod — scene art key per time-of-day (resolved in scenes.js)
 *   examineTargets     — clickable hotspots on the SCENE (x,y are fractions 0..1
 *                        of the scene image; clueId optional → grants evidence)
 *   schematic          — {x,y,w,h} block (fractions 0..1) for the redesigned MAP
 */

export const ROOM_IDS = ['coworking', 'office', 'pantry', 'sofa', 'printer', 'elevator'];

const ALL_ADJACENT = ['coworking', 'office', 'pantry', 'sofa', 'printer', 'elevator'];

export const rooms = [
  {
    id: 'coworking',
    label: 'COWORKING',
    short: 'CWK',
    sceneAssetByPeriod: { morning: 'coworking-day', dusk: 'coworking-dusk', night: 'coworking-night' },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'coworking'),
    examineTargets: [
      { id: 'cw-body', label: 'THE BODY', x: 0.40, y: 0.62, flavor: 'Sam, face-down between the desks. The skin says hours. The bruise on the forearm says they saw it coming — and the phone that never leaves their hand is gone.', clueId: 'the-body' },
      { id: 'cw-window', label: 'THE WINDOW', x: 0.72, y: 0.34, flavor: 'Rain sheeting down forty floors of glass. The city glitters and doesn’t care. It never does.' },
    ],
    schematic: { x: 0.68, y: 0.54, w: 0.28, h: 0.38 },
  },
  {
    id: 'office',
    label: 'DAVID’S OFFICE',
    short: 'OFC',
    sceneAssetByPeriod: { morning: 'office-day', dusk: 'office-dusk', night: 'office-night' },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'office'),
    examineTargets: [
      { id: 'of-desk', label: 'DAVID’S DESK', x: 0.50, y: 0.58, flavor: 'The bottom drawer doesn’t sit flush. Inside: a burner phone, still warm, and a yellowed clipping — a hit-and-run, years back, never closed.', clueId: 'retrieved-proof' },
      { id: 'of-photo', label: 'FRAMED PHOTO', x: 0.24, y: 0.72, flavor: 'David and a younger man, arms slung over shoulders on some old road trip. The other face has been scratched out with a key.' },
    ],
    schematic: { x: 0.68, y: 0.08, w: 0.28, h: 0.38 },
  },
  {
    id: 'pantry',
    label: 'PANTRY',
    short: 'PAN',
    sceneAssetByPeriod: { morning: 'pantry-day', dusk: 'pantry-dusk', night: 'pantry-night' },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'pantry'),
    examineTargets: [
      { id: 'pn-glasses', label: 'TWO GLASSES', x: 0.42, y: 0.60, flavor: 'Two whiskey glasses by the sink, set down around two. One wears Sam’s prints. The other’s been wiped down to nothing — the only clean thing in this room.', clueId: 'two-glasses' },
      { id: 'pn-sink', label: 'THE SINK', x: 0.74, y: 0.42, flavor: 'Still wet. A dish towel folded too neatly for 2 a.m. Somebody tidied in a hurry and called it calm.' },
    ],
    schematic: { x: 0.36, y: 0.08, w: 0.28, h: 0.38 },
  },
  {
    id: 'sofa',
    label: 'SOFA · LOUNGE',
    short: 'LNG',
    sceneAssetByPeriod: { morning: 'sofa-day', dusk: 'sofa-dusk', night: 'sofa-night' },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'sofa'),
    examineTargets: [
      { id: 'sf-jacket', label: 'PONCHO’S JACKET', x: 0.46, y: 0.62, flavor: 'Poncho’s jacket, thrown over the lounge arm. In the pocket, a crumpled IOU — a lot owed to Sam. Damning, until you notice it’s a month old and torn clean down the middle.', clueId: 'owed-note' },
    ],
    schematic: { x: 0.04, y: 0.08, w: 0.28, h: 0.38 },
  },
  {
    id: 'printer',
    label: 'PRINTER · NOOK',
    short: 'PRN',
    sceneAssetByPeriod: { morning: 'printer', dusk: 'printer', night: 'printer' },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'printer'),
    examineTargets: [
      { id: 'pr-shredder', label: 'THE SHREDDER', x: 0.50, y: 0.62, flavor: 'Fresh confetti in the bin. Patient fingers reassemble it: that same clipping, and a line in Sam’s hand — "last time. then it’s done." Someone disagreed.', clueId: 'shredded-letter' },
    ],
    schematic: { x: 0.36, y: 0.54, w: 0.28, h: 0.38 },
  },
  {
    id: 'elevator',
    label: 'ELEVATOR',
    short: 'ELV',
    sceneAssetByPeriod: { morning: 'elevator', dusk: 'elevator', night: 'elevator' },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'elevator'),
    examineTargets: [
      { id: 'el-badge', label: 'BADGE LOG', x: 0.50, y: 0.50, flavor: 'The reader’s memory: #D2 (Sam) in, never out. And a hole where #D1 — David’s — should be, scrubbed, with a quiet re-entry at 01:55. He told everyone he left at midnight.', clueId: 'scrubbed-badge' },
    ],
    schematic: { x: 0.04, y: 0.54, w: 0.28, h: 0.38 },
  },
];

export const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]));

/** All examine targets flattened, keyed by target id → { ...target, roomId }. */
export const examineTargetById = Object.fromEntries(
  rooms.flatMap((r) => (r.examineTargets ?? []).map((t) => [t.id, { ...t, roomId: r.id }])),
);
