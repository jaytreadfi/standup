/**
 * rooms.js — canonical room data for Tread Office.
 *
 * Pure data. No imports from React, Jotai, or engine modules.
 * Engine + view layers consume this; this consumes nothing.
 *
 * Mapped to the actual office floor plan (color-coded by product owner):
 *   red    → office (David's enclosed office)
 *   green  → printer (small nook)
 *   yellow → coworking (main shared workspace, replaces "bullpen")
 *   pink   → elevator (transition / lobby)
 *   orange → pantry (replaces "kitchen")
 *   blue   → sofa (lounge / reception, replaces "reception")
 *
 * mapPosition.{x,y} are the center of each clickable hotspot, as fractions
 * (0..1) of the floor-plan image. Extracted from the color-coded reference
 * floor plan; image is square so the same fractions apply to both axes.
 *
 * Adjacency is provisional pending Phase 2 SVG floor plan; for now every
 * room is reachable from every other room. Phase 2 will refine.
 */

export const ROOM_IDS = ['coworking', 'office', 'pantry', 'sofa', 'printer', 'elevator'];

const ALL_ADJACENT = ['coworking', 'office', 'pantry', 'sofa', 'printer', 'elevator'];

export const rooms = [
  {
    id: 'coworking',
    label: 'COWORKING',
    sceneAssetByPeriod: {
      morning: 'coworking-day',
      dusk: 'coworking-dusk',
      night: 'coworking-night',
    },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'coworking'),
    examineTargets: [],
    mapPosition: { x: 0.255, y: 0.538 },
  },
  {
    id: 'office',
    label: 'DAVID’S OFFICE',
    sceneAssetByPeriod: {
      morning: 'office-day',
      dusk: 'office-dusk',
      night: 'office-night',
    },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'office'),
    examineTargets: [],
    mapPosition: { x: 0.931, y: 0.836 },
  },
  {
    id: 'pantry',
    label: 'PANTRY',
    sceneAssetByPeriod: {
      morning: 'pantry-day',
      dusk: 'pantry-dusk',
      night: 'pantry-night',
    },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'pantry'),
    examineTargets: [],
    mapPosition: { x: 0.759, y: 0.433 },
  },
  {
    id: 'sofa',
    label: 'SOFA · LOUNGE',
    sceneAssetByPeriod: {
      morning: 'sofa-day',
      dusk: 'sofa-dusk',
      night: 'sofa-night',
    },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'sofa'),
    examineTargets: [],
    mapPosition: { x: 0.760, y: 0.208 },
  },
  {
    id: 'printer',
    label: 'PRINTER · NOOK',
    sceneAssetByPeriod: {
      morning: 'printer',
      dusk: 'printer',
      night: 'printer',
    },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'printer'),
    examineTargets: [],
    mapPosition: { x: 0.516, y: 0.744 },
  },
  {
    id: 'elevator',
    label: 'ELEVATOR',
    sceneAssetByPeriod: {
      morning: 'elevator',
      dusk: 'elevator',
      night: 'elevator',
    },
    adjacents: ALL_ADJACENT.filter((r) => r !== 'elevator'),
    examineTargets: [],
    mapPosition: { x: 0.524, y: 0.515 },
  },
];

export const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]));
