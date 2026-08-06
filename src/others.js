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

const getExponent = factor => 10 ** factor;

const logValueFactor = factor_obj => log(`invalid value_factor: [${JSON.stringify(factor_obj)}]`);

/**
  * Return a multiplying factor (exponental or scale) based on a "value_factor" option
  * @param {object} config Card config
  * @param {number} index Index of an entity in config.entities
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

  if (validIndex && config.entities[index].value_factor !== undefined) {
    // provided a per-entity value_factor
    ({ value_factor } = config.entities[index]);
  } else if (validIndex && config.entities[index].y_axis === 'secondary') {
    // use value_factor_secondary for entities with 'y_axis: secondary'
    // if value_factor_secondary = undefined, then later it will fallback to 1
    value_factor = config.value_factor_secondary;
  } else if (index === -1) {
    // use value_factor_secondary for secondary Y-axis labels
    // if value_factor_secondary = undefined, then later it will fallback to 1
    value_factor = config.value_factor_secondary;
  } else {
    // use a global value_factor
    ({ value_factor } = config);
  }

  if (value_factor === undefined || value_factor === null) {
    // fallback to a default factor
    return 1;
  }

  if (typeof value_factor === 'object') {
    const { type, factor } = value_factor;
    if (type === undefined || factor === undefined
      || typeof type !== 'string' || !isNumeric(factor, true)) {
      // invalid options, fallback to a default factor
      logValueFactor(value_factor);
      return 1;
    }
    if (type === 'exponent') {
      return getExponent(Number(factor));
    } else if (type === 'scale') {
      return Number(factor);
    }
    // invalid 'type' option
    logValueFactor(value_factor);
    return 1;
  }

  if (isNumeric(value_factor, true)) {
    // use a legacy "exponent" way
    return getExponent(Number(value_factor));
  }

  logValueFactor(value_factor);
  // fallback to a default factor
  return 1;
};

export {
  isNumeric,
  getFactor,
};
