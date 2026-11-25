import type { stateObjType } from '../types/stateObjType';

const STATE_OBJ_COMMON = {
  last_changed: "2026-11-01T12:00:00.000Z",
  last_updated: "2026-11-01T12:01:00.000Z",
  attributes: {
    abc: 456,
    status: 'on',
  },
};

export const STATE_OBJ_NUMERIC: stateObjType = {
  entity_id: 'sensor.xxx',
  state: '55',
  last_changed: STATE_OBJ_COMMON.last_changed,
  last_updated: STATE_OBJ_COMMON.last_updated,
  attributes: STATE_OBJ_COMMON.attributes,
};

export const STATE_OBJ_STRING: stateObjType = {
  entity_id: 'sensor.yyy',
  state: 'on',
  last_changed: STATE_OBJ_COMMON.last_changed,
  last_updated: STATE_OBJ_COMMON.last_updated,
  attributes: STATE_OBJ_COMMON.attributes,
};
