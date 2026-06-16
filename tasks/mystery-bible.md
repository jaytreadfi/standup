# Case Bible — "LAST ONE OUT" (Tread office murder)

A neo-noir whodunit set at **Tread**, a Bangkok startup on the 40th floor by CentralWorld.
Grounded + in-jokes: the team eats lunch at CentralWorld, does a weekly activity night
(go-karts, padel, karaoke, bowling), several live in the condo towers next door, and only
Sam and Poncho drive. The office is the setting; the murder is about the company.

**Framing:** the murder happened **last night** (kart night → team home → Yibo + David stay late →
argument ~midnight → killing ~02:00). The team arrives for a normal **workday** the next morning and
finds Yibo dead. The player (a new hire) is pulled in by David to "confirm it's an accident" and works
the floor through the day. So everyone is naturally present (it's a workday) and the witnesses are
**recounting last night**.

## Spine
- **Victim:** YIBO — core engineer and David's **cofounder**, who moved to Singapore and went
  semi-absent while still drawing founder equity. Flew in two days ago (rare visit), brought a
  whiskey bottle as a gift. Found dead in the bullpen before first shift.
- **Killer (truth):** DAVID (founder/CEO) — the man who pulls the night-desk hire (the player)
  up to the floor and wants it ruled an accident before 06:00.
- **Motive (the company, NOT personal):** David has been faking Tread's growth numbers for a new
  investor round (the dashboards Dena maintains) and quietly restructured the cap table to dilute
  the absent Yibo. Yibo flew in because he'd pulled the **real** numbers, found the fraud, and came
  to **pull his core engine** (a reversion clause hands the IP back to its author) and blow up the
  round. That ends everything David built. They stayed late after kart night, drank Yibo's gift
  whiskey, argued (~midnight, Jay hears it). ~02:00 David killed him in the bullpen (head to a desk
  corner), staged a drunk/jet-lagged fall, took Yibo's **laptop** (real numbers + kill-switch) and
  phone, wiped a glass, scrubbed his own badge re-entry, and "found" the body. Steers the player to
  a patsy.
- **The patsy:** PONCHO (engineer) — clashed with Yibo over a rewrite of his engine, is a known
  work-addict always at the office late, and drives a car (could come/go unseen). David + Dena point
  at him. **Innocent:** he was asleep in his car in the garage; Sam saw him.
- **Player:** the new night-desk hire who gets pulled up to the floor. Deadline: 06:00 first shift.

## Time mechanic (real-time, full-day)
- Clock opens at **09:00 AM** (`START_MINUTE = 0`) and runs a full **24 hours** to **09:00 AM next day**
  (`DEADLINE_MINUTE = 1440`), when David takes the **board call** and the accident story sets for good.
- Time **ticks on its own** in real time (`useGameClock` in actions.js, **1 in-game minute per real
  second**, so the whole day ≈ 24 real min). **Player actions are free** — travel/examine/dialogue
  cost no minutes. The ticker pauses in dialogue, overlays, the map, and fullscreen modes.
- The scene art walks **morning → dusk → night** as the day passes (`periodFor`: morning <360 = 09:00–
  15:00, dusk 360–599 = 15:00–19:00, night ≥600 = 19:00 on). Hitting the deadline forces ending D
  (`isPastDeadline`). The deadline rate is a single constant (`GAME_MINUTES_PER_REAL_SECOND`) — easy to retune.

## Cast (7 living suspects + victim Yibo; Jamie long gone; Sam is now a SUSPECT, not the victim)
- **David** D1 — founder/CEO, the killer. Warm-paternal then cold. Office. Steers to Poncho; lies he
  karted home at eleven; threatens the player if pressed.
- **Yibo** V1 — victim. Cofounder, visiting. Voice lives only in the evidence. No portrait asset.
- **Peem** D2 — project lead. Mature, deliberate, "I suppose." Printer nook. Earwitness (the thud
  ~02:00) and names the founder war plainly.
- **Poncho** D3 — engineer, the patsy. Dry, blunt-honest, work-addict, drives. Elevator/garage.
  Alibi: asleep in his car, Sam saw him. The "grudge" printout is weeks old and patched up.
- **Jay** D4 — marketing. Monotone, deadpan, "dude/bro," "ask Claude." Bullpen. Heard David & Yibo
  argue ~midnight ("the numbers are a lie").
- **Ching** D5 — product design. Shy, hesitant, detail-eyed. Sofa/lounge. Red herring (Yibo had a
  hold over her jump to a rival studio) but she was fleeing town (cab at half four); notices David's
  shaking hands + the missing whiskey bottle.
- **Dena** D6 — data analyst. Sweet, "hmmm," people-pleaser. Pantry. Unwitting accomplice (tidied on
  David's word) + the fraud witness (David had her "smooth" the growth curve).
- **Sam** D7 — office admin. Sweary, sarcastic, metaphors, gym, drives. Elevator/lobby. Your ally:
  controls the badge system, points you at the scrubbed log, clears Poncho, side-eyes David.

## Clue web (TRUE_CULPRIT = david, PATSY = poncho). 9 clues; accuse picks 3; Ending A needs ≥2 CORE/HEAVY vs David.
Examine (one per room):
- coworking `the-body` CORE [david] — staged fall; laptop + phone gone → premeditated.
- office `retrieved-proof` ("YIBO'S LAPTOP") HEAVY [david] — the real numbers + reversion clause back in David's drawer.
- pantry `two-glasses` CORE [david] — two drinks at 2am, one wiped; the gift bottle missing.
- printer `shredded-letter` ("SHREDDED PRINTOUT") HEAVY [david] — real vs faked metrics + "I'm pulling the engine. —Y", shredded.
- elevator `scrubbed-badge` HEAVY [david] — V1 (Yibo) up never down; D1 (David) entry deleted, re-entry 01:55.
- sofa `owed-note` ("PONCHO'S GRUDGE") WEAK [poncho] — old rewrite-grudge thread, already patched. RED HERRING.
Dialogue-granted:
- jay → `witness-argument` CORE [david]; peem → `earwitness-thud` CORE [david]; ching → `ching-motive` WEAK [ching] (herring).

David dominates the suspicion meter (truth-tracker). The misdirection is narrative: David + Dena point at
Poncho; Sam + the witnesses point home. The deduction = trust the evidence over the man who hired you.

## Endings (neo-noir, bitter)
- A — name David with hard proof (≥2 CORE/HEAVY vs him): you nail it, the raise dies, you're off the team
  by Monday, but Yibo gets the truth.
- B — David, thin proof: right and unprovable; first-week hire's word vs the founder; walked to the elevator.
- C — accuse anyone else (esp. Poncho): you were steered; the killer keeps the company; the laptop goes in the river.
- D — timeout at the 09:00 board call (a full day later): ruled jet-lag + one drink too many; you never said the word.
