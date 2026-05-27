# Tread Office (Mystery) — Build Plan & Engineering Handoff

> **Audience:** Senior engineer + small team picking up the project. Read top to bottom.
> **Status:** Phase 0 complete (architecture + scope locked). Phase 1 ready to start.
> **Game design source of truth:** [tread-office-master-spec.md](./tread-office-master-spec.md) — do not edit without ack from product owner. This doc is the *engineering* counterpart.
> **Deployment target:** desktop browser, internal use only (~10 employees). Not for public release.

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Project scope & engineering principles](#2-project-scope--engineering-principles)
3. [Stack & versions](#3-stack--versions)
4. [Repository layout](#4-repository-layout)
5. [Locked architecture decisions](#5-locked-architecture-decisions)
6. [Core abstractions (the vocabulary)](#6-core-abstractions)
7. [State shape](#7-state-shape)
8. [Engine module contracts](#8-engine-module-contracts)
9. [Day-1 onboarding (30 minutes to a running dev server)](#9-day-1-onboarding)
10. [Phase 1 — Skeleton + route + Ink + telemetry](#10-phase-1)
11. [Phases 2–10 — full roadmap](#11-phases-210-roadmap)
12. [Asset pipeline](#12-asset-pipeline)
13. [Quality bars](#13-quality-bars)
14. [Anti-patterns / don't-do list](#14-anti-patterns)
15. [Open decisions](#15-open-decisions)
16. [Glossary](#16-glossary)
17. [Handoff log](#17-handoff-log)

---

## 1. Project overview

**What we're building.** A short narrative mystery game called **Tread Office** (working case: *"Last Pitch Before Sunrise"*). Single-case MVP, ~15–25 minutes per playthrough. Player is a brand-new intern investigating sabotage of the CEO's pitch deck before an investor lands at sunrise. Eight suspects (caricatures of real teammates, with permission), eight clues, four endings.

**Reference points.** *Ace Attorney* (investigation → present-evidence loop), *Danganronpa* (suspect mental model), *Return of the Obra Dinn* (deductive end-game), *Hypnospace Outlaw* (UI texture). The look is brutalist trading-terminal — IBM Plex Mono, near-black canvas, single accent in warm orange (`#f57c3a`), zero border-radius, hard 1px borders.

**Game design is fully spec'd.** §3 (cast), §5 (clue chain), §6 (rooms), §9 (endings) of the master spec are locked. The engineering work below builds the *engine* that drives that spec — not the spec itself. Story content (Ink files) is authored last, in Phase 10, by an LLM, not by humans.

**Why this matters.** Most narrative-mystery projects die in the writing pass because the engine wasn't built to support what the writers want. We are sequencing engineering *first*, story *last*, with the explicit principle that the engine must be content-agnostic — any swap of `data/clues.js`, `data/rooms.js`, and the `.ink` files should produce a different case without code changes.

---

## 2. Project scope & engineering principles

### Scope

- **Single case MVP.** One mystery. One culprit. One office. Multiple endings. No expansion packs, no level editor, no second case.
- **~15–25 minutes per playthrough.** Replay value comes from reaching different endings, not from procedural variety.
- **Desktop browser only.** No mobile responsiveness. No tablet layout. Minimum supported viewport: 1280×720. No mobile-first CSS, no touch handlers.
- **Internal audience (~10 employees).** No auth. No analytics. No SEO. No accounts. No social features. No cloud save.
- **Offline single-player.** Zero network calls at runtime. Everything ships in the bundle.

### Engineering principles

These are the load-bearing rules. Every commit should be checkable against them.

1. **Engine is content-agnostic.** Swap `data/clues.js`, `data/rooms.js`, and the `.ink` files; the runtime should produce a different mystery without code changes.
2. **Data is inert; engine is pure; state is reactive; views are dumb.** Strict dependency direction: `data → engine → state → views`. Never the other way.
3. **One mode at a time.** The mode router renders exactly one top-level screen. Overlap is impossible by construction (see [§5.1](#51-mode-state-machine)).
4. **No premature abstraction.** A feature appears once → write it explicitly. Twice → consider a helper. Three times → maybe extract. Never extract on first sight.
5. **Persistence is automatic.** Every state-mutating action writes through to localStorage in the same tick. No "save" buttons, no manual checkpointing, no save scumming.
6. **Test the engine, smoke-test the views.** Engine modules have full unit-test coverage. Components get rendered-without-throwing checks plus one integration test in Phase 9.
7. **Performance budget is the load-bearing constraint.** <200 KB initial bundle. <1.5 s LCP. The bundle visualizer runs as a CI step from Phase 1 onward.
8. **The plan supersedes the code.** This file is the canonical reference. If code drifts from the plan, update one or the other — never both silently.

---

## 3. Stack & versions

Pin exactly. No surprises during onboarding.

| Layer | Choice | Version | Rationale |
|---|---|---|---|
| Build | Vite | `^5.4.0` | Instant HMR; ESM-native. Avoid Vite 6 until it stabilizes. |
| Runtime | React | `^18.3.1` | Concurrent features used minimally (Suspense for code-split scenes). Do NOT upgrade to React 19 — server components add complexity we don't need. |
| Routing | `react-router-dom` | `^6.30.3` | v6 data-router not needed; classic `<Routes>` is enough. Locks `/mystery` (the entry route) and `/mystery/credits` (epilogue, Phase 9). |
| State | Jotai | `^2.19.1` | Atom granularity matches our state shape (mode, overlay, clock, flags as separate atoms; derivations via `atom(get => …)`). Do NOT reach for Redux Toolkit or Zustand — the ceremony is wrong scope for a 26-hour project. |
| Animation | framer-motion | `^12.x` | `<AnimatePresence mode="wait">` is the load-bearing primitive for mode transitions. |
| Styling | CSS Modules + CSS variables | n/a | Tokens compiled to `:root` CSS vars, components use `*.module.css` with `var(--token-name)`. No Tailwind, no CSS-in-JS, no MUI. |
| Narrative DSL | `inkjs` | `^2.x` | Industry-standard narrative scripting (80 Days, Heaven's Vault). Single npm package contains both runtime and compiler — but they MUST be imported separately (see [§14](#14-anti-patterns) anti-pattern #3). |
| Tests | Vitest + Testing Library | latest | Unit tests for pure-function engine modules (`clock.js`, `gating.js`, `suspicion.js`, `clueRules.js`). React component tests for HUD + overlays. No e2e in v1. |
| Lint | ESLint flat config + Prettier | latest | Airbnb-derived rules. |
| Node | Node 20 LTS | `>=20.10` | Required by Vite 5 + inkjs's compiler script. |
| Package manager | npm | `>=10` | Use whatever the team is on; pnpm/yarn fine if consistent. |

**Dep count target:** under 25 production deps. Currently planned: 6.

---

## 4. Repository layout

```
tread-office/
├── package.json
├── package-lock.json
├── vite.config.js                # @ alias, asset handling
├── vercel.json                   # SPA rewrite for /mystery deep-links
├── index.html                    # font preconnect + #root
├── README.md                     # quickstart only; design lives in tasks/
├── eslint.config.js
├── .gitignore                    # ignores dist/, node_modules/, NOT ink/*.json
├── ink/                          # narrative source files
│   ├── sample.ink                # Phase 1: stub story to prove pipeline
│   ├── sample.json               # COMMITTED compiled output
│   ├── characters/               # Phase 5+: per-character stories
│   │   ├── david.ink
│   │   ├── sam.ink
│   │   ├── jay.ink
│   │   ├── peem.ink
│   │   ├── dena.ink
│   │   ├── poncho.ink
│   │   ├── ching.ink
│   │   └── jamie.ink
│   └── cold-open.ink             # Phase 8
├── scripts/
│   └── compile-ink.mjs           # dev-only; reads ink/**/*.ink → siblings .json
├── tests/
│   ├── engine/
│   │   ├── clock.test.js
│   │   ├── gating.test.js
│   │   ├── suspicion.test.js
│   │   └── clueRules.test.js
│   └── overlays/
│       └── canOpenOverlay.test.js
├── src/
│   ├── main.jsx                  # React mount + BrowserRouter
│   ├── App.jsx                   # <Routes>: only /mystery in this app
│   ├── index.css                 # global :root CSS variables (token bridge)
│   ├── pages/
│   │   ├── MysteryPage.jsx       # mounts <GameShell>
│   │   └── CreditsPage.jsx       # Phase 9
│   ├── theme/
│   │   ├── tokens.js             # design tokens (single source of truth)
│   │   └── motion.js             # easings, durations, slide distances, hitShake
│   ├── components/
│   │   └── chrome/               # brutalist design-system primitives (see §5.12)
│   │       ├── CornerBrackets/
│   │       ├── FlashWipe/
│   │       ├── GhostNumber/
│   │       ├── ScrambleText/
│   │       ├── SectionLabel/
│   │       ├── SlotNumber/
│   │       └── TerminalChrome/
│   ├── lib/
│   │   ├── safeStorage.js        # safe localStorage wrapper (try/catch, JSON, quota)
│   │   ├── classnames.js         # tiny clsx-equivalent (4 lines)
│   │   └── log.js                # dev-only console wrapper
│   ├── assets/
│   │   ├── scenes/
│   │   │   ├── bullpen/
│   │   │   │   ├── morning.webp
│   │   │   │   ├── dusk.webp
│   │   │   │   └── night.webp
│   │   │   ├── reception.webp
│   │   │   ├── conference.webp
│   │   │   ├── server-room.webp
│   │   │   ├── kitchen.webp
│   │   │   ├── davids-office.webp
│   │   │   └── bathroom.webp
│   │   └── portraits/
│   │       ├── david.png
│   │       ├── sam.png            # 8 portraits at 256×256, transparent bg
│   │       └── …
│   └── mystery/
│       ├── GameShell.jsx          # mode router + overlay router
│       ├── GameShell.module.css
│       ├── modes/                 # mutually exclusive top-level screens
│       │   ├── BootMode.jsx       # Phase 1
│       │   ├── ColdOpenMode.jsx   # Phase 8
│       │   ├── FreeRoamMode.jsx   # Phase 1 (placeholder), Phase 2 (real)
│       │   ├── DialogueMode.jsx   # Phase 5
│       │   ├── AccusationMode.jsx # Phase 8
│       │   └── EndingMode.jsx     # Phase 8
│       ├── overlays/              # full-screen overlays, only one open at a time
│       │   ├── NotebookOverlay.jsx    # Phase 6
│       │   ├── LockerOverlay.jsx      # Phase 6
│       │   ├── SuspectsOverlay.jsx    # Phase 6
│       │   └── ExamineOverlay.jsx     # Phase 2
│       ├── hud/
│       │   ├── TopBar.jsx         # Phase 1: clock + clue counter + overlay buttons
│       │   ├── TopBar.module.css
│       │   ├── BottomHint.jsx     # Phase 2: contextual prompts
│       │   └── ClueToast.jsx      # Phase 6: clue-collection animation
│       ├── scene/
│       │   ├── SceneCanvas.jsx    # Phase 2: bg image + hotspot layer
│       │   ├── Hotspot.jsx        # Phase 2
│       │   └── BackgroundFor.js   # Phase 4: picks variant by clock minute
│       ├── dialogue/
│       │   ├── DialoguePanel.jsx  # Phase 5
│       │   ├── DialogueChoices.jsx
│       │   └── inkRuntime.js      # Phase 1: thin wrapper around inkjs Story
│       ├── state/
│       │   └── mystery.js         # all atoms; persisted root atom
│       ├── data/
│       │   ├── rooms.js           # 7 rooms, hotspots, adjacency  (Phase 3)
│       │   ├── characters.js      # 8 characters, schedules        (Phase 7)
│       │   ├── clues.js           # 8 clues with prerequisites + evidenceAgainst (Phase 6)
│       │   └── endings.js         # ending criteria → outcome     (Phase 8)
│       └── engine/
│           ├── clock.js           # Phase 1: TIME_COSTS + advance + format
│           ├── canOpenOverlay.js  # Phase 1: predicate
│           ├── saveLoad.js        # Phase 1: schema versioning
│           ├── telemetry.js       # Phase 1: ring buffer in localStorage
│           ├── gating.js          # Phase 6: evaluate prerequisites
│           ├── clueRules.js       # Phase 6: flag-driven clue grants
│           ├── suspicion.js       # Phase 6: derive meters from collectedClues
│           └── schedule.js        # Phase 7: who-is-where-at-time
└── public/
    ├── favicon.ico
    └── fonts/
        └── (preloaded if self-hosting; otherwise Google Fonts via index.html)
```

**Conventions:**
- One folder per component when it has a `.module.css` sibling (e.g. `chrome/CornerBrackets/`). Single-file components live flat.
- `@/` import alias points at `src/`. Configured in `vite.config.js`.
- Tests sit in top-level `tests/` mirroring `src/` paths. No `__tests__` folders; co-location is fine for component tests but engine tests benefit from being centralized.
- `data/*.js` files export plain JS objects — no React, no Jotai. Pure content.
- `engine/*.js` files export pure functions — no React, no Jotai. Pure logic.
- React + Jotai live in `pages/`, `mystery/modes/`, `mystery/overlays/`, `mystery/hud/`, `mystery/scene/`, `mystery/dialogue/`, `mystery/state/`.

This separation (data → engine → state → React) is the project's most important invariant. **Every dependency must point downward.** A component imports from state. State imports from engine. Engine imports from data. None go the other way. If you want to import a component into engine, that is a code smell — the logic belongs in engine, the rendering belongs in the component.

---

## 5. Locked architecture decisions

These were debated and resolved before code started. **Do not relitigate without explicit ack from the product owner.** If you find a reason to change one, write it in §17 (handoff log) with the alternative, the trade-off, and why now.

### 5.1 Mode state machine

```js
mode: 'BOOT' | 'COLD_OPEN' | 'FREE_ROAM' | 'DIALOGUE' | 'ACCUSATION' | 'ENDING'
```

`<GameShell>` reads `modeAtom` and renders exactly one mode component via `<AnimatePresence mode="wait">`. **Two modes cannot render simultaneously.** This is the structural fix for grid-based UI overlap. The fix is enforced by the framework, not by careful CSS — there is no "carefully manage z-index of six panels" surface area, because there is at most one panel.

Rationale: the alternative (render Scene / Clock / Suspects / Notebook / Locker / Dialogue as siblings in a grid) inevitably causes panels to fight for layout. Dialogue overlaps clock, locker covers half of suspects on certain breakpoints, etc. The mode-router approach trades grid flexibility (which we don't need) for layout determinism (which we critically need).

### 5.2 Overlay system

```js
overlay: 'NOTEBOOK' | 'LOCKER' | 'SUSPECTS' | 'EXAMINE' | null
```

Overlays are full-screen modals on top of whatever mode is active. **At most one open at a time.** Opening overlay X with overlay Y open closes Y first. Pressing ESC closes the overlay. EXAMINE was originally proposed as a mode; demoted to an overlay because mode swaps are expensive UX and EXAMINE rarely involves substantive interaction (just a close-up + flavor text + maybe a clue grant).

Rules encoded in `engine/canOpenOverlay.js`:
- Blocked entirely during `COLD_OPEN`, `ACCUSATION`, `ENDING` (cutscenes).
- During `DIALOGUE`: NOTEBOOK, LOCKER, SUSPECTS allowed (read-only reference). EXAMINE blocked (you can't examine a desk while talking to someone).
- During `FREE_ROAM`: all overlays allowed.

Opening an overlay does NOT advance the clock (`OVERLAY_OPEN: 0` in TIME_COSTS).

### 5.3 Routing

`react-router-dom` v6, classic `<Routes>` (not the data-router). Routes:

| Path | Component | Phase |
|---|---|---|
| `/mystery` | `<MysteryPage>` | Phase 1 |
| `/mystery/credits` | `<CreditsPage>` | Phase 9 |
| `*` | redirect to `/mystery` | Phase 1 |

The mystery owns its full viewport. There is no app shell, no tab bar, no other "route in the same project."

### 5.4 Dialogue — Ink

All conversation content lives in `.ink` files in `ink/`. Compiled to JSON via `npm run ink:compile`. Loaded at runtime by `mystery/dialogue/inkRuntime.js`, which wraps `inkjs/engine/Story`.

Why Ink: ~400 nodes total (8 characters × ~5 trees × ~10 nodes) is past the scale where hand-rolled JSON dialogue authoring becomes painful. Ink gives us native variables, conditionals, once-only lines, fallthrough, diverts, cross-character state references. Compiles to JSON so the "data is pure" principle holds. Industry-validated (80 Days, Heaven's Vault, Sorcery!).

External functions exposed to Ink stories:
```ink
EXTERNAL set_flag(name)
EXTERNAL grant_clue(id)
EXTERNAL get_clock_minute()
EXTERNAL has_flag(name)
```

These are bound by `inkRuntime.js` to functions that mutate the Jotai state. Ink stories never touch React or Jotai directly.

### 5.5 Accusation mechanic — Telltale-style

Player picks a suspect from the suspect board, then selects exactly 3 clues from the evidence locker, then confirms. The engine evaluates:
- For each presented clue, does `clue.evidenceAgainst.includes(selectedSuspectId)`?
- Count matches. Outcome maps to ending A/B/C/D (full criteria in `data/endings.js`, locked in Phase 8).

Single attempt. No "are you sure?" retry. Ending fires.

Why not Ace Attorney "contradict-the-statement": that requires `contradicts: [statementId]` on every clue and a hand-authored testimony state machine per witness. Triples authoring burden, wrong scope.

Why not Obra Dinn three-tuples: that mechanic only works with multiple crimes (suspect + means + location for each fate). We have one crime.

### 5.6 Clock cost table

```js
const TIME_COSTS = {
  TRAVEL: 5,            // crossing a hotspot to another room
  EXAMINE: 10,          // opening EXAMINE overlay on a hotspot
  DIALOGUE_NODE: 15,    // each player choice in dialogue (NOT each line)
  OVERLAY_OPEN: 0,      // notebook / locker / suspects are free
  ACCUSATION_OPEN: 0,   // entering accusation doesn't burn time
};
```

Day budget: 480 minutes (9:00 AM → 5:00 PM). Then evening (5–7 PM). Then night (7 PM → sunrise = ~14 hours of in-game time). Hard deadline at minute 1410 (9:00 AM next day). At 15 min/dialogue choice, that's ~32 conversation choices in the workday — about right for a mystery where the player feels time pressure but isn't rushed off the clue chain.

Time-of-day breakpoints (locked):
- minute 0–360 (9 AM – 3 PM): morning
- minute 360–600 (3 PM – 7 PM): dusk
- minute 600+ (7 PM – sunrise): night

### 5.7 Save model — single autosave

Single autosave to `localStorage['tread-mystery-state-v1']`. Schema-versioned: `{ v: SCHEMA_VERSION, state: {...} }`. On load, if `v !== SCHEMA_VERSION`, wipe and start a fresh playthrough. No manual save UI. Every state-mutating action writes through `saveLoad.save(state)`.

Endings reached are persisted separately at `localStorage['tread-mystery-endings-v1']` so wipe-on-mismatch of the playthrough doesn't lose the player's "ending gallery" achievement record.

Why no save scumming: a 4-hour mystery where every choice can be rewound has no tension. We force commitment. Multiple endings are reached by *replay*, not save-scum.

### 5.8 Dialogue → clue coupling — decoupled

Dialogue nodes never call `grant_clue` arbitrarily. They only `set_flag`. A pure-function evaluator `engine/clueRules.js` runs after every flag mutation:

```js
function evaluate(flags, alreadyCollected) {
  const newGrants = [];
  for (const clue of clues) {
    if (alreadyCollected.has(clue.id)) continue;
    if (clue.prerequisites.every(p => flags.has(p))) {
      newGrants.push(clue.id);
    }
  }
  return newGrants;
}
```

Each clue:
```js
{
  id: 'clue6',
  label: 'Drive audit log',
  description: '…',
  prerequisites: ['has_clue1', 'has_clue2', 'peem_unlocked_server'],
  evidenceAgainst: ['sam'],
}
```

The §5 gating graph from the master spec maps directly to `prerequisites` arrays. Writers can re-tune clue triggers without touching dialogue. State is replay-deterministic.

Some Ink stories DO call `grant_clue(id)` directly — e.g. the cold open hands the player a notebook flag without ceremony. But that's the exception. The rule is: dialogue sets flags, rules grant clues.

### 5.9 NPC schedules — static, with "just left" texture

v1 ships flat schedules:
```js
sam.schedule = {
  '9:00': 'kitchen',
  '11:00': 'bullpen',
  '12:30': 'kitchen',
  '14:00': 'conference',
  …
}
```

No flag-conditional schedules in v1 ("Sam goes to server room only if she heard the rumor"). If we want that texture, it's a Phase 7.5 add.

When the player enters a room, we compute:
- Which NPCs are *currently* scheduled here? → render a "Talk to [Name]" hotspot for each.
- Which NPCs *just left* (within last 10 minutes)? → render a passive room hint: *"Sam's coffee mug is still warm. She just left for the kitchen."*

The world does NOT tick during dialogue. The clock advances per player action, deterministically. Walking into a room and talking to Sam doesn't cause Peem to leave the server room mid-conversation.

### 5.10 Telemetry — day 1

`engine/telemetry.js` exports `event(name, payload)`. Appends to `localStorage['tread-mystery-telemetry-v1']`, capped at 1000 events (ring buffer). Internal-only game, internal-only telemetry. No network calls.

Standard event names:
- `mode_change` `{from, to}`
- `overlay_change` `{from, to}`
- `clue_collected` `{id, atMinute, viaSource}`
- `dialogue_choice` `{character, node, choiceIndex, label}`
- `flag_set` `{name}`
- `room_enter` `{roomId, atMinute}`
- `accusation_attempt` `{suspectId, clueIds, outcome}`
- `ending_reached` `{ending, atMinute}`

Pays back the first time a tester misses clue 6 — we replay the event log and see exactly where the chain broke for them.

### 5.11 State — single Jotai atom tree, persisted

Atoms are granular for re-render efficiency, but persistence is via a single derived "snapshot" effect that subscribes to all writeable atoms and calls `saveLoad.save()` on every change. See [§7](#7-state-shape) for the shape.

### 5.12 Design system — brutalist chrome library

The project ships with an internal design-system library under `src/components/chrome/` plus tokens at `src/theme/tokens.js`. The chrome is the single source of truth for the brutalist aesthetic. Components, in order of importance:

| Component | Purpose | Phase consumed |
|---|---|---|
| `TerminalChrome` | Composition wrapper that adds CornerBrackets + GhostNumber + SectionLabel around any panel content. The brutalist frame. | Phase 1 (overlays, accusation) |
| `CornerBrackets` | Animated orange L-bracket corners that "slam in" on mount. | Phase 1 |
| `SectionLabel` | Small uppercased monospace label at a panel corner: `01/08 · OFFICE`. | Phase 1 |
| `GhostNumber` | Oversized monospace numeral rendered at 8% opacity behind content (`720px` font-size). | Phase 1 (optional decoration) |
| `ScrambleText` | Cycles `█▓▒░` glyphs into a target string for the "code unlocking" effect. | Phase 6 (clue toast), Phase 8 (accusation reveal) |
| `FlashWipe` | A 180 ms full-screen orange flash. Used on hard scene transitions. | Phase 4 (mode change), Phase 5 (clue grant) |
| `SlotNumber` | Slot-machine-style digit reveal. Used on suspicion meters and the clue counter. | Phase 6 |

Tokens (`src/theme/tokens.js`) live as a single JS object with sub-namespaces for `colors`, `typography`, `spacing`, `radii`, `borders`, `easings`, `durations`, `zIndex`. Mirrored to CSS variables in `src/index.css` (e.g. `--color-canvas`, `--ease-slam`, `--dur-fast`). **Tokens.js and index.css must stay in sync.** If you change a token, change the CSS var.

**Implementation status:** these components don't exist in the empty repo. Phase 1 includes implementing them. They are well-understood primitives; specs are in their respective folders' READMEs once written. None depend on MUI, no third-party UI libraries.

**Mock-derived chrome additions (Phase 1 implements alongside the above).** The reference layouts in §5.13 introduce three new persistent-chrome primitives that didn't exist in the original chrome set:

| Component | Purpose | Phase consumed |
|---|---|---|
| `TerminalStatusRow` | Top-of-viewport breadcrumb. Horizontal row of pipe-separated key/value pairs: `TREAD · CASE 01/04 · SCENE 02/05 · FLOOR 14 · OBJ <text> · NOW <clock> · SUNRISE <countdown>`. Fixed 32px height. Reads from atoms; pure render. | Phase 1 (replaces planned `TopBar`) |
| `FunctionKeyBar` | Bottom-of-viewport keyboard-shortcut row: `F1 PROBE · F2 EVIDENCE · F3 BADGE LOG · F4 SCRATCHPAD …`. Reads a list of `{key, label, action, enabled}` entries from props or atoms. Renders dim/active states. | Phase 1 (HUD) |
| `SystemStatusRow` | Far-bottom faux-OS status row: `CPU 04 · MEM 41% · BUILD 0.7.3 · NIGHT 2 · SAVE AUTOPLAY`. Cosmetic chrome only — reads `import.meta.env.VITE_BUILD` for the build hash; fakes CPU/MEM with stable random values at mount; reads time-of-day + autosave state from atoms. | Phase 1 |
| `RosterPanel` | Right-side persistent panel. Renders all 8 NPCs with current status (computed via `engine/schedule.js`: `AT DESK`, `IN <room>`, `OUT`, `LOCKED`, `IDLE`, etc.), short numeric badge (e.g. minutes-since-seen), and selection state. | Phase 7 (when schedules land); stub renders in Phase 1. |
| `RecentEvidencePanel` | Right-side panel below `RosterPanel`. Lists last 3 collected clues with TB-XX ID + short description. | Phase 6. |

---

### 5.13 Reference layouts (from product-owner mocks)

Seven mocks were produced by the product owner before Phase 1 started. They are the canonical layout reference for the corresponding modes/overlays. The visual polish is rough; the **information hierarchy and panel placement is locked**. If a code change drifts from these layouts, update the doc or the layout — never both silently.

**Interpretation guardrails.** The mocks contain placeholder content that does NOT supersede the master spec. Treat as scratch:
- Pink/red accent in some mocks — canonical accent is `#f57c3a` (warm orange, per `tokens.js` and master spec §10).
- Character names "Arden / Kai / Mira / Pol / Juno / Ren / Syl / Doge" — canonical cast is in master spec §3 (David, Sam, Jay, Peem, Dena, Poncho, Ching, Jamie). The D1–D8 designators in mock 6 are useful as anonymous slot IDs in roster chrome (e.g. `D1 · DAVID`).
- "After Arden's death" framing — master spec §2 is explicit: no body count, crime is corporate sabotage. The OBJ text in the top status bar should read sabotage-flavored (e.g. `OBJ Find who gutted the deck before sunrise.`).
- "Tread HQ — Floor 14" / multi-floor — single-floor 7-room office per master spec §6. Floor plan is one floor.
- "CASE 01/04 · SCENE 02/05" — single case MVP. `CASE 01/01` is fine cosmetic chrome. `SCENE` counter can be a cosmetic phase tracker (`SCENE 01/05` = morning, `02/05` = afternoon, `03/05` = dusk, `04/05` = night, `05/05` = dawn) — five labels mirroring the time-of-day cycle from spec §11.

**Layout 1 — Truth Bullet Acquisition card** *(triggered by `clueRules.evaluate()` returning a new clue; opens as a full-screen overlay on top of any mode)*
- Top: chapter/phase lockup (`CHAPTER 03 · DISCOVERY`) on left; mute system breadcrumb on right.
- Center: large `Acquired` lockup, then a single clue tile centered (diamond icon · ID · classification badge · clue title · 1-line description · hotkey legend).
- Background: blurred snapshot of the scene the player was in (or floor plan).
- Bottom: primary CTA `STORE IN LOCKER [E]` + `FunctionKeyBar`.

**Layout 2 — Evidence Locker overlay** *(opened from TopBar `EVIDENCE` button or `F2`)*
- Top row: left = `LOADED 08`; center = title `Evidence Locker` with subhead `08 LOADED · 1 SELECTED · CHAMBER 03`; right = `FILTER ALL · SORT TIME · CLOSE [Q]`.
- Main: 4×2 grid of clue tiles. Each tile = `TB-XX` ID + classification badge (`WEAK | CORE | HEAVY`) + diamond icon + clue title + 1-line description.
- Empty slots have dashed borders (per master spec §8).
- Selected tile gets accent border + slightly shaded fill.
- Below grid: full description panel for the selected clue + `FIRE [F]` / `PRESENT` CTA on the right.
- Bottom: persistent `FunctionKeyBar` + breadcrumb (`LPRS · DIR.H · LOCKER`).

**Layout 3 — Friendship-track dialogue (DIALOGUE mode, FTE variant)** *(used for the trust-building beats; e.g. Ching's three-step trust earn from spec §3)*
- Scene bg behind, dimmed.
- Character: stacked portrait variants (multiple expression frames visible — drives a "blink to next emotion" beat as the conversation progresses) on the left side.
- Speech panel on right: speaker name lockup, prompt line, choice buttons stacked.
- Right edge: per-character relationship meter (`TRUST 02/05` for Ching; absent for non-trust characters).
- Top breadcrumb: chapter/phase + system chrome.

**Layout 4 — Standard dialogue with reaction stack (DIALOGUE mode)**
- Scene bg behind.
- Single primary character with smaller stacked reaction-portraits to convey emotional beat changes mid-conversation.
- Speaker label.
- Quoted line in a panel.
- Top: chapter/scene/floor breadcrumb + system chrome.

**Layout 5 — Map / Travel selection** *(sub-mode of FREE_ROAM, or its own MAP mode — see §15 OD-9)*
- Title block: location name + subtitle (`Tread Office — Single Floor` / `Where will you go?`).
- Center: large floor plan, room labels include status (`LOCKED`, `EVIDENCE`, character markers, dotted travel trail from current position).
- Right panel: selected-room detail (name, subtype, 1–2 sentence description, list of NPCs currently there + evidence count, `MOVE HERE [Enter]` CTA, hotkey legend `tab · cycle rooms`, `esc · cancel`, `m · toggle labels`).
- Bottom-left: T-MINUS clock + `MOVES <used>/<budget>` counter (if MOVES mechanic adopted; see §15 OD-10).
- Bottom-right: `FunctionKeyBar`.

**Layout 6 — FREE_ROAM floor plan (terminal/dispatch view, primary surface)**
- Top breadcrumb: `TREAD/OS · USER · <intern-name> · SHIFT · NIGHT 02 · CASE 01 / 01 · SCENE 02 / 05`.
- Main: floor plan fills viewport, character markers (D1–D8 designators tied to actual cast) on rooms with movement trails since last tick.
- Ghost numeral (large `14` or `01` for the single floor) behind floor plan at low opacity.
- Corner brackets framing the canvas.

**Layout 7 — Master FREE_ROAM HUD (canonical FREE_ROAM screen)**
- Top: `TerminalStatusRow` with `TREAD · CASE · SCENE · FLOOR · OBJ · NOW · SUNRISE`.
- Left ~60%: floor plan (Layout 6).
- Right ~40%, split vertically:
  - Top: `RosterPanel` — every NPC listed with current status (`AT DESK · 42` / `KITCHEN · 02:53 · 17` / `OFF-SITE` / `OUT 23:48` / `SERVER ROOM · LOCKED · 06` / `IDLE NEAR DOOR`).
  - Bottom: `RecentEvidencePanel` — last 3 clues collected with TB-XX IDs.
- Bottom: `FunctionKeyBar` (`F1 PROBE · F2 EVIDENCE · F3 NOTES · F4 SUSPECTS …`).
- Far-bottom: `SystemStatusRow` (`CPU · MEM · BUILD · NIGHT · SAVE AUTOPLAY`).

**Architectural shift implied by Layouts 6 + 7.** FREE_ROAM is a **floor-plan dispatch view**, not a scene-background view. Scene art renders only during DIALOGUE / EXAMINE / acquisition cards. This supersedes master spec §8's "scene panel as main view" — the scene panel is now an on-demand sub-screen, not the persistent surface. Confirmed direction: terminal/dispatch primary. Phase 2 work pivots from "scene canvas + hotspots on background image" to "floor plan SVG + clickable rooms + character icon overlay." See §15 OD-9.

**New mechanics introduced by mocks** (proposed; lock at indicated phase):

| Mechanic | Scope impact | Lock at |
|---|---|---|
| `WEAK / CORE / HEAVY` clue classification | Adds `weight: 'weak' \| 'core' \| 'heavy'` to clue schema. Tunes accusation outcomes (Ending A requires ≥2 CORE/HEAVY among presented clues; Ending B fires on weak-clue selections). Drops the existing `smokingGun: true` / `clears: true` boolean tags from `engine/suspicion.js` in favor of weight-driven math. | Phase 6 |
| MOVES counter (action budget per scene) | NEW. Hard limit on actions per scene before time auto-advances to the next phase boundary (e.g. 6 moves → afternoon). Could replace OR augment the per-action time cost. **Recommendation:** keep the time cost system; treat MOVES as a *display-only* derived stat (`moves = floor(minutes / 30)`) so the player has a coarser mental model of "actions left in this phase" without changing the underlying clock. Pure UI. | Phase 4 |
| Multi-scene/chapter chrome | Five cosmetic phase labels (morning/afternoon/dusk/night/dawn) shown in `SCENE 0X/05`. No real chapter-break mechanic. Player flow stays continuous. | Phase 4 |
| Trust meter per NPC | NEW. Replaces "set a few trust flags" with a numeric `trust[characterId]` 0..5. Display-only; gating still uses flag prerequisites. Authored in `data/characters.js`. Visible in Layout 3 only for characters whose arc requires earned trust (Ching primarily). | Phase 5 |
| Function-key shortcuts (F1–F4) | Pure UX. Maps `F1 → focus floor plan / probe`, `F2 → open Locker`, `F3 → open Notes`, `F4 → open Suspects`. Native `keydown` listener on `<GameShell>`. | Phase 1 (wire empty handlers; bind real overlays in Phase 6) |

The vocabulary the rest of the codebase uses. Every engineer on the project must internalize these.

| Term | Definition | Lives in |
|---|---|---|
| **Mode** | The current top-level screen of the game. Mutually exclusive. | `state/mystery.js` `modeAtom` |
| **Overlay** | A full-screen panel rendered on top of the active mode. Mutually exclusive with other overlays. | `state/mystery.js` `overlayAtom` |
| **Room** | A discrete physical location in the office (`reception`, `bullpen`, etc.). 7 total. | `data/rooms.js` |
| **Hotspot** | A clickable region on a scene background. Has an action (`travel`, `examine`, `talk`). | `data/rooms.js`, rendered by `scene/Hotspot.jsx` |
| **Flag** | A boolean state marker, set by dialogue or examine actions. | `state/mystery.js` `flagsAtom` (a `Set<string>`) |
| **Clue** | A piece of evidence. Has a description, prerequisites (flags that must be true), and a list of suspects it points at. | `data/clues.js`, granted by `engine/clueRules.js` |
| **Gate** | A predicate (`flags.has('foo') && flags.has('bar')`) that controls whether a hotspot, dialogue choice, or room is currently available. | Evaluated by `engine/gating.js` |
| **Schedule** | A character's timetable: which room they are in at which clock-minute. | `data/characters.js` |
| **Suspicion** | Per-suspect score derived from collected clues' `evidenceAgainst[]` weights. | Computed by `engine/suspicion.js` |
| **Ending** | One of A/B/C/D, determined by accusation outcome + clue strength + time remaining. | `data/endings.js` |
| **Tick** | A single clock advance, triggered by an action. Tick = 5 / 10 / 15 minutes depending on `TIME_COSTS`. | `engine/clock.js` |

These are the only terms in the codebase. If you find yourself naming something a "scene" (other than the background image), a "panel" (other than the chrome wrapper), or a "screen" (other than the conceptual mode), pause and align with this glossary first.

---

## 7. State shape

```js
// state/mystery.js — atoms

modeAtom            : Atom<Mode>
overlayAtom         : Atom<Overlay | null>
clockMinutesAtom    : Atom<number>          // 0 = 9:00 AM
currentRoomAtom     : Atom<RoomId>
flagsAtom           : Atom<Set<string>>
collectedCluesAtom  : Atom<Array<{id, atMinute, source}>>
dialogueAtom        : Atom<DialogueState | null>
//   { storyId, currentText, choices: [{label, idx}], history: [...] }
examineAtom         : Atom<{ hotspotId } | null>
endingAtom          : Atom<EndingId | null>

// derived (read-only)
suspicionByCharacterAtom : Atom<Record<CharacterId, number>>  // 0..1
canOpenOverlayAtom       : Atom<(overlay) => boolean>
charactersInRoomAtom     : Atom<Array<CharacterId>>            // current room, current minute
justLeftFromRoomAtom     : Atom<Array<CharacterId>>            // last 10 min

// persisted snapshot — subscribes to all writeable atoms above and writes through
persistAtom : Atom (effect-only)
```

Persistence shape on disk:
```json
// localStorage['tread-mystery-state-v1']
{
  "v": 1,
  "state": {
    "mode": "FREE_ROAM",
    "overlay": null,
    "clockMinutes": 75,
    "currentRoom": "kitchen",
    "flags": ["case_opened", "talked_to_dena", "heard_yelling_story"],
    "collectedClues": [{"id": "clue3", "atMinute": 45, "source": "dialogue:dena_kitchen"}],
    "dialogue": null,
    "examine": null,
    "ending": null
  }
}
```

`localStorage['tread-mystery-endings-v1']` (ending gallery, persists across resets):
```json
{ "v": 1, "reached": ["A", "C"] }
```

`localStorage['tread-mystery-telemetry-v1']` (ring buffer, capped 1000):
```json
{ "v": 1, "events": [{"name": "mode_change", "ts": 1714327800000, "payload": {…}}, …] }
```

---

## 8. Engine module contracts

Pure functions. No React, no Jotai imports. Trivially testable.

### `engine/clock.js`

```js
export const TIME_COSTS = {
  TRAVEL: 5, EXAMINE: 10, DIALOGUE_NODE: 15, OVERLAY_OPEN: 0, ACCUSATION_OPEN: 0,
};

export function advance(currentMinutes, action) // → newMinutes
export function formatClock(minutes)             // → "11:30 AM"
export function periodFor(minutes)               // → 'morning'|'dusk'|'night'
export function isPastSunrise(minutes)           // → boolean
```

### `engine/canOpenOverlay.js`

```js
export function canOpenOverlay(mode, overlay) // → boolean
```

Pure lookup. No state.

### `engine/saveLoad.js`

```js
export const SCHEMA_VERSION = 1;
export const STATE_KEY = 'tread-mystery-state-v1';
export const ENDINGS_KEY = 'tread-mystery-endings-v1';

export function save(state)        // → void
export function load()             // → state | null  (null on schema mismatch or missing)
export function reset()            // → void          (wipes STATE_KEY only, leaves endings)
export function recordEnding(id)   // → void
export function reachedEndings()   // → string[]
```

### `engine/telemetry.js`

```js
export const TELEMETRY_KEY = 'tread-mystery-telemetry-v1';
export const MAX_EVENTS = 1000;

export function event(name, payload)  // → void  (also console.log in dev)
export function dump()                 // → Event[]
export function clear()                // → void
```

### `engine/gating.js`

```js
export function evaluatePrerequisites(flagSet, requiredFlags)  // → boolean
export function visibleChoices(allChoices, flagSet)            // → Choice[]
export function visibleHotspots(allHotspots, flagSet)          // → Hotspot[]
```

### `engine/clueRules.js`

```js
export function evaluate(flagSet, collectedClueIdSet, allClues)
//  → string[] (newly granted clue IDs; caller is responsible for committing)
```

### `engine/suspicion.js`

```js
export const WEIGHTS = {
  STANDARD: 0.12,         // each clue → +12% on each character in evidenceAgainst
  SMOKING_GUN: 0.30,      // a clue marked smokingGun: true
  ALIBI: -0.50,           // a clue marked clears: true
};

export function compute(collectedClues, allClues)
//  → Record<CharacterId, number>  (clamped to [0, 1])
```

### `engine/schedule.js`

```js
export function whoIsInRoom(roomId, atMinute, allCharacters)
//  → CharacterId[]
export function whoJustLeft(roomId, atMinute, withinMinutes, allCharacters)
//  → Array<{characterId, leftAtMinute, headedTo}>
```

Each of these has a unit test in `tests/engine/`. Coverage target: 100% for `engine/*` files. They are the load-bearing pieces. If they break, the game is fundamentally broken.

---

## 9. Day-1 onboarding

For the next engineer joining the project. Target: dev server running, can navigate to `/mystery` and see the placeholder shell, in 30 minutes.

```bash
# 1. Clone
git clone <repo> tread-office
cd tread-office

# 2. Install
npm install

# 3. Run dev
npm run dev
# → opens http://localhost:5173

# 4. Visit /mystery
# → should see brutalist shell with morning bullpen background, "09:00 AM" in top-bar

# 5. Run tests
npm test

# 6. Compile sample Ink (sanity check)
npm run ink:compile
# → reads ink/sample.ink, writes ink/sample.json
```

Read these in order:
1. [tread-office-master-spec.md](./tread-office-master-spec.md) — what the game IS (~30 min)
2. This file (you are here) — how the engine WORKS (~30 min)
3. `src/mystery/state/mystery.js` — the state atoms (~5 min)
4. `src/mystery/engine/` — every file is small, all together ~15 min
5. `src/mystery/GameShell.jsx` — the mode router (~5 min)

Total: ~85 min from cold start to "I understand this codebase."

---

## 10. Phase 1 — Skeleton + route + Ink + telemetry

**Phase budget: ~4 hours.**

**Goal.** `tread-office/` is a runnable Vite project. `/mystery` route loads the brutalist shell with the morning bullpen background. TopBar shows mock clock + clue counter + three overlay buttons (no-op). Sample `.ink` file compiles to JSON; `inkRuntime` loads it without error. Telemetry stub fires `mode_change` on initial mount. `localStorage['tread-mystery-state-v1']` round-trips through reload with schema versioning.

**"Done" looks like.** Open `/mystery` in a browser. See a brutalist scene with the morning bullpen full-bleed in the background, a thin top bar showing `09:00 AM`, `0/8 CLUES`, and three buttons (`NOTEBOOK / EVIDENCE / SUSPECTS`). Reload — state hydrates. Open devtools, type `await import('@/mystery/dialogue/inkRuntime').then(m => m.loadSample())` — see a `Story` object returned. Run `npm test` — engine module tests pass. Run `npm run build` — production bundle is built; the inkjs *compiler* is NOT in the bundle (only the runtime).

### 10.1 Files to create

> Mark these as you go. Each file has a single responsibility.

#### Project bootstrap
- [ ] `package.json` — name `tread-office`, scripts: `dev` `build` `preview` `test` `lint` `ink:compile`. Deps: `react`, `react-dom`, `react-router-dom@^6.30.3`, `jotai@^2.19.1`, `framer-motion@^12`, `inkjs`. Dev deps: `vite@^5.4`, `@vitejs/plugin-react`, `vitest`, `@testing-library/*`, `jsdom`, `eslint*`, `prettier`. Node >= 20 in `engines`.
- [ ] `vite.config.js` — `@` alias to `src/`, plugin-react, vitest config (jsdom env).
- [ ] `index.html` — `#root`, IBM Plex Mono preconnect + 400/700 weights, viewport meta, no `<noscript>`.
- [ ] `.gitignore` — node_modules, dist, .env*, but NOT `ink/*.json` (those are committed).
- [ ] `eslint.config.js` (flat config) — Airbnb-derived, react, react-hooks, jsx-a11y, import.
- [ ] `vercel.json` — `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`. Without this, `/mystery` 404s on Vercel deep-links.
- [ ] `README.md` — 20 lines: what it is, `npm install`, `npm run dev`, link to this build plan.

#### Design system — tokens & global CSS
- [ ] `src/theme/tokens.js` — single object with `colors`, `typography`, `spacing`, `radii` (all zero), `borders`, `easings` (`slam`, `pop`, `exit`, `quart`), `durations` (`fast: 150`, `base: 250`, `slow: 450`, `flash: 180`), `zIndex`.
- [ ] `src/theme/motion.js` — re-exports `easings` and `durations` from tokens; defines `slideDistances` (`sm: 16, md: 40, lg: 240, xl: 480`) and `hitShake` framer-motion variant.
- [ ] `src/index.css` — `:root` with CSS variables mirroring tokens (e.g. `--color-canvas`, `--ease-slam`, `--dur-fast`). Reset (html/body/#root: 100% height, no margin). Branded thin scrollbars. `@font-face` for IBM Plex Mono if self-hosting (otherwise `<link>` in index.html).

#### Design system — chrome components

Each component lives in its own folder with `index.jsx` + `*.module.css`. Implementations are small (30–100 lines each). Specs:

- [ ] `src/components/chrome/CornerBrackets/` — Four absolutely-positioned L-shaped 2px orange brackets at the corners of the parent. Animate in on mount (slam easing, staggered if `staggered` prop). `pointer-events: none`. Props: `staggered?: boolean`.
- [ ] `src/components/chrome/SectionLabel/` — Small monospace label rendered at one corner of the parent. Props: `index: number, total: number, label: string, position: 'tl' | 'tr' | 'bl' | 'br'`. Renders `01/08 · OFFICE` style.
- [ ] `src/components/chrome/GhostNumber/` — Renders `props.value` at 720px font-size, 8% opacity, accent-orange, behind content. `position: absolute; pointer-events: none`. Props: `value: string | number`.
- [ ] `src/components/chrome/ScrambleText/` — Cycles `█▓▒░` glyphs over the target string for `props.duration` ms then locks. Props: `target: string, duration?: number, autoStart?: boolean`. Used for clue reveals.
- [ ] `src/components/chrome/FlashWipe/` — Imperative full-screen orange flash, 180 ms. Exports both a `<FlashWipe />` controlled component (boolean prop) and an imperative `flash()` helper that renders into a portal. Used on mode transitions and clue grants.
- [ ] `src/components/chrome/SlotNumber/` — Animated digit reveal: cycles digits at ~80 ms intervals before locking on the final value. Props: `value: number, duration?: number`. Used for suspicion meters and clue counter.
- [ ] `src/components/chrome/TerminalChrome/` — Composition wrapper. Renders `CornerBrackets` + optional `GhostNumber` + `SectionLabel` + children. Props: `sceneId: number, sceneTotal?: number, label: string, ghostNumber?: string|number, showCorners?: boolean, bracketsStaggered?: boolean, hideLabel?: boolean, children`.

#### Asset pipeline
- [ ] **Compress three bullpen scene renders to WebP.** Source PNGs in `~/Downloads/hf_…081932`, `…081950`, `…082015` are 1.4–1.7 MB each at variable resolutions; for production we want ≤500 KB each at 1920×1080. Use `cwebp -q 85 -resize 1920 0` (or sharp via a one-off Node script). PNG → WebP at q=85 typically yields 4–6× compression with no perceptible quality loss for illustrated scenes.
- [ ] `src/assets/scenes/bullpen/morning.webp` — compressed from `~/Downloads/hf_…081932`
- [ ] `src/assets/scenes/bullpen/dusk.webp` — compressed from `~/Downloads/hf_…082015`
- [ ] `src/assets/scenes/bullpen/night.webp` — compressed from `~/Downloads/hf_…081950`

#### Lib helpers
- [ ] `src/lib/safeStorage.js` — wraps `localStorage` with try/catch, JSON parse/stringify, quota-exceeded handling. Exports `getItem(key)`, `setItem(key, value)`, `removeItem(key)`.
- [ ] `src/lib/classnames.js` — 4-line clsx-equivalent (`function cn(...args) { return args.filter(Boolean).join(' '); }`).
- [ ] `src/lib/log.js` — `log(...)`, `warn(...)`, `error(...)` that no-op outside `import.meta.env.DEV` (keep production console clean).

#### App entry
- [ ] `src/main.jsx` — `<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>` mount. Imports `./index.css`.
- [ ] `src/App.jsx` — `<Routes>` with `/mystery` → `<MysteryPage />` and `*` → `<Navigate to="/mystery" replace />`. No global theme provider needed (CSS vars do the work).
- [ ] `src/pages/MysteryPage.jsx` — mounts `<GameShell />`. Sets `document.title = 'Tread Office'` on mount.

#### Game shell
- [ ] `src/mystery/GameShell.jsx` — reads `modeAtom`, `overlayAtom`. Renders top bar always. Mode router via `<AnimatePresence mode="wait">` switching on `mode`. Overlay router via `<AnimatePresence>` (multiple) switching on `overlay`. Phase 1 only renders `FreeRoamMode` for any mode and stub overlays.
- [ ] `src/mystery/GameShell.module.css` — full-viewport flex column: TopBar fixed at top, mode area takes remaining height.

#### Modes (Phase 1 minimum)
- [ ] `src/mystery/modes/BootMode.jsx` — minimal "loading" splash; transitions to FREE_ROAM on mount-completion.
- [ ] `src/mystery/modes/FreeRoamMode.jsx` — renders bullpen morning bg full-bleed via CSS background-image. No hotspots yet (Phase 2). Imports the WebP, sets it as background.
- [ ] `src/mystery/modes/FreeRoamMode.module.css` — `.root { position: absolute; inset: 0; background: var(--scene-bg) center/cover no-repeat; }` (the URL is set inline via `style` prop based on time-of-day in Phase 4; Phase 1 hardcodes morning).

#### HUD (per §5.13 Layout 7 — five chrome panels, not a single TopBar)
- [ ] `src/mystery/hud/TerminalStatusRow.jsx` — top breadcrumb (32px). Reads `clockMinutesAtom`, `objectiveAtom`. Renders pipe-separated lockup: `TREAD · CASE 01/01 · SCENE 01/05 · FLOOR 01 · OBJ <text> · NOW <T-MINUS> · SUNRISE 06:00:00`. Phase 1 hardcodes objective text.
- [ ] `src/mystery/hud/FunctionKeyBar.jsx` — bottom keyboard-shortcut row. Renders `F1 PROBE · F2 EVIDENCE · F3 NOTES · F4 SUSPECTS · F5 SAVE`. Phase 1 wires global `keydown` listener with stubbed handlers (`console.log('[fkey] F2')`); real overlay handlers bound in Phase 6.
- [ ] `src/mystery/hud/SystemStatusRow.jsx` — far-bottom faux-OS row. Renders `CPU <stable-fake> · MEM <stable-fake>% · BUILD <import.meta.env.VITE_BUILD || 'dev'> · NIGHT <period> · SAVE AUTOPLAY`. Stable fakes generated once at mount via `useMemo` so they don't jitter.
- [ ] `src/mystery/hud/RosterPanel.jsx` — right-top panel. Phase 1 renders 8 stub rows from a hardcoded list (`D1·DAVID · OFF-SHIFT`, …); real status states land in Phase 7 once `engine/schedule.js` exists.
- [ ] `src/mystery/hud/RecentEvidencePanel.jsx` — right-bottom panel. Phase 1 renders empty state (`No bullets logged.`); real clue feed lands in Phase 6.
- [ ] `src/mystery/hud/*.module.css` — one per component. IBM Plex Mono uppercase, accent border separators, all positioned via the GameShell grid layout (no absolute positioning except for SystemStatusRow which is `bottom: 0`).

#### State
- [ ] `src/mystery/state/mystery.js` — exports atoms listed in §7. Persistence effect via `atomEffect` pattern: subscribe to all writeable atoms, debounce 100ms, call `saveLoad.save()`. Hydrate on app mount via `saveLoad.load()`.

#### Engine
- [ ] `src/mystery/engine/clock.js` — exports `TIME_COSTS`, `advance(min, action)`, `formatClock(min)`, `periodFor(min)`, `isPastSunrise(min)`.
- [ ] `src/mystery/engine/canOpenOverlay.js` — exports the predicate.
- [ ] `src/mystery/engine/saveLoad.js` — exports `SCHEMA_VERSION`, `STATE_KEY`, `ENDINGS_KEY`, `save`, `load`, `reset`, `recordEnding`, `reachedEndings`. Wraps `safeStorage`.
- [ ] `src/mystery/engine/telemetry.js` — exports `event`, `dump`, `clear`. Ring buffer at `MAX_EVENTS = 1000`. Console-logs in dev (`import.meta.env.DEV`).

#### Ink pipeline
- [ ] `ink/sample.ink` — 3-line stub story:
  ```ink
  Welcome to Tread Office.
  * [Begin] -> END
  ```
- [ ] `ink/sample.json` — committed compiled output. Generated by `npm run ink:compile`.
- [ ] `scripts/compile-ink.mjs` — Node script: reads every `.ink` under `ink/`, compiles via `import { Compiler } from 'inkjs/compiler/Compiler'`, writes sibling `.json`. Run-once via `npm run ink:compile`. NEVER imported from app code.
- [ ] `src/mystery/dialogue/inkRuntime.js` — wraps `inkjs/engine/Story`. Exports:
  ```js
  export async function loadSample()                         // dev sanity check
  export function loadFromJSON(json) → Story
  export function continueAll(story) → string                 // returns concatenated text since last choice
  export function choose(story, idx)                         // makes a choice
  export function bindExternals(story, { setFlag, grantClue, getClockMinute, hasFlag })
  ```
  **CRITICAL:** import path must be `inkjs/engine/Story` — never `inkjs` or `inkjs/compiler/*`. The compiler adds ~200 KB to the bundle and we don't need it at runtime. The bundle smoke test below verifies this.

#### Tests (Phase 1 unit tests)
- [ ] `tests/engine/clock.test.js` — `advance(0, 'TRAVEL') === 5`, `formatClock(0) === '09:00 AM'`, `formatClock(75) === '10:15 AM'`, `periodFor(361) === 'dusk'`, `isPastSunrise(1411) === true`.
- [ ] `tests/engine/canOpenOverlay.test.js` — every (mode, overlay) cell of the matrix.
- [ ] `tests/engine/saveLoad.test.js` — round-trip save/load, schema mismatch wipes, `recordEnding` appends.

### 10.2 Smoke test (must pass before Phase 1 closes)

- [ ] `npm install` succeeds with no peer-dep warnings
- [ ] `npm run dev` starts on `:5173` with no console errors
- [ ] Visit `http://localhost:5173/` → redirects to `/mystery`
- [ ] Visit `/mystery` → see morning bullpen bg full-bleed
- [ ] TopBar shows `09:00 AM`, `0 / 8 CLUES`, three overlay buttons
- [ ] Console: `[telemetry] mode_change BOOT→FREE_ROAM` on initial mount
- [ ] DevTools → Application → Local Storage → `tread-mystery-state-v1` exists with `{v: 1, state: {…}}`
- [ ] Reload `/mystery` → state hydrates; console shows `[saveLoad] hydrated from v1`
- [ ] In console: `await (await import('/src/mystery/dialogue/inkRuntime.js')).loadSample()` returns a `Story` object whose `Continue()` emits the welcome line
- [ ] `npm test` — all unit tests pass
- [ ] `npm run build` — production build succeeds. Open `dist/assets/index-*.js` (gzipped) — should be < 200 KB.
- [ ] Run `npx vite-bundle-visualizer` — `inkjs/compiler/*` is **NOT** in the bundle. `inkjs/engine/Story` IS. If the compiler shows up, fix `inkRuntime.js` import path.
- [ ] `vite preview` — `/mystery/foo/bar` deep-link returns the app, not 404. Validates `vercel.json` SPA rewrite locally before deploy.

### 10.3 Out of scope for Phase 1

Resist the urge:
- Hotspots / clickable scene → Phase 2
- Real dialogue UI → Phase 5 (Ink pipeline is proven in Phase 1, but no DialogueMode component yet)
- Multiple rooms → Phase 3
- Time-of-day variant swapping → Phase 4 (Phase 1 hardcodes morning)
- Clue grants, real overlays → Phase 6
- NPC schedules → Phase 7
- Cold open dialogue → Phase 8
- Any real game content / story / character lines → Phase 10

**If you find yourself wanting to add one of these, that's a sign you're in the wrong phase. Stop and merge Phase 1.**

### 10.4 Risks for Phase 1

| Risk | Likelihood | Mitigation |
|---|---|---|
| Vite + inkjs ESM/CJS interop weird | medium | Use `import { Story } from 'inkjs/engine/Story'`. If breakage, fall back to `inkjs` namespace import; bundle penalty acceptable for one phase. File issue. |
| WebP not displaying in Safari | low | WebP has been Safari-supported since 14. If we hit it, add `<picture>` fallback to PNG. Phase 1 doesn't ship to users so deferrable. |
| Persistence race on rapid state changes | low | Debounce save by 100ms (`atomEffect` cleanup). |
| CSS Module class-name collision in chrome | low | Vite scopes module classes. |
| Path alias `@` not picked up by tests | medium | Mirror `vite.config.js` alias in `vitest` config (`test.alias` or shared `resolve.alias`). |

---

## 11. Phases 2–10 — full roadmap

Each phase ships a demonstrable thing. **Do not start phase N+1 until phase N's smoke test is green.** When you start a phase, expand its sub-section below into a full Phase-1-style breakdown (files, smoke tests, risks). The summaries below are pre-flight notes only.

### Phase 2 — Floor plan + clickable rooms + EXAMINE popover (~3 hr)

**Ships:** Floor plan SVG renders as the FREE_ROAM canvas (per §5.13 Layout 6+7). All 7 rooms are clickable polygons; clicking sets `currentRoomAtom` and logs `[travel] kitchen` to console. One examine target per room (clickable detail icon overlaid on the room polygon) — clicking opens `ExamineOverlay` with flavor text and a Close button. Adjacency from master spec §6 is enforced: clicks on non-adjacent rooms get a "Can't reach from here" toast.

**Key files:** `scene/FloorPlan.jsx` (SVG with clickable `<g>` per room + status overlays for `LOCKED` / `EVIDENCE` / NPC dots), `scene/RoomMarker.jsx` (NPC dot + name label), `scene/Hotspot.jsx` (in-room examine targets), `overlays/ExamineOverlay.jsx`, `data/rooms.js` (full 7-room data: `id`, `label`, `adjacents`, `examineTargets`, `position` in floor-plan coords).

**Exit criteria:** Floor plan responsive at 1920×1080 and 1280×720 (SVG `viewBox` + `preserveAspectRatio="xMidYMid meet"`). Hover on room shows label. `Tab` cycles selectable rooms; `Enter` enters; `Esc` cancels. Examine overlay traps focus and closes on ESC. `room_enter` telemetry fires on travel. Bumped from 2 → 3 hr because the SVG floor-plan asset + room hit-zones is more work than a hotspot layer on a raster.

### Phase 3 — Per-room scene backgrounds (for DIALOGUE / EXAMINE only) (~2 hr)

**Ships:** Scene art is wired to render as the backdrop in DIALOGUE, EXAMINE, ColdOpen, and acquisition-card surfaces. Bullpen uses the three time-of-day WebPs from Phase 1. Other rooms get placeholder solid panels with the room name in Plex Mono uppercase (per §12 placeholder strategy) until art lands. The floor plan in FREE_ROAM stays unchanged — it's not a scene render.

**Key files:** `scene/SceneBackground.jsx` (selects bg by room + period; reads `currentRoomAtom` + `clockMinutesAtom`), `data/rooms.js` (extends with `sceneAssetByPeriod` field per room — most rooms have a single asset, only bullpen has three).

**Exit criteria:** Opening DIALOGUE in any of 7 rooms shows the correct backdrop. Bullpen scene swaps morning/dusk/night based on clock minute. Placeholder panels for un-arted rooms read as deliberate, not broken.

### Phase 4 — Clock + time-of-day swap (~1 hr)

**Ships:** Every action that calls `advance()` actually moves the clock. `BackgroundFor.js` selects morning/dusk/night WebP based on `periodFor(minutes)`. Visiting the bullpen at minute 400 shows the dusk render.

**Key files:** Wire `clock.advance()` calls into `Hotspot.onClick`. `scene/BackgroundFor.js` selects variant. Top-bar reads `clockMinutesAtom` and formats live.

**Exit criteria:** A 30-action playthrough hits each of morning/dusk/night at expected minutes.

### Phase 5 — Ink-driven DialogueMode (~4 hr)

**Ships:** Clicking a "Talk to [Name]" hotspot enters DIALOGUE mode with a real ink story driving it. `set_flag` and `grant_clue` external functions wired. Two stub characters (David and Sam) have ink files.

**Key files:** `dialogue/DialoguePanel.jsx`, `dialogue/DialogueChoices.jsx`, `dialogue/inkRuntime.js` (extended with bindings), `ink/characters/david.ink`, `ink/characters/sam.ink` (stub content).

**Exit criteria:** Selecting a choice that contains `~ set_flag("talked_to_david")` actually sets the flag in Jotai. Telemetry logs `dialogue_choice` events. Closing dialogue returns mode to FREE_ROAM with the new flag persisted.

**Open decision:** confirm Ink → flag binding API uses `EXTERNAL` declarations bound at story-load time (vs Ink tags parsed by JS). Plan: external functions, bound by `inkRuntime.bindExternals()`.

### Phase 6 — Clue rules + gating + 3 overlays (~5 hr)

**Ships:** All 8 clues defined in `data/clues.js` with prerequisites. `clueRules.evaluate()` runs after every flag mutation. Collecting a clue triggers a `ClueToast` animation (slot-machine reveal). Notebook, Locker, and Suspects overlays render real data with framer-motion entrance.

**Key files:** `data/clues.js`, `engine/clueRules.js`, `engine/gating.js`, `engine/suspicion.js`, three overlay components, `hud/ClueToast.jsx`.

**Exit criteria:** Walking through the canonical 1+6+8 clue chain end-to-end (with stub dialogue) collects all 8 clues. Suspects overlay shows Sam's meter rise. Notebook auto-summarizes.

**Open decision:** confirm overlay close behavior. Plan: ESC closes any overlay, restores prior mode (no mode change happens when overlay opens; opening just stacks).

### Phase 7 — NPC schedules (~3 hr)

**Ships:** All 8 characters have static schedules in `data/characters.js`. "Talk to X" hotspots only appear when X is currently in the player's room. "[Name] just left for [room]" hint renders if X left within the last 10 min.

**Key files:** `data/characters.js`, `engine/schedule.js`, `scene/SceneCanvas.jsx` (consumes `charactersInRoomAtom`).

**Exit criteria:** Sam appears in kitchen at 9:00 AM, leaves at 11:00 AM (per spec). At 11:05 AM, kitchen shows "Sam's coffee mug is still warm. She just left for the bullpen." At 11:11 AM, no hint. Telemetry confirms `room_enter` events match expected NPC presence.

### Phase 8 — Cold open + accusation + endings (~3 hr)

**Ships:** Fresh playthrough auto-fires David's cold open dialogue (in DAVIDS_OFFICE, mode=COLD_OPEN). Player can press "I'm ready to accuse" once `caseOpened` flag is set, transitioning to ACCUSATION. AccusationMode lets player pick suspect, then 3 clues from a grid, then confirm. Ending fires based on `data/endings.js` rules.

**Key files:** `modes/ColdOpenMode.jsx`, `modes/AccusationMode.jsx`, `modes/EndingMode.jsx`, `data/endings.js`, `ink/cold-open.ink`.

**Exit criteria:** Each of A/B/C/D endings is reachable via a deterministic path from a fresh save. `recordEnding(id)` is called. `localStorage['tread-mystery-endings-v1']` accumulates.

**Open decision:** confirm "are you sure?" UX. Plan: single attempt, ending fires (per master spec §13.8).

### Phase 9 — Polish (~2 hr)

**Ships:** Text speed setting (slow/normal/instant) on dialogue render, persisted. Skip-dialogue button (advances to next choice without time cost — replays only). Color-blind QA pass (verify orange `#f57c3a` is distinguishable from text in protanopia + deuteranopia simulators). Credits page at `/mystery/credits`.

**Key files:** `pages/CreditsPage.jsx`, settings sub-overlay (or plain `<select>` in TopBar).

**Exit criteria:** Replay cycle (finish → restart → finish) is one click. No accessibility regressions.

### Phase 10 — Writing pass (LLM-driven, no engineering)

**Ships:** All `.ink` files have real character-voiced dialogue per master spec §3 personalities. The 8 ink files together author the full clue chain. The 4 endings have real cutscene text.

**Process:** This is content work, not engineering. Engineer responsibility ends at "engine accepts any conformant `.ink` file." The actual writing is done with LLM assistance using master spec §3 as the voice reference. Ship readiness = playtest.

---

## 12. Asset pipeline

### Floor plan (FREE_ROAM canvas — Phase 2)

The persistent FREE_ROAM surface per §5.13 Layouts 6 + 7. Single asset, **vector** (SVG) not raster. Specs:

- Top-down architectural-style line drawing of the single-floor office.
- 7 named rooms, each a closed polygon with a `data-room-id` attribute matching `data/rooms.js` IDs.
- Doors / openings drawn as thin gaps between polygons; adjacency must read visually so the player understands "I can walk from kitchen to bullpen but not kitchen to server room."
- Stroke: 1 px in `var(--color-border)`. Fill: transparent (the canvas color shows through). Hover/selected fill: 8% `var(--color-accent)`.
- Designer's call on detail level. Reference visual: mocks 6 + 7 are the canonical density target.
- Format: `src/assets/floorplan/floor-01.svg`. Inline-rendered (not `<img>`) so we can attach event handlers + dynamic styling per room.

### Scene backgrounds (DIALOGUE / EXAMINE / acquisition backdrops only — Phase 3)

| Room | Status | Variants |
|---|---|---|
| Bullpen | Provided (Phase 1 imports) | morning, dusk, night |
| Reception | Needs gen | single (Phase 3 placeholder until then) |
| Conference | Needs gen | single |
| Server room | Needs gen | single |
| Kitchen | Needs gen | single |
| David's office | Needs gen | single |
| Bathroom | Needs gen | single (low priority — flavor scene only) |

**Specs:** 1920×1080 PNG source → 1920×1080 WebP @ q=85. Target 200–500 KB final size. Test at q=75 if a render exceeds 500 KB at q=85.

**Compression command:**
```bash
cwebp -q 85 -resize 1920 0 input.png -o output.webp
# or via Node sharp:
node -e "require('sharp')('input.png').resize(1920).webp({quality: 85}).toFile('output.webp')"
```

**Placeholder strategy for missing rooms (Phase 3 onward).** Solid color from `tokens.js` palette (e.g. `var(--color-surface-2)`) with the room name overlaid in Plex Mono uppercase. Specifically NOT a "coming soon" image — those rot. A flat panel reads as deliberate brutalist aesthetic until art lands.

### Character portraits

Eight portrait PNGs at 256×256 with transparent backgrounds, placed under `src/assets/portraits/{characterId}.png`. Suggested style: pixel-art bust shots, head-and-shoulders only. Mapping of art to character is product owner's call (not engineer's). If portraits aren't ready by Phase 6, fall back to a colored circle with the character's first initial in monospace — uses tokens already defined.

### Ink compilation

Run `npm run ink:compile` whenever an `.ink` file changes. The script compiles every `*.ink` under `ink/` to a sibling `*.json`. **Both source and compiled output are committed to the repo.** This avoids requiring inklecate (the official C# compiler binary) at build time on CI/Vercel — we use the JS-based `inkjs/compiler/Compiler` instead, which runs in Node. The compiler is a dev-time tool only and must NEVER appear in the production runtime bundle.

### Telemetry events catalog

(See [§5.10](#510-telemetry-day-1) for the canonical list. Add new events with care; don't pollute the catalog.)

---

## 13. Quality bars

### Performance budgets

- Initial bundle (gzipped): < 200 KB
- LCP (largest contentful paint = scene background fully loaded): < 1.5 s on broadband
- Time to first interactive: < 800 ms
- Mode transition: visually steady at 60 fps (no dropped frames during `<AnimatePresence>` swap)

### Accessibility

- Tab order: TopBar buttons → mode-area focusable elements (hotspots, dialogue choices) → overlay (when open).
- ESC closes any overlay.
- All hotspots have `aria-label` describing the action.
- Color contrast: orange `#f57c3a` on canvas `#0a0a0a` is 5.4:1 (passes WCAG AA for 11px+ text). Off-white text `#f4efe8` on canvas is 16.4:1 (passes AAA).
- Color-blindness: orange-on-canvas is distinguishable in all three common types (protan/deutan/tritan). Verified at Phase 9 with a sim.
- No flashing >3 Hz. (FlashWipe is a single 180 ms flash, well under threshold.)
- Reduced motion: respect `prefers-reduced-motion`; framer-motion's `MotionConfig` can globally disable transforms.

### Smoke tests

Per phase, top of each phase's section. Must pass before merge.

### Lint / format

`npm run lint` clean before merge. `npm run format` runs Prettier — committed code matches.

### Test coverage

- Engine modules (`engine/*.js`): 100% line coverage, target. They are pure functions with small inputs; this is cheap.
- Components: smoke tests (does it render?) only. We don't need to assert pixel-perfect output.
- Integration: one Playwright test in Phase 9 that walks the canonical clue chain end-to-end.

---

## 14. Anti-patterns

Known traps. Do not commit these.

1. **Rendering more than one mode component at once.** The mode router in `<GameShell>` is the only place that picks which mode is visible. If you find yourself wanting a dialogue panel rendered on top of the scene grid, that's the *DIALOGUE mode* — switch modes, don't compose.

2. **Using `useState` for game state.** All persisted game state is in Jotai atoms in `state/mystery.js`. `useState` is OK for ephemeral component state (e.g. focused button index in a menu) but never for clock, flags, clues, mode.

3. **Importing `inkjs/compiler/*` from app code.** The compiler is dev-only. Importing it from `src/` adds ~200 KB to the production bundle. The bundle smoke test in [§10.2](#102-smoke-test-must-pass-before-phase-1-closes) catches this. If you need to compile at runtime (you don't), challenge that need first.

4. **Mutating Jotai atom values directly.** `flagsAtom` is a `Set` — but Jotai compares by reference. Always create a new Set: `setFlags(prev => new Set([...prev, 'newFlag']))`. Same for `collectedCluesAtom`.

5. **Reaching from `engine/` into `state/` or React.** Engine modules are pure functions. They take state in, return new state out. No imports from `state/`, no React hooks. Violation = bug magnet.

6. **Reaching from `data/` into `engine/` or anywhere else.** Data files are inert. No imports. Just objects.

7. **Hardcoded clock minutes in components.** Use `clockMinutesAtom`. Format with `formatClock()`. Never `'9:30 AM'` as a literal string in JSX (except mock data clearly marked as such).

8. **Adding HUD panels.** The HUD is locked at: `TerminalStatusRow` (top), `RosterPanel` (right-top), `RecentEvidencePanel` (right-bottom), `FunctionKeyBar` (bottom), `SystemStatusRow` (far-bottom), and the floor plan canvas (center-left). That's it. Per §5.13 Layout 7. New persistent UI elements need explicit ack — don't sneak in a "minimap" (the floor plan IS the map), "compass," or extra "objective tracker" beyond the OBJ field already in `TerminalStatusRow`.

9. **Premature "smart" overlay logic.** Overlays just open and close. They don't talk to each other. They don't persist scroll position. They don't animate between themselves. Closing locker and opening notebook is two atomic state changes, not a "transition."

10. **Dialogue branching in JSX.** All branching lives in `.ink`. If you find yourself writing `if (flags.has('foo')) renderChoiceA() else renderChoiceB()` in a React component, that's the dialogue authoring's job, not the runtime's.

11. **Using framer-motion `layoutId` across mode swaps.** Framer's shared-layout animations break in `<AnimatePresence mode="wait">`. Don't try to be clever. Each mode mounts/unmounts cleanly.

12. **Fetching anything over the network.** This is an offline single-player game. There are no network calls. If you find yourself reaching for `fetch`, stop.

---

## 15. Open decisions

Items not blocking Phase 1. Resurface before the relevant phase starts.

| ID | Decision | Phase | Default plan |
|---|---|---|---|
| OD-1 | Ink → flag binding mechanism (EXTERNAL functions vs. tag parsing) | 5 | EXTERNAL functions, bound at story load via `inkRuntime.bindExternals` |
| OD-2 | Overlay close behavior (does ESC close one overlay or all overlays in a stack?) | 6 | One at a time; we never stack, so non-issue. Confirm in Phase 6 review. |
| OD-3 | "Are you sure?" gate before final accusation | 8 | No. Single attempt, ending fires. (Master spec §13.8 confirms.) |
| OD-4 | Mid-day check-in mechanism (Slack-style overlay vs. forced cutscene) | 8 | Slack-style overlay with Continue button. Auto-fires at minute 180 ± a small range based on player position. |
| OD-5 | Optional David-as-suspect red herring | 8 | Defer. Adds 30+ minutes of writing for v1 with marginal payoff. Revisit post-launch. |
| OD-6 | Replay/restart UX | 9 | One-click "New Case" button on credits screen and on a small pause-menu accessible from TopBar. Confirms with a single dialog ("This will end your current case. Continue?"). |
| OD-7 | Sound (ambient office hum, click SFX, dialogue beep) | post-v1 | Out of scope for v1. Deferred. |
| OD-8 | Map / Travel — sub-screen of FREE_ROAM (overlay) or its own MAP mode? | 3 | Sub-screen. Floor plan IS the FREE_ROAM canvas (per §5.13 Layout 7), so "travel" is just clicking a room directly on FREE_ROAM. Layout 5's dedicated MAP screen is reserved for an optional zoomed/labeled mode toggled by `M` key. |
| OD-9 | FREE_ROAM rendering — floor-plan dispatch view vs. scene-image-with-hotspots? | 2 | Floor-plan dispatch view (per §5.13 mocks). Scene art renders only during DIALOGUE / EXAMINE / acquisition cards. Supersedes master spec §8 "scene panel as main view." |
| OD-10 | MOVES counter — real action budget or display-only derived stat? | 4 | Display-only. `moves = floor(minutes_in_current_phase / 30)` so player has a coarse "actions left in this phase" mental model without changing underlying clock mechanics. If gameplay testing shows the time pressure is too soft, revisit and make it a hard budget. |
| OD-11 | Clue weight schema — `WEAK / CORE / HEAVY` enum vs. existing `smokingGun`/`clears` boolean tags? | 6 | Enum. `weight: 'weak' \| 'core' \| 'heavy'` plus an optional `clears: characterId` for alibi clues. Drives the suspicion math (HEAVY = 0.30, CORE = 0.18, WEAK = 0.10) and the A-vs-B ending discriminator. |

---

## 16. Glossary

| Term | One-line meaning |
|---|---|
| Mode | The current top-level screen (BOOT/COLD_OPEN/FREE_ROAM/DIALOGUE/ACCUSATION/ENDING). |
| Overlay | A full-screen panel (NOTEBOOK/LOCKER/SUSPECTS/EXAMINE) on top of the active mode. |
| Scene | A room's background illustration. NOT the persistent surface — only renders during DIALOGUE / EXAMINE / acquisition cards. The FREE_ROAM surface is the floor plan, not a scene. |
| Floor plan | The persistent canvas in FREE_ROAM. Top-down schematic of the office with NPC markers + movement trails. |
| Hotspot | A clickable region on a scene background. |
| Flag | A boolean state marker, set by dialogue or examine. |
| Clue | An evidence record granted when its prerequisites (flags) are met. |
| Gate | A predicate guarding a hotspot, choice, or room. |
| Schedule | A character's room-by-time table. |
| Suspicion | Per-character score derived from collected clues. |
| Tick | A single clock advance triggered by an action. |
| Ending | One of A/B/C/D, fired at accusation or sunrise. |
| Playthrough | One save (one open case). Reaching an ending closes it. |

---

## 17. Handoff log

Append entries when you make a non-obvious call or revise a locked decision.

| Date | Engineer | Phase | Change | Rationale |
|---|---|---|---|---|
| 2026-04-28 | (initial) | 0 | Architecture locked. Build plan v1 published. | Mode router + decoupled clue rules + Ink dialogue + single autosave + lean stack are the load-bearing decisions. |
| | | | | |

---

*End of build plan. Version 1. Treat this file as the canonical engineering reference; update it (don't replace it) as decisions evolve.*
