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

> ⚠️ **STALE — pre-"Last One Out" notes.** The two "second hardening pass" lines above that mention **Jamie**, **Dena→coffee-ring/Ching→alibi-note/Jamie→late-badge** grants, and "evidence pointing cleanly at **Sam**" describe the *abandoned* corporate-sabotage / Sam-as-culprit story. The shipped game is **"Last One Out"**: victim = Sam, **killer = David**, patsy = Poncho; Jamie is not in the cast. Real dialogue grants are **Jay→witness-argument, Peem→earwitness-thud, Ching→ching-motive** (see `data/dialogue.js`). Kept the history intact; this note supersedes it.

---

## Review — 88-agent senior-dev audit + a11y/perf fix pass (2026-06-16)

Ran a `find → adversarially-verify → synthesize` Workflow: 10 specialist auditors (narrative, data-integrity, engine, state, React, UX, a11y, perf, CSS, tests) → 77 candidates → **72 confirmed** (5 killed as false positives by skeptic verifiers).

**Headline:** the suspected mystery-vs-data drift was a **false alarm** — suspicion correctly ranks **David #1** (raw 17 vs 1), Sam (victim) is excluded, Jamie is gone from code. Stale "Sam/Jamie" refs survive only in docs + orphaned assets (now corrected). No blockers; 72 unit tests / lint / build all green at baseline.

**Implemented (user picked the "quick-win correctness" + "a11y/perf" bundles):**

