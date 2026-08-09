import {
  URL_DOCS,
  STATISTICS_PERIODS,
  STATISTICS_TYPES,
  DEFAULT_STATISTICS_TYPE,
} from './const';
import { log } from './utils';
import {
  isNumeric,
  logStringWarning,
  getBound,
} from './others';

/**
 * Check if an option is numeric (if not undefined);
 * fallback to a default value if not numeric or out of bounds.
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
    // log a warning in case of a string presentation of a number
    logStringWarning(value, option);

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
 * round to an integer if needed.
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
 * Check if a bound option is valid (accounting for an optional "~" prefix).
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
        // check for a "string number" since this will not be cleared below
        // log a warning in case of a string presentation of a number
        logStringWarning(value, option);
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
 * Check both upper/lower bounds for valid values.
 * @param {object} config Config object
 * @returns {{
 *   lowerBound: string|number|undefined,
 *   upperBound: string|number|undefined
 * }} Cleared bounds
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

/**
 * Check color_thresholds array.
 * @param {object} config Config object containing color_thresholds
 * @param {string} configName Name of a config object
 */
const checkColorThresholds = (config, configName) => {
  const thresholds = config.color_thresholds;

  if (thresholds === undefined || thresholds === null) {
    // color_thresholds not defined
    return;
  }

  if (!Array.isArray(thresholds)) {
    // color_thresholds not a list
    log(`Invalid option ${configName}.color_thresholds: expected a list; unsetting to []`);
    config.color_thresholds = [];
    return;
  }

  config.color_thresholds = thresholds
    .map((threshold, idx) => {
      if (typeof threshold === 'string') {
        return { color: threshold };
      }

      if (threshold && typeof threshold === 'object') {
        let { color, value } = threshold;

        if (color === undefined || typeof color !== 'string') {
          log(`Invalid option ${configName}.color_thresholds[${idx}]: "color" is missing or not a string; adjusting to "var(--primary-text-color)"`);
          color = 'var(--primary-text-color)';
        }

        if (value !== undefined && value !== null) {
          if (!isNumeric(value, true)) {
            log(`Invalid option ${configName}.color_thresholds[${idx}]: "value" is not a numeric value; unsetting to undefined`);
            value = undefined;
          } else {
            // log a warning in case of a string presentation of a number
            logStringWarning(value, `${configName}.color_thresholds[${idx}].value`);
            value = Number(value);
          }
        } else if (value === null) {
          log(`Invalid option ${configName}.color_thresholds[${idx}]: "value" is null, unsetting to undefined`);
          value = undefined;
        }

        return { color, value };
      }

      // other invalid content
      log(`Invalid option ${configName}.color_thresholds[${idx}]: expected an object or color string; replacing with a default entry`);
      return { color: 'var(--primary-text-color)' };
    });
};


/**
 * Check the `statistics` option (may be set per entity or card-wide);
 * `true` is a shorthand for the defaults.
 * @param {object} config Config object
 * @param {number} index Index of an entity
 */
/* eslint-disable no-param-reassign */
const checkStatistics = (config, index) => {
  const entity = config.entities[index];
  const stats = entity.statistics !== undefined ? entity.statistics : config.statistics;

  if (stats === undefined || stats === false) {
    delete entity.statistics;
    return;
  }

  // Statistics are numeric aggregates of a state: no attribute to read,
  // no non-numeric state to map. Fall back to a raw history.
  const incompatible = (entity.attribute !== undefined && 'attribute')
    || (Array.isArray(config.state_map) && config.state_map.length > 0 && 'state_map');
  if (incompatible) {
    log(`Option statistics of entities[${index}] is not compatible with ${incompatible}; ignoring statistics and reading raw history instead`);
    delete entity.statistics;
    return;
  }

  const opts = stats === true ? {} : stats;
  if (typeof opts !== 'object' || Array.isArray(opts))
    throw new Error(`"statistics" must be a boolean or an object.\n See ${URL_DOCS}`);
  if (opts.period !== undefined && !STATISTICS_PERIODS.includes(opts.period))
    throw new Error(`"statistics.period" must be one of ${STATISTICS_PERIODS.join(', ')}.\n See ${URL_DOCS}`);
  if (opts.type !== undefined && !STATISTICS_TYPES.includes(opts.type))
    throw new Error(`"statistics.type" must be one of ${STATISTICS_TYPES.join(', ')}.\n See ${URL_DOCS}`);

  entity.statistics = { type: DEFAULT_STATISTICS_TYPE, ...opts };
};
/* eslint-enable no-param-reassign */

export {
  checkStatistics,
  checkNumericOption,
  checkIntegerOption,
  checkBoundOption,
  checkBounds,
  checkColorThresholds,
};
