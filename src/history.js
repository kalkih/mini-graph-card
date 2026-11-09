import {
  convertStateByMap,
  getObjectAttr,
} from './others';

/**
 * Prepare a cached history array for a further processing:
 * - convert unexpected states to NaN;
 * - define a "fetch start" time for a forthcoming fetching data from HA server;
 * - define other important properties (isCacheConverted, skipInitialState)
 * for a forthcoming fetching data from HA server.
 * @param {object} historyObj Cached history object
 * @param {Date} start Starting time of interval
 * @returns {{
 *   history: Array<object>,
 *   isCacheConverted: boolean,
 *   skipInitialState: boolean,
 *   fetchStart: Date,
 * }} Processed history data properties
 */
const prepareCachedHistory = (historyObj, start) => {
  let isCacheConverted = false;
  let skipInitialState = false;
  let fetchStart = start;

  // making a local copy of cached history array
  let history = historyObj.data.map(item => ({
    ...item,
    // checking just in case (if a history array was made by a prev version of m-g-c)
    state: (item.state === null // including converted NaNs
      || item.state === undefined
      || item.state === 'unavailable'
      || item.state === 'unknown') // added just in case
      ? NaN
      : item.state,
  }));

  let currDataIndex = history.findIndex(item => new Date(item.last_changed) > start);
  if (currDataIndex !== -1) {
    if (currDataIndex > 0) {
      // include previous item
      currDataIndex -= 1;
      // but change it's last changed time
      history[currDataIndex].last_changed = start;
    }

    // delete everything before the found point
    history = history.slice(currDataIndex);
    // skip initial state when fetching recent/not-cached data
    skipInitialState = true;

    const lastFetched = new Date(historyObj.last_fetched);
    fetchStart = new Date(lastFetched - 1); // make it a bit earlier

    // does cached history array contain mapped data (indexes)?
    isCacheConverted = historyObj.state_map_converted === true;
  } else {
    // there were no states which could be used in current graph so clearing
    history = [];
  }

  return {
    history,
    isCacheConverted,
    skipInitialState,
    fetchStart,
  };
};

/**
 * Align a fetched history with a current state/attribute value:
 * - take a state/attribute value from the latest history record;
 * - calculate a current state/attribute value;
 * - map both values if a mapping is configured;
 * - compare both values;
 * - manually add the current state/attribute value to the history if values are different.
 * @param {Array<object>} fetchedPoints History fetched from HA server
 * @param {Array<object>} cachedHistory History taken from a cache
 * @param {object} stateObj stateObj for an entity
 * @param {string|undefined} attribute Attribute name
 * @param {object|undefined} stateMapConfig state_map config object
 * @param {boolean} isStateMapStrictMode True if state_map config defines a strict mapping,
 * false otherwise
 * @param {boolean} isCacheConverted True if cached history was mapped, false otherwise
 * @returns {void}
 */
const alignFetchedWithCurrent = (
  fetchedPoints, cachedHistory,
  stateObj, attribute,
  stateMapConfig, isStateMapStrictMode,
  isCacheConverted,
) => {
  // if (!stateObj) { // ????????????
  //   /
  //   fetchedPoints.push({
  //     entity_id: undefined, // ????????????
  //     state: 'unknown',
  //     last_changed: new Date().toISOString(), // ????????????
  //     last_updated: new Date().toISOString(), // ????????????
  //     attributes: undefined,
  //   });
  //   return;
  // }

  // check if the latest point corresponds to the current state
  // for that, take the last history item
  let isLastItemTakenFromCache = false;
  let lastHistoryItem;
  if (fetchedPoints.length > 0) {
    // taken from fetched history
    lastHistoryItem = fetchedPoints[fetchedPoints.length - 1];
  } else {
    // taken from cache
    isLastItemTakenFromCache = cachedHistory.length > 0;
    lastHistoryItem = isLastItemTakenFromCache
      ? cachedHistory[cachedHistory.length - 1]
      : null;
  }

  // current value of state/attribute
  let currentValue = attribute
    ? getObjectAttr(stateObj.attributes, attribute)
    : stateObj.state;

  // cached history may contain mapped values (indexes),
  // to compare a current value with an index, we need to process state_map.
  // note: stateMapConfig is null if state_map is undefined or has an empty map array
  if (isLastItemTakenFromCache && isCacheConverted && isStateMapStrictMode) {
    // need to convert before comparing
    const mock = { state: currentValue };
    convertStateByMap(mock, stateMapConfig);
    currentValue = mock.state; // currentValue is an index now
  }

  // last value of state/attribute from history
  const lastHistoryValue = lastHistoryItem
    ? attribute && lastHistoryItem.attributes
      ? getObjectAttr(lastHistoryItem.attributes, attribute)
      : lastHistoryItem.state
    : null;

  // if the latest record from the history does not correspond to the current state/attribute
  // - add the current state/attribute to the history
  // (may happen since data in recorder may be not ready yet)
  if (lastHistoryValue !== currentValue) {
    fetchedPoints.push({
      entity_id: stateObj.entity_id,
      state: stateObj.state,
      last_changed: stateObj.last_changed,
      last_updated: stateObj.last_updated,
      attributes: stateObj.attributes,
    });
  }
};

