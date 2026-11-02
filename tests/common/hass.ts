export const hass = {
  states: {
    'sun.sun': {attributes: {}},
    'automation.test': {attributes: {}},
    'sensor.non_numerical': {attributes: {}},
    'sensor.numerical_1': {
      attributes: {
        unit_of_measurement: 'x',
      },
    },
    'sensor.numerical_2': {
      attributes: {
        state_class: 'measurement',
      },
    },
    'sensor.numerical_3': {
      attributes: {
        unit_of_measurement: 'x',
        state_class: 'measurement',
      },
    },
  },
};
