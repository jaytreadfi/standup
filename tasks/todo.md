# Tread Office — Game Fix & Refactor

## Problem (verified via Playwright + code read)
The game is a "Phase 1 stub": only a CAD floor-plan map screen exists.
- **Scenes never render** — beautiful day/dusk/night room art exists on disk but is dead code.
- **Navigation does nothing visible** — clicking a room only changes a text label.
- **No gameplay loop** — F1–F4 are stubs; no examine, dialogue, evidence, accusation, or endings. Roster is hardcoded.

## Decisions (from user)
1. **Scope:** Playable vertical slice — full core loop, placeholder writing.
2. **Room view:** Scene-primary point-and-click. Room art is the main view; MAP button to travel.
3. **Map:** Redesign as a clean orange-terminal schematic (not the CAD png).

## Architecture
**Spine (owned by lead — built first):** state, actions, data, engine. Concrete files, not just a spec.
**View layer (dev team, parallel — disjoint file ownership):** scene view, map overlay, examine overlay, dialogue/accusation/ending modes, info overlays, roster realdata.
**Integration (lead):** GameShell routing + FunctionKeyBar wiring + verify (build/tests/Playwright).
**Playtest (tester team):** drive via Playwright, report bugs + UX friction; lead fixes.

## Core gameplay loop (target)
COLD_OPEN (David briefs you) → FREE_ROAM (scene-primary): examine hotspots → collect evidence; open MAP → travel (costs 5m); talk to NPCs present → dialogue (may grant clues/flags). Clock advances; scene swaps morning/dusk/night. When ready → ACCUSE (pick suspect + 3 clues) → ENDING (A/B/C/D). Sunrise = forced timeout ending.

## Status
- [x] Investigate (Playwright screenshots + code/build-plan digest)
- [x] Lock scope decisions with user
- [x] Build foundation spine (lead) — data/engine/state/actions, all parse, tests green
- [x] Deploy dev team: 6 parallel devs built view/feature layer (scene view, map, examine, dialogue, cold-open/accusation/ending, overlays+roster)
- [x] Integrate into GameShell + wire F-keys (cinematic vs HUD mode split; overlays as shell siblings)
- [x] Verify: build (535 modules ✓), 66 unit tests ✓, full Playwright playthrough → Ending A, ZERO console errors
  - Fixed bug: `.shell > *` rule clobbered overlay scrims (position/z-index) → rendered overlays as shell siblings
- [x] Deploy playtest team (5/5 testers, 0 console errors, 0 blockers, 22 issues filed)
- [x] Fix reported issues + finalize

