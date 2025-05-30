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

const compress = data => lzStringCompress(JSON.stringify(data));

const decompress = data => (typeof data === 'string' ? JSON.parse(lzStringDecompress(data)) : data);

const getFirstDefinedItem = (...collection) => collection.find(item => typeof item !== 'undefined');

// eslint-disable-next-line max-len
const compareArray = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

const log = (message) => {
  // eslint-disable-next-line no-console
  console.warn('mini-graph-card: ', message);
};

const getHour24 = (locale) => {
  const TimeFormat = {
    language: 'language',
    system: 'system',
    am_pm: '12',
    twenty_four: '24',
  };
  if ([TimeFormat.language, TimeFormat.system].includes(locale.time_format)) {
    const testLanguage = locale.time_format === TimeFormat.language
      ? locale.language
      : undefined;
    const test = new Date('January 1, 2020 22:00:00').toLocaleString(testLanguage);
    return !test.includes('10');
  }
  return locale.time_format === TimeFormat.twenty_four;
};

const getHourFormat = hour24 => (hour24 ? { hourCycle: 'h23' } : { hour12: true });

export {
  getMin, getAvg, getMax, getTime, getMilli, compress, decompress, log,
  getFirstDefinedItem,
  compareArray,
  getHourFormat, getHour24,
};
