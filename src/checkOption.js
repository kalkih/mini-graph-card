import { log } from './utils';
import { isNumeric, getBound } from './others';

/**
 * Check if an option is numeric (if not undefined);
 * fallback to a default value if not numeric or out of bounds
 * @param {object} config Config object
 * @param {string} option Name of option to be checked
 * @param {number} defaultValue Default fallback value
 * @param {number} minBound Optional minimum allowed value
 * @param {number} maxBound Optional maximum allowed value
 * @param {boolean} [allowString=false] Optional flag
 * to allow string representations of numbers (like "123")
 * @returns {number} Cleared value
 */
const checkNumericOption = (
  config,
  option,
  defaultValue,
  minBound = undefined,
  maxBound = undefined,
  allowString = false,
) => {
  const value = config[option];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (isNumeric(value, allowString)) {
    if (typeof value === 'string') {
      log(`Warning for option ${option}: [${value}] is configured as a string; please make it a number`);
    }

    const valueNumeric = Number(value);
    const isMinValid = minBound === undefined || valueNumeric >= minBound;
    const isMaxValid = maxBound === undefined || valueNumeric <= maxBound;
    if (isMinValid && isMaxValid) {
      return valueNumeric; // return type 'number'
    }
  }

  const clearedValue = defaultValue;
  const invalidValue = typeof value === 'object'
    ? JSON.stringify(value)
    : value;
  let errorDescr = 'not a numeric value';
  if (isNumeric(value, allowString)) {
    const valueNumeric = Number(value);
    if (minBound !== undefined && valueNumeric < minBound) {
      errorDescr = `out of bounds, minimum allowed: ${minBound}`;
    } else if (maxBound !== undefined && valueNumeric > maxBound) {
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
 * @param {boolean} [allowString=false] Optional flag
 * to allow string representations of numbers (like "123")
 * @returns {number} Cleared value
 */
const checkIntegerOption = (
  config,
  option,
  defaultValue,
  minBound = undefined,
  maxBound = undefined,
  allowString = false,
) => {
  const value = checkNumericOption(config, option, defaultValue, minBound, maxBound, allowString);
  if (value !== undefined && !Number.isInteger(value)) {
    const roundedValue = Math.round(value) + 0; // prevent "-0" value
    log(`Invalid integer option ${option}: [${value}]; rounding value to ${roundedValue}`);
    return roundedValue;
  }
  return value;
};

/**
 * "Check if a bound option is valid (accounting for an optional "~" prefix).
 * @param {object} config Config object
 * @param {string} option Name of the option to be checked
 * @returns {number|string|undefined} Cleared value in its original format, or undefined
 */
const checkBoundOption = (config, option) => {
  const value = config[option];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = getBound(value);
    if (parsed !== undefined && isNumeric(parsed.value)) {
      if (!parsed.soft && typeof value === 'string') {
        log(`Warning for option ${option}: [${value}] is configured as a string; please make it a number`);
      }

      const cfg = { [option]: parsed.value };
      if (checkNumericOption(cfg, option, undefined) !== undefined) {
        return parsed.soft ? value : parsed.value;
      }
    }
  }

  // invalid type or value of the option
  const invalidValue = typeof value === 'object' ? JSON.stringify(value) : value;
  log(`Invalid option ${option}: [${invalidValue}] (not a numeric value); adjusting value to undefined`);
  return undefined;
};

/**
 * Check both upper/lower bounds for valid values
 * @param {object} config Config object
 * @returns {{lowerBound: string|number|undefined, upperBound: string|number|undefined}} Cleared
 * bounds
 */
const checkBounds = (config) => {
  const lowerBound = checkBoundOption(config, 'lower_bound');
  let upperBound = checkNumericOption(
    config,
    'upper_bound',
    undefined,
    undefined,
    undefined,
    true, // allowString
  );

  if (lowerBound !== undefined && upperBound !== undefined) {
    const cleanLowerBount = getBound(lowerBound).value;
    if (upperBound <= cleanLowerBount) {
      log(`Invalid lower & upper bounds: [${lowerBound}, ${upperBound}]; unsetting value of upper_bound to undefined`);
      upperBound = undefined;
    }
  }

  return { lowerBound, upperBound };
};

export {
  checkNumericOption,
  checkIntegerOption,
  checkBoundOption,
  checkBounds,
};
