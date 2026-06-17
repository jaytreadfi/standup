# CHANGELOG vs the approved version

- **(a) "The Great Room" redefined as the whole venue + common-area room re-labeled.** "The Great Room" is now the BRAND NAME of the entire shared coworking floor; every public room (commons, pantry, lounge, printer nook, elevator/lobby) is part of it, and only Tread's `office` is private. The open common-area room (id `coworking`), previously labeled `THE GREAT ROOM` / `GRT`, is re-labeled **`THE COMMONS`** / short **`CMN`**. Every surviving "The Great Room" usage now correctly means the venue/floor that opens at dawn (objective string, preamble line 3, cutscene/closing stage direction, Ending D). The single in-fiction room token "the Great Room" in Jay's dialogue became "the commons."
- **(b) Japan vs Spain World Cup final watch party + only-TreadFi closed circle.** The generic social/go-kart night becomes the team staying late to watch the **Japan vs Spain** World Cup final on the big screen in The Commons. Yibo watched too, then left early after the match, jet-lagged. All other coworking members went home after the final, so only the TreadFi team (plus Yibo) was on the floor. Woven LIGHTLY into: the spine, one cutscene line (Dena: "after the match"), the Commons aftermath hotspot, `sf-jacket`, three clue touches (`the-body`, `two-glasses`, `scrubbed-badge`), and three dialogue lines (david c "watch parties," jay a "the final," sam b "after the final"). No departure/kill/recall clock time moved.
- **(c) Calm "members come in" deadline replaces "flood."** Every dawn-deadline line now reads "the other members and offices start coming in" instead of "flood / strangers walk through." Applied in `cw-window`, sam node b, `scrubbed-badge`, and Ending D. David's two preserved lines ("the whole floor walks through here" / "the whole building walks through here") were already calm and are untouched.
- **(d) SUSPECT BOARD → SUSPECTS + SuspectsOverlay dash fix.** AccusationMode heading/aria-label and SuspectsOverlay label/aria-labels renamed to "Suspects." Re-classified from owner fork (§5) to APPLIED. Body copy fully replaced to remove the player-facing em dash: "This panel won't name them for you. Weigh the evidence and decide."
- **(e) Peem "leaving in a box" restored.** Node b's toned "one of them was never walking out of here" reverts to the owner's original "one of them was always leaving in a box."
- **(f) Everything else preserved verbatim.** All node IDs, choices, setFlag/grantClue wiring, the 9 clue IDs/weights/sources/targets, the 8 character placements, all 6 room IDs/coords, `resolveEnding`, the clock mechanic, TRUE_CULPRIT/PATSY, and every untargeted player-facing line are byte-for-byte unchanged. Reviewer fixes folded in: the loved "this was the warmest room in Bangkok" tail in `cw-aftermath` is RESTORED (not deleted); the aftermath line reads "the whole team" (not "whole floor") to protect the closed circle; the `el-badge` placeholder is filled with its verbatim base body. Zero em/en dashes in any player-facing string; "Japan vs Spain" uses "vs," never a dash.

---

# TREAD OFFICE MURDER — FINAL STORY PACKAGE ("LAST ONE OUT")
### Approval-ready. Section 1 is the pitch to approve; sections 2–5 greenlight implementation.

---

# 1. THE STORY (approval pitch)

**The hook:** Yibo, Tread's absent cofounder, flew into Bangkok jet-lagged for a rare visit. The whole TreadFi team stayed late at the office to watch the World Cup final, Japan vs Spain, on the big screen in The Commons. Yibo stayed to watch too. After the match, wrecked from the flight, he begged off early, and everyone believed he cabbed back to his hotel. The other coworking members on the floor had all gone home after the final, so it was just the team. One by one, the rest trickled out through the night, each seen by the next. Near three in the morning David called everyone back: Yibo is dead on the pantry floor. You are the intern. You have until dawn to lay the order everyone left tonight against the building's badge log and watch one man fall out the bottom of it.

**Who did it (locked, unchanged):** David. The motive is the company, not a grudge. David faked Tread's growth numbers to land a new raise and quietly diluted the absent Yibo. Yibo pulled the real numbers, found the fraud, and flew in to yank his core engine (a reversion clause hands the IP back to its author) and kill the round. David put his head to the pantry counter, staged a drunk jet-lagged fall, took the laptop and phone, wiped his glass, pocketed the gift bottle, shredded Yibo's printout, scrubbed his own badge entry, and "found" the body himself so someone else would make the call.

