/**
 * Find an object with the minimum or maximum numeric 'state' value.
 * @param {Array<Object>} arr Array of objects
 * @param {'min'|'max'} type Type of extrema to find
 * @returns {Object} Object with a minimum or maximum  numeric 'state' value,
 * or an empty object if the source array does not contain numeric 'state' values
 */
const getExtrema = (arr, type) => {
  if (!arr || !arr.length) {
    return {};
  }
  return arr.reduce((extremeObj, currObj) => {
    const currValue = parseFloat(currObj.state);
    if (Number.isNaN(currValue)) {
      return extremeObj;
    }
    const extremaValue = parseFloat(extremeObj.state);
    if (Number.isNaN(extremaValue)) {
      return currObj;
    }
    const isNewExtremaFound = type === 'min'
      ? currValue < extremaValue
      : currValue > extremaValue;
    return isNewExtremaFound
      ? currObj
      : extremeObj;
  }, {});
};

/**
 * Calculate a sum of 'state' values.
 * @param {Array<Object>} arr Array of objects
 * @returns {{sum: number|undefined, count: number}|{}} Object containing a sum
 * of numeric 'state' values
 * and a count of objects with numeric 'state' values,
 * or an empty object if the source array does not contain numeric 'state' values
 */
const getSum = (arr) => {
  if (!arr || !arr.length) {
    return { sum: undefined, count: 0 };
  }
  return arr.reduce((accum, currObj) => {
    const currValue = parseFloat(currObj.state);
    if (Number.isNaN(currValue)) {
      return accum;
    }
    const currentSum = accum.sum === undefined
      ? 0
      : accum.sum;
    return {
      sum: currentSum + currValue,
      count: accum.count + 1,
    };
  }, { sum: undefined, count: 0 });
};

/**
 * Calculate an average value of 'state' values.
 * @param {Array<Object>} arr Array of objects
 * @returns {number} Average numeric 'state' value,
 * or NaN if the source array does not contain numeric 'state' values
 */
const getAvg = (arr) => {
  if (!arr || !arr.length) {
    return NaN;
  }
  const result = getSum(arr);
  if (result.sum === undefined || result.count === 0) {
    return NaN;
  }
  return result.sum / result.count;
};

const maximum = (arr) => {
  const maxValue = getExtrema(arr, 'max').state;
  return maxValue === undefined
    ? NaN
    : parseFloat(maxValue);
};

const minimum = (arr) => {
  const minValue = getExtrema(arr, 'min').state;
  return minValue === undefined
    ? NaN
    : parseFloat(minValue);
};

const median = (arr) => {
  if (!arr || !arr.length) {
    return NaN;
  }
  const numbersArrSorted = arr
    .map(item => parseFloat(item.state))
    .filter(val => !Number.isNaN(val)) // remove NaNs
    .sort((a, b) => a - b);
  if (!numbersArrSorted.length) {
    return NaN;
  }
  const mid = Math.floor(numbersArrSorted.length / 2);
  if (numbersArrSorted.length % 2 === 1) {
    return numbersArrSorted[mid];
  }
  return (numbersArrSorted[mid - 1] + numbersArrSorted[mid]) / 2;
};

const first = (arr) => {
  if (!arr || !arr.length) {
    return NaN;
  }
  return parseFloat(arr[0].state);
};

const last = (arr) => {
  if (!arr || !arr.length) {
    return NaN;
  }
  return parseFloat(arr[arr.length - 1].state);
};

const sum = (arr) => {
  const sumValue = getSum(arr).sum;
  if (sumValue === undefined) {
    return NaN;
  }
  return sumValue;
};

const delta = (arr) => {
  const maxValue = maximum(arr);
  const minValue = minimum(arr);
  if (Number.isNaN(maxValue) || Number.isNaN(minValue)) {
    return NaN;
  }
  return maxValue - minValue;
};

const diff = (arr) => {
  const lastValue = last(arr);
  const firstValue = first(arr);
  if (Number.isNaN(lastValue) || Number.isNaN(firstValue)) {
    return NaN;
  }
  return lastValue - firstValue;
};

const aggregateFuncMap = {
  avg: getAvg,
  median,
  max: maximum,
  min: minimum,
  first,
  last,
  sum,
  delta,
  diff,
};

export {
  aggregateFuncMap,
  getExtrema,
  getAvg,
};
