/* eslint-disable no-bitwise */
const getMin = (arr, val) => arr.reduce((min, p) => (
  Number(p[val]) < Number(min[val]) ? p : min
), arr[0]);
const getMax = (arr, val) => arr.reduce((max, p) => (
  Number(p[val]) > Number(max[val]) ? p : max
), arr[0]);
const getTime = (date, extra, locale = 'en-US') => date.toLocaleString(locale, { hour: 'numeric', minute: 'numeric', ...extra });
const getMilli = hours => (hours * 60 ** 2 * 10 ** 3);

const interpolateColor = (a, b, factor) => {
  const ah = +a.replace('#', '0x');
  const ar = ah >> 16;
  const ag = ah >> 8 & 0xff;
  const ab = ah & 0xff;
  const bh = +b.replace('#', '0x');
  const br = bh >> 16;
  const bg = bh >> 8 & 0xff;
  const bb = bh & 0xff;
  const rr = ar + factor * (br - ar);
  const rg = ag + factor * (bg - ag);
  const rb = ab + factor * (bb - ab);

  return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1)}`;
};

export {
  getMin,
  getMax,
  getTime,
  getMilli,
  interpolateColor,
};
