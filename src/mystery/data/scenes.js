/**
 * scenes.js — asset resolvers for room scene art and character portraits.
 *
 * The data layer stores asset *keys* (e.g. 'coworking-day', 'david') as plain
 * strings so it stays import-free and content-swappable. This module is the one
 * place that turns those keys into bundled URLs via Vite's import.meta.glob.
 *
 * Pure data resolution. No React, no Jotai.
 */

// Scene art ships as JPEG (opaque full-bleed photography — far smaller than PNG);
// the glob also accepts PNG so either format resolves by key during a migration.
const sceneModules = import.meta.glob('../../assets/scenes/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Portraits stay PNG — they're transparent 3x3 expression sprite-sheets.
const portraitModules = import.meta.glob('../../assets/portraits/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Evidence art — one dedicated illustration per clue hotspot (plus a couple of
// flavor/zoom extras). Keyed by basename, e.g. 'two-glasses', 'owed-note-note'.
const evidenceModules = import.meta.glob('../../assets/evidence/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Intro slideshow stills — opaque illustrated POV frames keyed by basename
// (e.g. '01', '07'), shipped as JPEG like the scene art.
const introModules = import.meta.glob('../../assets/intro/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Build a { basename: url } lookup from a glob result keyed by full path. */
function indexByBasename(modules) {
  const out = {};
  for (const [path, url] of Object.entries(modules)) {
    const base = path.split('/').pop().replace(/\.(jpe?g|png|webp)$/i, '');
    out[base] = url;
  }
  return out;
}

export const sceneUrls = indexByBasename(sceneModules);
export const portraitUrls = indexByBasename(portraitModules);
export const evidenceUrls = indexByBasename(evidenceModules);
export const introUrls = indexByBasename(introModules);

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

/**
 * Resolve an evidence image key to its bundled URL.
 * @param {string|null|undefined} key e.g. 'two-glasses'
 * @returns {string|null}
 */
export function evidenceUrl(key) {
  return key ? (evidenceUrls[key] ?? null) : null;
}

/**
 * Resolve an intro slide key to its bundled URL.
 * @param {string} key e.g. '01'
 * @returns {string|null}
 */
export function introUrl(key) {
  return introUrls[key] ?? null;
}