Quick-win correctness:
1. `AccusationMode` headline `NAME THE SABOTEUR` → **`NAME THE KILLER`** (last leftover string from the abandoned sabotage premise; it's a murder).
2. `actions.openExamine` could log a **phantom clue after the sunrise timeout ending** fired → added `mode === 'ENDING'` bail after `advanceClock('EXAMINE')` (mirrors the `chooseDialogue` guard).
3. `clock.formatClock` hardened against **NaN/Infinity/negative** (corrupt persisted clock) → finite guard + true modulo wrap (existing 25 clock tests still green).
4. Removed dead assets: `portraits/jamie.png` (removed character), `floorplan/floor-01.png` + dir + the `floorplanModules`/`floorplanUrls` resolver in `scenes.js` (MapOverlay dropped the floorplan). Fixed stale `dialogueAtom` JSDoc shape.

Accessibility:
5. Shell-level `<Announcer>` (polite + assertive `aria-live`, mounted above the fullscreen/HUD split so it survives mode changes) → evidence-logged + room-change are announced; the **forced sunrise ending fires an assertive alert** (was silent to screen readers).
6. `DialogueMode` now pulls keyboard focus into the conversation on entry + each node (was dropping to `<body>`, choices unreachable).
7. `<MotionConfig reducedMotion="user">` wraps the shell so framer's WAAPI transforms honor `prefers-reduced-motion` (the CSS `@media` rule didn't cover those).
8. `--color-text-muted` / `textMuted` lifted `#5e5b58` → **`#8a857f`** (~2.8:1 → ~5.2:1, clears WCAG AA on info-bearing text).
9. Responsive viewport: `width=1280` → **`width=device-width, initial-scale=1`** (re-enables zoom/reflow + the author's existing responsive CSS).

Performance:
10. **Scene art PNG → JPEG q90** via `sips` (zero new deps; opaque full-bleed art): scenes **21 MB → 3.5 MB** (~6×). `scenes.js` glob accepts `*.{jpg,jpeg,png}`.
11. `FreeRoamMode` **preloads** all rooms' art for the current period (`new Image()`) + `decoding="async"` on the scene img → travel/period swaps no longer pop in (verified: all 6 day scenes fetch 200 on entry).
12. `vite.config` `manualChunks` splits **framer-motion** + **React** into cacheable vendor chunks → app chunk **378 KB → 87 KB** (+ vendor-motion 129 KB, vendor-react 160 KB).

**Verified:** `npm run lint` ✓ clean · **72 unit tests** ✓ · `npm run build` ✓ · Playwright on the built app → boot→cold-open→free-roam, **scenes render** (JPEG `naturalWidth` 1376, all images 200), **0 console errors**, screenshot confirms no JPEG banding in the noir art.

**Not done (offered, awaiting decision):**
- **Test safety net + CI** bundle (`suspicion.test.js`, `actions.test.js`, `integrity.test.js`, GitHub Actions) — protects the killer-ranking invariant + timeout path.
- **Neo-noir tone fix** (design call): re-base clock to night so the murder isn't in 9 AM daylight; tune action costs so the sunrise deadline bites (Ending D is currently ~unreachable); decide the suspicion meter's role (it solves the deduction for the player).
- **Portrait WebP/AVIF** (5 MB, transparent) needs a `sharp`-based build plugin — deferred as a dependency-adding change; scenes already got the big win via JPEG.
- `src/assets/portraits-raw/` (49 MB dead source masters) left in place — removal is a separate call (won't reclaim git history without a rewrite).

---

## Review — Story rewrite + real-time clock (2026-06-16)

**Goal:** rewrite the case as the real Tread team, kill **Yibo** (visiting cofounder) instead of
Sam, make the plot twistier/longer, and switch the clock to "just keep ticking" in real time so
player movement no longer costs minutes.

**Done & verified (74 tests pass, lint clean, Playwright playtest 0 console errors):**
- **Recast (`data/characters.js`):** victim = **Yibo** (V1, no portrait); 7 living suspects —
  David(CEO/killer), Peem(PM), Poncho(dev/patsy), Jay(Marketing), Ching(UX), Dena(Data), **Sam now
  Office Admin & the player's ally** (was the victim). Two drivers (Poncho+Sam) share the elevator.
- **New motive = the company** (David faked the raise numbers + diluted absentee cofounder Yibo;
  Yibo came to pull his engine & blow up the round). Reskinned `clues.js`, `rooms.js`, `endings.js`
  — **clue ids/weights/`TRUE_CULPRIT`/`PATSY` unchanged**, so `resolveEnding` + tests held.
- **Dialogue (`dialogue.js`) rewritten in each teammate's real voice** (per the team-breakdown doc)
  with Bangkok in-jokes (CentralWorld lunches, kart nights, condos next door, who drives). Sam points
  you at the badge log + clears Poncho; Dena breaks down as the unwitting accomplice + fraud witness.
- **Real-time clock:** `engine/clock.js` dropped `TIME_COSTS`/`advance()`; added `START_MINUTE`(02:00),
  real-time constants. `state/actions.js` `tickClock()` + `useGameClock()` (mounted in GameShell) advance
  the clock ~0.267 min/real-sec, pause in dialogue/overlays/map, force ending D at 06:00. Travel/examine/
  dialogue are now free. `MapOverlay` "+20 MIN" → "▸ MOVE". `saveLoad.SCHEMA_VERSION` → 3 (old saves drop).
- **Cosmetic:** cold open "YIBO IS DEAD" + new preamble; BootMode timestamp 02:00; objective text.
- Playtested: clock 02:00→02:01 over 6s, frozen while map open; full accuse→**Ending A** path works.

**Notes / not done:** the day/dusk scene art now goes unused (game is all-night by design). Suspicion
meter still solves the deduction for the player (pre-existing design call, untouched). No view-layer tests
added.

---

## Review — Morning start + 24h real-time clock (2026-06-16, follow-up)

**User feedback:** the game shouldn't be all-night — it should start in the **morning** like a workday
and progress through the day. The old per-action time cost (20 min/room) made the in-game day fly by.

**Done & verified (74 tests pass, lint clean, Playwright 0 console errors):**
- **Clock model flipped to a full workday** (`engine/clock.js`): `START_MINUTE = 0` (09:00 AM),
  `DEADLINE_MINUTE = 1440` (09:00 next day = 24h), `GAME_MINUTES_PER_REAL_SECOND = 1` (1 in-game min /
  real sec → whole day ≈ 24 real min). Renamed `SUNRISE_MINUTE`→`DEADLINE_MINUTE`, `isPastSunrise`→
  `isPastDeadline` (rippled to actions.js + clock.test.js).
- **Scene art now walks morning → dusk → night** as the clock advances (verified: minute 690 → "08:30
  PM · NIGHT" + night art). The day/dusk/night art is no longer wasted.
- **Framing → morning discovery:** murder happened last night; team finds the body on a workday so
  everyone's naturally present and witnesses recount last night. Deadline = David's **board call at
  09:00 tomorrow**. Updated David's cold-open/dialogue, Jay/Peem ("last night"), Ching's escape
  timeline, the objective, cold-open preamble + mission line, BootMode stamp, HUD label ("BOARD CALL
  09:00"), and ending D ("BOARD CALL / a full day and a night later").
- `saveLoad.SCHEMA_VERSION` → 4 (discards the interim night-version save). Clock-test rewritten for the
  24h model; stale "sunrise/first shift/06:00" comments cleaned up.

**Tuning note:** the deadline is a soft fail-safe — at 1 min/sec it's 24 real min away, so players accuse
when ready and the day is mostly atmosphere/realism (low pressure, as requested). The rate is one
constant (`GAME_MINUTES_PER_REAL_SECOND`) if it ever needs to feel faster/slower.
