import {
  URL_DOCS,
  MAX_BARS,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_SIZE_HEADER,
  DEFAULT_BAR_SPACING,
  DEFAULT_GRAPH_HEIGHT,
  DEFAULT_MARGIN,
  DEFAULT_HOURS_TO_SHOW,
  DEFAULT_POINTS_PER_HOUR,
  DEFAULT_STATIC_VALUE_LABEL_OFFSET,
  DEFAULT_COLORS,
  DEFAULT_SHOW,
} from './const';
import { log } from './utils';
import {
  checkNumericOption,
  checkIntegerOption,
  checkBounds,
  checkColorThresholds,
  checkLineStyle,
} from './checkOption';
import { getFactor } from './others';
import { migrateYaxisConfig } from './migrate';

/**
 * Starting from the given index, increment the index until an array element with a
 * "value" property is found
 *
 * @param {Array} stops
 * @param {number} startIndex
 * @returns {number}
 */
const findFirstValuedIndex = (stops, startIndex) => {
  for (let i = startIndex; i < stops.length; i += 1) {
    if (stops[i].value != null) {
      return i;
    }
  }
  throw new Error(
    'Error in threshold interpolation: could not find right-nearest valued stop. '
    + 'Do the first and last thresholds have a set "value"?',
  );
};

/**
 * Interpolates the "value" of each stop. Each stop can be a color string or an object of type
 * ```
 * {
 *   color: string
 *   value?: number | null
 * }
 * ```
 * And the values will be interpolated by the nearest valued stops.
 *
 * For example, given values `[ 0, null, null, 4, null, 3]`,
 * the interpolation will output `[ 0, 1.3333, 2.6667, 4, 3.5, 3 ]`
 *
 * Note that values will be interpolated ascending and descending.
 * All that's necessary is that the first and the last elements have values.
 *
 * @param {Array} stops
 * @returns {Array<{ color: string, value: number }>}
 */
const interpolateStops = (stops) => {
  if (!stops || !stops.length) {
    return stops;
  }
  if (stops[0].value == null || stops[stops.length - 1].value == null) {
    throw new Error(`The first and last thresholds must have a set "value".\n See ${URL_DOCS}`);
  }

  let leftValuedIndex = 0;
  let rightValuedIndex = null;

  return stops.map((stop, stopIndex) => {
    if (stop.value != null) {
      leftValuedIndex = stopIndex;
      return { ...stop };
    }

    if (rightValuedIndex == null || stopIndex > rightValuedIndex) {
      rightValuedIndex = findFirstValuedIndex(stops, stopIndex);
    }

    // y = mx + b
    // m = dY/dX
    // x = index in question
    // b = left value

    const leftValue = stops[leftValuedIndex].value;
    const rightValue = stops[rightValuedIndex].value;
    const m = (rightValue - leftValue) / (rightValuedIndex - leftValuedIndex);
    return {
      color: typeof stop === 'string' ? stop : stop.color,
      value: m * (stopIndex - leftValuedIndex) + leftValue,
    };
  });
};

/**
 * Process color_thresholds array: first reverse it,
 * then either return it "as is" (if type = smooth)
 * or augment it with additional stops to prevent an unneeded color transition (if type = hard)
 * @param {Array<{ color: string, value: number }>} stops Initial color_thresholds array
 * @param {string} type Type of color thresholds transition
 * @returns {Array<{ color: string, value: number }>} Processed color_thresholds array
 */
const computeThresholds = (stops, type) => {
  const valuedStops = interpolateStops(stops);
  valuedStops.sort((a, b) => b.value - a.value);

  if (type === 'smooth') {
    return valuedStops;
  } else {
    const rect = [].concat(...valuedStops.map((stop, i) => {
      const nextStop = valuedStops[i + 1];
      const delta = nextStop
        ? Math.abs(stop.value - nextStop.value) * 0.0001
        : Math.abs(stop.value) * 0.0001 || 0.0001;
      return [
        stop,
        {
          value: stop.value - delta,
          color: nextStop ? nextStop.color : stop.color,
        },
      ];
    }));
    return rect;
  }
};

