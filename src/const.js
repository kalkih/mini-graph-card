const MAX_BARS = 96;
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_FONT_SIZE_HEADER = 14;
const DEFAULT_BAR_SPACING = 4;
const DEFAULT_GRAPH_HEIGHT = 100;
const GRAPH_WIDTH = 500; // width of the graph's SVG coordinate system
const DEFAULT_MARGIN = 5;
const DEFAULT_HOURS_TO_SHOW = 24;
const DEFAULT_POINTS_PER_HOUR = 0.5;
const DEFAULT_STATIC_VALUE_LABEL_OFFSET = 20; // in %
const NBSP = '\u00A0';
const DEFAULT_COLORS = [
  'var(--accent-color)',
  '#3498db',
  '#e74c3c',
  '#9b59b6',
  '#f1c40f',
  '#2ecc71',
  '#1abc9c',
  '#34495e',
  '#e67e22',
  '#7f8c8d',
  '#27ae60',
  '#2980b9',
  '#8e44ad',
];
const DEFAULT_SHOW = {
  name: true,
  icon: true,
  state: true,
  graph: 'line',
  labels: 'hover',
  labels_secondary: 'hover',
  extrema: false,
  legend: true,
  fill: true,
  points: 'hover',
};

const X = 0;
const Y = 1;
const V = 2;
const ONE_HOUR = 1000 * 3600;

export {
  MAX_BARS,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_SIZE_HEADER,
  DEFAULT_BAR_SPACING,
  DEFAULT_GRAPH_HEIGHT,
  GRAPH_WIDTH,
  DEFAULT_MARGIN,
  DEFAULT_HOURS_TO_SHOW,
  DEFAULT_POINTS_PER_HOUR,
  DEFAULT_STATIC_VALUE_LABEL_OFFSET,
  NBSP,
  DEFAULT_COLORS,
  DEFAULT_SHOW,
  X,
  Y,
  V,
  ONE_HOUR,
};
