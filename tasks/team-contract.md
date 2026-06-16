# Tread Office — Dev Team Contract

You are building the **view/feature layer** of a brutalist trading-terminal mystery game on top of an
already-built foundation (state, actions, data, engine). **Do not modify the foundation or shared
integration files** — the lead wires those. Build only the files assigned to you.

## RESERVED — do NOT touch (lead owns these)
`src/mystery/GameShell.jsx`, `src/mystery/hud/FunctionKeyBar.jsx`, `src/mystery/state/mystery.js`,
`src/mystery/state/actions.js`, `src/mystery/engine/*`, `src/mystery/data/*`, `src/index.css`,
`src/theme/*`. Read them freely; never edit them.

## The aesthetic (preserve it exactly)
Brutalist trading terminal. **IBM Plex Mono only**, near-black canvas `#0a0a0a`, single warm orange
accent `#f57c3a`, **zero border-radius anywhere**, 1px sharp borders, uppercase mono labels with wide
letter-spacing. Use the CSS variables from `src/index.css` (`--color-accent`, `--color-canvas`,
`--color-text`, `--color-text-dim`, `--space-*`, `--font-*`, `--ease-*`, `--dur-*`, `--z-*`). Use
**CSS Modules** (`X.module.css`) — no Tailwind, no inline style objects except for dynamic
positioning (hotspot x/y, schematic rects). Reuse chrome components in `src/components/chrome/`
(`TerminalChrome`, `CornerBrackets`, `ScrambleText`, `SlotNumber`, `FlashWipe`, `SpriteFrame`).
Respect `prefers-reduced-motion`. Make it feel premium and deliberate — this is the main complaint.

## The action layer — call these, never poke atoms to mutate
```js
import { useGameActions } from '@/mystery/state/actions';
const actions = useGameActions();
// navigation
actions.openMap(); actions.closeMap(); actions.travelTo(roomId);
// examine
actions.openExamine(targetId); actions.closeExamine();
// info overlays
actions.openOverlay('NOTEBOOK'|'SUSPECTS'); actions.closeOverlay();
// dialogue
actions.startDialogue(characterId); actions.chooseDialogue(choice); actions.endDialogue();
// cold open
actions.beginShift();
// accusation
actions.beginAccusation(); actions.setAccusedSuspect(id); actions.toggleAccusationClue(id);
actions.confirmAccusation(); actions.cancelAccusation();
// lifecycle
actions.restart();
```
Read state with `useAtomValue(...)` from `@/mystery/state/mystery`:
`currentRoomAtom, clockMinutesAtom, collectedCluesAtom, examineAtom, dialogueAtom, accusationAtom,`
`endingAtom, mapOpenAtom, overlayAtom, charactersInRoomAtom, suspicionByCharacterAtom, objectiveAtom`.

## Data + helpers
- `@/mystery/data/rooms` → `rooms`, `roomById`, `examineTargetById`. Room has `id,label,short,
  sceneAssetByPeriod{morning,dusk,night}, examineTargets[{id,label,x,y,flavor,clueId?}], schematic{x,y,w,h}`.
- `@/mystery/data/scenes` → `sceneUrl(key)`, `portraitUrl(id)`. Resolve scene art:
  `sceneUrl(roomById[roomId].sceneAssetByPeriod[period])`.
- `@/mystery/data/characters` → `characters`, `characterById`, `suspects`. Char: `{id,name,slot,role,schedule}`.
- `@/mystery/data/clues` → `clues`, `clueById`, `WEIGHT_VALUE`. Clue: `{id,label,description,weight,evidenceAgainst[],source}`.
- `@/mystery/data/dialogue` → `dialogue` (keyed by charId → `{start, nodes{ id:{speaker,text,choices[{label,to?,setFlag?,grantClue?,end?}]}}}`).
- `@/mystery/data/endings` → `endings` ({A,B,C,D} each `{id,title,verdict,body,tone}`).
- `@/mystery/engine/clock` → `formatClock(min)`, `periodFor(min)` → 'morning'|'dusk'|'night'.
- `@/mystery/engine/schedule` → `roomByCharacter(characters, clockMinutes)`, `currentRoomOf(schedule, min)`.
- `@/mystery/engine/suspicion` → `badgeFor(raw)`. `suspicionByCharacterAtom` gives `{id:{raw,value}}`.

## Period → scene art
`const period = periodFor(clockMinutes); const url = sceneUrl(roomById[roomId].sceneAssetByPeriod[period]);`
Some rooms (printer, elevator) use the same key for all periods — that's expected.

## Self-check before you finish
Run `node_modules/.bin/esbuild <yourfile> --format=esm > /dev/null` on each JS/JSX file you write;
fix any parse error. Report the exact list of files you created/changed and a one-line integration
note (how the lead should mount your component) in your final message.
