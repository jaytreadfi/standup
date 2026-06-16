/**
 * scenes.js — asset resolvers for room scene art and character portraits.
 *
 * The data layer stores asset *keys* (e.g. 'coworking-day', 'david') as plain
 * strings so it stays import-free and content-swappable. This module is the one
 * place that turns those keys into bundled URLs via Vite's import.meta.glob.
 *
 * Pure data resolution. No React, no Jotai.
 */

const sceneModules = import.meta.glob('../../assets/scenes/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const portraitModules = import.meta.glob('../../assets/portraits/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const floorplanModules = import.meta.glob('../../assets/floorplan/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Build a { basename: url } lookup from a glob result keyed by full path. */
function indexByBasename(modules) {
  const out = {};
  for (const [path, url] of Object.entries(modules)) {
    const base = path.split('/').pop().replace(/\.png$/, '');
    out[base] = url;
  }
  return out;
}

export const sceneUrls = indexByBasename(sceneModules);
export const portraitUrls = indexByBasename(portraitModules);
export const floorplanUrls = indexByBasename(floorplanModules);

/**
 * Resolve a scene asset key to its bundled URL.
 * @param {string} key e.g. 'coworking-day'
 * @returns {string|null}
 */
export function sceneUrl(key) {
  return sceneUrls[key] ?? null;
}

/**
 * Resolve a character id to its portrait URL.
 * @param {string} id e.g. 'david'
 * @returns {string|null}
 */
export function portraitUrl(id) {
  return portraitUrls[id] ?? null;
}
