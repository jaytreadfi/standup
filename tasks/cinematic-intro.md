# Cinematic Intro + Opening Cutscene — Plan / Spec

Status: DONE (built via multi-agent workflow, 2026-06-18; not committed — left in working tree). Owner-approved decisions baked in. Verified: `npm run build` OK, `npm test` 77/77, `npm run lint` clean, Playwright drove landing→intro→coldopen→freeroam with 0 console errors. Adversarial review caught + fixed one keyboard bug (window keydown listener double-fired with each beat's focused onKeyDown → advanced two beats per Space press; removed the window listener, kept per-stage handlers). Keyboard re-verified: all 6 speakers render in order, none skipped.

**REVISION 2026-06-18b:** owner notes applied. Slideshow captions rewritten as the intern's first-person DIARY (3-voice author panel + editor Workflow) for a natural human voice — the caption table below is SUPERSEDED; `src/mystery/data/intro.js` is the source of truth. Also: 25th floor (not 40th), removed "everybody watches him when he talks", subtitle font bumped to `clamp(1.3rem,2.1vw,1.95rem)`, autoplay lengthened to `clamp(5200+len*60, 6500, 14000)` ms. Re-verified build OK / 77/77 / lint clean / Playwright 0 console errors; screenshots confirm bigger readable text.

## Goal — new opening flow

Replace the current straight-to-game boot with a three-beat opening:

```
LANDING (title "STANDUP" + [ ENTER GAME ])
   → INTRO  (11-slide POV slideshow, auto-advancing, narration subtitles)
      → COLD_OPEN (David gathers the team — NPC-style portrait cutscene, one speaker at a time)
         → FREE_ROAM (gameplay; everyone disperses to their rooms)
```

### Owner decisions (locked)
- **Title screen:** game name is **STANDUP**. Title + `[ ENTER GAME ]`. Keep the brutalist terminal look. **No "YIBO IS DEAD" on the landing** (it would spoil the slideshow's happy first day).
- **Slideshow:** **auto-advance + skippable.** Slow Ken-Burns push per slide, progress bar, click/Space/→ jumps ahead, a `SKIP ▸` button + Esc skips the whole intro. Narration as on-screen subtitles (no VO).
- **David's scene:** **NPC-style portrait cutscene** — reuse the in-game DialogueMode look (speaker portrait + typewriter line over the darkened Commons), advance one speaker at a time, read-only (no player choices), then hand to gameplay.
- **Captions:** the intern-monologue captions, mapped to the 11 supplied images by ACTUAL CONTENT (below).

## Assets (DONE)
11 supplied POV images (illustrated style, 2752×1536) downscaled to 1920×1072 JPEG q82 → `src/assets/intro/{01,02,04,05,06,07,08,10,11,13,14}.jpg` (~2.4 MB total). Style: stylized illustrated first-person; the team renders as the game's animal/human cast. Opaque photos → JPEG like the scene art.

## Slide order + captions (by verified image content)
Order is chronological. `time` shows top corner; `caption` is the subtitle. Dash-free, curly apostrophes/quotes to match existing files.

| key | time  | caption |
|-----|-------|---------|
| 01 | 08:50 | First day. Fortieth floor. They said dress nice. I wore the only nice thing I own. |
| 02 | 09:00 | INTERN. Unverified. The badge still smells like the laminator. |
| 04 | 09:30 | David. The founder. Shook my hand like he'd known me for years. Everybody watches him when he talks. |
| 05 | 10:00 | The team. Peem keeps it on the rails. Poncho never leaves that chair. Jay's cutting a launch video. Ching barely looks up. Dena makes the numbers look good. |
| 06 | 13:00 | Lunch is a runner from CentralWorld and a story about a go-kart night I missed. Felt like a family. The good kind. |
| 07 | 16:10 | Then he walked in off a flight from Singapore. Yibo. The other founder, the one who's never here. Whiskey in one hand, twelve hours of jet lag in the other. |
| 08 | 18:30 | Somebody put the final on the big screen. Japan vs Spain, just us by then. Yibo cracked the bottle he brought for everyone and poured one for the new kid. Him and David, founder to founder, like no time had passed. Almost. |
| 10 | 22:15 | After the final Yibo waved it off. "Hotel, before I fall over." Last I saw of him, headed for the lift. Everybody saw him say it. |
| 11 | 22:30 | Ching was already gone. Bag packed, cab booked, two minutes out. One foot out the door and not hiding it. |
| 13 | 23:30 | I clocked out late and useless. They were still going. Poncho at his desk. Peem at the printer. The city lit up and not caring. |
| 14 | 03:04 | Three hours later the phone went off the nightstand. David. Nine missed calls. "Come back. Now. Don't talk to anyone." |

Auto-advance duration per slide = `clamp(3500 + caption.length * 40, 4200, 9000)` ms (longer captions hold longer). Final slide (14, the 3am call) bridges into COLD_OPEN.

## Engineering contract

### Mode machine
- `modeAtom` union gains **`'LANDING'`** and **`'INTRO'`**; **`'BOOT'` is removed**.
- Fresh/initial mode = **`'LANDING'`** (`mystery.js` `FRESH_STATE.mode` / `_initial` default). Saved games still restore their own `mode` (no schema bump; `SCHEMA_VERSION` stays 4).
- Transitions: `LANDING --enterGame--> INTRO --endIntro--> COLD_OPEN --beginShift--> FREE_ROAM`.

### `state/actions.js`
- `enterGame()` → `set(modeAtom, 'INTRO')` + telemetry mode_change.
- `endIntro()` → `set(modeAtom, 'COLD_OPEN')` + telemetry.
- `beginShift()` unchanged (→ FREE_ROAM).

### `state/mystery.js`
- `FRESH_STATE.mode = 'LANDING'`; update modeAtom JSDoc union to `'LANDING'|'INTRO'|'COLD_OPEN'|'FREE_ROAM'|'DIALOGUE'|'ACCUSATION'|'ENDING'`.

### `GameShell.jsx`
- Remove `BootMode` import, the `BOOT:` entry, and the `mode === 'BOOT'` auto-advance effect.
- `FULLSCREEN_MODES` gains `LANDING: LandingMode, INTRO: IntroMode` (both render full-screen, no HUD).

### `engine/canOpenOverlay.js` (+ test)
- Add `LANDING` and `INTRO` rule blocks (all overlays `false`). Remove the `BOOT` block. Update the Modes doc line. Update `tests/engine/canOpenOverlay.test.js` to swap BOOT→LANDING and add INTRO to the blocked-modes set.

### `data/scenes.js`
- Add `introModules = import.meta.glob('../../assets/intro/*.{jpg,jpeg,png}', { eager, query:'?url', import:'default' })`, `export const introUrls = indexByBasename(introModules)`, and `export function introUrl(key) { return introUrls[key] ?? null }`.

### `data/intro.js` (NEW)
- `export const SLIDES = [{ key, time, caption }, ...]` in the table order above.

### `modes/LandingMode.jsx` (NEW) + `.module.css`
- Full-screen brutalist card: kicker `NIGHT DESK · CASE 01`, big `STANDUP` title (ScrambleText ok), `[ ENTER GAME ]` button → `actions.enterGame()`. TerminalChrome aesthetic. Autofocus the button. No "YIBO IS DEAD".

### `modes/IntroMode.jsx` (NEW) + `.module.css`
- Full-bleed `introUrl(key)` per slide (object-fit cover), slow Ken-Burns scale (disabled under prefers-reduced-motion), letterbox/scrim for caption legibility.
- Caption subtitle bottom-center in an `aria-live="polite"` region; small `time` top corner.
- Progress bar across the top; auto-advance per the duration formula. Click/Space/→ advances now; `SKIP ▸` button (top-right) + Esc → `actions.endIntro()`. Advancing past the last slide → `actions.endIntro()`.

### `modes/ColdOpenMode.jsx` (REWORK) + `.module.css`
- Convert the existing `CUTSCENE` to speaker **ids**: DAVID→`david`, SAM→`sam`, DENA→`dena`, JAY→`jay`, PEEM→`peem`, PONCHO→`poncho`. Keep the exact line text (incl. the Ching stage direction and the closing "Everyone rises…").
- Render ONE beat at a time (local index). Background = `coworking` night scene (`sceneUrl('coworking-night')`), darkened (reuse DialogueMode bg/scrim/vignette).
- Beat types:
  - **title** (first beat): chapter card — kicker `NIGHT DESK · CASE 01` + ScrambleText `YIBO IS DEAD`; advance on click/Space.
  - **spoken** `{speaker, text}`: DialogueMode-style — `SpriteFrame portraitUrl(id) cols=3 rows=3 col=0 row=0` + NAME/role + typewriter line (click/Space skips-reveal, then advances). Show a `▸ NEXT` affordance.
  - **dir** `{dir, text}`: centered muted-italic narration card; advance on click/Space.
  - **final beat** (the closing "Everyone rises…" dir): show **`[ WALK THE FLOOR ]`** button → `actions.beginShift()`. KEEP this exact label (capture.mjs selector depends on it).
- Read-only, no player choices. Each beat's text in a live region; buttons focusable.

### Delete
- `modes/BootMode.jsx` + `modes/BootMode.module.css`.

### `tasks/ui-audit/capture.mjs`
- Update the drive flow: on load `LANDING` → click `ENTER GAME`; `INTRO` → click `SKIP`; `COLD_OPEN` → advance beats until `WALK THE FLOOR`, click it → `FREE_ROAM`. Add `landing` + `intro` surfaces; keep `coldopen` (now interactive). Use the npx Playwright cache import; never `waitUntil:'networkidle'`.

## Verification bar
- `npm run build` OK · `npm test` green (update BOOT-referencing tests; add LANDING/INTRO overlay-gating coverage) · `npm run lint` clean.
- Playwright drive of the full new flow with **0 console errors** across landing/intro/coldopen/freeroam.
