import { interpolateRGB } from './color';
import {
  X, Y, V,
  ONE_HOUR,
  DEFAULT_BAR_SPACING,
} from './const';
import { log } from './utils';

export default class Graph {
  constructor({
    width,
    height,
    margin,
    hours_to_show = 24,
    points_per_hour = 1,
    aggregateFuncName = 'avg',
    groupBy = 'interval',
    smoothing = true,
    logarithmic = false,
    bar_spacing = DEFAULT_BAR_SPACING, // spacing between bars
    bar_spacing_group = DEFAULT_BAR_SPACING, // spacing between groups of bars
    total_bars_in_group = 1, // number of bars (i.e. number of entities with a shown bar graph)
    fill_baseline,
  }) {
    const aggregateFuncMap = {
      avg: this._average,
      median: this._median,
      max: this._maximum,
      min: this._minimum,
      first: this._first,
      last: this._last,
      sum: this._sum,
      delta: this._delta,
      diff: this._diff,
    };

    this._history = undefined;
    this.coords = [];
    this._width = width - margin[X] * 2;
    this._height = height - margin[Y] * 4;
    this._margin = margin;
    this._max = 0;
    this._min = 0;
    this._points_per_hour = points_per_hour;
    this._hours_to_show = hours_to_show;
    this._aggregateFuncName = aggregateFuncName;
    this._calcPoint = aggregateFuncMap[aggregateFuncName] || this._average;
    this._smoothing = smoothing;
    this._logarithmic = logarithmic;
    this._bar_spacing = bar_spacing;
    this._bar_spacing_group = bar_spacing_group;
    this._total_bars_in_group = total_bars_in_group;
    this._groupBy = groupBy;
    this._endTime = 0;
    this._fill_baseline = fill_baseline;
  }

  get max() { return this._max; }

  set max(max) { this._max = max; }

  get min() { return this._min; }

  set min(min) { this._min = min; }

  get history() { return this._history; }

  set history(data) { this._history = data; }

  /**
   * Update the graph data: group history into time buckets, calculate coordinates, define new value boundaries
   * @param {Array} [history] Array of historical data
   * @returns {void}
   */
  update(history = undefined) {
    if (history) {
      this._history = history;
    }
    if (!this._history) return;
    this._updateEndTime();

    // group history into time buckets
    const histGroups = this._history.reduce((res, item) => this._reducer(res, item), []);

    // extend length to fill missing history
    const requiredNumOfPoints = Math.ceil(this._hours_to_show * this._points_per_hour);
    histGroups.length = requiredNumOfPoints;

    // calculate coordinates
    this.coords = this._calcPoints(histGroups);

    // define new value boundaries
    this.min = Math.min(...this.coords.map(item => Number(item[V])));
    this.max = Math.max(...this.coords.map(item => Number(item[V])));
  }

  /**
   * Group historical data into time buckets based on their age
   * @param {Array} res Array of time buckets being populated
   * @param {Object} item Current history item
   * @returns {Array} Updated array of grouped time buckets
   */
  _reducer(res, item) {
    const age = this._endTime - new Date(item.last_changed).getTime();
    // interval = distance in hours from the beginning of the timespan to the "last_changed" moment
    // (is a negative value if a point is inside the timespan)
    const interval = (age / ONE_HOUR) - this._hours_to_show;
    if (interval < 0) {
      let key = Math.floor(Math.abs(interval * this._points_per_hour));
      const maxKey = Math.ceil(this._hours_to_show * this._points_per_hour) - 1;
      if (key > maxKey) {
        // cannot exceed a possible value
        key = maxKey;
      }
      if (!res[key]) {
        res[key] = [];
      }
      res[key].push(item);
    } else {
      // points from "before a timespan" moments are placed into the 1st bucket
      if (!res[0]) {
        res[0] = [];
      }
      res[0].push(item);
    }
    return res;
  }

