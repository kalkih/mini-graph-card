import type { StateMapType } from '../types/stateMapTypes';

export const STATE_MAP_NUMERIC_RELAXED: StateMapType = {
  keep_values: true,
  map: [
    { value: 123, label: 'Danger' },
  ],
};

export const STATE_MAP_NUMERIC_STRICT: StateMapType = {
  map: [
    { value: '54' },
    { value: '55' },
    { value: '456' },
  ],
};

export const STATE_MAP_STRINGS_STRICT: StateMapType = {
  map: [
    { value: 'off' },
    { value: 'on' },
    { value: '456' },
  ],
};
