/**
 * dialogue.js — branching dialogue trees, keyed by character id.
 *
 * Plain data (not Ink). The engine (actions.js) walks these nodes and applies
 * setFlag / grantClue side effects. These are the in-room one-on-one
 * conversations the intern has while roaming. The opening group cutscene is
 * separate: it lives self-contained in ColdOpenMode and is read-only.
 *
 * Node shape:
 *   { speaker, text, choices: [{ label, to?, setFlag?, grantClue?, end? }] }
 * A choice with `to` advances; `end: true` (or no `to`) closes the conversation.
 *
 * Voices are the real Tread team:
 *   David — founder, the killer. Warm, paternal, then cold. Steers you to Poncho.
 *   Peem  — project lead. Mature, deliberate, "I suppose." Earwitness who names
 *           the founder war plainly.
 *   Poncho— engineer, the patsy. Dry, blunt-honest, secret work-addict. Drives.
 *   Jay   — marketing. Monotone, deadpan, "dude/bro." The reluctant witness.
 *   Ching — product design. Shy, hesitant, detail-obsessed. Red herring.
 *   Dena  — data analyst. Sweet, "hmm", people-pleaser. Unwitting accomplice.
 *   Sam   — admin. Sweary, sarcastic, metaphor-happy. Your ally with the keys.
 *
 * The authority figures (David, Dena) push "accident / Poncho"; the witnesses
 * (Jay, Peem), the ally (Sam), and the herrings (Ching, Poncho) hand you the
 * thread that leads home.
 */

