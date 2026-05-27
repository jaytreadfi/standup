/**
 * inkRuntime.js
 *
 * Thin wrapper around the inkjs Story engine.
 *
 * CRITICAL import note: We import from 'inkjs/engine/Story', NOT from 'inkjs'.
 * The bare 'inkjs' namespace re-exports the compiler, which adds ~200 KB to
 * the production bundle. The engine-only path keeps the runtime footprint small.
 *
 * The compiler lives exclusively in scripts/compile-ink.mjs (dev-only).
 */

import { Story } from 'inkjs/engine/Story';

/**
 * Create an inkjs Story from a compiled JSON payload.
 *
 * The Story constructor requires a JSON string; this helper accepts either a
 * parsed object or a raw string so callers don't have to think about it.
 *
 * @param {string | object} json - Compiled ink JSON, either as a string or a
 *   parsed object (e.g. from a dynamic import of a .json module).
 * @returns {Story} A ready-to-use inkjs Story instance.
 */
export function loadFromJSON(json) {
  const jsonString = typeof json === 'string' ? json : JSON.stringify(json);
  return new Story(jsonString);
}

/**
 * Advance the story until it can no longer continue, collecting all text.
 *
 * Calls `story.Continue()` in a loop while `story.canContinue` is true,
 * trims each chunk, and joins them with newlines.
 *
 * @param {Story} story - An active inkjs Story instance.
 * @returns {string} All text emitted during this continuation pass.
 */
export function continueAll(story) {
  const chunks = [];
  while (story.canContinue) {
    chunks.push(story.Continue().trim());
  }
  return chunks.join('\n');
}

/**
 * Select a player choice by index.
 *
 * @param {Story} story - An active inkjs Story instance.
 * @param {number} choiceIdx - Zero-based index into `story.currentChoices`.
 * @returns {void}
 */
export function choose(story, choiceIdx) {
  story.ChooseChoiceIndex(choiceIdx);
}

/**
 * Return the current choices in a UI-friendly shape.
 *
 * @param {Story} story - An active inkjs Story instance.
 * @returns {{ label: string, idx: number }[]} Array of choice descriptors.
 */
export function getChoices(story) {
  return story.currentChoices.map((c, idx) => ({ label: c.text, idx }));
}

/**
 * Bind game-engine external functions to a Story instance.
 *
 * Ink source files may call EXTERNAL functions such as `set_flag`, `grant_clue`,
 * `get_clock_minute`, and `has_flag`. This helper wires those calls to real
 * game-engine callbacks, with no-op fallbacks for every handler so that stories
 * can be exercised in isolation during testing without providing a full engine.
 *
 * @param {Story} story - An active inkjs Story instance.
 * @param {object} [handlers={}] - Engine callbacks. All are optional.
 * @param {(name: string) => void}  [handlers.setFlag]        - Persist a flag by name.
 * @param {(id: string) => void}    [handlers.grantClue]      - Unlock a clue by id.
 * @param {() => number}            [handlers.getClockMinute] - Return current minute (0–59).
 * @param {(name: string) => boolean} [handlers.hasFlag]      - Check if a flag is set.
 * @returns {void}
 */
export function bindExternals(story, { setFlag, grantClue, getClockMinute, hasFlag } = {}) {
  story.BindExternalFunction('set_flag', (name) => {
    if (typeof setFlag === 'function') {
      setFlag(name);
    }
  });

  story.BindExternalFunction('grant_clue', (id) => {
    if (typeof grantClue === 'function') {
      grantClue(id);
    }
  });

  story.BindExternalFunction('get_clock_minute', () => {
    if (typeof getClockMinute === 'function') {
      return getClockMinute();
    }
    return 0;
  });

  story.BindExternalFunction('has_flag', (name) => {
    if (typeof hasFlag === 'function') {
      return hasFlag(name);
    }
    return false;
  });
}

/**
 * Development sanity-check helper.
 *
 * Fetches `/ink/sample.json` from the Vite dev server (or any static server
 * that serves the project root) and returns a ready Story instance. Returns
 * null if the fetch fails or the JSON is an empty placeholder (`{}`).
 *
 * NOTE: `ink/sample.json` must be compiled first via `npm run ink:compile`.
 * Until that command is run, this function returns null and emits a console
 * warning. Run `npm install && npm run ink:compile` to populate the file.
 *
 * @returns {Promise<Story | null>}
 */
export async function loadSample() {
  try {
    const response = await fetch('/ink/sample.json');
    if (!response.ok) {
      console.warn(
        '[inkRuntime] loadSample: failed to fetch /ink/sample.json —',
        response.status,
        response.statusText
      );
      return null;
    }

    const json = await response.json();

    // Guard against the empty placeholder written before compilation runs.
    if (Object.keys(json).length === 0) {
      console.warn(
        '[inkRuntime] loadSample: /ink/sample.json is an empty placeholder. ' +
          'Run `npm install && npm run ink:compile` to compile the Ink source.'
      );
      return null;
    }

    const story = loadFromJSON(json);

    if (import.meta.env?.DEV) {
      console.log('[inkRuntime] loadSample: story loaded OK. canContinue =', story.canContinue);
    }

    return story;
  } catch (err) {
    console.warn('[inkRuntime] loadSample: unexpected error —', err.message);
    return null;
  }
}