  /**
   * Сalculate coordinates (X, Y = 0, aggregated Value)
   * @param {Array} history Array of grouped time buckets
   * @returns {Array<Array<number>>} Array of [X, Y, Value] coordinates
   */
  _calcPoints(history) {
    let xRatio = this._width / history.length;
    xRatio = Number.isFinite(xRatio) ? xRatio : this._width; // prevent "divide by 0"

    const coords = [];
    let lastValue = 0;
    let x;

    for (let i = 0; i <= history.length; i += 1) {
      x = xRatio * i + this._margin[X];

      if (i === 0) {
        // left border
        const firstBucket = history[0];
        if (firstBucket && firstBucket[0]) {
          const zeroStartFuncs = ['sum', 'delta', 'diff'];
          if (zeroStartFuncs.includes(this._aggregateFuncName)) {
            lastValue = 0;
          } else {
            lastValue = parseFloat(firstBucket[0].state);
          }
        }
        coords.push([x, 0, lastValue]);
      } else {
        const bucket = history[i - 1];
        if (bucket && bucket.length > 0) {
          lastValue = this._calcPoint(bucket);
        }
        coords.push([x, 0, lastValue]);
      }
    }
    return coords;
  }

  /**
   * Recalculates a point's coords based on min & max thresholds
   * @param {Array<Array<number>>} coords Array of X, Y, Value
   * @returns {Array<Array<number>>} Array of X, Y, Value, where Y - recalculated based on min/max thresholds
   */
  calcY(coords) {
    // account for logarithmic graph
    const max = this._logarithmic ? Math.log10(Math.max(1, this.max)) : this.max;
    const min = this._logarithmic ? Math.log10(Math.max(1, this.min)) : this.min;

    const yRatio = ((max - min) / this._height) || 1;
    const coords2 = coords.map((coord) => {
      const val = this._logarithmic ? Math.log10(Math.max(1, coord[V])) : coord[V];
      const coordY = this._height - ((val - min) / yRatio) + this._margin[Y] * 2;
      return [coord[X], coordY, coord[V]];
    });

    return coords2;
  }

  /**
   * Get points with scaled Y-coordinates and handles line smoothing
   * @returns {Array<Array<number>>} Array of points [X, Y, Value, index]
   */
  getPoints() {
    let coords = this.calcY(this.coords);  // set Y coord
    if (this._smoothing) {
      let last = coords[0];
      coords.shift();
      return coords.map((point, i) => {
        const Z = this._midPoint(last[X], last[Y], point[X], point[Y]);
        const sum = (last[V] + point[V]) / 2;  // 2-points smoothing
        last = point;
        return [Z[X], Z[Y], sum, i + 1];
      });
    } else {
      return coords.map((point, i) => [point[X], point[Y], point[V], i]);
    }
  }

  /**
   * Get SVG path for line chart with optional smoothing
   * @returns {string} SVG path
   */
  getPath() {
    const coords = this.calcY(this.coords); // set Y coord

    let next; let Z;
    let path = '';
    let last = coords[0];
    path += `M${last[X]},${last[Y]}`; // move to 1st point

    coords.forEach((point) => {
      next = point;
      Z = this._smoothing
        ? this._midPoint(last[X], last[Y], next[X], next[Y])
        : next;
      path += ` ${Z[X]},${Z[Y]}`; // either a midPoint (smoothing = true) or "next"
      // does not affect if "next" was added before, otherwise makes a quadratic curve
      path += ` Q ${next[X]},${next[Y]}`;
      last = next;
    });
    path += ` ${next[X]},${next[Y]}`; // add last point
    return path;
  }

  /**
   * Returns a gradient used to set a gradiented color for a line & fill
   * @param {Array<Object>} thresholds color_thresholds array
   * @returns {Array<Object>} Gradient
   */
  computeGradient(thresholds) {
    const scale = this._logarithmic
      ? Math.log10(Math.max(1, this._max)) - Math.log10(Math.max(1, this._min))
      : this._max - this._min;

    return thresholds.map((stop, index, arr) => {
      let color;
      if (stop.value > this._max && arr[index + 1]) {
        const factor = (this._max - arr[index + 1].value) / (stop.value - arr[index + 1].value);
        color = interpolateRGB(arr[index + 1].color, stop.color, factor);
      } else if (stop.value < this._min && arr[index - 1]) {
        const factor = (arr[index - 1].value - this._min) / (arr[index - 1].value - stop.value);
        color = interpolateRGB(arr[index - 1].color, stop.color, factor);
      }
      let offset;
      if (scale <= 0) {
        offset = 0;
      } else if (this._logarithmic) {
        offset = (Math.log10(Math.max(1, this._max))
          - Math.log10(Math.max(1, stop.value)))
          * (100 / scale);
      } else {
        offset = (this._max - stop.value) * (100 / scale);
      }
      return {
        color: color || stop.color,
        offset,
      };
    });
  }