## Review — fix pass (10 fixes from playtest)
1. **[major] Suspicion meter** normalized per-suspect → every implicated suspect read 100%, hiding the culprit. Now normalized vs a GLOBAL max (suspicion.js) → Sam dominates (verified: Sam 73%, Poncho 18%, rest 0%).
2. **[major] Time pacing** — raised action costs (travel 5→20, examine 10→30, dialogue 15→25) so the day actually progresses (full solve now reaches ~1:40 PM, was ~10:30 AM); dusk/night art + timeout ending become reachable. Updated clock tests.
3. **[major] BEGIN SHIFT hidden ~4.7s** → compressed cold-open reveal; button visible ~2s, content animating throughout.
4. **[major/minor ×3] Map "UNDEFINED" header** → hardened SectionLabel against missing index.
5. **[minor] Re-examine recharged +10min** → first examine costs time, re-reads are free (flag-tracked).
6. **[minor] Escape didn't close Notebook/Suspects** → added handlers (parity with Map/Examine).
7. **[minor] Recent Evidence showed kebab ids** → uses clue.label now.
8. **[minor] "2:10 PM · MORNING"** → added periodLabel (DAY/DUSK/NIGHT).
9. **[minor] Hotspot discoverability** → un-examined reticles glow + pulse harder.
10. **[minor] Portraits 36MB** → downscaled 2048→768px = 5.9MB (84% cut).
Plus: ScrambleText setTimeout fallback (titles can't freeze in throttled tabs).

Verified after fixes: build ✓, 66 tests ✓, full playthrough → Ending A, 0 console errors.

## Deferred (noted, not done)
- printer/elevator rooms reuse one PNG for all periods (need dusk/night art).
- Accusation evidence chips: wider hit target / clearer toggle affordance.
- Deeper onboarding (coach-mark naming "examine"; explain sunrise stakes).
- Map presence/evidence dots: larger / differentiated markers.
- Narrative is placeholder (user deprioritized script).

## Known polish items (pre-playtest)
- Map overlay header shows "UNDEFINED" (MapOverlay TerminalChrome missing sceneId prop)
- Cold-open "BEGIN SHIFT" button looks faint
- Portrait PNGs are 4–5MB each (~38MB total) — major load-perf issue

## Verified working (Playwright, 0 console errors)
Cold-open → scene-primary free-roam (scene art renders!) → examine (logs evidence) → schematic map travel
→ dialogue → notebook/suspects overlays → accusation (pick suspect + 3 clues) → Ending A → restart.

---

## Review — second hardening pass (audit + playtest team, find→verify→synthesize)
Deployed a workflow of 5 elite code-auditors (engine/state/data/modes/overlays) + 5 Playwright
playtesters (happy-path/wrong-accuse/timeout/chaos/first-timer); 78 candidates → 62 confirmed
(adversarial verify) → 13 ranked issues. Fixed (front + back):

**Backend / engine / data**
1. **[major] Sunrise fired at 08:30, not the advertised 06:00** → `SUNRISE_MINUTE` 1410→**1260**; comments + tests updated (`formatClock(SUNRISE_MINUTE)==='06:00 AM'`).
2. **[major] `chooseDialogue` clobbered the sunrise-forced ending** (escape ending D) → bail `if (mode==='ENDING') return` after `advanceClock`.
3. **[minor] Flavor-only examine still cost 30 min** for zero payoff → only charge time when the hotspot has a `clueId`.
4. **[minor] MAP + info overlay could stack scrims** → mutual exclusion in `openMap`/`openOverlay`.
5. **[minor] Accusation reachable with <3 clues** (dead-end screen) → guard `beginAccusation`; gate F4 + SuspectsOverlay button.
6. **[major] Dialogue granted zero evidence** (dead `grantClue`) → wired Dena→coffee-ring, Ching→alibi-note, Jamie→late-badge.
7. **[minor] Telemetry double-encoded** its store → store the plain object (safeStorage serializes once).
8. **[polish] `restart()` skipped objective; dead LOCKER overlay; `examineAtom` JSDoc** → reset objective, removed LOCKER (+ tests), fixed type.

**Frontend / a11y / UX**
9. **[major] Overlays declared `aria-modal` but didn't trap focus** → shared `useDialogFocus` hook + background `.shell` marked `inert` while open (verified via Playwright).
10. **[major] MAP said "+5 MIN"; travel costs 20** → derive label from `TIME_COSTS.TRAVEL`.
11. **[minor] AccusationMode had no Escape**; clue chips truncated → added Escape→cancel + `title` tooltip.
12. **[minor] Cold-open / Ending `autoFocus` fired at opacity 0** (premature Enter skip) → focus on `onAnimationComplete`.
13. **[minor] FunctionKeyBar** re-registered keydown every render + save-pulse timer leak → ref-based single listener + timer cleanup.
14. **[polish] React Router v6 console warnings; MapOverlay had no exit anim; Recent-Evidence EV-NN unstable** → router future flags, motion exit, stable numbering.

**Devex**
15. **Broken `npm run lint`** (react-hooks v4 × ESLint 9 crash) → bumped to v5, added browser/node + vitest globals, `react/prop-types: off`, cleaned unused vars. **Lint now passes.**
16. **Removed dead Ink cluster** (`inkRuntime.js`, `scripts/compile-ink.mjs`, `ink/`, `inkjs` dep, `ink:compile` script).

**Rejected as false positive (caught by screenshot):** "portraits render only top-left 1/9" — the portrait PNGs ARE 3x3 expression sheets; `cols=3 rows=3 col=0 row=0` was correct. Reverted my own change.

**Verified after fixes:** `npm run lint` ✓ clean · 61 unit tests ✓ · build ✓ · Playwright: full solve → **Ending A**, clock-burn → **Ending D** at 06:00, dialogue→clue grant, focus-trap inert — all with **0 console errors**, portraits render full faces.

**Deferred (optional, not defects):** red-herring suspicion for Peem/Jamie (design choice — keeps evidence pointing cleanly at Sam); accusation-screen negative space (#42, cosmetic); ending-screen animation skip; sunrise-countdown urgency styling (the 06:00 readout is now accurate).
