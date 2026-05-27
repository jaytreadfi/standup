/**
 * Dev-only console wrapper.
 *
 * - log / warn are no-ops in production builds (import.meta.env.DEV === false).
 * - error always fires — errors must surface in production for debugging.
 * - dev(scope) returns a scoped logger with a [tread:<scope>] prefix.
 */

const DEV = import.meta.env.DEV;

// --- base exports -----------------------------------------------------------

/**
 * Logs a message in development only.
 *
 * @param {...unknown} args
 */
export function log(...args) {
  if (DEV) console.log('[tread]', ...args);
}

/**
 * Emits a console warning in development only.
 *
 * @param {...unknown} args
 */
export function warn(...args) {
  if (DEV) console.warn('[tread]', ...args);
}

/**
 * Emits a console error in ALL environments — errors should always surface.
 *
 * @param {...unknown} args
 */
export function error(...args) {
  console.error('[tread]', ...args);
}

// --- scoped logger ----------------------------------------------------------

/**
 * Returns a scoped logger whose prefix is `[tread:<scope>]`.
 * Handy for modules like telemetry, saveLoad, etc.
 *
 * @example
 * const logger = dev('saveLoad');
 * logger.log('slot written');   // [tread:saveLoad] slot written
 *
 * @param {string} scope
 * @returns {{ log: Function, warn: Function, error: Function }}
 */
export function dev(scope) {
  const prefix = `[tread:${scope}]`;
  return {
    log:   (...args) => { if (DEV) console.log(prefix, ...args); },
    warn:  (...args) => { if (DEV) console.warn(prefix, ...args); },
    error: (...args) => console.error(prefix, ...args),
  };
}

// --- default export ---------------------------------------------------------

export default log;
