/**
 * intro-flow.mjs — drive the new opening flow end to end and report console errors.
 *
 * Flow: LANDING (click "ENTER GAME") -> INTRO (click "SKIP") -> COLD_OPEN
 * (advance beats via Space until "WALK THE FLOOR", click it) -> FREE_ROAM.
 *
 * Screenshots each surface to <outDir> (default /tmp/intro-check). Collects
 * page.on('console', error) and page.on('pageerror'). Honors project lessons:
 *   - domcontentloaded + fixed waits (never networkidle on Vite).
 *   - small default timeout, try/catch every interaction, browser closed in finally.
 */

import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const PW_PATH = '/Users/jaytreadfi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = require(PW_PATH);

const OUT_DIR = process.argv[2] || '/tmp/intro-check';
const URL = process.argv[3] || 'http://localhost:5173/mystery';

mkdirSync(OUT_DIR, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...m) => console.log('[intro-flow]', ...m);

const surfacesOk = [];
const consoleErrors = [];

async function safe(label, fn) {
  try {
    await fn();
    log('OK  ', label);
    return true;
  } catch (err) {
    log('FAIL', label, '-', String(err).split('\n')[0]);
    return false;
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(4000);
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });
    page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + e.message));

    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await wait(1100); // landing title card reveal (staggered to ~0.6s + ScrambleText)

    // ---- LANDING ----
    const landingBtn = page.getByRole('button', { name: /enter game/i }).first();
    if (await safe('landing renders', async () => {
      if (!(await landingBtn.count())) throw new Error('no ENTER GAME button');
      await page.screenshot({ path: join(OUT_DIR, '00-landing.png') });
    })) surfacesOk.push('landing');

    // ---- enter -> INTRO ----
    await safe('click ENTER GAME', async () => {
      await landingBtn.click({ timeout: 2000 });
      await wait(1000); // first slide fades in
    });

    const skipBtn = page.getByRole('button', { name: /^skip$/i }).first();
    if (await safe('intro renders', async () => {
      if (!(await skipBtn.count())) throw new Error('no SKIP button');
      await page.screenshot({ path: join(OUT_DIR, '01-intro.png') });
    })) surfacesOk.push('intro');

    // ---- skip -> COLD_OPEN ----
    await safe('click SKIP', async () => {
      await skipBtn.click({ timeout: 2000 });
      await wait(1000); // cold-open title card reveal
    });

    if (await safe('coldopen renders', async () => {
      // Title card shows "YIBO IS DEAD"; capture the opening beat.
      await page.screenshot({ path: join(OUT_DIR, '02-coldopen.png') });
    })) surfacesOk.push('coldopen');

    // ---- advance beats until WALK THE FLOOR, then click it ----
    let reachedWalk = false;
    await safe('advance cold open beats', async () => {
      const walk = page.getByRole('button', { name: /walk the floor/i });
      for (let i = 0; i < 24; i++) {
        if (await walk.count().catch(() => 0)) {
          reachedWalk = true;
          break;
        }
        // One Space per beat. On a spoken beat still typing, Space skip-reveals;
        // the wait then lets the typewriter settle so the next Space (or this
        // one, once revealed) steps to the next beat. 600ms covers the longest
        // line's reveal. The final dir beat ignores Space and only the
        // [ WALK THE FLOOR ] button advances it (clicked below).
        await page.keyboard.press('Space').catch(() => {});
        await wait(600);
      }
      if (!reachedWalk) throw new Error('never reached WALK THE FLOOR');
      await page.screenshot({ path: join(OUT_DIR, '02b-coldopen-final.png') });
      await walk.first().click({ timeout: 2000 });
      await wait(1000);
    });

    // ---- FREE_ROAM ----
    if (await safe('freeroam renders', async () => {
      // Confirm we're out of the cutscene: the scene + action bar / hotspots show.
      const stillCutscene = await page
        .getByRole('button', { name: /walk the floor|enter game|^skip$/i })
        .count()
        .catch(() => 0);
      if (stillCutscene) throw new Error('still in opening flow, did not reach FREE_ROAM');
      await page.screenshot({ path: join(OUT_DIR, '03-freeroam.png') });
    })) surfacesOk.push('freeroam');

    // Settle and capture any late async errors.
    await wait(700);

    log('surfaces ok:', surfacesOk.join(', ') || '(none)');
    if (consoleErrors.length) {
      log('CONSOLE ERRORS (' + consoleErrors.length + '):');
      consoleErrors.forEach((e) => log('   -', e));
    } else {
      log('no console errors');
    }
    // Machine-readable tail for the parent process.
    console.log('RESULT_JSON ' + JSON.stringify({ surfacesOk, consoleErrors }));
  } finally {
    await browser.close();
    log('done ->', OUT_DIR);
  }
}

const HARD_CAP = setTimeout(() => {
  log('hard cap hit, exiting');
  console.log('RESULT_JSON ' + JSON.stringify({ surfacesOk, consoleErrors, hardCap: true }));
  process.exit(1);
}, 75000);
HARD_CAP.unref?.();

run().then(() => process.exit(0)).catch((e) => {
  log('fatal', e);
  console.log('RESULT_JSON ' + JSON.stringify({ surfacesOk, consoleErrors, fatal: String(e) }));
  process.exit(1);
});
