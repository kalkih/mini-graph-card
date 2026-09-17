import { compress as lzStringCompress, decompress as lzStringDecompress } from '@kalkih/lz-string';

const getMin = (arr, val) => arr.reduce((min, p) => (
  Number(p[val]) < Number(min[val]) ? p : min
), arr[0]);
const getAvg = (arr, val) => arr.reduce((sum, p) => (
  sum + Number(p[val])
), 0) / arr.length;
const getMax = (arr, val) => arr.reduce((max, p) => (
  Number(p[val]) > Number(max[val]) ? p : max
), arr[0]);

const getMilli = hours => hours * 60 ** 2 * 10 ** 3;

const compress = data => lzStringCompress(JSON.stringify(data));

const decompress = data => (typeof data === 'string' ? JSON.parse(lzStringDecompress(data)) : data);

const getFirstDefinedItem = (...collection) => collection
  .find(item => item !== undefined && item !== null);

// hass.formatEntityName only accepts a card's `name` option (a user string, a
// structured name, or undefined) from HA 2026.4. Earlier versions expose the
// same helper with an incompatible signature, so feature detection is not
// enough - the version has to be checked.
const supportsEntityNames = (hass) => {
  // A hass can report a recent version without carrying the helper (a test
  // harness, or a hass that has not finished initialising), and calling it
  // then throws - so the version gate alone is not enough.
  if (!hass || typeof hass.formatEntityName !== 'function') return false;
  const version = hass && hass.config && hass.config.version;
  if (!version) return false;
  const [major, minor] = version.split('.', 2);
  return Number(major) > 2026 || (Number(major) === 2026 && Number(minor) >= 4);
};

// Resolves a `name` option against the entity's registry context (entity,
// device, area, floor). Falls back to the friendly name on older HA versions,
// where a structured name cannot be resolved.
const computeEntityName = (hass, stateObj, name) => {
  if (supportsEntityNames(hass)) {
    return hass.formatEntityName(stateObj, name);
  }
  if (name !== undefined && name !== null && typeof name !== 'object') {
    return String(name);
  }
  return stateObj.attributes.friendly_name;
};

// formatEntityName resolves against the entity/device/area/floor registries, and
// HA swaps the real formatter in asynchronously once translations load. Neither
// shows up as an entity state change, so without this a rename (or that swap)
// leaves rendered names stale until some unrelated state change forces a render.
const NAME_SOURCES = ['formatEntityName', 'entities', 'devices', 'areas', 'floors'];

const entityNamesChanged = (oldHass, newHass) => {
  if (!oldHass || !newHass) return false;
  return NAME_SOURCES.some(key => oldHass[key] !== newHass[key]);
};

const log = (message) => {
  // eslint-disable-next-line no-console
  console.warn('mini-graph-card: ', message);
};

export {
  getMin, getAvg, getMax, getMilli, compress, decompress, log,
  getFirstDefinedItem,
  computeEntityName,
  entityNamesChanged,
};
