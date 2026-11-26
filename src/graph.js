import { interpolateRGB } from './color';
import {
  X, Y, V,
  ONE_HOUR,
  DEFAULT_GRAPH_HEIGHT,
  DEFAULT_GRAPH_WIDTH,
  DEFAULT_BAR_SPACING,
  DEFAULT_LINE_WIDTH,
  DEFAULT_BEZIERC_TENSION,
} from './const';
import {
  getLog10,
  log,
} from './utils';
import {
  getMidPoint,
  getMonotoneTangent,
} from './others';
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
   * smoothing?: boolean|string,
   * logarithmic?: boolean,
   * bar_spacing?: number,
   * bar_spacing_group?: number,
   * total_bars_in_group?: number,
   * baseline?: number,
   * tension?: number,
   * invert?: boolean }} [options={}] Graph configuration options
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
    tension = DEFAULT_BEZIERC_TENSION, // tension for Bezier C curve
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
    this._tension = tension;
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
   * @param {number} endTime Current interval's end time (timestamp in ms)
   * @param {Array<object>} [history=undefined] Array of historical data objects
   * @returns {void}
   */
  update(endTime, history = undefined) {
    if (history) {
      this._history = history;
    }
    if (!this._history) return;

    // update interval end date
    this._endTime = endTime;

    // group history into time buckets
    const histGroups = this._history.reduce((res, item) => this._reducer(res, item), []);

    // calculate "overall" value
    if (this._calculateOverall) {
      this._overall = this._calcOverall(histGroups);
    }

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
    xRatio = Number.isFinite(xRatio) // prevent division by 0
      ? xRatio
      : this._width;

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
   * @param {Array<Array<number>>} coords Array of [X, Y, Value]
   * @returns {Array<Array<number>>} Array of [X, Y, Value],
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

    return coords.map((coord) => {
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
  }

  /**
   * Get points with scaled Y-coordinates and handles line smoothing
   * @returns {Array<Array<number>>} Array of points [X, Y, Value, index]
   */
  getPoints() {
    if (!this.hasCoords) return []; // safety guard

    const points = [];
    const is2pointsSmoothing = this._smoothing === true;
    const len = this._coords.length;

    for (let i = 0; i < len; i += 1) {
      const point = this._coords[i];
      if (!Number.isNaN(point[Y])) {
        if (is2pointsSmoothing) {
          const prev = i > 0
            ? this._coords[i - 1]
            : null;
          const next = i < len - 1
            ? this._coords[i + 1]
            : null;
          const hasValidPrev = prev && !Number.isNaN(prev[Y]);
          const hasValidNext = next && !Number.isNaN(next[Y]);

          if (hasValidPrev) {
            const Z = getMidPoint(prev[X], prev[Y], point[X], point[Y]);
            const avgValue = (prev[V] + point[V]) / 2;
            points.push([Z[X], Z[Y], avgValue, i]);
          } else if (!hasValidNext) {
            // single point between two gaps
            points.push([point[X], point[Y], point[V], i]);
          }
        } else {
          points.push([point[X], point[Y], point[V], i]);
        }
      }
    }

    return points;
  }

  /**
   * Generate a single Cubic Bezier curve command for step from (i - 1) to i
   * @param {number} i Current point index in this._coords
   * @param {Array<number>} lastPoint Previous valid point [X, Y, Value]
   * @param {Array<number>} currPoint Current valid point [X, Y, Value]
   * @returns {string} SVG command fragment
   */
  _getBezierCStep(i, lastPoint, currPoint) {
    const arr = this._coords;
    const len = arr.length;
    const tension = this._tension;

    const p0 = (i - 2 >= 0 && !Number.isNaN(arr[i - 2][Y]))
      ? arr[i - 2]
      : lastPoint;
    const p1 = lastPoint;
    const p2 = currPoint;
    const p3 = (i + 1 < len && !Number.isNaN(arr[i + 1][Y]))
      ? arr[i + 1]
      : currPoint;

    // We need to prevent 'overshoot' glitches.
    // It is done by calculating tangents & applying a "Fritsch-Carlson guard".
    // More info here:
    // https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
    // https://en.wikipedia.org/wiki/Overshoot_(signal)

    // slope between p1 and p2
    const dx = p2[X] - p1[X];
    const d = dx > 0 // prevent division by 0
      ? (p2[Y] - p1[Y]) / dx
      : 0;

    // tangents on the beginning & at the end
    let m1 = getMonotoneTangent(p0, p1, p2) * tension;
    let m2 = getMonotoneTangent(p1, p2, p3) * tension;

    // Fritsch-Carlson guard to prevent 'overshoot'
    if (d !== 0) {
      const alpha = m1 / d;
      const beta = m2 / d;
      const sq = alpha * alpha + beta * beta;
      if (sq > 9) {
        const tau = 3 / Math.sqrt(sq);
        m1 *= tau;
        m2 *= tau;
      }
    }

    const cp1x = p1[X] + dx / 3;
    const cp1y = p1[Y] + (m1 * dx) / 3;
    const cp2x = p2[X] - dx / 3;
    const cp2y = p2[Y] - (m2 * dx) / 3;

    return ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[X]},${p2[Y]}`;
  }

  /**
   * Generate paths for line and/or fill
   * @param {object} options Path generation options
   * @param {boolean} options.buildLine True to build a path for line, false otherwise
   * @param {boolean} options.buildFill True to build a path for fill, false otherwise
   * @returns {{line: string, fill: string}} Generated paths
   */
  getLineAndFill({ buildLine, buildFill }) {
    if (!this.hasCoords || (!buildLine && !buildFill)) {
      return { line: '', fill: '' };
    }

    const isBezierC = this._smoothing === 'cubic';
    const height = buildFill
      ? this.baselineY
      : 0;
    const len = this._coords.length;

    let line = '';
    let fill = '';
    let firstX = 0;
    let lastPoint = null;
    let segmentLength = 0;

    // one loop for calculating both lines & fill
    for (let i = 0; i <= len; i += 1) {
      const currPoint = i < len
        ? this._coords[i]
        : null;
      const isGap = !currPoint || Number.isNaN(currPoint[Y]); // either a NaN gap or beyond coords

      if (!isGap) {
        let step = '';
        if (segmentLength === 0) {
          if (buildFill) {
            firstX = currPoint[X];
          }
          const cmd = (line || fill) // not equal to ''
            ? ' M ' // add a command
            : 'M '; // start with a command
          step = `${cmd}${currPoint[X]},${currPoint[Y]}`;
        } else if (isBezierC) {
          step = this._getBezierCStep(i, lastPoint, currPoint);
        } else {
          // continue processing a current segment
          const Z = this._smoothing
            ? getMidPoint(lastPoint[X], lastPoint[Y], currPoint[X], currPoint[Y])
            : currPoint;
          step = ` ${Z[X]},${Z[Y]} Q ${currPoint[X]},${currPoint[Y]}`;
        }

        if (buildLine) line += step;
        if (buildFill) fill += step;

        lastPoint = currPoint;
        segmentLength += 1;
      } else if (segmentLength > 0) {
        // either a NaN gap or beyond coords; finishing the last segment
        const endStep = segmentLength === 1
          ? ` L ${lastPoint[X]},${lastPoint[Y]}` // single point
          : !isBezierC
            ? ` ${lastPoint[X]},${lastPoint[Y]}` // line to last point
            : ''; // already processed in _getBezierCStep()

        if (buildLine) line += endStep;
        if (buildFill) {
          // adding a closed line for a fill (go down, go left)
          fill += `${endStep} L ${lastPoint[X]},${height} L ${firstX},${height} z`;
        }

        lastPoint = null;
        segmentLength = 0;
      }
    }

    return { line, fill };
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
      if (Number.isNaN(scale) || scale <= 0) {
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
   * Get bars for an entity
   * @param {number} position Index of a bar (0,1,..)
   * (i.e. index of an entity with a shown bar graph)
   * @returns {{width: number, items: Array<object>}} Bars for an entity
   * to be shown at a `position` index
   */
  getBars(position) {
    if (!this.hasCoords) { // safety guard
      return {
        width: 0,
        items: [],
      };
    }

    const spacing = this._bar_spacing;
    const spacing_group = this._bar_spacing_group;
    const total = this._total_bars_in_group;

    // number of measures
    const total_groups = this._coords.length;

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
      let height;
      const realY = coord[Y];
      if (!Number.isNaN(realY)) {
        if (realY <= baselineY) {
          y = realY;
        } else {
          y = baselineY;
        }
        height = Math.abs(baselineY - realY);
      } else {
        y = baselineY;
        height = 0;
      }

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

  /**
   * Return "overall" value calculated for a whole period
   * using the overall aggregate function
   * @param {Array<Array<object>>} histGroups Grouped time buckets
   * @returns {number|undefined} "Overall" value
   */
  _calcOverall(histGroups) {
    const history = histGroups.flat();
    return history.length > 0
      ? this._overallAggregateFunc(history)
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
