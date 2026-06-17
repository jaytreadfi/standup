# Tread Office — UI Cleanup Design Language

Shared brief for the parallel design pass. Every surface agent MUST read this and
hold to it so the result is coherent across surfaces. The chrome (header, action
bar, footer-removal, on-scene clock, clue boxes) is already finalized — match its
restraint.

## The aesthetic stays: brutalist trading-terminal
- IBM Plex Mono everywhere. Near-black canvas `#0a0a0a`. **Zero border-radius.**
  Sharp 1px borders. A single warm-orange accent `--color-accent (#f57c3a)`.
- Use ONLY the existing CSS variables (see `src/index.css` `:root`). Do **NOT** add
  global tokens, and do **NOT** edit `index.css` or `theme/tokens.js`.

## The mandate: declutter. Less text, clearer hierarchy, more breathing room.
The UI feels crowded and repetitive. Cut, don't add. Net token/element count on
each surface should go DOWN.

### KILL these (the clutter list)
- **Redundant index/counter micro-text:** `00 |`, `01 / 01`, `00 / 05`, `04 / 05`,
  scene/case/floor counters, and the `D1…D7` slot codes when the name is right there.
  Remove unless the code carries real navigational meaning.
- **Duplicated content:** the OBJECTIVE now lives ONLY in the top `OBJ` banner.
  Remove any repeated objective text from overlays (esp. the Evidence/Case-file card).
- **Giant ghost watermark glyphs** (`W`, `V`, `04`, `A`, `!!`) sitting behind dense
  text — they add noise and hurt legibility. In the **side panels** remove them
  outright. In fullscreen modes keep at most one, very faint, never behind body copy.
- **Filler status strings:** "AWAITING DATA", verbose hints, repeated ESC labels.
  Trim to the essential one.

### HIERARCHY (every surface)
- One clear **title**, at most one **supporting line**, then content. No competing headers.
- Three type roles, used consistently:
  - **Eyebrow/label:** `--font-xs`, `--color-text-muted`, tracked (`letter-spacing ~0.2em`), uppercase.
  - **Title:** `--font-lg`/`--font-xl`, weight 700. Accent color allowed for the single hero title.
  - **Body/prose:** `--font-sm`/`--font-base`, `--color-text` or `--color-text-dim`, **mixed case**,
    `line-height 1.4`. Long sentences are NOT uppercase (uppercase prose is the #1 readability killer here).
- Reduce the number of distinct sizes/weights competing in one view.

### SPACING & ALIGNMENT
- Pad on the 8px scale (`--space-4/6/8`). Cards get generous inner padding (`--space-8`).
- Kill large dead space: fullscreen modes (cold-open, accusation, ending) currently
  waste the bottom ~40–60% — vertically center the content column instead.
- Align edges; no orphan labels floating alone; consistent gaps between repeated items.

### COLOR DISCIPLINE
- Orange is an **accent, not a fill.** Avoid large saturated orange slabs (e.g. the
  Suspects "[ NEED 3+ EVIDENCE ]" bar, the accusation confirm). For a primary CTA use an
  **outlined** button or a dark/`--color-accent-dim` fill; reserve solid bright orange for
  small marks and a single hero CTA. Disabled states: low opacity, not loud.
- Overlay scrim should be dark enough to focus the card: ~`rgba(10,10,10,0.8)`.

### OVERLAY CONSISTENCY (Evidence, Suspects, Map, Examine)
- Same header pattern: small eyebrow + clear title, with the close affordance to the
  right. Drop the `01/01` counters. One consistent close control (text `ESC`/`✕`), styled the same.
- Consistent card chrome: 1px border, dark surface, same corner treatment (square).

## HARD CONSTRAINTS (do not break)
- **Edit ONLY your assigned files.** Do NOT touch any of: `index.css`, `theme/tokens.js`,
  `GameShell.*`, `FreeRoamMode.*`, `TerminalStatusRow.*`, `FunctionKeyBar.*`, or anything
  under `src/components/chrome/` (TerminalChrome, SectionLabel, etc. are SHARED). If you
  believe a shared file needs a change, note it in your report instead of editing it.
- Don't change game logic, atoms, actions, props, or remove interactive controls.
- Preserve accessibility: keep `aria-label`/`role`/focus handling; maintain text contrast
  (body text ≥ `--color-text-muted`, which is AA on dark).
- Keep `npm run lint` and `npm test` green.

## VERIFY visually (mandatory — findings about pixels must come from pixels)
Dev server runs at `http://localhost:5180/mystery`. Capture your surface with:
```
node tasks/ui-audit/capture.mjs <yourOutDir> <surface>
```
surfaces: `coldopen | freeroam | map | evidence | suspects | examine | dialogue | accusation | ending`.
Loop: screenshot → compare to this brief → refine → re-screenshot (2–3 passes). Read your
PNGs with your image-reading ability and judge them. Report console errors (the harness prints them).
Other agents may be live-editing in parallel on the same server — if you ever capture a red
Vite error overlay, just re-run the capture (the harness already waits out transients).