export default (config) => {
  if (!Array.isArray(config.entities))
    throw new Error(`Please provide the "entities" option as a list.\n See ${URL_DOCS}`);
  if (config.line_color_above || config.line_color_below)
    throw new Error(
      `"line_color_above/line_color_below" was removed, please use "color_thresholds".\n See ${URL_DOCS}`,
    );

  // migrate legacy options, currently belonging to y_axis object
  const migratedConfig = migrateYaxisConfig(config);

  const conf = {
    animate: false,
    font_size: DEFAULT_FONT_SIZE,
    font_size_header: DEFAULT_FONT_SIZE_HEADER,
    height: DEFAULT_GRAPH_HEIGHT,
    hours_to_show: DEFAULT_HOURS_TO_SHOW,
    points_per_hour: DEFAULT_POINTS_PER_HOUR,
    aggregate_func: 'avg',
    group_by: 'interval',
    line_color: [...DEFAULT_COLORS],
    color_thresholds: [],
    color_thresholds_transition: 'smooth',
    line_width: DEFAULT_MARGIN,
    bar_spacing: DEFAULT_BAR_SPACING,
    compress: true,
    smoothing: true,
    state_map: [],
    cache: true,
    tap_action: {
      action: 'more-info',
    },
    ...JSON.parse(JSON.stringify(migratedConfig)),
    show: { ...DEFAULT_SHOW, ...migratedConfig.show },
  };

  // check numeric options for validity
  conf.font_size = checkNumericOption(conf, 'font_size', 100, { minBound: 0.1, allowString: true });
  conf.font_size_header = checkNumericOption(conf, 'font_size_header', DEFAULT_FONT_SIZE_HEADER, { minBound: 0.1, allowString: true });

  conf.bar_spacing = checkNumericOption(conf, 'bar_spacing', DEFAULT_BAR_SPACING, { minBound: -1, allowString: true });
  conf.bar_spacing_group = checkNumericOption(conf, 'bar_spacing_group', undefined, { minBound: 0, allowString: true });

  conf.height = checkNumericOption(conf, 'height', DEFAULT_GRAPH_HEIGHT, { minBound: 0, allowString: true });

  conf.line_width = checkNumericOption(conf, 'line_width', DEFAULT_MARGIN, { minBound: 0, allowString: true });

  conf.hours_to_show = checkNumericOption(conf, 'hours_to_show', DEFAULT_HOURS_TO_SHOW, { minBound: 0.01, allowString: true });
  conf.points_per_hour = checkNumericOption(conf, 'points_per_hour', DEFAULT_POINTS_PER_HOUR, { minBound: 0.001, allowString: true });
  conf.update_interval = checkNumericOption(conf, 'update_interval', undefined, { minBound: 0, allowString: true });

    // axis options
  if (conf.y_axis && conf.y_axis.primary) {
    const primaryBounds = checkBounds(conf.y_axis.primary, 'primary');
    conf.y_axis.primary.lower_bound = primaryBounds.lowerBound;
    conf.y_axis.primary.upper_bound = primaryBounds.upperBound;

    conf.y_axis.primary.min_bound_range = checkNumericOption(
      conf.y_axis.primary, 
      'min_bound_range', 
      undefined, 
      { minBound: 0, allowString: true, logOptionName: 'primary.min_bound_range' },
    );

    conf.y_axis.primary.decimals = checkIntegerOption(
      conf.y_axis.primary, 
      'decimals', 
      undefined, 
      { minBound: 0, allowString: true, logOptionName: 'primary.decimals' },
    );
  }
  if (conf.y_axis && conf.y_axis.secondary) {
    const secondaryBounds = checkBounds(conf.y_axis.secondary, 'secondary');
    conf.y_axis.secondary.lower_bound = secondaryBounds.lowerBound;
    conf.y_axis.secondary.upper_bound = secondaryBounds.upperBound;

     conf.y_axis.secondary.min_bound_range = checkNumericOption(
      conf.y_axis.secondary, 
      'min_bound_range', 
      undefined, 
      { minBound: 0, allowString: true, logOptionName: 'secondary.min_bound_range' },
    );

    conf.y_axis.secondary.decimals = checkIntegerOption(
      conf.y_axis.secondary, 
      'decimals', 
      undefined, 
      { minBound: 0, allowString: true, logOptionName: 'secondary.decimals' },
    );
  }

  conf.decimals = checkIntegerOption(conf, 'decimals', undefined, { minBound: 0, allowString: true });

  conf.static_value_label_offset = checkNumericOption(
    conf,
    'static_value_label_offset',
    DEFAULT_STATIC_VALUE_LABEL_OFFSET,
    { minBound: 0, maxBound: 100, allowString: true },
  );
  if (conf.static_value_label_offset === undefined
    || conf.static_value_label_offset === null) {
    conf.static_value_label_offset = DEFAULT_STATIC_VALUE_LABEL_OFFSET;
  }

  conf.fill_baseline = checkNumericOption(conf, 'fill_baseline', undefined, { allowString: true });

  // process per-entity configs
  /* eslint-disable no-param-reassign */
  conf.entities.forEach((entity, i) => {
    if (typeof entity === 'string') {
      conf.entities[i] = { entity };
    } else {
      // check numeric per-entity options for validity
      entity.line_width = checkNumericOption(entity, 'line_width', conf.line_width, { minBound: 0, allowString: true });
      entity.decimals = checkIntegerOption(entity, 'decimals', conf.decimals, { minBound: 0, allowString: true });
      entity.fill_baseline = checkNumericOption(entity, 'fill_baseline', undefined, { allowString: true });

      if (entity.color_thresholds) {
        // check color_thresholds
        checkColorThresholds(entity, `entities[${i}]`);
        // eslint-disable-next-line no-param-reassign
        entity.color_thresholds = computeThresholds(
          entity.color_thresholds,
          entity.color_thresholds_transition || conf.color_thresholds_transition,
        );
      }
    }
  });
  /* eslint-enable no-param-reassign */

  // prepare predefined factors
  const entityFactors = conf.entities.map((_, index) => getFactor(conf, index));
  const axisFactors = {
    primary: getFactor(conf),
    secondary: getFactor(conf, -1),
  };

  conf.state_map.forEach((state, i) => {
    // convert string values to objects
    if (typeof state === 'string') conf.state_map[i] = { value: state, label: state };
    // make sure label is set
    conf.state_map[i].label = conf.state_map[i].label || conf.state_map[i].value;
  });

  if (typeof config.line_color === 'string')
    conf.line_color = [config.line_color, ...DEFAULT_COLORS];

  conf.font_size = (config.font_size / 100) * DEFAULT_FONT_SIZE || DEFAULT_FONT_SIZE;

  // check color_thresholds
  checkColorThresholds(conf, 'config');
  conf.color_thresholds = computeThresholds(
    conf.color_thresholds,
    conf.color_thresholds_transition,
  );

  // set valid values for bar_spacing options
  conf.bar_spacing = conf.bar_spacing < 0
    ? -1 : conf.bar_spacing; // "-1" stands for stacked bars
  conf.bar_spacing_group = conf.bar_spacing_group !== undefined && conf.bar_spacing_group !== null
    ? conf.bar_spacing_group
    : conf.bar_spacing < 0
      ? DEFAULT_BAR_SPACING : conf.bar_spacing;

  // warn if line_style is defined along with animate=true
  checkLineStyle(conf);

  // override points per hour to mach group_by function
  switch (conf.group_by) {
    case 'date':
      conf.points_per_hour = 1 / 24;
      break;
    case 'hour':
      conf.points_per_hour = 1;
      break;
    default:
      break;
  }

  if (conf.show.graph === 'bar') {
    const entities = conf.entities.length;
    if (conf.hours_to_show * conf.points_per_hour * entities > MAX_BARS) {
      conf.points_per_hour = MAX_BARS / (conf.hours_to_show * entities);
      log(`Not enough space, adjusting points_per_hour to ${conf.points_per_hour}`);
    }
  }

  return {
    config: conf,
    entityFactors,
    axisFactors,
  };
};
