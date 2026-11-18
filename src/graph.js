import { interpolateRGB } from './color';
import {
  X, Y, V,
  ONE_HOUR,
  DEFAULT_GRAPH_HEIGHT,
  DEFAULT_GRAPH_WIDTH,
  DEFAULT_BAR_SPACING,
  DEFAULT_LINE_WIDTH,
} from './const';
import {
  getLog10,
  log,
} from './utils';
import { aggregateFuncMap } from './aggregate';

export default class Graph {
  /**
   * Constructor of Graph class
   * @param {{
   * graphType?: string,
   * width?: number,
   * height?: number,
   * margin?: [number, number],
   * hours_to_show?: number,
   * points_per_hour?: number,
   * aggregateFuncName?: string,
   * calculateOverall?: boolean,
   * overallAggregateFuncName?: string,
   * smoothing?: boolean,
   * logarithmic?: boolean,
   * bar_spacing?: number,
   * bar_spacing_group?: number,
   * total_bars_in_group?: number,
   * baseline?: number,
   * invert?: boolean }} options Graph configuration options
   */
  constructor({
    graphType = 'line',
    width = DEFAULT_GRAPH_WIDTH,
    height = DEFAULT_GRAPH_HEIGHT,
    margin = [DEFAULT_LINE_WIDTH, DEFAULT_LINE_WIDTH],
    hours_to_show = 24,
    points_per_hour = 1,
    aggregateFuncName = 'avg',
    calculateOverall = false,
    overallAggregateFuncName = undefined,
    smoothing = true,
    logarithmic = false,
    bar_spacing = DEFAULT_BAR_SPACING, // spacing between bars
    bar_spacing_group = DEFAULT_BAR_SPACING, // spacing between groups of bars
    total_bars_in_group = 1, // number of bars (i.e. number of entities with a shown bar graph)
    baseline = undefined,
    invert = false,
  } = {}) {
    this._graphType = graphType;
    this._history = undefined;
    this._coords = [];
    this._width = width - margin[X] * 2;
    this._height = height - margin[Y] * 4;
    this._margin = margin;
    this._max = 0;
    this._min = 0;
    this._points_per_hour = points_per_hour;
    this._hours_to_show = hours_to_show;

    this._aggregateFuncName = aggregateFuncName;
    this._calcPoint = aggregateFuncMap[aggregateFuncName]
     || aggregateFuncMap.avg; // fallback in case a wrong func is passed

    // calculating "overall" aggregated values:
    this._calculateOverall = calculateOverall;
    this._overall = undefined;
    this._overallAggregateFuncName = overallAggregateFuncName;
    this._overallAggregateFunc = aggregateFuncMap[overallAggregateFuncName]
     || this._calcPoint; // fallback in case a wrong func is passed

    this._smoothing = smoothing;
    this._logarithmic = logarithmic;
    this._bar_spacing = bar_spacing;
    this._bar_spacing_group = bar_spacing_group;
    this._total_bars_in_group = total_bars_in_group;
    this._endTime = 0;
    this._baseline = baseline;
    this._invert = invert;
  }

  get overall() { return this._overall; }

  get max() { return this._max; }

  set max(max) { this._max = max; }

  get min() { return this._min; }

  set min(min) { this._min = min; }

  /**
   * Get the current Y-coord for a baseline
   * @returns {number} Y-coord of a baseline
   */
  get baselineY() {
    const absoluteTop = 0;
    const absoluteBottom = this._height + this._margin[Y] * 4;
    let baselineY = this._invert
      ? absoluteTop
      : absoluteBottom;

    if (this._baseline !== undefined) {
      // calculate Y coord
      const [baselineCoord] = this.calcY([[0, 0, this._baseline]]);
      const [, calculatedBaselineY] = baselineCoord;
      if (!Number.isNaN(calculatedBaselineY)) {
        baselineY = calculatedBaselineY;

        // if the baseline is inside a top "margins area"
        // - then shift the baseline to the top edge (0)
        const gridTop = this._margin[Y] * 2;
        if (baselineY <= gridTop) {
          baselineY = absoluteTop;
        }

        // if the baseline is inside a bottom "margins area"
        // - then shift the baseline to the bottom edge
        const gridBottom = this._height + this._margin[Y] * 2;
        if (baselineY >= gridBottom) {
          baselineY = absoluteBottom;
        }
      }
    }

    return baselineY;
  }

  /**
   * Get a relative ratio of the baseline position (0..1)
   * @returns {number|undefined} Baseline position ratio from the top,
   * or undefined if no baseline is customized
   */
  get baselineRatio() {
    if (this._baseline === undefined) {
      return undefined;
    }
    return this.baselineY / (this._height + this._margin[Y] * 4);
  }

