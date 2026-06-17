# UI Cleanup Pass — Tread Office (2026-06-16)

Heavy declutter of the game UI. Brutalist/terminal aesthetic STAYS; goal is less
crowding, clearer hierarchy, kill redundant micro-text, fix spacing/alignment.
Full latitude incl. gameplay panel. Every change visually verified via Playwright.

Dev server: http://localhost:5180/mystery (fixed port). Capture harness:
`node tasks/ui-audit/capture.mjs <outDir> [surface]`.

## Locked direction (from user)
- [ ] Footer (SystemStatusRow: CPU/MEM/SHIFT/AUTOSAVED/ONLINE/time) — REMOVE entirely.
- [ ] Action bar — centered, `[ EVIDENCE ] [ SUSPECTS ] [ ACCUSE ]` only. Remove MAP + SAVE.
      Drop visible F-key hints. (Keep keyboard shortcuts wired silently for a11y/testing.)
- [ ] Header (TerminalStatusRow) — strip TREAD / CASE 01/01 / SCENE 01/05 / FLOOR 01 /
      NOW clock / BOARD CALL. Keep ONLY `OBJ <objective>`. Make it readable.
- [ ] Clock — move ONTO the gameplay scene image, BIGGER / more prominent. No "BOARD CALL".
- [ ] Clue boxes — the on-scene examine "?" boxes — make BIGGER.

## Phase 1 — Structural edits (ME; conflict-prone shared files)
- [ ] GameShell.jsx/.module.css — drop SystemStatusRow; grid rows auto 1fr auto.
- [ ] Delete SystemStatusRow.jsx + .module.css.
- [ ] FunctionKeyBar.jsx/.module.css — Evidence/Suspects/Accuse, centered, no hints, keys kept.
- [ ] TerminalStatusRow.jsx/.module.css — OBJ-only header, bigger/legible.
- [ ] FreeRoamMode.jsx/.module.css — prominent on-scene clock (no board call); bigger "?" boxes;
      declutter scene chrome (SectionLabel 01/05, location block).
- [ ] Re-capture → tests + lint green → author DESIGN-LANGUAGE.md.

## Phase 2 — Design team (Workflow, parallel, strict file ownership, Playwright-verified)
Each agent edits ONLY its files; may NOT touch GameShell/index.css/tokens.js/FreeRoamMode.
- [ ] A Evidence overlay — NotebookOverlay.* (kill duplicated objective, dead space)
- [ ] B Suspects overlay — SuspectsOverlay.* (tame loud orange, tighten)
- [ ] C Map overlay — MapOverlay.* (declutter codes/legend)
- [ ] D Examine overlay — ExamineOverlay.* (light polish/consistency)
- [ ] E Side panels — RosterPanel.* + RecentEvidencePanel.* (ghost watermark, 00| prefixes, empties)
- [ ] F Dialogue — DialogueMode.* (polish)
- [ ] G Landing/intro — ColdOpenMode.* + BootMode.* (dead space, vertical rhythm, hierarchy)
- [ ] H Accusation + Ending — AccusationMode.* + EndingMode.* (tighten, dead space)

## Phase 3 — QA + final pass (ME + critic agent)
- [ ] QA/consistency critic reads every after-shot vs DESIGN-LANGUAGE.md; lists residuals.
- [ ] Run `npm test` (74) + `npm run lint` green.
- [ ] Final full-walkthrough capture; human-eye pass; fix stragglers.
- [ ] Review section below.

## Review — DONE (2026-06-17)
All phases complete; `npm run lint` clean, `npm test` 74/74, 0 console errors on every surface.

**Phase 1 (me) — chrome + scene:** footer deleted; header → `OBJ <objective>` only; action bar
centered `[ EVIDENCE ] [ SUSPECTS ] [ ACCUSE ]` (no Map/Save, no F-key hints, keys kept silently);
big 40px on-scene clock top-right (no board-call); examine "?" boxes 26→44px; scene chrome decluttered.

**Phase 2 (workflow, 8 specialists + QA):** evidence card dedup'd (objective lived twice) + compact
empty state; suspects orange slab → outlined locked CTA; map room-codes/`▸MOVE` removed; examine set as
consistency ref + ghost "EX" killed; side panels lost the giant ghost watermark + `00|` prefixes +
slot-code column; dialogue speaker de-duped + choices made clearly clickable; landing briefing rebalanced;
endgame centered + ending prose made readable.

**Phase 3 (me) — integration of QA residuals:** removed `D1..D7`/`01..07` slot codes (accusation +
suspects); unified all overlay closes to a single boxed `ESC`; dropped redundant ghost watermarks
(suspects "SB", ending "A" which duplicated the on-screen grade).

**Bonus bug:** the "dots" in the examine title were `ScrambleText` placeholder glyphs (`▌▎▏·`) frozen
when rAF is throttled (e.g. taking a macOS screenshot). Hardened `ScrambleText` (shared chrome): always
lands final text via setTimeout fallback, resolves immediately when `document.hidden`, re-animates on
target change; removed the buggy `startedRef` guard. Verified motion-on: examine title resolves to real
text, no glyphs.

**Artifacts:** before/after PNGs in `tasks/ui-audit/{baseline,after-structural,final,final2}/`; harness
`tasks/ui-audit/capture.mjs`; brief `tasks/ui-audit/DESIGN-LANGUAGE.md`.
Minor optional follow-ups (non-visible): a few orphaned CSS classes (`.slot`/`.cardTop`/`.closeKey`)
left after slot/close edits; ending column reads very slightly low.
