// Tread Office — Motion primitives
// Re-exports easing/duration tokens and defines motion variants/distances
// for slam-cut, brutalist UI transitions.

import { easings, durations } from './tokens';

export { easings, durations };

export const slideDistances = {
  sm: 16,
  md: 40,
  lg: 240,
  xl: 480,
};

// Framer Motion variant: a sharp horizontal hit-shake used for impact feedback
// (e.g. invalid input, hostile event, slam confirmations).
export const hitShake = {
  initial: { x: 0 },
  animate: {
    x: [0, -6, 6, -3, 3, 0],
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

export default {
  easings,
  durations,
  slideDistances,
  hitShake,
};
