import {
  log,
  getStringifiedValue,
} from './utils';
import {
  isString, isNumber,
  isNumeric,
  logStringWarning,
  getBound,
  isEntryAnimated,
} from './others';

/**
 * Check if entities are properly defined.
 * @param {object} configEntities Config 'entities' object
 * @returns {void}
 */
const checkEntities = (configEntities) => {
  if (!Array.isArray(configEntities)) {
    const error = 'Please provide the "entities" option as a list';
    log(error);
    throw new Error(error);
  }

  configEntities.forEach((entityConfig, index) => {
    const isShorthandString = isString(entityConfig);
    const hasEntity = entityConfig
      && isString(entityConfig.entity);
    const hasStaticValue = entityConfig
      && entityConfig.static_value !== undefined
      && isNumeric(entityConfig.static_value);
    if (!isShorthandString && !hasEntity && !hasStaticValue) {
      const error = `Invalid configuration at index ${index}: Either "entity" or "static_value" must be specified`;
      log(error);
      throw new Error(error);
    }
  });
};

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
 * @returns {number|undefined} Cleared value, or undefined
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
  const invalidValue = getStringifiedValue(value);
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
 * @param {string} [params.logOptionName] Optional custom option name for detailed log output
 * @returns {number|undefined} Cleared value, or undefined
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
 * @returns {{ value: number, soft: boolean }|undefined} Cleared parsed value, or undefined
  */
const checkBoundOption = (config, option, logOptionName) => {
  const value = config[option];

  if (value === undefined || value === null) {
    return undefined;
  }

  // getBound() can handle wrong data types
  const parsed = getBound(value);
  if (parsed !== undefined) {
    // getBound() returns a valid numeric bound with a boolean 'soft' flag
    if (!parsed.soft && typeof value === 'string') {
      // check for a "string number"
      // log a warning in case of a string presentation of a number
      logStringWarning(value, logOptionName);
    }
    return parsed;
  }

  // invalid type or value of the option
  const invalidValue = getStringifiedValue(value);
  log(`Invalid option "${logOptionName}": [${invalidValue}] (not a numeric value); unsetting value to undefined`);
  return undefined;
};

/**
 * Check both upper/lower bounds for valid values.
 * @param {object} config Config object
 * @param {string} yAxis Y-axis type (primary/secondary)
 * @returns {{
 *   lowerBound: string|number|undefined,
 *   upperBound: string|number|undefined,
 *   lowerBoundParsed: { value: number, soft: boolean }|undefined,
 *   upperBoundParsed: { value: number, soft: boolean }|undefined,
 * }} Cleared bounds & their parsed components
 */
const checkBounds = (config, yAxis) => {
  const lowerBoundParsed = checkBoundOption(
    config,
    'lower_bound',
    `${yAxis}.lower_bound`,
  );
  let upperBoundParsed = checkBoundOption(
    config,
    'upper_bound',
    `${yAxis}.upper_bound`,
  );

  // merge value & soft into a proper string
  const formatBound = bound => (bound.soft ? `~${bound.value}` : bound.value);

  if (lowerBoundParsed !== undefined && upperBoundParsed !== undefined) {
    const cleanLowerBound = lowerBoundParsed.value;
    const cleanUpperBound = upperBoundParsed.value;
    if (cleanUpperBound <= cleanLowerBound) {
      log(`Invalid ${yAxis} lower & upper bounds: [${formatBound(lowerBoundParsed)}, ${formatBound(upperBoundParsed)}];`
        + ` unsetting value of "${yAxis}.upper_bound" to undefined`);
      upperBoundParsed = undefined;
    }
  }

  return {
    // lowerBound & upperBound are only used to update the config
    lowerBound: lowerBoundParsed && formatBound(lowerBoundParsed),
    upperBound: upperBoundParsed && formatBound(upperBoundParsed),
    // parsed objects are used to calcalate bounds
    lowerBoundParsed,
    upperBoundParsed,
  };
};