/**
 * Transform a fetched history:
 * - apply legacy HA attributes shift workaround;
 * - extract values and 'last_updated' data for attributes;
 * - map values to numeric indexes if a mapping is configured;
 * - cleanup a data array to ensure it only contains expected values.
 * @param {Array<object>} fetchedPoints History fetched from HA server
 * @param {string|undefined} attribute Attribute name
 * @param {object|undefined} stateMapConfig state_map config object
 * @param {boolean} isStateMapStrictMode True if state_map config defines a strict mapping,
 * false otherwise
 * @param {boolean} skipInitialState True if fetched history includes an 'initial state'
 * at the beginning, false otherwise
 * @returns {Array<{state: number, last_changed: string}>} Array of transformed history points
 */
const transformFetchedPoints = (
  fetchedPoints,
  attribute,
  stateMapConfig,
  isStateMapStrictMode,
  skipInitialState,
) => {
  if (!fetchedPoints || fetchedPoints.length === 0) {
    // just for testing
    return [];
  }

  /**
   * Seems that some old HA versions could not handle properly
   * a combination of "retrieve a history for attributes" & "skipInitialState=true".
   * As a workaround, it was implemented a hack: pass "skipInitialState=false" when
   * requesting a history for attributes, and then delete the 1st point ("initial state")
   * if skipInitialState=true.
   * In newer versions of HA (at least in 2026.8), the workaround is not required,
   * the mentioned combination is handled properly.
   * Yet the workaround stays for a compatibility with old HA versions.
   */
  if (attribute && skipInitialState) {
    fetchedPoints.shift();
  }

  // check if we should convert states to numeric values
  if ((stateMapConfig && isStateMapStrictMode) || attribute) {
    /* eslint-disable no-param-reassign */
    fetchedPoints.forEach((item) => {
      if (attribute) {
        // extract a value and 'last_updated'

        // Warning: in a real-life scenario, it is not possible to have valid attributes
        // when state=unavailable. Here the algorithm would replace the "unavailable" value
        // with a valid attribute value. In real life, the attribute value would be "undefined",
        // thus a false presentation is impossible
        item.state = getObjectAttr(item.attributes, attribute);
        item.last_changed = item.last_updated;
        delete item.attributes;
      }
      if (stateMapConfig && isStateMapStrictMode) {
        // map values to numeric indexes (or NaN if no mapping provided)
        convertStateByMap(item, stateMapConfig);
      }
    });
    /* eslint-enable no-param-reassign */
  }

  const formattedPoints = fetchedPoints
    .map(item => ({
      // cleanup to ensure it only contains expected values (number as string or NaN)
      state: (Number.isNaN(item.state) || !Number.isNaN(parseFloat(item.state)))
        ? parseFloat(item.state)
        : NaN,
      last_changed: item.last_changed,
    }));

  return formattedPoints;
};

export {
  prepareCachedHistory,
  alignFetchedWithCurrent,
  transformFetchedPoints,
};
