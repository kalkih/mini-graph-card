/* eslint-disable import/prefer-default-export */

/**
 * The file contains functions which should be exposed for tests
 * and do not belong to other modules like "locale.js"
 */

import { log } from './utils';

/**
  * Return a multiplying factor (exponental or scale) based on a "value_factor" option
  * @param {object} config Card config
  * @param {number} index Index of an entity in config.entities
  * @returns {number} Multiplying factor
  */
const getFactor = (config, index = undefined) => {
  let value_factor;
  if (index >= 0 && config.entities[index] && config.entities[index].value_factor !== undefined) {
    // provided for a possible per-entity value_factor
    ({ value_factor } = config.entities[index]);
  } else if (index >= 0 && config.entities[index] && config.entities[index].y_axis === 'secondary'
    && config.value_factor_secondary !== undefined) {
    // use value_factor_secondary for entities with 'y_axis: secondary'
    value_factor = config.value_factor_secondary;
  } else if (index === -1 && config.value_factor_secondary !== undefined) {
    // use value_factor_secondary for secondary Y-axis labels
    value_factor = config.value_factor_secondary;
  } else {
    // use a global value_factor
    ({ value_factor } = config);
  }

  if (value_factor === undefined) {
    // fallback to a default factor
    return 1;
  }

  const getExponent = factor => 10 ** factor;
  const logValueFactor = factor_obj => log(`invalid value_factor: ${JSON.stringify(factor_obj)}`);

  if (typeof value_factor === 'object') {
    const { type, factor } = value_factor;
    if (type === undefined || factor === undefined
      || typeof type !== 'string' || typeof factor !== 'number') {
      // invalid options, fallback to a default factor
      logValueFactor(value_factor);
      return 1;
    }
    if (type === 'exponent') {
      return getExponent(factor);
    } else if (type === 'scale') {
      return factor;
    }
    // invalid 'type' option
    logValueFactor(value_factor);
    return 1;
  }

  if (typeof value_factor === 'number') {
    // use a legacy "exponent" way
    return getExponent(value_factor);
  }

  logValueFactor(value_factor);
  // fallback to a default factor
  return 1;
};

export {
  getFactor,
};