/* eslint-disable no-param-reassign */
/**
 * Check Y-axis labels option for a valid content.
 * @param {object} axisConfig Config object for Y-axis
 * @param {string} yAxis Y-axis type (primary/secondary)
 * @returns {void}
 */
const checkYAxisLabels = (axisConfig, yAxis) => {
  if (axisConfig) {
    const rawLabels = axisConfig.labels;
    if (Array.isArray(rawLabels)) {
      const oldLabels = [...axisConfig.labels];
      axisConfig.labels = rawLabels.filter(
        l => ['max', 'min', 'zero', 'all'].includes(l),
      );
      if (axisConfig.labels.length !== oldLabels.length) {
        log(`Option "y_axis.${yAxis}.labels": [${oldLabels}] reduced to [${axisConfig.labels}]`);
      }
    } else if (rawLabels !== undefined) {
      const invalidValue = getStringifiedValue(rawLabels);
      log(`Invalid option "y_axis.${yAxis}.labels": [${invalidValue}]; unsetting to undefined`);
      axisConfig.labels = undefined;
    }
  }
};
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
/**
 * Check color_thresholds array.
 * @param {object} config Config object containing color_thresholds
 * @param {string} configName Name of a config object
 * @returns {void}
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
    .map((threshold, index) => {
      if (typeof threshold === 'string') {
        return { color: threshold };
      }

      if (threshold && typeof threshold === 'object') {
        let { color, value } = threshold;

        if (color === undefined || typeof color !== 'string') {
          log(`Invalid option "${configName}.color_thresholds[${index}]": "color" is missing or not a string; adjusting to "var(--primary-text-color)"`);
          color = 'var(--primary-text-color)';
        }

        if (value !== undefined && value !== null) {
          if (!isNumeric(value, true)) {
            log(`Invalid option "${configName}.color_thresholds[${index}]": "value" is not a numeric value; unsetting to undefined`);
            value = undefined;
          } else {
            // log a warning in case of a string presentation of a number
            logStringWarning(value, `${configName}.color_thresholds[${index}].value`);
            value = Number(value);
          }
        } else if (value === null) {
          log(`Invalid option "${configName}.color_thresholds[${index}]": "value" is null, unsetting to undefined`);
          value = undefined;
        }

        return { color, value };
      }

      // other invalid content
      log(`Invalid option "${configName}.color_thresholds[${index}]": expected an object or a color string; replacing with a default entry`);
      return { color: 'var(--primary-text-color)' };
    });
};
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
/**
 * Check if state_map is properly defined.
 * @param {object} config Config object containing state_map
 * @param {string} configName Name of a config object
 * @returns {void}
 */
const checkStateMap = (config, configName) => {
  const stateMap = config.state_map;
  if (!Array.isArray(stateMap)) {
    const error = `Please provide the "${configName}.state_map" option as a list`;
    log(error);
    config.state_map = [];
    return;
  }

  const validEntries = [];
  stateMap.forEach((entry, index) => {
    const isShorthandString = isString(entry) || isNumber(entry);
    const hasValue = entry
      && (isString(entry.value) || isNumber(entry.value));
    if (!isShorthandString && !hasValue) {
      const error = `Invalid option "${configName}.state_map[${index}]": "value" must be specified`;
      log(error);
      return; // filter out wrong entries
    }
    // convert string values to objects
    if (isShorthandString) {
      validEntries.push({ value: String(entry), label: String(entry) });
    } else {
      // make sure a "value" is a string
      const value = String(entry.value);
      // make sure a "label" is set & a string
      let label;
      if (!entry.label) {
        label = value;
      } else if (!isString(entry.label) && !isNumber(entry.label)) {
        const error = `Invalid option "${configName}.state_map[${index}]": "label" must be a string`;
        log(error);
        label = value;
      } else {
        label = String(entry.label);
      }
      validEntries.push({ value, label });
    }
  });
  config.state_map = validEntries;
};
/* eslint-enable no-param-reassign */

