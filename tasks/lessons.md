# Lessons — Tread Office

Technical gotchas worth remembering for this codebase + workflow.

## Playwright against a Vite dev server
- **NEVER use `page.goto(url, { waitUntil: 'networkidle' })`.** Vite keeps the HMR
  websocket open forever, so `networkidle` never resolves and `goto` hangs to the
  navigation timeout. This stalled 4/5 playtest agents for the full watchdog window.
  Use `{ waitUntil: 'domcontentloaded' }` + a fixed `waitForTimeout`.
- Always `page.setDefaultTimeout(4000)`, wrap interactions in try/catch, and close the
  browser in `finally`. Cap each script's wall-clock so a missing selector can't hang.
- When scoping clicks while a modal is open, search inside the topmost visible
  `[role=dialog]` — otherwise a regex like `/ACCUSE/` matches the F-key button or the
  roster name sitting *behind* the scrim, and Playwright reports a pointer interception.

## CSS / overlay layering
- `GameShell.module.css` has `.shell > * { position: relative; z-index: 1 }`. Any
  full-screen overlay rendered as a **direct child** of `.shell` gets its `position:
  fixed` / `z-index` clobbered (it collapsed the map to a 66px strip). Render overlays
  as **siblings of `.shell`** (a fragment) or via a portal, not inside it.

## Engine design
- Normalize suspicion meters against a **global** max across all suspects, not each
  suspect's own max — otherwise one early clue pegs a weak suspect at 100% and hides
  the real culprit. (Both happy-path and first-timer testers caught this independently.)
- `requestAnimationFrame` is throttled/suspended in background & headless tabs. Any
  animation whose *final* state only lands in a rAF callback (e.g. ScrambleText) needs
  a `setTimeout` fallback so the end state always arrives.

## Process
- For a tightly-interconnected feature, build the shared spine (state/actions/data/
  engine) first and lock the contracts, THEN fan out parallel agents on disjoint leaf
  files (views/CSS). Keep the shared merge points (GameShell, FunctionKeyBar) owned by
  one integrator to avoid collisions.

## Audit findings are CLAIMS — verify against the running artifact before fixing
- A code-audit + adversarial-verify workflow flagged "all portraits render only their
  top-left 1/9th; SpriteFrame's 3x3 default is a foot-gun — render whole images." Both
  the finder AND the skeptical verifier were CONFIDENT and WRONG: the portrait PNGs
  (`src/assets/portraits/*.png`) are genuine **3x3 sprite sheets of 9 facial expressions**,
  so `cols=3 rows=3 col=0 row=0` (showing frame 0,0) was CORRECT. "Fixing" it to 1x1
  shrank 9 tiny faces into each slot. A Playwright **screenshot** caught the regression
  instantly. Lesson: the verifier reasoned from code ("no 3x3 sheet exists") without ever
  inspecting the pixels. For any finding about rendered output, confirm against a real
  screenshot / the actual asset, not the source alone — and revert cleanly when reality
  contradicts the audit.

## The sunrise deadline must come from ONE source
- `SUNRISE_MINUTE` was 1410 (= displayed 08:30 AM) while every player-facing string said
  06:00. 06:00 = 1260 minutes past the 9:00 AM start (21h), not 1410 (23.5h → 08:30).
  Fixed to 1260 and pinned with a test: `formatClock(SUNRISE_MINUTE) === '06:00 AM'`.
- An action that calls `advanceClock(...)` and then writes more state must bail if the
  clock tick forced an ending: `advanceClock(...); if (get(modeAtom)==='ENDING') return;`.
  Without it, `chooseDialogue` clobbered the forced timeout (ending D) back to FREE_ROAM.

## eslint-plugin-react-hooks must match the ESLint major
- v4 crashes ESLint 9 (`context.getSource is not a function`). Bump to v5 for flat config.
  Also add `globals.browser`/`globals.node` to `languageOptions.globals` (else `setTimeout`,
  `localStorage`, etc. trip `no-undef`), and a test-files override for vitest's bare
  `describe/it/expect`. This project documents props with JSDoc → `react/prop-types: off`.
