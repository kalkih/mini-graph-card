/* eslint-disable no-bitwise */
import { compress as lzStringCompress, decompress as lzStringDecompress } from '@kalkih/lz-string';

const getMin = (arr, val) => arr.reduce((min, p) => (
  Number(p[val]) < Number(min[val]) ? p : min
), arr[0]);
const getAvg = (arr, val) => arr.reduce((sum, p) => (
  sum + Number(p[val])
), 0) / arr.length;
const getMax = (arr, val) => arr.reduce((max, p) => (
  Number(p[val]) > Number(max[val]) ? p : max
), arr[0]);
const getTime = (date, extra, locale = 'en-US') => date.toLocaleString(locale, { hour: 'numeric', minute: 'numeric', ...extra });
const getMilli = hours => hours * 60 ** 2 * 10 ** 3;

<<<<<<< HEAD
const interpolateColor = (a, b, factor) => {
  const ah = +a.replace('#', '0x');
  const ar = ah >> 16;
  const ag = (ah >> 8) & 0xff;
  const ab = ah & 0xff;
  const bh = +b.replace('#', '0x');
  const br = bh >> 16;
  const bg = (bh >> 8) & 0xff;
  const bb = bh & 0xff;
  const rr = ar + factor * (br - ar);
  const rg = ag + factor * (bg - ag);
  const rb = ab + factor * (bb - ab);

  return `#${(((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1)}`;
};

const rgb_hex = (component) => {
  const hex = Math.round(Math.min(Math.max(component, 0), 255)).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

const convertHex2Rgb = (hex) => {
  const hexstring = hex.replace('#', '');

  return [
    parseInt(hexstring.substring(0, 2), 16),
    parseInt(hexstring.substring(2, 4), 16),
    parseInt(hexstring.substring(4, 6), 16),
  ];
};

const convertRgb2Hex = rgb => `#${rgb_hex(rgb[0])}${rgb_hex(rgb[1])}${rgb_hex(rgb[2])}`;

=======
>>>>>>> 47edf8135a0af615143a5e6b8c7797ad1d2eba9d
const compress = data => lzStringCompress(JSON.stringify(data));

const decompress = data => (typeof data === 'string' ? JSON.parse(lzStringDecompress(data)) : data);

const getFirstDefinedItem = (...collection) => collection.find(item => typeof item !== 'undefined');

// eslint-disable-next-line max-len
const compareArray = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

const log = (message) => {
  // eslint-disable-next-line no-console
  console.warn('mini-graph-card: ', message);
};

export {
  getMin, getAvg, getMax, getTime, getMilli, compress, decompress, log,
  getFirstDefinedItem,
  compareArray,
  convertHex2Rgb, convertRgb2Hex,
};
