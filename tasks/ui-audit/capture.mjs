/**
 * capture.mjs — reusable Playwright screenshot harness for Tread Office UI work.
 *
 * Drives the running dev server through every game surface and writes one PNG
 * per surface into <outDir>. Resilient by design: every step is wrapped, a
 * missing selector never hangs the run, and the browser always closes.
 *
 * Usage:
 *   node tasks/ui-audit/capture.mjs <outDir> [surface] [--url=http://localhost:5180/mystery] [--w=1440] [--h=900]
 *
 *   surface ∈ all (default) | landing | intro | coldopen | freeroam | map |
 *             evidence | suspects | examine | dialogue | accusation | ending
 *
 * Gotchas honored (see tasks/lessons.md):
 *   - NEVER waitUntil:'networkidle' against Vite (HMR ws never idles) → domcontentloaded + fixed wait.
 *   - setDefaultTimeout small, try/catch every interaction, close browser in finally.
 *   - When a modal is open, scope queries to the topmost [role=dialog].
 */

import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const PW_PATH = '/Users/jaytreadfi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = require(PW_PATH);

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

const OUT_DIR = positional[0] || 'tasks/ui-audit/baseline';
const ONLY = (positional[1] || 'all').toLowerCase();
const URL = flags.url || 'http://localhost:5180/mystery';
const VW = Number(flags.w || 1440);
const VH = Number(flags.h || 900);

mkdirSync(OUT_DIR, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...m) => console.log('[capture]', ...m);

function want(name) {
  return ONLY === 'all' || ONLY === name;
}

async function safe(label, fn) {
  try {
    await fn();
    log('OK  ', label);
  } catch (err) {
    log('FAIL', label, '-', String(err).split('\n')[0]);
  }
}

async function shot(page, name) {
  await page.screenshot({ path: join(OUT_DIR, `${name}.png`) });
}

// Click the accessible-named button if present (regardless of F-key hints), else
// fall back to a keyboard shortcut. Robust to the action-bar redesign.
async function activate(page, nameRe, key) {
  const btn = page.getByRole('button', { name: nameRe }).first();
  if (await btn.count().catch(() => 0)) {
    if (await btn.isEnabled().catch(() => false)) {
      await btn.click({ timeout: 1500 }).catch(() => {});
      return true;
    }
  }
  if (key) await page.keyboard.press(key).catch(() => {});
  return false;
}

