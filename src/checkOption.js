import { log } from './utils';
import {
  isNumeric,
  logStringWarning,
  getBound,
  isEntryAnimated,
} from './others';

/**
 * Check if an option is numeric (if not undefined);
 * fallback to a default value if not numeric or out of bounds.
 * @param {object} config Config object
 * @param {string} option Name of option to be checked
 * @param {number} defaultValue Default fallback value
 * @param {object} [params={}] Optional parameters
 * @param {number} [params.minBound] Optional minimum allowed value
 * @param {number} [params.maxBound] Optional maximum allowed value
 * @param {boolean} [params.allowString=false] Optional flag
 * to allow string representations of numbers
 * @param {string} [params.logOptionName] Optional custom option name for detailed log output
 * @returns {number} Cleared value
 */
const checkNumericOption = (
  config,
  option,
  defaultValue,
  params = {},
) => {
  const value = config[option];

  if (value === undefined || value === null) {
    return undefined;
  }

  const {
    minBound = undefined,
    maxBound = undefined,
    allowString = false,
    logOptionName = undefined,
  } = params;
  const displayOption = logOptionName || option;

  if (isNumeric(value, allowString)) {
    // log a warning in case of a string presentation of a number
    logStringWarning(value, displayOption);

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
  log(`Invalid option "${displayOption}": [${invalidValue}] (${errorDescr}); adjusting value to ${clearedValue}`);
  return clearedValue;
};

/**
 * Check if an option is integer;
 * fallback to a default value if not numeric or out of bounds;
 * round to an integer if needed.
 * @param {object} config Config object
 * @param {string} option Name of option to be checked
 * @param {number} defaultValue Default fallback value
 * @param {object} [params={}] Optional parameters
 * @param {number} [params.minBound] Optional minimum allowed value
 * @param {number} [params.maxBound] Optional maximum allowed value
 * @param {boolean} [params.allowString=false] Optional flag
 * to allow string representations of numbers
 * @param {string} [params.] Optional custom option name for detailed log output
 * @returns {number} Cleared value
 */
const checkIntegerOption = (
  config,
  option,
  defaultValue,
  params = {},
) => {
  const value = checkNumericOption(config, option, defaultValue, params);
  if (value !== undefined && !Number.isInteger(value)) {
    const roundedValue = Math.round(value) + 0; // prevent "-0" value
    const displayOption = params.logOptionName || option;
    log(`Invalid integer option "${displayOption}": [${value}]; rounding value to ${roundedValue}`);
    return roundedValue;
  }
  return value;
};

/**
 * Check if a bound option is valid (accounting for an optional "~" prefix).
 * @param {object} config Config object
 * @param {string} option Name of the option to be checked
 * @param {string} logOptionName Option name for detailed log output
* @returns {number|string|undefined} Cleared value in its original format, or undefined
 */
const checkBoundOption = (config, option, logOptionName) => {
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
        logStringWarning(value, logOptionName);
      }

      const cfg = { [option]: parsed.value };
      if (checkNumericOption(cfg, option, undefined, { logOptionName }) !== undefined) {
        return parsed.soft ? value : parsed.value;
      }
    }
  }

  // invalid type or value of the option
  const invalidValue = typeof value === 'object' ? JSON.stringify(value) : value;
  log(`Invalid option "${logOptionName}": [${invalidValue}] (not a numeric value); adjusting value to undefined`);
  return undefined;
};

/**
 * Check both upper/lower bounds for valid values.
 * @param {object} config Config object
 * @param {string} yAxis Y axis type (primary/secondary)
 * @returns {{
 *   lowerBound: string|number|undefined,
 *   upperBound: string|number|undefined
 * }} Cleared bounds
 */
const checkBounds = (config, yAxis) => {
  const lowerBound = checkBoundOption(
    config,
    'lower_bound',
    `${yAxis}.lower_bound`,
  );
  let upperBound = checkNumericOption(
    config,
    'upper_bound',
    undefined,
    { allowString: true, logOptionName: `${yAxis}.upper_bound` },
  );

  if (lowerBound !== undefined && upperBound !== undefined) {
    const cleanLowerBount = getBound(lowerBound).value;
    if (upperBound <= cleanLowerBount) {
      log(`Invalid lower & upper bounds: [${lowerBound}, ${upperBound}]; unsetting value of "upper_bound" to undefined`);
      upperBound = undefined;
    }
  }

  return { lowerBound, upperBound };
};

/* eslint-disable no-param-reassign */
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
    log(`Invalid option "${configName}.color_thresholds": expected a list; unsetting to []`);
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
          log(`Invalid option "${configName}.color_thresholds[${idx}]": "color" is missing or not a string; adjusting to "var(--primary-text-color)"`);
          color = 'var(--primary-text-color)';
        }

        if (value !== undefined && value !== null) {
          if (!isNumeric(value, true)) {
            log(`Invalid option "${configName}.color_thresholds[${idx}]": "value" is not a numeric value; unsetting to undefined`);
            value = undefined;
          } else {
            // log a warning in case of a string presentation of a number
            logStringWarning(value, `${configName}.color_thresholds[${idx}].value`);
            value = Number(value);
          }
        } else if (value === null) {
          log(`Invalid option "${configName}.color_thresholds[${idx}]": "value" is null, unsetting to undefined`);
          value = undefined;
        }

        return { color, value };
      }

      // other invalid content
      log(`Invalid option "${configName}.color_thresholds[${idx}]": expected an object or a color string; replacing with a default entry`);
      return { color: 'var(--primary-text-color)' };
    });
};
/* eslint-enable no-param-reassign */

/**
 * Warn if line_style is defined along with animate=true.
 * @param {object} config Config object
 */
const checkLineStyle = (config) => {
  config.entities.forEach((entity, index) => {
    if (isEntryAnimated(config, index)) {
      const hasLineStyle = (entity.line_style !== undefined && entity.line_style !== null)
        || (config.line_style !== undefined && config.line_style !== null);
      if (hasLineStyle) {
        log(`Option "entities[${index}].line_style" will be ignored because animation is enabled for it`);
      }
    }
  });
};

export {
  checkNumericOption,
  checkIntegerOption,
  checkBoundOption,
  checkBounds,
  checkColorThresholds,
  checkLineStyle,
};
