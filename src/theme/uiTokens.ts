// uiTokens — single source of truth for Neighborhood Watch UI styling.
// Sourced from the style sheet mockup (mockups/style sheet.png).
// Import these from anywhere instead of hard-coding hex values per file.

export const NW = {
  // Backgrounds
  bgInk: '#03050c',
  bgDeep: '#07101d',
  bgNight: '#0a0f14',
  panel: '#101b29',
  panelSoft: '#152336',

  // Accents
  blue: '#1e90ff',
  blueLight: '#a8c8ff',
  cyan: '#29b8ff',
  moon: '#e6e6e6',
  gold: '#ffc107',
  window: '#ffb84d',

  // Semantic
  success: '#2ecc71',
  warning: '#ff8a00',
  danger: '#ff3b30',

  // Text
  text: '#f3f6fb',
  textMuted: '#a8b6c8',
  textDim: '#6b7790',

  // Borders / strokes
  stroke: 'rgba(138,191,255,0.38)',
  strokeSoft: 'rgba(138,191,255,0.22)',
  strokeChrome: 'rgba(255,255,255,0.10)',

  // Radii
  radSm: 10,
  radMd: 16,
  radLg: 24,
  radPill: 999,

  // Letter spacing (heading uppercase reads like the mockup)
  trackedHeading: 2,
  trackedLabel: 1.5,
};

export default NW;