/**
 * Warn if line_style is defined along with animate=true.
 * @param {object} config Config object
 * @returns {void}
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

/**
 * Check group_by option for a compatibility with hours_to_show
 * @param {object} config Config object
 * @returns {string} Cleared group_by value
 */
const checkGroupBy = (config) => {
  const { group_by: groupBy, hours_to_show: hoursToShow } = config;

  if (groupBy === null || groupBy === undefined) {
    log(`group_by is ${groupBy}, unsetting group_by to "interval"`);
    return 'interval';
  }
  if (groupBy === undefined) {
    return 'interval';
  }

  const logReset = (requiredUnit) => {
    log(`group_by "${groupBy}" requires hours_to_show to be a multiple of ${requiredUnit} `
      + `(current: ${hoursToShow}); unsetting group_by to "interval"`);
  };

  if (groupBy === 'week') {
    if (hoursToShow < 168 || hoursToShow % 168 !== 0) {
      logReset('168 (1 week)');
      return 'interval';
    }
  } else if (groupBy === 'date') {
    if (hoursToShow < 24 || hoursToShow % 24 !== 0) {
      logReset('24 (1 day)');
      return 'interval';
    }
  } else if (groupBy === 'hour') {
    if (hoursToShow < 1 || hoursToShow % 1 !== 0) {
      logReset('1 (1 hour)');
      return 'interval';
    }
  } else if (groupBy === '30min') {
    if (hoursToShow < 0.5 || hoursToShow % 0.5 !== 0) {
      logReset('0.5 (30 minutes)');
      return 'interval';
    }
  } else if (groupBy === '15min') {
    if (hoursToShow < 0.25 || hoursToShow % 0.25 !== 0) {
      logReset('0.25 (15 minutes)');
      return 'interval';
    }
  }

  return groupBy;
};

/**
 * Adjust points_per_hour value based on the group_by parameter
 * @param {object} config Config object
 * @returns {number} Possibly adjusted value of points_per_hour
 */
const checkPointsPerHour = (config) => {
  const prevPointsPerHour = config.points_per_hour;
  let newPointsPerHour = prevPointsPerHour;
  let pointsPerHourAdjusted = false;

  switch (config.group_by) {
    case 'week':
      newPointsPerHour = 1 / 24 / 7;
      pointsPerHourAdjusted = true;
      break;
    case 'date':
      newPointsPerHour = 1 / 24;
      pointsPerHourAdjusted = true;
      break;
    case 'hour':
      newPointsPerHour = 1;
      pointsPerHourAdjusted = true;
      break;
    case '30min':
      newPointsPerHour = 2;
      pointsPerHourAdjusted = true;
      break;
    case '15min':
      newPointsPerHour = 4;
      pointsPerHourAdjusted = true;
      break;
    default:
      break;
  }
  if (pointsPerHourAdjusted
    && Math.abs(newPointsPerHour - prevPointsPerHour) > 1e-7) {
    log(`group_by "${config.group_by}": points_per_hour ${prevPointsPerHour}; adjusting value to ${newPointsPerHour}`);
  }

  return newPointsPerHour;
};

/* eslint-disable no-param-reassign */
/**
 * Check the global card title config
 * @param {object} config Config object
 * @returns {void}
 */
const checkName = (config) => {
  if (config.name !== undefined && config.name !== null && typeof config.name !== 'object') {
    config.name = String(config.name);
  } else if (typeof config.name === 'object') {
    const invalidValue = getStringifiedValue(config.name);
    log(`Invalid option "name": [${invalidValue}]; unsetting value to undefined`);
    config.name = undefined;
  }
};
/* eslint-enable no-param-reassign */

export {
  checkEntities,
  checkNumericOption,
  checkIntegerOption,
  checkBoundOption,
  checkBounds,
  checkYAxisLabels,
  checkColorThresholds,
  checkStateMap,
  checkLineStyle,
  checkGroupBy,
  checkPointsPerHour,
  checkName,
};
