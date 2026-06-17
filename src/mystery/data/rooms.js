/**
 * rooms.js — canonical room data for the Tread floor, the night Yibo died.
 *
 * Pure data. No imports from React, Jotai, or engine modules.
 * Engine + view layers consume this; this consumes nothing (asset KEYS only;
 * resolution to URLs happens in data/scenes.js).
 *
 * Six rooms. They are all part of The Great Room (the shared coworking floor)
 * except the team's own private office:
 *   coworking → THE COMMONS, the shared common area (where the watch party was)
 *   office    → THE OFFICE, Tread's own private rented room (the whole team works here)
 *   pantry    → kitchen / pantry, where Yibo's body is
 *   sofa      → lounge / reception
 *   printer   → printer nook
 *   elevator  → lobby + parking lift (the only way out)
 *
 * Each room carries:
 *   sceneAssetByPeriod — scene art key per time-of-day (resolved in scenes.js).
 *                        The whole case plays through the night, so the night art shows.
 *   examineTargets     — clickable hotspots on the SCENE (x,y are fractions 0..1
 *                        of the scene image; clueId optional → grants evidence)
 *   schematic          — {x,y,w,h} block (fractions 0..1) for the MAP
 */

export const ROOM_IDS = ['coworking', 'office', 'pantry', 'sofa', 'printer', 'elevator'];

const ALL_ADJACENT = ['coworking', 'office', 'pantry', 'sofa', 'printer', 'elevator'];

export const rooms = [
  {
    id: 'coworking',
    label: 'THE COMMONS',
    short: 'CMN',
    sceneAssetByPeriod: { morning: 'coworking-day', dusk: 'coworking-dusk', night: 'coworking-night' },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'coworking'),
    examineTargets: [
      { id: 'cw-aftermath', label: 'THE AFTERMATH', x: 0.40, y: 0.62, flavor: 'The leftovers of a good night gone cold. CentralWorld takeout going hard in the boxes, the big screen still frozen on the Japan vs Spain final, paper cups everywhere. A few hours ago this was the warmest room in Bangkok. Now it’s the room where David sat everyone down and said the word gone.' },
      { id: 'cw-window', label: 'THE WINDOW', x: 0.72, y: 0.34, flavor: 'Black glass forty floors up, the CentralWorld signage smeared to neon soup down below. The city is still dark. When that sky goes grey the building wakes up, the commons unlocks, and the other members and offices start coming in like nothing happened. The city glitters and doesn’t care. It never does.' },
    ],
    schematic: { x: 0.68, y: 0.54, w: 0.28, h: 0.38 },
  },
  {
    id: 'office',
    label: 'THE OFFICE',
    short: 'OFC',
    sceneAssetByPeriod: { morning: 'office-day', dusk: 'office-dusk', night: 'office-night' },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'office'),
    examineTargets: [
      { id: 'of-desk', label: 'DAVID’S SPOT', x: 0.50, y: 0.58, flavor: 'Something is wedged half under David’s spot at the long team desk: a laptop with a sticker from a Singapore conference. Yibo’s. Still warm. The screen wakes to a spreadsheet of numbers that don’t match the ones David’s been showing investors.', clueId: 'retrieved-proof' },
      { id: 'of-photo', label: 'FRAMED PHOTO', x: 0.24, y: 0.72, flavor: 'Two founders at a go-kart track, arms slung over shoulders, a trophy between them. Years ago, when it was still theirs together. Yibo’s face has been turned to the wall.' },
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
      { id: 'pn-body', label: 'THE BODY', x: 0.30, y: 0.66, flavor: 'Yibo on the pantry floor by the counter, where two glasses still sit. The skin says hours. The gash above his temple lines up with the hard counter corner, almost too well. His laptop and his phone, the things glued to his hands, are gone. Good whiskey on his breath. He didn’t drink alone, and nobody tidies up after a man who just slips.', clueId: 'the-body' },
      { id: 'pn-glasses', label: 'TWO GLASSES', x: 0.58, y: 0.52, flavor: 'Two whiskey glasses by the sink, set down around two, poured from Yibo’s airport-gift bottle that nobody can find now. One wears Yibo’s prints. The other has been wiped down to nothing, the only clean thing in this room. This is where the good night quietly ended.', clueId: 'two-glasses' },
      { id: 'pn-sink', label: 'THE SINK', x: 0.80, y: 0.40, flavor: 'Still wet. A dish towel folded too neatly for two in the morning. Somebody tidied in a hurry and called it calm.' },
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
      { id: 'sf-jacket', label: 'PONCHO’S JACKET', x: 0.46, y: 0.62, flavor: 'Poncho’s jacket, slung over the lounge arm since the watch party. In the pocket, a folded printout. A thread where he swears Yibo will rewrite his engine “over my dead body.” Damning, until you read the line at the bottom in his own hand: “we’re good. beers on me.”', clueId: 'owed-note' },
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
      { id: 'pr-shredder', label: 'THE SHREDDER', x: 0.50, y: 0.62, flavor: 'Fresh confetti in the bin. Patient fingers reassemble it: the real growth curve beside the deck’s prettier lie, and a line in Yibo’s hand, “the round is a lie. I’m pulling the engine.” Someone disagreed, hard, and fed the proof to the blades.', clueId: 'shredded-letter' },
    ],
    schematic: { x: 0.36, y: 0.54, w: 0.28, h: 0.38 },
  },
  {
    id: 'elevator',
    label: 'ELEVATOR · LOBBY',
    short: 'ELV',
    sceneAssetByPeriod: { morning: 'elevator', dusk: 'elevator', night: 'elevator' },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'elevator'),
    examineTargets: [
      { id: 'el-badge', label: 'BADGE LOG', x: 0.50, y: 0.50, flavor: 'The reader’s memory: guest badge V1 (Yibo) up at 21:40, never down. So Yibo never left the floor. And a hole where D1, David’s badge, should be. Deleted, with a quiet re-entry stamp at 01:50. He told everyone he headed home at eleven. Only admin and David can rewrite this log.', clueId: 'scrubbed-badge' },
    ],
    schematic: { x: 0.04, y: 0.54, w: 0.28, h: 0.38 },
  },
];

export const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]));

/** All examine targets flattened, keyed by target id → { ...target, roomId }. */
export const examineTargetById = Object.fromEntries(
  rooms.flatMap((r) => (r.examineTargets ?? []).map((t) => [t.id, { ...t, roomId: r.id }])),
);
