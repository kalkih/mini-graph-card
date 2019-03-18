const getMin = (arr, val) => arr.reduce((min, p) => (
  Number(p[val]) < Number(min[val]) ? p : min
), arr[0]);
const getMax = (arr, val) => arr.reduce((max, p) => (
  Number(p[val]) > Number(max[val]) ? p : max
), arr[0]);
const getTime = (date, extra) => date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', ...extra });
const getMilli = hours => (hours * 60 ** 2 * 10 ** 3);

export {
  getMin,
  getMax,
  getTime,
  getMilli,
};
