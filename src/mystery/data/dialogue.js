/**
 * dialogue.js — lightweight branching dialogue trees, keyed by character id.
 *
 * Deliberately NOT Ink — the case writing is placeholder for this slice, so a
 * plain data tree keeps it fully controllable and toolchain-free. The engine
 * (actions.js) walks these nodes and applies setFlag / grantClue side effects.
 *
 * Node shape:
 *   { speaker, text, choices: [{ label, to?, setFlag?, grantClue?, end? }] }
 * A choice with `to` advances to that node; `end: true` (or no `to`) closes the
 * conversation. `setFlag` records a flag; `grantClue` logs evidence.
 */

export const dialogue = {
  david: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'David',
        text: 'You’re the new intern. Good. Someone gutted my pitch deck overnight — fourteen slides, gone. Board’s at sunrise. Find out who.',
        choices: [
          { label: 'Where do I start?', to: 'b' },
          { label: 'On it.', end: true },
        ],
      },
      b: {
        speaker: 'David',
        text: 'Everyone swears they left by seven. Badges say otherwise. Walk the floor, look at what people leave behind. Then come back and name them.',
        choices: [{ label: 'Understood.', setFlag: 'briefed', end: true }],
      },
    },
  },
  sam: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Sam',
        text: 'The deck? Tragic. I worked SO hard on it. I was home by six, honestly. Ask anyone.',
        choices: [
          { label: 'The badge log says 02:02.', to: 'b' },
          { label: 'Sure. We’ll talk again.', end: true },
        ],
      },
      b: {
        speaker: 'Sam',
        text: '...badges glitch all the time. You can’t prove a coffee run is sabotage, intern.',
        choices: [{ label: 'Noted.', setFlag: 'sam_defensive', end: true }],
      },
    },
  },
  dena: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Dena',
        text: 'Late? I left at five. But I heard the espresso machine running way past midnight. Only one person drinks doubles at 2 a.m.',
        choices: [{ label: 'Who?', to: 'b' }, { label: 'Thanks.', end: true }],
      },
      b: {
        speaker: 'Dena',
        text: 'Sam. Obviously Sam. They live on that machine.',
        choices: [{ label: 'Good to know.', setFlag: 'dena_pointed_sam', grantClue: 'coffee-ring', end: true }],
      },
    },
  },
  jay: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Jay',
        text: 'I just push code, I don’t do politics. Whiteboard got wiped though — the "DECK FINAL" line. Wasn’t me.',
        choices: [{ label: 'Appreciate it.', end: true }],
      },
    },
  },
  poncho: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Poncho',
        text: 'A USB? Yeah I left one in the dock, but mine’s labeled. That blank one isn’t mine. Don’t pin this on me.',
        choices: [{ label: 'Relax.', setFlag: 'poncho_denies_usb', end: true }],
      },
    },
  },
  ching: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Ching',
        text: 'Someone asked me to cover standup this morning. Left a note. I’m not saying who — but they sounded desperate.',
        choices: [{ label: 'Was it Sam?', to: 'b' }, { label: 'Hm.', end: true }],
      },
      b: {
        speaker: 'Ching',
        text: 'You said it, not me.',
        choices: [{ label: 'Right.', setFlag: 'ching_hint', grantClue: 'alibi-note', end: true }],
      },
    },
  },
  peem: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Peem',
        text: 'I was at the printer till late finishing mocks. Heard the shredder going in the nook. Loud. Angry, even.',
        choices: [{ label: 'Thanks, Peem.', end: true }],
      },
    },
  },
  jamie: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Jamie',
        text: 'I run the badge system. #D2 was the only after-hours entry. I already flagged it. You didn’t hear it from me.',
        choices: [{ label: 'I owe you one.', setFlag: 'jamie_badge_tip', grantClue: 'late-badge', end: true }],
      },
    },
  },
};

export const COLD_OPEN_CHARACTER = 'david';