  get history() { return this._history; }

  set history(data) { this._history = data; }

  /**
   * Update the graph data: group history into time buckets,
   * calculate coordinates, define new value boundaries
   * @param {Date} endTime Current interval's end time
   * @param {Array<object>} [history=undefined] Array of historical data
   * @returns {void}
   */
  update(endTime, history = undefined) {
    if (history) {
      this._history = history;
    }
    if (!this._history) return;

    // update interval end date
    this._endTime = endTime;

    // calculate "overall" value
    if (this._calculateOverall) {
      this._overall = this._calcOverall();
    }

    // group history into time buckets
    const histGroups = this._history.reduce((res, item) => this._reducer(res, item), []);

    // extend length to fill missing history
    const requiredNumOfPoints = Math.ceil(this._hours_to_show * this._points_per_hour);
    histGroups.length = requiredNumOfPoints;

    // calculate coordinates
    this._coords = this._calcPoints(histGroups);

    // reduce for bars
    if (this._graphType === 'bar') {
      this._coords = this._coords.slice(1);
    }

    // define new value boundaries
    ({ min: this.min, max: this.max } = this._calcBounds());
  }

  /**
   * Group historical data into time buckets based on their age
   * @param {Array} res Array of time buckets being populated
   * @param {object} item Current history item
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
      res[0] = [item];
    }
    return res;
  }

  /**
   * Calculate coordinates (X, Y = 0, aggregated Value)
   * @param {Array<Array<object>|undefined>} buckets Array of grouped time buckets
   * @returns {Array<Array<number>>} Array of [X, Y, Value] coordinates
   */
  _calcPoints(buckets) {
    let xRatio = this._width / buckets.length;
    xRatio = Number.isFinite(xRatio) ? xRatio : this._width; // prevent "divide by 0"

    const coords = [];
    let lastValue = NaN;
    let x;

    for (let i = 0; i <= buckets.length; i += 1) {
      x = xRatio * i + this._margin[X];
      let currentPointValue;

      if (i === 0) {
        // left border
        const firstBucket = buckets[0];
        if (firstBucket && firstBucket[0]) {
          // state - either a number or NaN
          const firstValue = firstBucket[0].state;
          if (!Number.isNaN(firstValue)) {
            const zeroStartFuncs = ['sum', 'delta', 'diff'];
            if (zeroStartFuncs.includes(this._aggregateFuncName)) {
              lastValue = 0;
            } else {
              lastValue = firstValue;
            }
          } else {
            lastValue = NaN;
          }
        }
        currentPointValue = lastValue;
      } else {
        const bucket = buckets[i - 1];
        if (bucket && bucket.length > 0) {
          // calc aggregated value
          lastValue = this._calcPoint(bucket);
          currentPointValue = lastValue;
        } else {
          // no points in this bucket, use prev. point
          currentPointValue = lastValue;
        }
      }
      coords.push([x, 0, currentPointValue]);
    }
    return coords;
  }

  get hasCoords() { return this._coords.length > 0; }

  /**
   * Calculate and store Y coordinates for all points
   * @returns {void}
   */
  updateCoords() {
    this._coords = this.calcY(this._coords);
  }

  /**
   * Recalculate a point's coords based on min & max thresholds
   * @param {Array<Array<number>>} coords Array of X, Y, Value
   * @returns {Array<Array<number>>} Array of X, Y, Value,
   * where Y - recalculated based on min/max thresholds
   */
  calcY(coords) {
    // account for logarithmic graph
    const max = !Number.isNaN(this.max)
      ? this._logarithmic
        ? getLog10(this.max)
        : this.max
      : NaN;
    const min = !Number.isNaN(this.min)
      ? this._logarithmic
        ? getLog10(this.min)
        : this.min
      : NaN;

    if (Number.isNaN(max) || Number.isNaN(min)) {
      return coords.map(coord => [coord[X], NaN, coord[V]]);
    }

    const delta = Math.abs(max - min);
    let yRatio;
    if (max === min || delta < Number.EPSILON) {
      yRatio = 1;
    } else {
      yRatio = delta / this._height;
    }

    const coords2 = coords.map((coord) => {
      if (Number.isNaN(coord[V])) {
        return [coord[X], NaN, NaN];
      }

      const val = this._logarithmic ? getLog10(coord[V]) : coord[V];
      let coordY;
      if (this._invert) {
        coordY = ((val - min) / yRatio) + this._margin[Y] * 2;
      } else {
        coordY = this._height - ((val - min) / yRatio) + this._margin[Y] * 2;
      }
      return [coord[X], coordY, coord[V]];
    });

    return coords2;
  }

