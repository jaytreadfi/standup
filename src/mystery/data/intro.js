/**
 * intro.js — the cinematic POV slideshow (modeAtom === 'INTRO').
 *
 * The intern's first-day DIARY, mapped to the 11 supplied illustrated POV stills
 * by actual image content. Chronological order; `key` resolves to a bundled URL
 * via introUrl() in data/scenes.js, `time` is the small on-screen clock label
 * (rendered separately, so captions carry no timestamp), `caption` is the
 * subtitle. First-person throughout; this is the happy first day before the
 * murder, so nothing reads as sinister.
 *
 * Player-facing copy: curly apostrophes/quotes only, zero em/en dashes.
 */

export const SLIDES = [
  {
    key: '01',
    time: '08:50',
    caption:
      'First day. I stood on the curb craning up at all that glass until my neck hurt, buses and a tuk-tuk rattling past. Twenty-five floors up is my first real job. I came early, obviously.',
  },
  {
    key: '02',
    time: '09:00',
    caption:
      'The badge they printed me just says GUEST, like the building isn’t sure about me yet. I tapped it to the reader and the light went green on the first try. Okay. It’s real.',
  },
  {
    key: '04',
    time: '09:30',
    caption:
      'David, who started the whole thing, reached clear across the table to shake my hand before I’d even sat down. I’d practiced something to say and forgot all of it. He just made it easy.',
  },
  {
    key: '05',
    time: '10:00',
    caption:
      'The whole team at one long desk. Peem handed me a coffee before I sat down, Jay grinning behind his sunglasses, Dena waving, and Poncho barely looked up from his screen, which somehow felt friendly too.',
  },
  {
    key: '06',
    time: '13:00',
    caption:
      'Lunch was katsu and rice and somebody’s miso, boxes everywhere, everyone talking over each other. They pulled me a chair without asking. I laughed so hard at Jay I forgot to be nervous.',
  },
  {
    key: '07',
    time: '16:10',
    caption:
      'So the famous cofounder is real. Yibo rolled in straight off the Singapore flight, red shirt, suitcase still rattling, holding up a duty-free bottle like a trophy. Looked completely wrecked. Beamed anyway.',
  },
  {
    key: '08',
    time: '18:30',
    caption:
      'Somehow it turned into a watch party, Japan vs Spain on the big screen. Yibo poured the whiskey round, David right beside him, the two of them catching up like no time had passed. I’ve been here one day and I was holding a glass too.',
  },
  {
    key: '10',
    time: '22:15',
    caption:
      'Jet lag finally won. Yibo waved goodnight from the closing elevator, off to his hotel, still smiling. We all called bye after him. I think he’d been awake about thirty hours.',
  },
  {
    key: '11',
    time: '22:30',
    caption:
      'Ching slipped over to the rainy glass, backpack already on, phone glowing TAXI BOOKED 2 MIN. She’s very good at leaving exactly when she wants to. A hand up, and she was gone before I could say bye.',
  },
  {
    key: '13',
    time: '23:30',
    caption:
      'I finally called it, late and useless and grinning about it. From the elevator the office was all dark windows and city light, just one person still hunched at a screen. My first day. I think I might belong here.',
  },
  {
    key: '14',
    time: '03:04',
    caption:
      'Woke up to my phone screaming on the nightstand. DAVID. Nine missed calls. He says come back now, come back, and his voice is all wrong, and I’m awake before I understand a word of it.',
  },
];
