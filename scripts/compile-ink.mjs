/**
 * compile-ink.mjs
 *
 * Dev-only build script. Walks ink/**\/*.ink, compiles each file via the
 * inkjs compiler, and writes a sibling .json file.
 *
 * IMPORTANT: This script must NEVER be imported from app code. The inkjs
 * compiler is a dev-only dependency path. App code must use the engine-only
 * import: `import { Story } from 'inkjs/engine/Story'`.
 *
 * Usage: node scripts/compile-ink.mjs
 *   (also invoked via `npm run ink:compile`)
 */

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Replicate __dirname for ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root is one level up from scripts/
const PROJECT_ROOT = join(__dirname, '..');
const INK_DIR = join(PROJECT_ROOT, 'ink');

/**
 * Recursively collect all files matching a given extension under a directory.
 *
 * @param {string} dir - Absolute path to search.
 * @param {string} ext - File extension including the dot (e.g. '.ink').
 * @returns {Promise<string[]>} Absolute paths of matching files.
 */
async function walkForExt(dir, ext) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walkForExt(fullPath, ext);
      results.push(...nested);
    } else if (entry.isFile() && extname(entry.name) === ext) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Compile a single .ink source file to a sibling .json file.
 * Uses `inkjs/compiler/Compiler` — the compiler namespace, NOT the engine.
 *
 * @param {string} inkPath - Absolute path to the .ink source file.
 * @returns {Promise<void>}
 */
async function compileInkFile(inkPath) {
  // Dynamic import keeps the compiler out of any static analysis that might
  // accidentally bundle it into app code if this script were ever mis-imported.
  const { Compiler } = await import('inkjs/compiler/Compiler');

  const source = await readFile(inkPath, 'utf8');

  let compiledStory;
  try {
    compiledStory = new Compiler(source).Compile();
  } catch (err) {
    // Rethrow with file context so the caller can surface the right filename.
    throw Object.assign(new Error(err.message), { inkPath });
  }

  const jsonOut = compiledStory.ToJson();
  const outPath = join(dirname(inkPath), basename(inkPath, '.ink') + '.json');

  await writeFile(outPath, jsonOut, 'utf8');

  const relInk = inkPath.replace(PROJECT_ROOT + '/', '');
  const relJson = outPath.replace(PROJECT_ROOT + '/', '');
  console.log(`compiled ${relInk} → ${relJson}`);
}

async function main() {
  let inkFiles;
  try {
    inkFiles = await walkForExt(INK_DIR, '.ink');
  } catch (err) {
    console.error(`Failed to read ink directory (${INK_DIR}):`, err.message);
    process.exit(1);
  }

  if (inkFiles.length === 0) {
    console.log('No .ink files found under ink/. Nothing to compile.');
    process.exit(0);
  }

  let hadError = false;

  for (const inkPath of inkFiles) {
    try {
      await compileInkFile(inkPath);
    } catch (err) {
      const file = err.inkPath ?? inkPath;
      const rel = file.replace(PROJECT_ROOT + '/', '');
      console.error(`Error compiling ${rel}:\n  ${err.message}`);
      hadError = true;
    }
  }

  process.exit(hadError ? 1 : 0);
}

main();
