const URL_DOCS = 'https://github.com/kalkih/mini-graph-card/blob/master/README.md';
const FONT_SIZE = 14;
const FONT_SIZE_HEADER = 14;
const MAX_BARS = 96;
const ICONS = {
  humidity: 'hass:water-percent',
  illuminance: 'hass:brightness-5',
  temperature: 'hass:thermometer',
  battery: 'hass:battery',
};
const DEFAULT_COLORS = ['var(--accent-color)', '#3498db', '#e74c3c', '#9b59b6', '#f1c40f', '#2ecc71'];
const UPDATE_PROPS = ['entity', 'line', 'length', 'fill', 'points', 'tooltip', 'abs'];
const DEFAULT_SHOW = {
  name: true,
  icon: true,
  state: true,
  graph: 'line',
  labels: 'hover',
  extrema: false,
  legend: true,
  fill: true,
  points: 'hover',
};

const X = 0;
const Y = 1;
const V = 2;

export {
  URL_DOCS,
  FONT_SIZE,
  FONT_SIZE_HEADER,
  MAX_BARS,
  ICONS,
  DEFAULT_COLORS,
  UPDATE_PROPS,
  DEFAULT_SHOW,
  X, Y, V,
};
