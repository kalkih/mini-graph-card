// Functions to migrate a legacy config to the latest config

import { log } from './utils';

/**
 * Migrate legacy options to the new y_axis structure.
 * @param {object} config Config object
 * @returns {object} Updated config object with y_axis
 */
const migrateYaxisConfig = (config) => {
  const conf = JSON.parse(JSON.stringify(config));

  // [ 'legacy_old_key', 'axis', 'new_key' ]
  const migrations = [
    // primary
    ['lower_bound', 'primary', 'lower_bound'],
    ['upper_bound', 'primary', 'upper_bound'],
    ['min_bound_range', 'primary', 'min_bound_range'],
    ['decimals_primary_labels', 'primary', 'decimals'],
    ['value_factor', 'primary', 'value_factor'],
    // secondary
    ['lower_bound_secondary', 'secondary', 'lower_bound'],
    ['upper_bound_secondary', 'secondary', 'upper_bound'],
    ['min_bound_range_secondary', 'secondary', 'min_bound_range'],
    ['decimals_secondary_labels', 'secondary', 'decimals'],
    ['value_factor_secondary', 'secondary', 'value_factor'],
  ];

  migrations.forEach(([oldKey, axis, newKey]) => {
    const oldValue = conf[oldKey];

    // check if the legacy option is present in config
    if (oldValue !== undefined) {
      if (oldValue !== null) {
        // check if the option is already defined in the new y_axis object
        const hasNewValue = conf.y_axis
          && conf.y_axis[axis]
          && conf.y_axis[axis][newKey] !== undefined
          && conf.y_axis[axis][newKey] !== null;

        if (!hasNewValue) {
          // new option is missing

          // create empty object if it was not created yet
          if (!conf.y_axis) {
            conf.y_axis = {};
          }
          if (!conf.y_axis[axis]) {
            conf.y_axis[axis] = {};
          }
          // copy a value
          conf.y_axis[axis][newKey] = oldValue;

          log(`option "${oldKey}" is deprecated and has been automatically migrated. `
            + `Please update your YAML configuration to "y_axis.${axis}.${newKey}"`);
        } else {
          // new option is also present
          // legacy option is ignored in favor of the new option
          log(`option "${oldKey}" is ignored `
            + `because you have already configured "y_axis.${axis}.${newKey}". Please remove "${oldKey}" from your YAML`);
        }
      }
      // remove old option
      delete conf[oldKey];
    }
  });

  return conf;
};

/**
 * Migrate legacy state_map array option to the new object structure.
 * @param {object} config Config object containing state_map
 * @returns {object} Updated config object
 */
const migrateStateMapConfig = (config) => {
  let newConfig = { ...config };

  if (config.state_map !== undefined && config.state_map !== null) {
    // "state_map" is defined
    if (Array.isArray(config.state_map)) {
      // state_map -> state_map.map
      newConfig.state_map = { map: config.state_map };
    } else if (typeof config.state_map === 'object') {
      const { map, keep_values } = config.state_map;
      // map is copied as is
      newConfig.state_map = { map: map || []};
      if (keep_values !== undefined) {
        // keep_values is copied as is
        newConfig.state_map.keep_values = keep_values;
      }
      // only map & keep_values are copied
      // inner structure is to be checked in checkStateMap()
    } else {
      // wrong structure of "state_map"
      newConfig.state_map = { map: [] };
    }
  } else {
    // "state_map" is not defined
    newConfig.state_map = { map: [] };
  }

  return newConfig;
};

export {
  migrateYaxisConfig,
  migrateStateMapConfig,
};
