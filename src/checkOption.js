import { log } from './utils';
import { isNumeric } from './others';

/**
 * Check if an option is numeric (if not undefined);
 * fallback to a default value if not numeric or out of bounds
 * @param {object} config Config object
 * @param {string} option Name of option to be checked
 * @param {number} defaultValue Default fallback value
 * @param {number} minBound Optional minimum allowed value
 * @param {number} maxBound Optional maximum allowed value
 * @returns {number} Cleared value
 */
const checkNumericOption = (
  config,
  option,
  defaultValue,
  minBound = undefined,
  maxBound = undefined,
) => {
  const value = config[option];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (isNumeric(value)) {
    const isMinValid = minBound === undefined || value >= minBound;
    const isMaxValid = maxBound === undefined || value <= maxBound;
    if (isMinValid && isMaxValid) {
      return value;
    }
  }

  const clearedValue = defaultValue;
  const invalidValue = typeof value === 'object'
    ? JSON.stringify(value)
    : value;
  let errorDescr = 'not a numeric value';
  if (isNumeric(value)) {
    if (minBound !== undefined && value < minBound) {
      errorDescr = `out of bounds, minimum allowed: ${minBound}`;
    } else if (maxBound !== undefined && value > maxBound) {
      errorDescr = `out of bounds, maximum allowed: ${maxBound}`;
    }
  }
  log(`Invalid option ${option}: [${invalidValue}] (${errorDescr}); adjusting value to ${clearedValue}`);
  return clearedValue;
};

/**
 * Check if an option is integer;
 * fallback to a default value if not numeric or out of bounds;
 * round to an integer if needed
 * @param {object} config Config object
 * @param {string} option Name of option to be checked
 * @param {number} defaultValue Default fallback value
 * @param {number} minBound Optional minimum allowed value
 * @param {number} maxBound Optional maximum allowed value
 * @returns {number} Cleared value
 */
const checkIntegerOption = (
  config,
  option,
  defaultValue,
  minBound = undefined,
  maxBound = undefined,
) => {
  const value = checkNumericOption(config, option, defaultValue, minBound, maxBound);
  if (value !== undefined && !Number.isInteger(value)) {
    const roundedValue = Math.round(value) + 0; // prevent "-0" value
    log(`Invalid integer option ${option}: [${value}]; rounding value to ${roundedValue}`);
    return roundedValue;
  }
  return value;
};

export {
  checkNumericOption,
  checkIntegerOption,
};
