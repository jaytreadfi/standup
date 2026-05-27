// Tread Office — Design Tokens
// Brutalist trading-terminal mystery game
// IBM Plex Mono, near-black canvas, single warm orange accent, sharp edges only.

export const colors = {
  canvas: '#0a0a0a',
  surface: '#0f0f0f',
  surface2: '#141414',
  border: '#262626',
  borderStrong: '#3a3a3a',
  accent: '#f57c3a',
  accentDim: '#7a3e1d',
  text: '#f4efe8',
  textDim: '#9a958f',
  textMuted: '#5e5b58',
  success: '#5fbf6e',
  warn: '#e8a23a',
  danger: '#e84a3a',
};

export const typography = {
  mono: '"IBM Plex Mono", ui-monospace, monospace',
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 24,
  display: 56,
  ghost: 720,
  weightRegular: 400,
  weightBold: 700,
  lineTight: 1.1,
  lineBase: 1.4,
  tracking: '0.04em',
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

export const radii = {
  none: 0,
};

export const borders = {
  thin: '1px solid #262626',
  accent: '1px solid #f57c3a',
  dashed: '1px dashed #3a3a3a',
  soft: '1px solid #1a1a1a',
};

export const layout = {
  gutterShell: 24,
};

export const dividers = {
  divider: '#1a1a1a',
};

export const easings = {
  slam: 'cubic-bezier(0.85, 0, 0.15, 1)',
  pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  quart: 'cubic-bezier(0.76, 0, 0.24, 1)',
  soft: 'cubic-bezier(0.2, 0, 0, 1)',
};

export const durations = {
  fast: 150,
  base: 250,
  slow: 450,
  flash: 180,
};

export const zIndex = {
  base: 0,
  hud: 10,
  mode: 20,
  overlay: 30,
  toast: 40,
  flash: 50,
};

export const tokens = {
  colors,
  typography,
  spacing,
  radii,
  borders,
  layout,
  dividers,
  easings,
  durations,
  zIndex,
};

export default tokens;
