import { log } from './utils';
import {
  URL_DOCS,
  FONT_SIZE,
  FONT_SIZE_HEADER,
  MAX_BARS,
  DEFAULT_COLORS,
  DEFAULT_SHOW,
} from './const';

const computeThresholds = (stops, type) => {
  stops.sort((a, b) => b.value - a.value);

  if (type === 'smooth') {
    return stops;
  } else {
    const rect = [].concat(...stops.map((stop, i) => ([stop, {
      value: stop.value - 0.0001,
      color: stops[i + 1] ? stops[i + 1].color : stop.color,
    }])));
    return rect;
  }
};

export default (config) => {
  if (config.entity)
    throw new Error(`The "entity" option was removed, please use "entities".\n See ${URL_DOCS}`);
  if (!Array.isArray(config.entities))
    throw new Error(`Please provide the "entities" option as a list.\n See ${URL_DOCS}`);
  if (config.line_color_above || config.line_color_below)
    throw new Error(
      `"line_color_above/line_color_below" was removed, please use "color_thresholds".\n See ${URL_DOCS}`,
    );

  const conf = {
    animate: false,
    hour24: false,
    font_size: FONT_SIZE,
    font_size_header: FONT_SIZE_HEADER,
    height: 100,
    hours_to_show: 24,
    points_per_hour: 0.5,
    aggregate_func: 'avg',
    group_by: 'interval',
    line_color: [...DEFAULT_COLORS],
    color_thresholds: [],
    color_thresholds_transition: 'smooth',
    line_width: 5,
    bar_spacing: 4,
    compress: true,
    smoothing: true,
    state_map: [],
    cache: true,
    value_factor: 0,
    value_multipler: 1,
    tap_action: {
      action: 'more-info',
    },
    ...JSON.parse(JSON.stringify(config)),
    show: { ...DEFAULT_SHOW, ...config.show },
  };

  conf.entities.forEach((entity, i) => {
    if (typeof entity === 'string') conf.entities[i] = { entity };
  });

  conf.state_map.forEach((state, i) => {
    // convert string values to objects
    if (typeof state === 'string') conf.state_map[i] = { value: state, label: state };
    // make sure label is set
    conf.state_map[i].label = conf.state_map[i].label || conf.state_map[i].value;
  });

  if (typeof config.line_color === 'string')
    conf.line_color = [config.line_color, ...DEFAULT_COLORS];

  conf.font_size = (config.font_size / 100) * FONT_SIZE || FONT_SIZE;
  conf.color_thresholds = computeThresholds(
    conf.color_thresholds,
    conf.color_thresholds_transition,
  );
  const additional = conf.hours_to_show > 24 ? { day: 'numeric', weekday: 'short' } : {};
  conf.format = { hour12: !conf.hour24, ...additional };

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

  return conf;
};
