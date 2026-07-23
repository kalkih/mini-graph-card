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
    hours = 24,
    points = 1,
    aggregateFuncName = 'avg',
    groupBy = 'interval',
    smoothing = true,
    logarithmic = false,
    bar_spacing = DEFAULT_BAR_SPACING, // spacing between bars
    bar_spacing_group = DEFAULT_BAR_SPACING, // spacing between groups of bars
    total_bars_in_group = 1, // number of bars (i.e. number of entities with a shown bar graph)
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
    this.width = width - margin[X] * 2;
    this.height = height - margin[Y] * 4;
    this.margin = margin;
    this._max = 0;
    this._min = 0;
    this.points = points; // stands for "points_per_hour"
    this.hours = hours; // stands for "hours_to_show"
    this.aggregateFuncName = aggregateFuncName;
    this._calcPoint = aggregateFuncMap[aggregateFuncName] || this._average;
    this._smoothing = smoothing;
    this.logarithmic = logarithmic;
    this.bar_spacing = bar_spacing;
    this.bar_spacing_group = bar_spacing_group;
    this.total_bars_in_group = total_bars_in_group;
    this._groupBy = groupBy;
    this._endTime = 0;
  }

  get max() { return this._max; }

  set max(max) { this._max = max; }

  get min() { return this._min; }

  set min(min) { this._min = min; }

  set history(data) { this._history = data; }

  update(history = undefined) {
    if (history) {
      this._history = history;
    }
    if (!this._history) return;
    this._updateEndTime();

    const histGroups = this._history.reduce((res, item) => this._reducer(res, item), []);

    // extend length to fill missing history
    const requiredNumOfPoints = Math.ceil(this.hours * this.points);
    histGroups.length = requiredNumOfPoints;

    this.coords = this._calcPoints(histGroups);
    this.min = Math.min(...this.coords.map(item => Number(item[V])));
    this.max = Math.max(...this.coords.map(item => Number(item[V])));
  }

  _reducer(res, item) {
    const age = this._endTime - new Date(item.last_changed).getTime();
    const interval = (age / ONE_HOUR * this.points) - this.hours * this.points;
    if (interval < 0) {
      const key = Math.floor(Math.abs(interval));
      if (!res[key]) res[key] = [];
      res[key].push(item);
    } else {
      res[0] = [item];
    }
    return res;
  }

  _calcPoints(history) {
    let xRatio = this.width / (this.hours * this.points - 1);
    xRatio = Number.isFinite(xRatio) ? xRatio : this.width;

    const coords = [];
    let last = history.filter(Boolean)[0];
    let x;
    for (let i = 0; i < history.length; i += 1) {
      x = xRatio * i + this.margin[X];
      if (history[i]) {
        last = history[i];
        coords.push([x, 0, this._calcPoint(last)]);
      } else {
        coords.push([x, 0, this._lastValue(last)]);
      }
    }
    return coords;
  }

  _calcY(coords) {
    // account for logarithmic graph
    const max = this.logarithmic ? Math.log10(Math.max(1, this.max)) : this.max;
    const min = this.logarithmic ? Math.log10(Math.max(1, this.min)) : this.min;

    const yRatio = ((max - min) / this.height) || 1;
    const coords2 = coords.map((coord) => {
      const val = this.logarithmic ? Math.log10(Math.max(1, coord[V])) : coord[V];
      const coordY = this.height - ((val - min) / yRatio) + this.margin[Y] * 2;
      return [coord[X], coordY, coord[V]];
    });

    return coords2;
  }

  getPoints() {
    let { coords } = this;
    if (coords.length === 1) {
      coords[1] = [this.width + this.margin[X], 0, coords[0][V]];
    }
    coords = this._calcY(this.coords);
    if (this._smoothing) {
      let last = coords[0];
      coords.shift();
      return coords.map((point, i) => {
        const Z = this._midPoint(last[X], last[Y], point[X], point[Y]);
        const sum = (last[V] + point[V]) / 2;
        last = point;
        return [Z[X], Z[Y], sum, i + 1];
      });
    } else {
      return coords.map((point, i) => [point[X], point[Y], point[V], i]);
    }
  }


  getPath() {
    let { coords } = this;
    if (coords.length === 1) {
      coords[1] = [this.width + this.margin[X], 0, coords[0][V]];
    }
    coords = this._calcY(this.coords);
    let next; let Z;
    let path = '';
    let last = coords[0];
    path += `M${last[X]},${last[Y]}`;

    coords.forEach((point) => {
      next = point;
      Z = this._smoothing ? this._midPoint(last[X], last[Y], next[X], next[Y]) : next;
      path += ` ${Z[X]},${Z[Y]}`;
      path += ` Q ${next[X]},${next[Y]}`;
      last = next;
    });
    path += ` ${next[X]},${next[Y]}`;
    return path;
  }

  computeGradient(thresholds) {
    const scale = this.logarithmic
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
      } else if (this.logarithmic) {
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

  getFill(path) {
    const height = this.height + this.margin[Y] * 4;
    let fill = path;
    // note that currently this.margin[X] = 0 when fill is defined
    fill += ` L ${this.width + this.margin[X]}, ${height}`;
    fill += ` L ${this.coords[0][X]}, ${height} z`;
    return fill;
  }

  /**
   * Get bars for an entity
   * @param {number} position Index of a bar (0,1,..)
   * (i.e. index of an entity with a shown bar graph)
   * @returns Bars for an entity to be shown at a `position` index
   */
  getBars(position) {
    const spacing = this.bar_spacing;
    const spacing_group = this.bar_spacing_group;
    const total = this.total_bars_in_group;

    const coords = this._calcY(this.coords);

    // number of measures
    const total_groups = Math.ceil(this.hours * this.points);

    // width of a group of bars
    const group_width = (this.width - spacing_group * (total_groups - 1))
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
      x: this.margin[X]
        + (group_width + spacing_group) * i
        + (spacing === -1 ? 0 : (bar_width + spacing) * position),
      y: coord[Y],
      height: this.height - coord[Y] + this.margin[Y] * 4,
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
    if (['delta', 'diff'].includes(this.aggregateFuncName)) {
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