  /**
   * Get an SVG path for a fill
   * @param {string} path SVG path for a line
   * @returns {string} SVG path for a fill
   */
  getFill(path) {
    let height = this._height + this._margin[Y] * 4;
    if (this._fill_baseline !== undefined) {
      const [baselineCoord] = this.calcY([[0, 0, this._fill_baseline]]);
      [, height] = baselineCoord;
    }
    let fill = path;
    // note that currently this._margin[X] = 0 when fill is defined
    fill += ` L ${this._width + this._margin[X]}, ${height}`;
    fill += ` L ${this.coords[0][X]}, ${height} z`;
    return fill;
  }

  /**
   * Get bars for an entity
   * @param {number} position Index of a bar (0,1,..)
   * (i.e. index of an entity with a shown bar graph)
   * @returns {Array<Object>} Bars for an entity to be shown at a `position` index
   */
  getBars(position) {
    const spacing = this._bar_spacing;
    const spacing_group = this._bar_spacing_group;
    const total = this._total_bars_in_group;

    let coords = this.calcY(this.coords); // set Y coord
    coords = coords.slice(1); // remove left border

    // number of measures
    const total_groups = coords.length;

    // width of a group of bars
    const group_width = (this._width - spacing_group * (total_groups - 1))
      / total_groups;

    // width of a bar
    let bar_width;
    if (spacing === -1) {
      bar_width = group_width;
    } else {
      bar_width = (group_width - spacing * (total - 1)) / total;
      if (bar_width <= 0) {
        bar_width = 1;
        log(`Invalid bar_width, adjusted to 1 (bar_spacing ${spacing}, bar_spacing_group ${spacing_group})`);
      }
    }

    return coords.map((coord, i) => ({
      x: this._margin[X]
        + (group_width + spacing_group) * i
        + (spacing === -1 ? 0 : (bar_width + spacing) * position),
      y: coord[Y],
      height: this._height - coord[Y] + this._margin[Y] * 4,
      width: bar_width,
      value: coord[V],
    }));
  }

  _midPoint(Ax, Ay, Bx, By) {
    const Zx = (Ax - Bx) / 2 + Bx;
    const Zy = (Ay - By) / 2 + By;
    return [Zx, Zy];
  }

  _average(items) {
    return items.reduce((sum, entry) => (sum + parseFloat(entry.state)), 0) / items.length;
  }

  _median(items) {
    const itemsDup = [...items].sort((a, b) => parseFloat(a) - parseFloat(b));
    const mid = Math.floor((itemsDup.length - 1) / 2);
    if (itemsDup.length % 2 === 1)
      return parseFloat(itemsDup[mid].state);
    return (parseFloat(itemsDup[mid].state) + parseFloat(itemsDup[mid + 1].state)) / 2;
  }

  _maximum(items) {
    return Math.max(...items.map(item => item.state));
  }

  _minimum(items) {
    return Math.min(...items.map(item => item.state));
  }

  _first(items) {
    return parseFloat(items[0].state);
  }

  _last(items) {
    return parseFloat(items[items.length - 1].state);
  }

  _sum(items) {
    return items.reduce((sum, entry) => sum + parseFloat(entry.state), 0);
  }

  _delta(items) {
    return this._maximum(items) - this._minimum(items);
  }

  _diff(items) {
    return this._last(items) - this._first(items);
  }

  _lastValue(items) {
    if (['delta', 'diff'].includes(this._aggregateFuncName)) {
      return 0;
    } else {
      return parseFloat(items[items.length - 1].state) || 0;
    }
  }

  _updateEndTime() {
    this._endTime = new Date();
    switch (this._groupBy) {
      case 'month':
        this._endTime.setMonth(this._endTime.getMonth() + 1);
        this._endTime.setDate(1);
        this._endTime.setHours(0, 0, 0, 0);
        break;
      case 'date':
        this._endTime.setDate(this._endTime.getDate() + 1);
        this._endTime.setHours(0, 0, 0, 0);
        break;
      case 'hour':
        this._endTime.setHours(this._endTime.getHours() + 1);
        this._endTime.setMinutes(0, 0, 0);
        break;
      default:
        break;
    }
  }
}