async function closeOverlay(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await wait(250);
  // Belt-and-suspenders: click an explicit close control if Escape didn't take.
  const dlg = page.locator('[role=dialog]').last();
  if (await dlg.count().catch(() => 0)) {
    const closeBtn = dlg.getByRole('button', { name: /close|done|back|×|✕/i }).first();
    if (await closeBtn.count().catch(() => 0)) await closeBtn.click({ timeout: 1000 }).catch(() => {});
  }
  await wait(200);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];
  try {
    const ctx = await browser.newContext({
      viewport: { width: VW, height: VH },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(4000);
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });
    page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + e.message));

    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await wait(900); // LANDING title card reveal (~0.6s staggered)

    // If a sibling agent's mid-edit left a transient Vite error overlay up, give
    // HMR a moment to recover and reload before shooting (avoids false "broken").
    for (let i = 0; i < 3; i++) {
      const hasOverlay = await page.locator('vite-error-overlay').count().catch(() => 0);
      if (!hasOverlay) break;
      log('vite error overlay present — waiting for HMR recovery…');
      await wait(2000);
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await wait(900);
    }

    // ---- LANDING (title "STANDUP" + [ ENTER GAME ]) ----
    if (want('landing')) await safe('landing', () => shot(page, '00-landing'));

    // ---- Enter the game → INTRO slideshow ----
    await safe('enter-game', async () => {
      const enter = page.getByRole('button', { name: /enter game/i }).first();
      if (await enter.count()) await enter.click({ timeout: 2000 });
      await wait(900); // first slide fades/Ken-Burns in
    });

    // ---- INTRO (POV slideshow) ----
    if (want('intro')) await safe('intro', () => shot(page, '00b-intro'));

    // ---- Skip the intro → COLD OPEN ----
    await safe('skip-intro', async () => {
      const skip = page.getByRole('button', { name: /skip/i }).first();
      if (await skip.count()) await skip.click({ timeout: 2000 });
      await wait(800); // cold-open title card reveal
    });

    // ---- COLD OPEN (David gathers the team — interactive, one beat at a time) ----
    if (want('coldopen')) await safe('coldopen', () => shot(page, '01-coldopen'));

    // ---- Advance the cutscene beat by beat until [ WALK THE FLOOR ] ----
    await safe('begin-shift', async () => {
      const begin = page.getByRole('button', { name: /begin shift|walk the floor/i });
      // Each beat advances on click/Space; skip-reveal then advance, up to all beats.
      for (let i = 0; i < 24; i++) {
        if (await begin.count().catch(() => 0)) break;
        await page.keyboard.press('Space').catch(() => {});
        await wait(250);
      }
      const walk = begin.first();
      if (await walk.count().catch(() => 0)) await walk.click({ timeout: 2000 });
      await wait(700);
    });

    // ---- FREE ROAM (scene + sidebar panels + header + action bar) ----
    if (want('freeroam')) await safe('freeroam', () => shot(page, '02-freeroam'));

    // ---- MAP overlay (on-scene MAP button or F1) ----
    if (want('map')) {
      await safe('map', async () => {
        await activate(page, /open floor map|^map$/i, 'F1');
        await wait(500);
        await shot(page, '03-map');
        await closeOverlay(page);
      });
    }

    // ---- EVIDENCE / notebook overlay (F2) ----
    if (want('evidence')) {
      await safe('evidence', async () => {
        await activate(page, /evidence/i, 'F2');
        await wait(450);
        await shot(page, '04-evidence');
        await closeOverlay(page);
      });
    }

    // ---- SUSPECTS overlay (F3) ----
    if (want('suspects')) {
      await safe('suspects', async () => {
        await activate(page, /suspects/i, 'F3');
        await wait(450);
        await shot(page, '05-suspects');
        await closeOverlay(page);
      });
    }

    // ---- EXAMINE overlay (click a "?" hotspot) ----
    if (want('examine')) {
      await safe('examine', async () => {
        const hot = page.getByRole('button', { name: /^examine /i }).first();
        if (await hot.count()) await hot.click({ timeout: 2000 });
        await wait(450);
        await shot(page, '06-examine');
        await closeOverlay(page);
      });
    }

    // ---- DIALOGUE (click a TALK marker) ----
    if (want('dialogue')) {
      await safe('dialogue', async () => {
        const talk = page.getByRole('button', { name: /^talk to /i }).first();
        if (await talk.count()) await talk.click({ timeout: 2000 });
        await wait(500);
        await shot(page, '07-dialogue');
        // leave dialogue: Escape or an END/BACK control
        await page.keyboard.press('Escape').catch(() => {});
        await wait(300);
      });
    }

    // ---- ACCUSATION + ENDING (best-effort: need >=3 clues) ----
    if (want('accusation') || want('ending')) {
      await safe('collect-clues', async () => {
        // Examine every "?" hotspot in the current room to bank clues.
        for (let r = 0; r < 6; r++) {
          const hotspots = page.getByRole('button', { name: /^examine /i });
          const n = await hotspots.count().catch(() => 0);
          let collected = 0;
          for (let i = 0; i < n; i++) {
            const h = hotspots.nth(i);
            if (await h.isVisible().catch(() => false)) {
              await h.click({ timeout: 1200 }).catch(() => {});
              await wait(250);
              await page.keyboard.press('Escape').catch(() => {});
              await wait(200);
              collected++;
            }
          }
          // Travel to the next room via the map to find more clue hotspots.
          await activate(page, /open floor map|^map$/i, 'F1');
          await wait(350);
          const dest = page.locator('[role=dialog]').last().getByRole('button').nth(r + 1);
          if (await dest.count().catch(() => 0)) await dest.click({ timeout: 1200 }).catch(() => {});
          await wait(400);
          await page.keyboard.press('Escape').catch(() => {});
          await wait(200);
        }
      });
      await safe('open-accusation', async () => {
        await activate(page, /accuse/i, 'F4');
        await wait(500);
      });
      if (want('accusation')) {
        await safe('accusation', () => shot(page, '08-accusation'));
      }
      if (want('ending')) {
        await safe('ending', async () => {
          // Pick first suspect, first three evidence chips, then confirm.
          const suspect = page.getByRole('button', { name: /david/i }).first();
          if (await suspect.count()) await suspect.click({ timeout: 1500 }).catch(() => {});
          await wait(150);
          const chips = page.getByRole('button', { pressed: false });
          // The evidence chips are toggle buttons; click three distinct clue labels.
          for (const label of [/the body/i, /laptop/i, /glasses/i, /grudge/i, /printout/i, /badge/i]) {
            const chip = page.getByRole('button', { name: label }).first();
            if (await chip.count().catch(() => 0)) {
              await chip.click({ timeout: 1200 }).catch(() => {});
              await wait(120);
            }
            const picked = await page.getByRole('button', { pressed: true }).count().catch(() => 0);
            if (picked >= 4) break; // 1 suspect + 3 clues
          }
          await wait(150);
          const confirm = page.getByRole('button', { name: /confirm accusation/i }).first();
          if (await confirm.count()) await confirm.click({ timeout: 1500 }).catch(() => {});
          await wait(800);
          await shot(page, '09-ending');
          void chips;
        });
      }
    }

    if (consoleErrors.length) {
      log('CONSOLE ERRORS (' + consoleErrors.length + '):');
      consoleErrors.slice(0, 20).forEach((e) => log('  ', e));
    } else {
      log('no console errors');
    }
  } finally {
    await browser.close();
    log('done →', OUT_DIR);
  }
}

const HARD_CAP = setTimeout(() => {
  log('hard cap hit, exiting');
  process.exit(1);
}, 90000);
HARD_CAP.unref?.();

run().then(() => process.exit(0)).catch((e) => {
  log('fatal', e);
  process.exit(1);
});
