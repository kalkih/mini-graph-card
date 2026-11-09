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

const getLog10 = value => Math.log10(Math.max(1, value));

const getMilli = hours => hours * 60 ** 2 * 10 ** 3;

const compress = data => lzStringCompress(JSON.stringify(data));

const decompress = data => (typeof data === 'string'
  ? JSON.parse(lzStringDecompress(data))
  : data);

const getFirstDefinedItem = (...collection) => collection
  .find(item => item !== undefined && item !== null);

const getStringifiedValue = value => (typeof value === 'object'
  ? JSON.stringify(value)
  : value);

const log = (message) => {
  // eslint-disable-next-line no-console
  console.warn('mini-graph-card: ', message);
};

/**
 * Render a string template by replacing ${variable} tokens with values.
 * Math operations are not supported in ${...}.
 * @param {string} template String containing ${variable} tokens
 * @param {object} vars Object containing variable key-value pairs
 * @returns {string} Rendered string
 */
const renderSimpleTemplate = (template, vars) => {
  if (typeof template !== 'string'
    || !template.includes('${')
    || !vars
    || typeof vars !== 'object') {
    return String(template); // return as is
  }
  return template.replace(
    /\$\{\s*(\w+)\s*\}/g,
    (match, key) => (vars[key] !== undefined ? vars[key] : match),
  );
};

export {
  getMin, getAvg, getMax,
  getLog10,
  getMilli,
  compress, decompress,
  log,
  getFirstDefinedItem,
  getStringifiedValue,
  renderSimpleTemplate,
};
