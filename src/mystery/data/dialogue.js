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
 * Tone: neo-noir. The authority figures (David, Dena) push "accident / Poncho";
 * the witnesses (Jay, Peem) and the red herrings (Ching, Poncho) hand you the
 * thread that leads home.
 */

export const dialogue = {
  david: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'David',
        text: 'You found them. Sam. Terrible thing — looks like a fall, the heart maybe. The building opens at six and I’d like this quiet and clean. Walk the floor, confirm it’s nothing, come back to me.',
        choices: [
          { label: '“Looks like a fall?”', to: 'b' },
          { label: '“I’ll walk it.”', end: true },
        ],
      },
      b: {
        speaker: 'David',
        text: 'People come apart under pressure. Poncho’s been unraveling for weeks — owed Sam money, the whole sad story. If you must find something, find it over there. Not in here.',
        choices: [
          { label: '“I’ll start where the evidence does.”', to: 'c', setFlag: 'david_steered' },
          { label: '“Understood.”', setFlag: 'david_steered', end: true },
        ],
      },
      c: {
        speaker: 'David',
        text: '...Careful, kid. Interns who go chasing ghosts at four in the morning don’t usually last the week. I’d hate for tonight to be your last good decision.',
        choices: [{ label: '“Noted.”', setFlag: 'david_threat', end: true }],
      },
    },
  },

  jay: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Jay',
        text: 'Couldn’t sleep, came back to push a fix. Heard David and Sam going at it in his office around midnight. Real venom — not a work thing. And David swore to everyone he left at twelve. He didn’t.',
        choices: [
          { label: '“About what?”', to: 'b' },
          { label: '“Thanks, Jay.”', grantClue: 'witness-argument', end: true },
        ],
      },
      b: {
        speaker: 'Jay',
        text: 'Couldn’t make out most of it through the glass. One phrase, though, loud enough to carry: “years ago.” Sam said it like a knife. David went very, very quiet after that.',
        choices: [{ label: '“Keep this between us.”', grantClue: 'witness-argument', setFlag: 'jay_witness', end: true }],
      },
    },
  },

  peem: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Peem',
        text: 'I was at the printer till late, finishing mocks. Around two I heard it — a thud out in the bullpen, then dead air. A minute later someone walked past, fast, to the elevator. Tall. Calm.',
        choices: [
          { label: '“Did you see who?”', to: 'b' },
          { label: '“Thanks, Peem.”', grantClue: 'earwitness-thud', end: true },
        ],
      },
      b: {
        speaker: 'Peem',
        text: 'Couldn’t see the face from the nook. But nobody walks calm away from a sound like that — unless they already knew exactly what it was.',
        choices: [{ label: '“Right.”', grantClue: 'earwitness-thud', end: true }],
      },
    },
  },

  dena: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Dena',
        text: 'It’s an accident. It has to be an accident. David said— ' + '...look at Poncho if you’re going to look at anyone. He’s the one who fell apart. Owed Sam money.',
        choices: [
          { label: '“David told you to say that.”', to: 'b' },
          { label: '“Maybe.”', setFlag: 'dena_steered', end: true },
        ],
      },
      b: {
        speaker: 'Dena',
        text: '...I just keep this place running. I moved a chair back. Rinsed a glass. He said it would help, that it was nothing. Oh God. What did I help with?',
        choices: [{ label: '“You cleaned a crime scene.”', setFlag: 'dena_tampered', end: true }],
      },
    },
  },

  poncho: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Poncho',
        text: 'The IOU? Yeah — I owed Sam, everyone knows. But we squared it last week. Sam tore the thing in half, said forget it. Why is everyone suddenly looking at me?',
        choices: [
          { label: '“Where were you at two?”', to: 'b' },
          { label: '“Easy. Breathe.”', setFlag: 'poncho_cleared', end: true },
        ],
      },
      b: {
        speaker: 'Poncho',
        text: 'Stuck in this elevator, signal-dead, since one. Check the maintenance call log if you don’t believe me. I’m a coward, man. Not a killer.',
        choices: [{ label: '“Okay. Sit tight.”', setFlag: 'poncho_cleared', end: true }],
      },
    },
  },

  ching: {
    start: 'a',
    nodes: {
      a: {
        speaker: 'Ching',
        text: 'I won’t pretend to grieve. Sam was bleeding me too — something personal, nothing you’d find in a file. But I was leaving tonight. Bag’s packed. There’s a cab booked for half four.',
        choices: [
          { label: '“Bleeding you how?”', to: 'b' },
          { label: '“Noted.”', grantClue: 'ching-motive', end: true },
        ],
      },
      b: {
        speaker: 'Ching',
        text: 'Doesn’t matter now, does it. I wanted out of this building, not out of a problem. There’s a difference, even if it doesn’t look like one from where you’re standing.',
        choices: [{ label: '“We’ll see.”', grantClue: 'ching-motive', setFlag: 'ching_motive', end: true }],
      },
    },
  },
};

export const COLD_OPEN_CHARACTER = 'david';