  /**
   * Get points with scaled Y-coordinates and handles line smoothing
   * @returns {Array<Array<number>>} Array of points [X, Y, Value, index]
   */
  getPoints() {
    if (this._smoothing) {
      const [first, ...rest] = this._coords;
      let last = first;
      return rest.map((point, i) => {
        const Z = this._midPoint(last[X], last[Y], point[X], point[Y]);
        const sum = (last[V] + point[V]) / 2; // 2-points smoothing
        last = point;
        return [Z[X], Z[Y], sum, i + 1];
      });
    } else {
      return this._coords.map((point, i) => [point[X], point[Y], point[V], i]);
    }
  }

  /**
   * Get SVG path for line chart with optional smoothing
   * @returns {string} SVG path
   */
  getPath() {
    let next;
    let Z;
    let path = '';
    let last = this._coords[0];
    path += `M${last[X]},${last[Y]}`; // move to 1st point

    this._coords.forEach((point) => {
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
   * Return a gradient used to set a gradiented color for a line & fill
   * @param {Array<object>} thresholds color_thresholds array
   * @returns {Array<object>} Gradient
   */
  computeGradient(thresholds) {
    const scale = this._logarithmic
      ? getLog10(this._max) - getLog10(this._min)
      : this._max - this._min;

    const gradientStops = thresholds.map((stop, index, arr) => {
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
      } else {
        // limit stopValue within max/min
        const stopValue = (stop.value >= this._max)
          ? this._max
          : (stop.value <= this._min)
            ? this._min
            : stop.value;
        // get Y coord for stopValue
        const [stopCoord] = this.calcY([[0, 0, stopValue]]);
        const [, coordY] = stopCoord;
        // calculate absolute offset
        offset = coordY / (this._height + this._margin[Y] * 4) * 100;
      }
      return {
        color: color || stop.color,
        offset,
      };
    });

    return this._invert
      ? gradientStops.reverse()
      : gradientStops;
  }

  /**
   * Get an SVG path for a fill
   * @param {string} path SVG path for a line
   * @returns {string} SVG path for a fill
   */
  getFill(path) {
    const height = this.baselineY;
    let fill = path;
    // note that currently this._margin[X] = 0 when fill is defined
    fill += ` L ${this._width + this._margin[X]}, ${height}`;
    fill += ` L ${this._coords[0][X]}, ${height} z`;
    return fill;
  }

  /**
   * Get bars for an entity
   * @param {number} position Index of a bar (0,1,..)
   * (i.e. index of an entity with a shown bar graph)
   * @returns {{width: number, items: Array<object>}} Bars for an entity
   * to be shown at a `position` index
   */
  getBars(position) {
    const spacing = this._bar_spacing;
    const spacing_group = this._bar_spacing_group;
    const total = this._total_bars_in_group;

    // number of measures
    const total_groups = this._coords.length;
    if (total_groups === 0) { // safety guard
      return {
        width: 0,
        items: [],
      };
    }

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

    const { baselineY } = this;

    const items = this._coords.map((coord, i) => {
      let y;
      const realY = coord[Y];
      if (realY <= baselineY) {
        y = realY;
      } else {
        y = baselineY;
      }
      const height = Math.abs(baselineY - realY);

      const x = this._margin[X]
        + (group_width + spacing_group) * i
        + (spacing === -1 ? 0 : (bar_width + spacing) * position);

      return {
        x,
        y,
        height,
        value: coord[V],
      };
    });

    return {
      width: bar_width,
      items,
    };
  }

  _midPoint(Ax, Ay, Bx, By) {
    const Zx = (Ax - Bx) / 2 + Bx;
    const Zy = (Ay - By) / 2 + By;
    return [Zx, Zy];
  }

  /**
   * Return "overall" value calculated for a whole period
   * using the overall aggregate function
   * @returns {number|undefined} "Overall" value
   */
  _calcOverall() {
    return this._history.length > 0
      ? this._overallAggregateFunc(this._history)
      : undefined;
  }

  /**
   * Calculate min/max bounds based on "coords" array
   * @returns {{min: number, max: number}} Min/max bounds (can be NaN for empty or NaN coords)
   */
  _calcBounds() {
    let max = NaN;
    let min = NaN;
    for (let i = 0; i < this._coords.length; i += 1) {
      const val = this._coords[i][V];
      if (!Number.isNaN(val)) {
        // process only numeric values
        if (Number.isNaN(max) || val > max) max = val;
        if (Number.isNaN(min) || val < min) min = val;
      }
    }
    return { max, min };
  }
}
