// hass.formatEntityName only accepts a card's `name` option (a user string, a
// structured name, or undefined) from HA 2026.4. Earlier versions expose the
// same helper with an incompatible signature, so feature detection is not
// enough - the version has to be checked.
/**
 * Check if the current version of HA supports structured entity names.
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {boolean} True if the current version of HA supports structured entity names,
 * false otherwise
 */
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

/**
 * Resolve a `name` option against the entity's registry context (entity, device, area, floor).
 * Falls back to the friendly name on older HA versions, where a structured name cannot be resolved.
 * @param {HomeAssistant} hass HomeAssistant object
 * @param {object} stateObj stateObj for an entity
 * @param {string
 * | {type: 'entity'|'device'|'area'|'floor'}
 * | {type: 'text', text: string}
 * | ({type: 'entity'|'device'|'area'|'floor'} |  {type: 'text', text: string})[]
 * } [name] Composed name structure or string override
 * @returns {string} Resolved entity name
 */
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

/**
 * Check if names changed.
 * @param {HomeAssistant} oldHass Old HomeAssistant object
 * @param {HomeAssistant} newHass New HomeAssistant object
 * @returns {boolean} True if names changed, false otherwise
 */
const entityNamesChanged = (oldHass, newHass) => {
  if (!oldHass || !newHass) return false;
  return NAME_SOURCES.some(key => oldHass[key] !== newHass[key]);
};

export {
  computeEntityName,
  entityNamesChanged,
};
