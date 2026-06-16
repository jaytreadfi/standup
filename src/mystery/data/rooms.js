/**
 * rooms.js — canonical room data for Tread Office.
 *
 * Pure data. No imports from React, Jotai, or engine modules.
 * Engine + view layers consume this; this consumes nothing (asset KEYS only;
 * resolution to URLs happens in data/scenes.js).
 *
 * The six rooms of the Tread office floor:
 *   coworking → main shared workspace
 *   office    → David's enclosed office
 *   pantry    → kitchen / pantry
 *   sofa      → lounge / reception
 *   printer   → printer nook
 *   elevator  → lobby / transition
 *
 * Each room carries:
 *   sceneAssetByPeriod — scene art key per time-of-day (resolved in scenes.js)
 *   examineTargets     — clickable hotspots on the SCENE (x,y are fractions 0..1
 *                        of the scene image; clueId optional → grants evidence)
 *   schematic          — {x,y,w,h} block (fractions 0..1) for the redesigned MAP
 *   adjacents          — every room reachable from every other (provisional)
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
      { id: 'cw-desk', label: 'CLUTTERED DESK', x: 0.32, y: 0.66, flavor: 'A workstation mid-crisis — energy cans, a tangled dock. An unlabeled USB drive juts out, warm to the touch.', clueId: 'usb-drive' },
      { id: 'cw-whiteboard', label: 'WHITEBOARD', x: 0.70, y: 0.34, flavor: 'Sprint goals, half-erased. The row that read "DECK · FINAL" has been wiped clean. The eraser is still damp.' },
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
      { id: 'of-laptop', label: 'DAVID’S LAPTOP', x: 0.50, y: 0.58, flavor: 'The deck file is open to its version history. Fourteen slides were deleted at 02:14 last night — long after everyone "left."', clueId: 'deleted-slides' },
      { id: 'of-drawer', label: 'DESK DRAWER', x: 0.24, y: 0.72, flavor: 'Locked. A faint smell of cold espresso clings to the handle.' },
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
      { id: 'pn-mug', label: 'ABANDONED MUG', x: 0.42, y: 0.66, flavor: 'A coffee ring, still tacky. Fresh espresso crema. Someone was making a 2 a.m. cup while the rest of the floor slept.', clueId: 'coffee-ring' },
      { id: 'pn-fridge', label: 'FRIDGE NOTES', x: 0.74, y: 0.42, flavor: 'Passive-aggressive sticky notes about stolen oat milk. Nothing useful here. Probably.' },
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
      { id: 'sf-cushion', label: 'COUCH CUSHION', x: 0.46, y: 0.70, flavor: 'Shoved deep between the cushions: a crumpled note. "cover for me at standup? owe you one." No signature.', clueId: 'alibi-note' },
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
      { id: 'pr-tray', label: 'SHREDDER TRAY', x: 0.50, y: 0.62, flavor: 'Confetti of a printed deck. Reassemble enough and slide 9 emerges — the kill-shot revenue metric, deliberately destroyed.', clueId: 'shredded-printout' },
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
      { id: 'el-badge', label: 'BADGE READER LOG', x: 0.50, y: 0.50, flavor: 'Last night’s access log: one badge in at 02:02, out at 02:31. Badge #D2 — Sam’s. The only soul on this floor.', clueId: 'late-badge' },
    ],
    schematic: { x: 0.04, y: 0.54, w: 0.28, h: 0.38 },
  },
];

export const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]));

/** All examine targets flattened, keyed by target id → { ...target, roomId }. */
export const examineTargetById = Object.fromEntries(
  rooms.flatMap((r) => (r.examineTargets ?? []).map((t) => [t.id, { ...t, roomId: r.id }])),
);