**The night, afternoon to dawn (spine, not player-facing):**
- **~16:00** Yibo lands, comes straight to the office, jet-lagged, duty-free whiskey in hand. (owner's cinematic)
- **~18:30** David turns it into a World Cup final watch party in The Commons: Japan vs Spain, CentralWorld food run, bottle opened, big screen on. The other coworking members watch too, then head home as the night ends. (cinematic)
- **21:40** Yibo's guest badge reads UP. It never reads down. (hard anchor)
- **~22:15** After the final, jet-lagged, Yibo says goodnight, "heading to the hotel," steps toward the lift. By now the rest of the floor's members have gone, leaving only the team. Nobody watches him reach it. He doubles back to the pantry with David.
- **~22:30 — Departure 1:** Ching leaves first (packed bag, booked cab). Sam badges her down.
- **~23:00 — Departure 2:** Dena leaves, walks to her condo next door. Sam badges her down.
- **~23:40** Jay's render dies (~eleven); he doubles back near midnight for a cable and hears David and Yibo arguing through the office glass.
- **~00:30 — Departure 3:** Sam does her badge sweep and drives home, passing Poncho asleep in his car in the garage (down since ~22:50, held by the one gate camera through dawn).
- **~01:30 — Departure 4:** Jay's re-render finishes; he badges down. Peem, still at the printer, waves him off (they vouch for each other to 01:30).
- **~01:50** David steps to the lobby reader and scrubs his entry; the reader re-stamps him on the way back up — the artifact he runs out of night to clean.
- **~01:55 — THE KILL.** David puts Yibo's head to the counter corner.
- **~02:00** Peem hears a thud toward the pantry, then a tall, calm figure walks (away from him) to the lift.
- **~02:05–02:15** David cleans: laptop, phone, wiped glass, pocketed bottle, shredded printout.
- **~02:15 — Departure 5:** Peem badges down, walks to the condo tower next door.
- **~02:55** David comes back up alone, "finds" Yibo, starts the recall calls. In the recall window he has Dena rinse a glass and straighten a chair in the pantry.
- **~03:10 — PLAYABLE CLOCK STARTS.** Group cutscene in The Commons, then everyone disperses.
- **~06:00 — DAWN DEADLINE.** The Great Room opens for the day; the other members and offices start coming in.

**How the game opens:** A short, non-interactive, read-only group cutscene in The Commons at 03:10. David tells the team Yibo is dead in the pantry and frames it as a likely accident he wants kept quiet before the floor opens. The cast reacts in their own voices. The player makes no choices, only reads. Then everyone disperses into the rooms and the intern starts working the floor, the city still black through the glass.

**How the intern investigates:** You roam six rooms, talk one-on-one with all seven living suspects, and examine hotspots. The genius is that the static rooms ARE the recall — everyone is present because David called them back, and each person recounts the order they left. You reconstruct that departure order against the badge log. Every line is past tense; nobody is "still" anywhere.

**The path to David (fair-play convergence):** Seven strong clues converge on David — the body staged in the pantry, his glass wiped clean, Yibo's laptop with the real numbers back in his drawer, the shredded proof, the scrubbed badge with the re-entry stamp he couldn't erase, Jay's overheard argument, and Peem's thud. Naming David with two or more of these strong clues is the truth.

**The two fair red herrings:**
- **Poncho** (the steer): clashed with Yibo over an engine rewrite, is a known work-addict, drives. But he was asleep in his car under the one garage camera, and Sam saw him. His grudge note is three weeks old and patched up.
- **Ching** (the secret): Yibo had a hold over her quiet jump to a rival studio. A real motive. But her bag was packed and her cab booked and timestamped. She was fleeing town, not killing.

Both are cleared in dialogue, not by inference, and no hard physical evidence ever touches either.

**The deadline = dawn.** Tread rents only The Office; the pantry, lounge, printer, lobby, and commons are shared building space they don't own, all part of The Great Room. Deep night, the commons is keycard-locked and the other members are gone — the only reason the team can keep this internal. At ~06:00 the building opens The Great Room on a schedule no one on the team controls, the other members and offices start coming in, and a cofounder dead in a shared pantry quietly becomes "jet lag and one drink too many." Sam says it plainly: the morning unlock is not on her keyring.

**The four endings:**
- **A — YOU NAMED HIM (success):** name David with hard proof. The raise dies, you're off the team by Monday, but Yibo gets a name on the thing that killed him.
- **B — NO PROOF (warn):** name David, too thin to hold. Right and alone; he walks you to the lift himself.
- **C — STEERED WRONG (danger):** name anyone else. Poncho gets walked out, the killer keeps the company, and made sure you were the one to close the wrong case.
- **D — DOORS OPEN (danger, timeout):** dawn hits first. The Great Room opens, the other members come in, and it's out of your hands.

---

# 2. THE OPENING CUTSCENE (full script)

Non-interactive, read-only. Setting: **THE COMMONS, 03:10**, whole panel present, city black through the glass. The player only reads. (`(stage direction)` lines render with no speaker tag, in muted/italic flavor style.)

**DAVID:** Okay. Everyone's here. I'm sorry to drag you back at this hour. It's Yibo. I came up for my charger and he was on the pantry floor. He's gone.

*(A beat. Nobody moves.)*

**SAM:** A fall. In the pantry. Sure. That man could hold his drink better than any of us.

**DENA:** Hmm. but he said goodnight after the match. he was heading to the hotel, we all saw him say it. didn't we? okay. it's an accident. it has to be.

**JAY:** Dude. He flew across the whole world to die in our pantry.

**PEEM:** I suppose someone should actually look. Properly. Before we decide what it was.

**PONCHO:** I was asleep in my car the whole time. Sam saw me. So whatever this is, it's not me.

*(Ching says nothing. She pulls her packed bag a little closer and watches David's hands.)*

**DAVID:** It looks like a fall. Okay? A fall. We just, we keep this in the family and we get it straight before the building wakes up at dawn and the whole floor walks through here. That's all I'm asking. We owe him that much. New kid, you've got no history here, so go walk the floor, tell me there's nothing to find. Everyone else, just stay where I put you. Please.

*(Everyone rises and drifts out into the rooms. The intern is left alone in The Great Room. The sky through the glass is still black.)*

The steer to Poncho and the probation threat are NOT here — they live only in David's private one-on-one during play.

> Note for the implementer: the setting header is **THE COMMONS** (the physical gathering room). The closing stage direction "left alone in The Great Room" is preserved verbatim and reads correctly as the venue/whole floor the intern stands in, not the single common-area room.

---

# 3. FULL REWRITTEN COPY

Zero em/en dashes in any player-facing string. Curly apostrophes throughout (matching existing files). Hyphenated compounds kept (go-kart, first-week, re-render, re-entry, pre-dawn, stand-up, jet-lagged, airport-gift). Any World Cup phrasing uses "Japan vs Spain" (no dash). All IDs, flags, grants, weights, choice counts unchanged.

## 3.1 OBJECTIVE (one identical string, three locations)

> Yibo's dead on the pantry floor. Name the killer before David buries it. The Great Room opens at dawn and then it's out of your hands.

## 3.2 OPENING-CUTSCENE COPY (ColdOpenMode surface)

**Preamble (TREAD/OS dispatch frame, 4 lines):**
```
> TREAD/OS · FLOOR 25 · 03:10
> COFOUNDER DOWN · PANTRY · KEEP IT QUIET
> THE GREAT ROOM OPENS AT DAWN
> OPERATOR: INTERN · UNVERIFIED
```
**Title / kicker:** `NIGHT DESK · CASE 01` / `YIBO IS DEAD`
**Mission line:** `Walk the floor. Read what's left. Name the killer before dawn opens the doors.`
**Begin button:** `[ WALK THE FLOOR ]`

The cutscene body is the section-2 script above (rendered from a self-contained `CUTSCENE` array, decoupled from `dialogue.david`).

## 3.3 BOOT TERMINAL (BootMode)

```
> NODE TREAD/OS-04 ONLINE
> FLOOR 25 · 03:10 · NIGHT
> AWAITING OPERATOR
```

## 3.4 ALL 7 INTERACTIVE DIALOGUE TREES

### `david` (private; carries the steer + threat; grants no clue)
- **a** → choices: `“A fall?”`→b · `“I'll walk it.”`→end
> There you are. Hell of a first week, kid. I'm so sorry you walked into this one. Came up for my charger and found him on the pantry floor. Yibo. Jet lag, the drink, a bad fall. I just need it quiet and clean before that floor opens at dawn and the whole building walks through here. So walk it for me. Confirm there's nothing to find. Then come back to me.
- **b** → choices: `“I'll start where the evidence does.”`→c (setFlag `david_steered`) · `“Understood.”`→end (setFlag `david_steered`)
> Yibo flew in carrying a year of resentment and a bottle of whiskey. Him and Poncho have been at each other over the codebase for weeks. And Poncho practically lives at that desk, drives himself in at all hours, in and out whenever he likes. If you really have to turn over rocks, turn the ones by his chair. Not in here.
- **c** → choices: `“Noted.”`→end (setFlag `david_threat`)
> ...I like you. The new ones who keep their heads down go a long way here. Lunches at CentralWorld, watch parties, the whole family. The ones who go chasing ghosts tend not to clear probation. Don't let tonight be the thing that ends a nice little career before it starts.

### `jay` (grants `witness-argument`)
- **a** → choices: `“Going at it about what?”`→b · `“Thanks, Jay.”`→end (grantClue `witness-argument`)
> Dude. So we all stayed for the final tonight, Japan vs Spain, the whole team crammed in around the big screen, Yibo too. After he said he was heading back to his hotel? My render for the launch video died on me, like eleven. Came back from the commons near midnight to grab a cable and David and Yibo were in the office going at it. Not the fun kind. David told all of us he headed home hours ago with the rest. He didn't, bro. He was right here.
- **b** → choices: `“Keep this between us.”`→end (grantClue `witness-argument`, setFlag `jay_witness`)
> Couldn't hear all of it. Glass is thick. One line got through though. Yibo goes, “the numbers are a lie and you know it.” David went real quiet after that. I'd describe his face but, uh, I don't know, ask Claude. It was not a good face.

### `peem` (grants `earwitness-thud`; self-clearing vantage + Jay corroboration in node a)
- **a** → choices: `“Did you see a face?”`→b · `“Thanks, Peem.”`→end (grantClue `earwitness-thud`)
> I stayed back at the printer to finish the raise deck, the one David's been pushing. Jay was the last one I saw leave, waved him off from here around half one. Then around two I heard it. A thud, out toward the pantry, then nothing at all. A moment later someone walked past to the elevator. Not hurried. Calm. Tall. They walked away from me, toward the lift, so I never saw a face. Which, I suppose, is exactly why it wasn't me.
- **b** → choices: `“Understood.”`→end (grantClue `earwitness-thud`, setFlag `peem_witness`)
> No face. But I suppose you don't stroll off from a sound like that unless you already know what made it. And I'll put it plainly. Yibo came to take the company back, David came to keep it. I suppose, once it got to that, one of them was always leaving in a box. I really hoped I was being dramatic.

### `dena` (no clue; `dena_steered` on a, `dena_tampered` on b)
- **a** → choices: `“David told you what to say.”`→b · `“Maybe.”`→end (setFlag `dena_steered`)
> Hmm. it's, okay, it's an accident, right? It has to be. He said goodnight, he was going back to his hotel, we all saw him say it. David said to tell you it was an accident. And that if anyone looks shaky it's Poncho, the codebase thing. So, that's what I'm telling you. That's the thing I'm saying.
- **b** → choices: `“You cleaned a crime scene.”`→end (setFlag `dena_tampered`)
> I just make the dashboards! He asked me to “smooth” the growth curve for the investor deck and I said okay because, you don't say no to David. Then Yibo flew in and pulled the raw numbers and, oh my god. And then when he called us all back tonight he had me rinse out one of the glasses by the sink and straighten a chair in the pantry and I said okay to that too. What did I say okay to?

### `poncho` (sets `poncho_cleared`; garage alibi folded into node a)
- **a** → choices: `“Where were you at two?”`→b · `“Easy. Sit tight.”`→end (setFlag `poncho_cleared`)
> Me? Yeah, I was here. I'm always here, ask anyone, I like it better than my condo. But by two I was down in the garage, asleep in my car. Sam saw me on her way out, ask her. Yibo wanted to gut my engine and rewrite it “cleaner.” We fought about it. Three weeks ago. We were past it. I'm not gonna kill a man over a refactor.
- **b** → choices: `“Okay. Stay put.”`→end (setFlag `poncho_cleared`)
> Down in the garage, asleep in my car. Have been since before midnight. I do that, it's a whole thing, Sam clocked me on her way down, pull the gate camera if you want. Look, I'm blunt, not stupid. If I'd done it, I would not have parked under the one camera in the building.

### `ching` (grants `ching-motive`)
- **a** → choices: `“Convenient timing.”`→b · `“Noted.”`→end (grantClue `ching-motive`)
> I, um. I won't pretend I'm sad. Yibo found out I'd been talking to another studio, taking some of my own work with me, and he held it over me. Said it would cost me. So, yes. I had a reason. But I'm already getting out. Tonight. My bag's by the door, the cab's booked. I wanted gone. Not this.
- **b** → choices: `“Hm. Go on.”`→end (grantClue `ching-motive`, setFlag `ching_motive`)
> I wanted out of the company. Not that. There's a difference, even if it doesn't look like one from where you're standing. But I notice things, it's the job. David's hands were shaking when he walked us back in tonight. And Yibo's whiskey, the bottle he brought for everyone? It's gone. Somebody took it.

### `sam` (sets `sam_pointed`; air-quotes restored; badge re-entry mechanic delivered)
- **a** → choices: `“You think David did this?”`→b · `“Where's that log?”`→end (setFlag `sam_pointed`)
> Okay, real talk. This “accident” smells like the sauna after leg day. I run the badges, the building, the whole damn keyring. Yibo's guest pass shows him going up at twenty to ten and never coming back down. Dead men don't badge out, fine. But somebody scrubbed David's entry off that same log, and exactly two people can edit it. Me, and him.
- **b** → choices: `“On it.”`→end (setFlag `sam_pointed`)
> I think I drove that man around CentralWorld for three days while he asked real pointed questions about our numbers, and now he's on the pantry floor. I think Poncho was dead asleep in his car when I pulled out tonight, I saw him with my own eyes, leave him out of this. And here's the thing about that log. You can wipe an old entry, but the reader writes a fresh stamp to the building's copy every time a badge touches it, and only my admin key clears that copy. David scrubbed himself and the reader stamped him right back, and he ran out of night to fix it. Go read it fast. Once the floor opens at dawn the other members and offices start coming in, and that part's not on my keyring. The whole rest of the floor cleared out after the final, so it was just us up here, and David knows I'm not the only one who can edit that log.

## 3.5 ALL 9 CLUES

**`the-body`** (CORE → david) · source `pantry` · label `THE BODY`
> Yibo on the pantry floor by the counter where he and David were drinking after the match. The gash above his temple lines up with the hard counter corner a little too neatly, and his laptop and phone, the things glued to his hands, are gone. Good whiskey on his breath. He did not drink alone, and nobody tidies up after a man who just slips. This was murder, dressed as a bad night.

**`retrieved-proof`** (HEAVY → david) · source `office` · label `YIBO'S LAPTOP`
> David's bottom drawer sits proud of the desk, won't close. Half-shoved under it: Yibo's laptop, still warm. On it, the raw growth numbers that do not match the deck David has been showing investors, and the reversion clause that hands the core engine back to whoever wrote it. The two things that could end David's raise, back in David's hands the same night Yibo dies.

**`two-glasses`** (CORE → david) · source `pantry` · label `TWO GLASSES`
> Two whiskey glasses by the pantry sink, set down around two, poured from Yibo's airport-gift bottle that nobody can find now. One glass still has Yibo's prints, the one David never thought to touch. The other is wiped clean, and rinsed again later on David's word. Too clean. They argued in the office near midnight, then carried the bottle in here to finish it founder to founder once the match was over. One of them never left the room standing.

**`shredded-letter`** (HEAVY → david) · source `printer` · label `SHREDDED PRINTOUT`
> Confetti in the shredder, reassembled: the real metrics next to the deck's faked ones, and a line in Yibo's hand, “the round is a lie. I'm pulling the engine. Y.” Yibo printed the proof to end it tonight. Someone fed it to the blades.

**`scrubbed-badge`** (HEAVY → david) · source `elevator` · label `SCRUBBED BADGE LOG`
> The access log shows guest badge V1 (Yibo) up at 21:40, never down, so Yibo never left the floor. The other members all badged out after the final, leaving only the team. And a hole where D1, David's badge, should be. Deleted, with a quiet re-entry stamp at 01:50. David told everyone he headed home at eleven with the rest. He wiped his own entry, but the reader stamped him fresh on the way back up and that copy only clears with admin keys. Only two badges can edit this log: admin's, and his.

**`owed-note`** (WEAK → poncho, RED HERRING) · source `sofa` · label `PONCHO'S GRUDGE`
> In Poncho's jacket on the lounge: a printout of a thread where he tells Yibo the rewrite happens “over my dead body.” Looks like a motive. It is also three weeks old, and scrawled across the bottom in Poncho's hand: “we're good. beers on me. P.”

**`witness-argument`** (CORE → david) · source `jay` · label `THE ARGUMENT`
> Jay came back to re-cut the launch video, his render died around eleven, and he doubled back for a cable near midnight. Through the office glass he heard David and Yibo tearing into each other: “the numbers are a lie and you know it.” Not a work fight. Proof both men were in the building long after David swore he had gone home.

**`earwitness-thud`** (CORE → david) · source `peem` · label `THE THUD`
> Peem stayed latest at the printer finishing the raise deck and heard it around 2 a.m. A thud out toward the pantry, then dead air. A moment later a tall, calm figure walked, not ran, to the elevator. The figure walked away from Peem, who had just waved Jay off, which is exactly why Peem is not it.

**`ching-motive`** (WEAK → ching, RED HERRING) · source `ching` · label `CHING'S SECRET`
> Yibo had something on Ching, a quiet jump to a rival studio with work that was not hers to take, and held it over her. A real motive. But her bag was packed and her cab was booked and timestamped. She was already fleeing town tonight, reaching for an exit, not a weapon.

## 3.6 ALL 6 ROOMS

### `coworking` → label `THE COMMONS`, short `CMN`
- **`cw-aftermath`** (replaces `cw-body`, NO clueId) · x:0.40, y:0.62 · label `THE AFTERMATH`
> The leftovers of a good night gone cold. CentralWorld takeout going hard in the boxes, the big screen still frozen on the Japan vs Spain final, paper cups everywhere. A few hours ago this was the warmest room in Bangkok. Now it's the room where David sat everyone down and said the word gone.
- **`cw-window`** · x:0.72, y:0.34 · label `THE WINDOW`
> Black glass twenty-five floors up, the CentralWorld signage smeared to neon soup down below. The city is still dark. When that sky goes grey the building wakes up, the commons unlocks, and the other members and offices start coming in like nothing happened. The city glitters and doesn't care. It never does.

### `office` → label `THE OFFICE`, short `OFC`
- **`of-desk`** · x:0.50, y:0.58 · clueId `retrieved-proof` · label `DAVID'S SPOT`
> Something is wedged half under David's spot at the long team desk: a laptop with a sticker from a Singapore conference. Yibo's. Still warm. The screen wakes to a spreadsheet of numbers that don't match the ones David's been showing investors.
- **`of-photo`** · x:0.24, y:0.72 · label `FRAMED PHOTO`
> Two founders at a go-kart track, arms slung over shoulders, a trophy between them. Years ago, when it was still theirs together. Yibo's face has been turned to the wall.

### `pantry` → label `PANTRY`, short `PAN`
- **`pn-body`** (NEW, carries `the-body`) · x:0.30, y:0.66 · clueId `the-body` · label `THE BODY`
> Yibo on the pantry floor by the counter, where two glasses still sit. The skin says hours. The gash above his temple lines up with the hard counter corner, almost too well. His laptop and his phone, the things glued to his hands, are gone. Good whiskey on his breath. He didn't drink alone, and nobody tidies up after a man who just slips.
- **`pn-glasses`** · x:0.58, y:0.52 · clueId `two-glasses` · label `TWO GLASSES`
> Two whiskey glasses by the sink, set down around two, poured from Yibo's airport-gift bottle that nobody can find now. One wears Yibo's prints. The other has been wiped down to nothing, the only clean thing in this room. This is where the good night quietly ended.
- **`pn-sink`** (KEPT, flavor-only) · x:0.80, y:0.40 · label `THE SINK`
> Still wet. A dish towel folded too neatly for two in the morning. Somebody tidied in a hurry and called it calm.

### `sofa` → label `SOFA · LOUNGE`, short `LNG`
- **`sf-jacket`** · x:0.46, y:0.62 · clueId `owed-note` · label `PONCHO'S JACKET`
> Poncho's jacket, slung over the lounge arm since the watch party. In the pocket, a folded printout. A thread where he swears Yibo will rewrite his engine “over my dead body.” Damning, until you read the line at the bottom in his own hand: “we're good. beers on me.”

### `printer` → label `PRINTER · NOOK`, short `PRN`
- **`pr-shredder`** · x:0.50, y:0.62 · clueId `shredded-letter` · label `THE SHREDDER`
> Fresh confetti in the bin. Patient fingers reassemble it: the real growth curve beside the deck's prettier lie, and a line in Yibo's hand, “the round is a lie. I'm pulling the engine.” Someone disagreed, hard, and fed the proof to the blades.

### `elevator` → label `ELEVATOR · LOBBY`, short `ELV`
- **`el-badge`** · x:0.50, y:0.50 · clueId `scrubbed-badge` · label `BADGE LOG`
> The reader's memory: guest badge V1 (Yibo) up at 21:40, never down. So Yibo never left the floor. And a hole where D1, David's badge, should be. Deleted, with a quiet re-entry stamp at 01:50. He told everyone he headed home at eleven. Only admin and David can rewrite this log.

## 3.7 ALL 4 ENDINGS

**A** — title `YOU NAMED HIM` · verdict `THE TRUTH, UGLY` · tone `success`
> You lay it all down before the doors open. The scrubbed badge. The wiped glass. Yibo's laptop back in his drawer with the real numbers glowing on it. The warmth drains out of his face. He'll have lawyers by noon, the raise is dead, and you're off the team by Monday. But the report says David. Yibo gets a name on the thing that killed him. Some nights, ugly is the best you get.

**B** — title `NO PROOF` · verdict `RIGHT, AND ALONE` · tone `warn`
> You point at David and you're right and you both know it. But it's a first-week intern's word against the man who signs the checks, and the sky is already going grey. You brought a hunch to a knife fight. He walks you to the lift himself, easy and unhurried, holds the door. The truth rides down twenty-five floors with you and gets out at the lobby, alone.

**C** — title `STEERED WRONG` · verdict `THE KILLER WALKS` · tone `danger`
> You point exactly where you were told to point. Poncho gets walked out of the building he practically lived in, the floor exhales, and David rests a heavy, grateful hand on your shoulder. The raise closes Friday. Somewhere a laptop full of the truth gets wiped and dropped off a Chao Phraya bridge. You closed the case on the wrong person, and he made sure you'd be the one to do it. He keeps the company. You keep the badge.

**D** — title `DOORS OPEN` · verdict `OUT OF TIME` · tone `danger`
> Dawn. The Great Room unlocks on the building's schedule, not yours. Staff prop the doors, the cleaners reach the pantry, and the other members and offices start coming in with their coffees and their stand-up meetings. A cofounder dead on a shared kitchen floor quietly becomes a story about jet lag and one drink too many. You walked this floor from deep night into first light and never said the word. By the time the right question gets asked, the man who knows the answer is already three explanations ahead.

## 3.8 SUSPECTS-PANEL COPY (APPLIED — lock-residual rename, was §5 fork)

These player-facing strings change (no IDs/logic touched):
- **AccusationMode.jsx:** section heading `SUSPECT BOARD` → `SUSPECTS`; aria-label `Suspect board` → `Suspects`. (Non-rendering JSDoc/JSX comments at :23/:68 synced off "board" for consistency.)
- **SuspectsOverlay.jsx:** TerminalChrome label `Suspect Board` → `Suspects`; aria-labels `Suspect board` / `Close suspect board` → `Suspects` / `Close suspects`. Body copy FULL replacement (removes the player-facing em dash by splitting into two sentences): `The board won't name them for you — weigh the evidence and decide.` → **`This panel won't name them for you. Weigh the evidence and decide.`** (The preceding sentence "Everyone still on the floor." is preserved verbatim.) Non-rendering JSDoc at :14/:17-18 synced "board" → "panel."

---

# 4. IMPLEMENTATION MAP (for later — not now)

**`src/mystery/data/dialogue.js`** — replace `text` on all 7 trees per §3.4. Keep every node id, `start`, `to`, `setFlag`, `grantClue`, `end`, and choice count. The four lines that actually change text: `david` node c ("kart nights" → "watch parties"); `jay` node a (adds the Japan vs Spain watch-party opener; "the Great Room" → "the commons"; the now-adjacent "Yibo" becomes "he" to avoid double-naming); `peem` node b ("one of them was never walking out of here" → "one of them was always leaving in a box"); `sam` node b (everything up to and including "Go read it fast." is verbatim; the tail becomes the calm-deadline + closed-circle form in §3.4). Peem node a keeps the Jay-corroboration clause; Dena node b keeps "rinse out one of the glasses by the sink." `COLD_OPEN_CHARACTER` export can stay (still `'david'`) but is no longer consumed by the decoupled cutscene; update the top docstring line about David's nodes feeding the cold open. Drop/clean any now-unused import surfaced by the decoupling.

**`src/mystery/data/clues.js`** — `the-body.source` `coworking` → `pantry`; rewrite all 9 `description` strings per §3.5. The three watch-party touches: `the-body` ("after the match"), `two-glasses` ("once the match was over"), `scrubbed-badge` (closed-circle "other members all badged out after the final" line). IDs, `weight`, `evidenceAgainst`, `label`, `TRUE_CULPRIT`, `PATSY` unchanged. Confirm `scrubbed-badge` re-entry stamp reads **01:50** (scrub), distinct from the **01:55** kill in the spine — overwrite any live `01:55` stamp instance. Grep `-i bullpen` over `src/mystery/` after editing → must return ZERO player-facing hits. Update the file docstring's framing off "bullpen."

**`src/mystery/data/rooms.js`** — relabel `coworking` `THE GREAT ROOM`/`GRT` → **`THE COMMONS`/`CMN`** (and its leading code-comment off "bullpen"/"Great Room single room"); `office` stays `THE OFFICE`/`OFC` (drop any "David's office" phrasing in label/comments — it is Tread's private team room). Remove `cw-body` hotspot, add flavor-only `cw-aftermath` (§3.6, watch-party aftermath with the loved "warmest room in Bangkok" tail kept). `cw-window` deadline line → calm "other members and offices start coming in." `sf-jacket` "go-kart night" → "the watch party." Move `the-body` to new `pn-body` hotspot in pantry; keep `pn-glasses` (`two-glasses`) and `pn-sink` (flavor-only), re-coordinated per §3.6 so the three pantry hotspots don't overlap. `el-badge` body is the verbatim §3.6 string (was a placeholder in the surface draft). `of-photo` go-kart photo is a historic frame, NOT the watch-party night — preserve verbatim.

**`src/mystery/data/characters.js`** — UNCHANGED. Placement stays: david=office, peem=printer, poncho=elevator, jay=coworking, ching=sofa, dena=pantry, sam=elevator. (Sam + Poncho co-located at elevator is intended; confirm the engine renders two portraits in one room — the only placement risk. If it can't, move Sam to coworking and flag.)

**`src/mystery/modes/ColdOpenMode.jsx`** — NEW self-contained read-only multi-speaker cutscene (distinct from interactive DialogueMode). Replace the `DAVID_A`/`DAVID_B` pull + `PREAMBLE`/`BRIEF` with a local `CUTSCENE` array (§2 script, setting header **THE COMMONS**, Dena line "after the match") and the 4-line `PREAMBLE` (§3.2, line 3 keeps `THE GREAT ROOM OPENS AT DAWN` as venue). Render maps over `CUTSCENE`; `dir: true` lines render with no speaker tag in muted/italic style. Title/kicker kept; mission line + button copy per §3.2. Drop the now-dead `dialogue` import. CRITICAL: this decoupling is a must-fix so David's private steer + threat never leak into the public read.

**`src/mystery/modes/BootMode.jsx`** — replace `BOOTLINES` with the night frame (§3.3). `INITIALIZING SHIFT` subhead left as-is (generic).

**`src/mystery/state/actions.js`** — `DEFAULT_OBJECTIVE` (line 47) = the §3.1 string. Flag the now-possibly-unused `COLD_OPEN_CHARACTER` import (line 20).

**`src/mystery/state/mystery.js`** — `objective` (line 39) and `objectiveAtom` fallback (line 95) = the identical §3.1 string. All three objective locations must match exactly so the HUD reads it on fresh load, hydrated load, and restart.

**`src/mystery/data/endings.js`** — rewrite Ending D body's deadline clause per §3.7 ("outside tenants flood the floor" → "the other members and offices start coming in"); title/verdict `BOARD CALL`/`OUT OF TIME` → `DOORS OPEN`/`OUT OF TIME`. Endings A/B/C bodies are verbatim (no flood/board imagery). The preserved Ending D line "The Great Room unlocks on the building's schedule" stays (venue). `resolveEnding` UNCHANGED (Ending A's ≥2 CORE/HEAVY math holds). Re-point the D docstring off "deadline" to the dawn open.

**`src/mystery/engine/clock.js`** — re-anchor to a deep-night→dawn run, engine mechanic intact:
- `DEADLINE_MINUTE = 170`, `REAL_SECONDS_PER_DAY = 170` (1 in-game min/real sec, ~3-real-min window, 03:10→06:00). `START_MINUTE = 0`; `DAY_LENGTH_MINUTES` derives to 170.
- `formatClock` `BASE_MINUTES = 9*60` → `3*60+10`; update docstring examples to night times (`formatClock(0)`→`03:10 AM`, `formatClock(170)`→`06:00 AM`).
- `periodFor` re-thresholded: `>=120 → 'morning'` (dawn/first light), `>=60 → 'dusk'` (pre-dawn grey), else `'night'`. Update its docstring; the old 600/360 branches and the `12:00 AM (midnight)` example must be rewritten, not just the constants.
- `PERIOD_LABEL = { morning: 'DAWN', dusk: 'PRE-DAWN', night: 'NIGHT' }`.
- Rewrite file header + `isPastDeadline` doc off "09:00 board call" to "deep-night to dawn, 03:10→06:00, The Great Room opens."
- Engineer note: confirm a careful player can clear all 6 rooms + reach all 7 suspects inside the ~3-real-min window; widen `REAL_SECONDS_PER_DAY` if playtesting is too tight. Timeout path itself untouched.

**`src/mystery/hud/TerminalStatusRow.jsx`** (line 8) — comment "board-call deadline" → "dawn deadline" (non-rendering).

**`src/mystery/modes/AccusationMode.jsx`** + **`src/mystery/overlays/SuspectsOverlay.jsx`** — APPLY §3.8 renames (re-classified from fork to required by the no-board lock). No IDs, flags, clue logic, or resolver change.

**Files unchanged by design:** `characters.js`, `resolveEnding`.

**Verification:** these are JSX/plain-data content edits; no backend (models/services/migrations/specs) touched, and no unit suite covers the prose strings. After editing, run three greps over `src/mystery/`: `-i bullpen` (zero hits), `-i "great room"` (only venue usages survive: objective ×3, preamble line 3, cutscene closing direction, Ending D), and a dash scan (zero em/en dashes in rendered strings; JSDoc-only OK). The one behavioral constant to verify in-app is the clock window (`DEADLINE_MINUTE`/`REAL_SECONDS_PER_DAY` = 170): confirm a careful player can still reach all 6 rooms and 7 suspects before the dawn cutoff, and tune the rate if too tight. Confirm in-app that the engine renders two portraits in one room (Sam + Poncho at elevator) or move Sam to coworking.

---

# 5. OPEN QUESTIONS (real forks only)

1. **SUSPECTS panel rename — RESOLVED, APPLIED (no longer a fork).** Per the unconditional no-board lock, AccusationMode and SuspectsOverlay are renamed to "Suspects" and the SuspectsOverlay body copy is rewritten to remove the player-facing em dash (§3.8). Exact strings are ready; zero logic impact. Documented here only so a future verifier knows the carve-out question was closed in favor of renaming.

2. **Common-area room label = THE COMMONS / CMN (owner veto window).** Per owner note 1, the open common-area room (`coworking`) is re-labeled off "The Great Room" (now the whole venue). "THE COMMONS" reads best and stays distinct from the venue brand. Alternates considered: "THE FLOOR," "OPEN COMMONS." Flagged for owner veto; everything downstream ("the commons unlocks," jay's "the commons") follows this choice.

3. **Sam + Poncho co-located at the elevator.** Intended (Sam vouches for Poncho on the spot; badge log + garage alibi both live there). Only a risk if the engine can't render two portraits in one room. **Confirm the engine handles it in-app before calling implementation done**; if not, the fallback is moving Sam to The Commons. This is the one true engine blocker.

4. **Clock tightness.** The 03:10→06:00 face maps to a ~3-real-minute window at the current 1-min/sec rate. Implementation-tuning detail, not a story fork: if playtesting shows it's too tight to visit all 6 rooms + 7 suspects, widen `REAL_SECONDS_PER_DAY` (keeping the displayed face if desired). The story does not depend on the exact number.