export const dialogue = {
  david: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'David',
        text: 'There you are. Hell of a first week, kid. I’m so sorry you walked into this one. Came up for my charger and found him on the pantry floor. Yibo. Jet lag, the drink, a bad fall. I just need it quiet and clean before that floor opens at dawn and the whole building walks through here. So walk it for me. Confirm there’s nothing to find. Then come back to me.',
        choices: [
          { label: '“A fall?”', to: 'b' },
          { label: '“I’ll walk it.”', end: true },
        ],
      },
      b: {
        speaker: 'David',
        text: 'Yibo flew in carrying a year of resentment and a bottle of whiskey. Him and Poncho have been at each other over the codebase for weeks. And Poncho practically lives at that desk, drives himself in at all hours, in and out whenever he likes. If you really have to turn over rocks, turn the ones by his chair. Not in here.',
        choices: [
          { label: '“I’ll start where the evidence does.”', to: 'c', setFlag: 'david_steered' },
          { label: '“Understood.”', setFlag: 'david_steered', end: true },
        ],
      },
      c: {
        speaker: 'David',
        text: '...I like you. The new ones who keep their heads down go a long way here. Lunches at CentralWorld, watch parties, the whole family. The ones who go chasing ghosts tend not to clear probation. Don’t let tonight be the thing that ends a nice little career before it starts.',
        choices: [{ label: '“Noted.”', setFlag: 'david_threat', end: true }],
      },
    },
  },

  jay: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Jay',
        text: 'Dude. So we all stayed for the final tonight, Japan vs Spain, the whole team crammed in around the big screen, Yibo too. After he said he was heading back to his hotel? My render for the launch video died on me, like eleven. Came back from the commons near midnight to grab a cable and David and Yibo were in the office going at it. Not the fun kind. David told all of us he headed home hours ago with the rest. He didn’t, bro. He was right here.',
        choices: [
          { label: '“Going at it about what?”', to: 'b' },
          { label: '“Thanks, Jay.”', grantClue: 'witness-argument', end: true },
        ],
      },
      b: {
        speaker: 'Jay',
        text: 'Couldn’t hear all of it. Glass is thick. One line got through though. Yibo goes, “the numbers are a lie and you know it.” David went real quiet after that. I’d describe his face but, uh, I don’t know, ask Claude. It was not a good face.',
        choices: [{ label: '“Keep this between us.”', grantClue: 'witness-argument', setFlag: 'jay_witness', end: true }],
      },
    },
  },

  peem: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Peem',
        text: 'I stayed back at the printer to finish the raise deck, the one David’s been pushing. Jay was the last one I saw leave, waved him off from here around half one. Then around two I heard it. A thud, out toward the pantry, then nothing at all. A moment later someone walked past to the elevator. Not hurried. Calm. Tall. They walked away from me, toward the lift, so I never saw a face. Which, I suppose, is exactly why it wasn’t me.',
        choices: [
          { label: '“Did you see a face?”', to: 'b' },
          { label: '“Thanks, Peem.”', grantClue: 'earwitness-thud', end: true },
        ],
      },
      b: {
        speaker: 'Peem',
        text: 'No face. But I suppose you don’t stroll off from a sound like that unless you already know what made it. And I’ll put it plainly. Yibo came to take the company back, David came to keep it. I suppose, once it got to that, one of them was always leaving in a box. I really hoped I was being dramatic.',
        choices: [{ label: '“Understood.”', grantClue: 'earwitness-thud', setFlag: 'peem_witness', end: true }],
      },
    },
  },

  dena: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Dena',
        text: 'Hmm. it’s, okay, it’s an accident, right? It has to be. He said goodnight, he was going back to his hotel, we all saw him say it. David said to tell you it was an accident. And that if anyone looks shaky it’s Poncho, the codebase thing. So, that’s what I’m telling you. That’s the thing I’m saying.',
        choices: [
          { label: '“David told you what to say.”', to: 'b' },
          { label: '“Maybe.”', setFlag: 'dena_steered', end: true },
        ],
      },
      b: {
        speaker: 'Dena',
        text: 'I just make the dashboards! He asked me to “smooth” the growth curve for the investor deck and I said okay because, you don’t say no to David. Then Yibo flew in and pulled the raw numbers and, oh my god. And then when he called us all back tonight he had me rinse out one of the glasses by the sink and straighten a chair in the pantry and I said okay to that too. What did I say okay to?',
        choices: [{ label: '“You cleaned a crime scene.”', setFlag: 'dena_tampered', end: true }],
      },
    },
  },

  poncho: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Poncho',
        text: 'Me? Yeah, I was here. I’m always here, ask anyone, I like it better than my condo. But by two I was down in the garage, asleep in my car. Sam saw me on her way out, ask her. Yibo wanted to gut my engine and rewrite it “cleaner.” We fought about it. Three weeks ago. We were past it. I’m not gonna kill a man over a refactor.',
        choices: [
          { label: '“Where were you at two?”', to: 'b' },
          { label: '“Easy. Sit tight.”', setFlag: 'poncho_cleared', end: true },
        ],
      },
      b: {
        speaker: 'Poncho',
        text: 'Down in the garage, asleep in my car. Have been since before midnight. I do that, it’s a whole thing, Sam clocked me on her way down, pull the gate camera if you want. Look, I’m blunt, not stupid. If I’d done it, I would not have parked under the one camera in the building.',
        choices: [{ label: '“Okay. Stay put.”', setFlag: 'poncho_cleared', end: true }],
      },
    },
  },

  ching: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Ching',
        text: 'I, um. I won’t pretend I’m sad. Yibo found out I’d been talking to another studio, taking some of my own work with me, and he held it over me. Said it would cost me. So, yes. I had a reason. But I’m already getting out. Tonight. My bag’s by the door, the cab’s booked. I wanted gone. Not this.',
        choices: [
          { label: '“Convenient timing.”', to: 'b' },
          { label: '“Noted.”', grantClue: 'ching-motive', end: true },
        ],
      },
      b: {
        speaker: 'Ching',
        text: 'I wanted out of the company. Not that. There’s a difference, even if it doesn’t look like one from where you’re standing. But I notice things, it’s the job. David’s hands were shaking when he walked us back in tonight. And Yibo’s whiskey, the bottle he brought for everyone? It’s gone. Somebody took it.',
        choices: [{ label: '“Hm. Go on.”', grantClue: 'ching-motive', setFlag: 'ching_motive', end: true }],
      },
    },
  },

  sam: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Sam',
        text: 'Okay, real talk. This “accident” smells like the sauna after leg day. I run the badges, the building, the whole damn keyring. Yibo’s guest pass shows him going up at twenty to ten and never coming back down. Dead men don’t badge out, fine. But somebody scrubbed David’s entry off that same log, and exactly two people can edit it. Me, and him.',
        choices: [
          { label: '“You think David did this?”', to: 'b' },
          { label: '“Where’s that log?”', setFlag: 'sam_pointed', end: true },
        ],
      },
      b: {
        speaker: 'Sam',
        text: 'I think I drove that man around CentralWorld for three days while he asked real pointed questions about our numbers, and now he’s on the pantry floor. I think Poncho was dead asleep in his car when I pulled out tonight, I saw him with my own eyes, leave him out of this. And here’s the thing about that log. You can wipe an old entry, but the reader writes a fresh stamp to the building’s copy every time a badge touches it, and only my admin key clears that copy. David scrubbed himself and the reader stamped him right back, and he ran out of night to fix it. Go read it fast. Once the floor opens at dawn the other members and offices start coming in, and that part’s not on my keyring. The whole rest of the floor cleared out after the final, so it was just us up here, and David knows I’m not the only one who can edit that log.',
        choices: [{ label: '“On it.”', setFlag: 'sam_pointed', end: true }],
      },
    },
  },
};

export const COLD_OPEN_CHARACTER = 'david';
