/* eslint-disable import/prefer-default-export */

/**
 * The file contains functions which should be exposed for tests
 * and do not belong to other modules like "locale.js"
 */

import { log } from './utils';

/**
  * Check if a value is a valid number
  * @param {any} value Value to be checked
  * @param {boolean} [allowString=false] Optional flag
  * to allow string representations of numbers (like "123")
  * @returns {boolean} True if value is a valid number, false - otherwise
  */
const isNumeric = (value, allowString = false) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return true;
  }
  if (allowString && typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      // empty string
      return false;
    }
    // try to convert a string to a number
    const num = Number(trimmed);
    return Number.isFinite(num);
  }
  return false;
};

/**
 * Log a warning if a configuration numeric value is passed as a string.
 * @param {any} value Value to check
 * @param {string} option Name of the option for the log message
 */
const logStringWarning = (value, option) => {
  if (typeof value === 'string') {
    log(`Warning for option "${option}": [${value}] is configured as a string; please make it a number`);
  }
};

/**
  * Return a multiplying factor (exponential or scale) based on a "value_factor" option
  * @param {object} config Card config
  * @param {number} [index] Index of an entity in config.entities
  * (`undefined` stands for a primary Y-axis, `-1` - for a secondary Y-axis)
  * @returns {number} Multiplying factor
  */
const getFactor = (config, index = undefined) => {
  if (!config) {
    // fallback to a default factor
    return 1;
  }

  let value_factor;
  const validIndex = typeof index === 'number'
    && index >= 0
    && Array.isArray(config.entities)
    && config.entities[index];

  let yAxis;
  if (validIndex && config.entities[index].value_factor !== undefined) {
    // provided a per-entity value_factor
    ({ value_factor } = config.entities[index]);
  } else if (validIndex && config.entities[index].y_axis === 'secondary') {
    // use value_factor for secondary Y-axis labels for entities with 'y_axis: secondary'
    // if value_factor = undefined, then later it will fallback to 1
    value_factor = config.y_axis && config.y_axis.secondary && config.y_axis.secondary.value_factor;
    yAxis = 'secondary';
  } else if (index === -1) {
    // use value_factor for secondary Y-axis labels
    // if value_factor = undefined, then later it will fallback to 1
    value_factor = config.y_axis && config.y_axis.secondary && config.y_axis.secondary.value_factor;
    yAxis = 'secondary';
  } else {
    // use value_factor for primary Y-axis labels
    value_factor = config.y_axis && config.y_axis.primary && config.y_axis.primary.value_factor;
    yAxis = 'primary';
  }

  if (value_factor === undefined || value_factor === null) {
    // fallback to a default factor
    return 1;
  }

  const displayOption = yAxis
    ? `${yAxis}.value_factor`
    : `entities[${index}].value_factor`;

  const getExponent = factor => 10 ** factor;
  const logInvalidValueFactor = factor_obj => log(`invalid "${displayOption}": [${JSON.stringify(factor_obj)}]`);

  if (typeof value_factor === 'object') {
    const { type, factor } = value_factor;
    if (type === undefined || factor === undefined
      || typeof type !== 'string' || !isNumeric(factor, true)) {
      // invalid options, fallback to a default factor
      logInvalidValueFactor(value_factor);
      return 1;
    }
    if (type === 'exponent' || type === 'scale') {
      // log a warning in case of a string presentation of a number
      logStringWarning(factor, displayOption);
      switch (type) {
        case 'exponent':
          return getExponent(Number(factor));
        default: // scale
          return Number(factor);
      }
    }
    // invalid 'type' option
    logInvalidValueFactor(value_factor);
    return 1;
  }

  if (isNumeric(value_factor, true)) {
    // log a warning in case of a string presentation of a number
    logStringWarning(value_factor, displayOption);
    // use a legacy "exponent" way
    return getExponent(Number(value_factor));
  }

  logInvalidValueFactor(value_factor);
  // fallback to a default factor
  return 1;
};

/**
  * Parse a bound value accounting for an optional "~" prefix.
  * @param {number|string} bound Bound with a possible "~" prefix
  * @returns {{value: number, soft: boolean}|undefined} Parsed value
  */
const getBound = (bound) => {
  if (bound === undefined || bound === null || typeof bound === 'object') {
    return undefined;
  }

  const strBound = String(bound).trim();
  if (strBound.startsWith('~')) {
    // soft bound
    const value = strBound.slice(1);
    if (isNumeric(value, true)) {
      return {
        value: Number(value),
        soft: true,
      };
    }
    return undefined;
  }

  // fixed bound
  if (isNumeric(strBound, true)) {
    return {
      value: Number(strBound),
      soft: false,
    };
  }
  return undefined;
};

/**
 * Checks if animation is enabled for a specific entry in config.entities.
 * @param {object} config Config object
 * @param {number} index Index of an entry in config.entities
 * @returns {boolean} True if animated, false - otherwise
 */
const isEntryAnimated = (config, index) => {
  const entryConf = config.entities && config.entities[index];
  if (entryConf && entryConf.animate !== undefined && entryConf.animate !== null) {
    return entryConf.animate === true;
  }
  return config.animate === true;
};

export {
  isNumeric,
  logStringWarning,
  getFactor,
  getBound,
  isEntryAnimated,
};
