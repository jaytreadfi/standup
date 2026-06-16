/**
 * dialogue.js — branching dialogue trees, keyed by character id.
 *
 * Plain data (not Ink). The engine (actions.js) walks these nodes and applies
 * setFlag / grantClue side effects. David's nodes a/b also feed the cold open.
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
 *   Dena  — data analyst. Sweet, "hmmm", people-pleaser. Unwitting accomplice.
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
        text: 'There you are. Hell of a first week, kid. Yibo — found him just like that when I came in early. Jet lag, the drink, a bad fall last night after everyone went home. Tragic. The board calls tomorrow morning and I need this quiet and clean before they do. Walk the floor, confirm it’s nothing, come back to me.',
        choices: [
          { label: '“A fall?”', to: 'b' },
          { label: '“I’ll walk it.”', end: true },
        ],
      },
      b: {
        speaker: 'David',
        text: 'Yibo flew in carrying a year of resentment and a bottle of whiskey. He and Poncho have been at each other over the codebase for weeks — and Poncho practically lives at that desk, drives himself in at all hours. If you must turn over rocks, turn the ones by his chair. Not in my office.',
        choices: [
          { label: '“I’ll start where the evidence does.”', to: 'c', setFlag: 'david_steered' },
          { label: '“Understood.”', setFlag: 'david_steered', end: true },
        ],
      },
      c: {
        speaker: 'David',
        text: '...I like you. New hires who keep their heads down go a long way here — lunch at CentralWorld, kart nights, the whole family. The ones who go chasing ghosts tend not to clear probation. Don’t let today be the thing that ends a promising little career.',
        choices: [{ label: '“Noted.”', setFlag: 'david_threat', end: true }],
      },
    },
  },

  jay: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Jay',
        text: 'Dude. Last night — came back to re-cut the launch video, the render died on me, like eleven. David and Yibo were in the office going at it. Not the fun kind. David told everyone he karted home with the rest of us. He didn’t, bro. He was right here.',
        choices: [
          { label: '“Going at it about what?”', to: 'b' },
          { label: '“Thanks, Jay.”', grantClue: 'witness-argument', end: true },
        ],
      },
      b: {
        speaker: 'Jay',
        text: 'Couldn’t hear all of it. Glass is thick. One line got through, though — Yibo goes, “the numbers are a lie and you know it.” David went real quiet after that. I’d describe his face but, uh... I don’t know, ask Claude. It was not a good face.',
        choices: [{ label: '“Keep this between us.”', grantClue: 'witness-argument', setFlag: 'jay_witness', end: true }],
      },
    },
  },

  peem: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Peem',
        text: 'Last night I stayed back at the printer to finish the board deck — the raise David’s been pushing. Around two I heard it: a thud out in the bullpen, then nothing at all. A moment later someone walked past to the elevator. Not hurried. Calm. Tall.',
        choices: [
          { label: '“Did you see a face?”', to: 'b' },
          { label: '“Thanks, Peem.”', grantClue: 'earwitness-thud', end: true },
        ],
      },
      b: {
        speaker: 'Peem',
        text: 'No. But I suppose you don’t stroll away from a sound like that unless you already know what made it. And I’ll put it plainly: Yibo came to take the company back, David came to keep it. I suppose one of them was always leaving in a box. I’d hoped I was being dramatic.',
        choices: [{ label: '“Understood.”', grantClue: 'earwitness-thud', setFlag: 'peem_witness', end: true }],
      },
    },
  },

  dena: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Dena',
        text: 'Hmm. It’s — okay, it’s an accident, right? It has to be. David said to tell you it was an accident. And that if anyone looks shaky it’s Poncho, the codebase thing. So... that’s what I’m telling you. That’s the thing I’m saying.',
        choices: [
          { label: '“David told you what to say.”', to: 'b' },
          { label: '“Maybe.”', setFlag: 'dena_steered', end: true },
        ],
      },
      b: {
        speaker: 'Dena',
        text: 'I just make the dashboards! He asked me to “smooth” the growth curve for the investor deck and I said okay because — you don’t say no to David. Then Yibo flew in and pulled the raw numbers and— oh my god. And tonight he had me rinse a glass and straighten a chair and I said okay to that too. What did I say okay to?',
        choices: [{ label: '“You cleaned a crime scene.”', setFlag: 'dena_tampered', end: true }],
      },
    },
  },

  poncho: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Poncho',
        text: 'Me? Yeah, I was here. I’m always here — ask anyone, I like it better than my condo. Yibo wanted to gut my engine and rewrite it “cleaner.” We fought about it. Three weeks ago. We were past it. I’m not going to kill a man over a refactor.',
        choices: [
          { label: '“Where were you at two?”', to: 'b' },
          { label: '“Easy. Sit tight.”', setFlag: 'poncho_cleared', end: true },
        ],
      },
      b: {
        speaker: 'Poncho',
        text: 'Down in the garage, asleep in my car. I do that, it’s a whole thing — Sam saw me on her way up, ask her. Pull the gate camera if you want. Look — I’m blunt, not stupid. If I’d done it, I wouldn’t have parked under the one camera in the building.',
        choices: [{ label: '“Okay. Stay put.”', setFlag: 'poncho_cleared', end: true }],
      },
    },
  },

  ching: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Ching',
        text: 'I... um. I won’t pretend I’m sad. Yibo found out I’d been talking to another studio — taking some of my own work with me — and he held it over me. Said it would cost me. So, yes. I had a reason. But... I’m already getting out. Today. My bag’s by the door, the cab’s booked. I wanted gone, not... this.',
        choices: [
          { label: '“Convenient timing.”', to: 'b' },
          { label: '“Noted.”', grantClue: 'ching-motive', end: true },
        ],
      },
      b: {
        speaker: 'Ching',
        text: 'I wanted out of the company. Not... that. There’s a difference, even if it doesn’t look like one from where you’re standing. But I notice things — it’s the job. David’s hands were shaking when he walked us in this morning. And Yibo’s whiskey, the bottle he brought for everyone? It’s gone. Somebody took it.',
        choices: [{ label: '“Hm. Go on.”', grantClue: 'ching-motive', setFlag: 'ching_motive', end: true }],
      },
    },
  },

  sam: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Sam',
        text: 'Okay, real talk — this “accident” smells like the sauna after leg day. I run the badges, the building, the whole damn keyring. Yibo’s guest pass shows him going up and never coming down. Dead men don’t badge out, fine. But somebody scrubbed David’s entry off that same log, and exactly two people can edit it: me, and him.',
        choices: [
          { label: '“You think David did this?”', to: 'b' },
          { label: '“Where’s that log?”', setFlag: 'sam_pointed', end: true },
        ],
      },
      b: {
        speaker: 'Sam',
        text: 'I think I drove that man around CentralWorld for three days while he asked real pointed questions about our numbers, and now he’s on the floor. I think Poncho was dead asleep in his car when I pulled in — I saw him, leave him out of this. And I think you should go read that badge reader before David remembers I’m not the only one who can edit it.',
        choices: [{ label: '“On it.”', setFlag: 'sam_pointed', end: true }],
      },
    },
  },
};

export const COLD_OPEN_CHARACTER = 'david';
