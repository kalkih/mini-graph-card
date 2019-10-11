import { X, Y, V } from './const';
import { interpolateColor } from './utils';

export default class Graph {
  constructor(width, height, margin, hours = 24, points = 1, aggregateFuncName = 'avg', groupBy = 'interval') {
    const aggregateFuncMap = {
      avg: this._average,
      max: this._maximum,
      min: this._minimum,
    };

    this.coords = [];
    this.width = width - margin[X] * 2;
    this.height = height - margin[Y] * 2;
    this.margin = margin;
    this._max = 0;
    this._min = 0;
    this.points = points;
    this.hours = hours;
    this._calculatePoint = aggregateFuncMap[aggregateFuncName] || this._average;
    this._groupBy = groupBy;
  }

  get max() { return this._max; }

  set max(max) { this._max = max; }

  get min() { return this._min; }

  set min(min) { this._min = min; }

  update(history) {
    const groupByFunc = this._groupBy === 'date' ? this._getGroupByDateFunc() : this._getGroupByIntervalFunc();
    const coords = history.reduce((res, item) => groupByFunc(res, item), []);


    const requiredNumOfPoints = Math.ceil(this.hours * this.points);
    if (coords.length > requiredNumOfPoints) {
      // if there is too much data we reduce it
      coords.splice(0, coords.length - requiredNumOfPoints);
    } else {
      // extend length to match the required number of points
      coords.length = requiredNumOfPoints;
    }

    this.coords = this._calcPoints(coords);
    this.min = Math.min(...this.coords.map(item => Number(item[V])));
    this.max = Math.max(...this.coords.map(item => Number(item[V])));
  }

  _getGroupByIntervalFunc() {
    const now = new Date().getTime();
    return (res, item) => {
      const age = now - new Date(item.last_changed).getTime();
      const interval = (age / (1000 * 3600) * this.points) - this.hours * this.points;
      const key = Math.floor(Math.abs(interval));
      if (!res[key]) res[key] = [];
      res[key].push(item);
      return res;
    };
  }

  _getGroupByDateFunc() {
    const dateToKeyMap = {};
    return (res, item) => {
      const date = new Date(item.last_changed).toDateString();
      if (dateToKeyMap[date] === undefined) dateToKeyMap[date] = res.length;
      const key = dateToKeyMap[date];
      if (!res[key]) res[key] = [];
      res[key].push(item);
      return res;
    };
  }

  _calcPoints(history) {
    const coords = [];
    let xRatio = this.width / (this.hours * this.points - 1);
    xRatio = Number.isFinite(xRatio) ? xRatio : this.width;

    const first = history.filter(Boolean)[0];
    let last = [this._calculatePoint(first), this._last(first)];
    const getCoords = (item, i) => {
      const x = xRatio * i + this.margin[X];
      if (item)
        last = [this._calculatePoint(item), this._last(item)];
      return coords.push([x, 0, item ? last[0] : last[1]]);
    };

    for (let i = 0; i < history.length; i += 1)
      getCoords(history[i], i);

    if (coords.length === 1) coords[1] = [this.width + this.margin[X], 0, coords[0][V]];
    return coords;
  }

  _calcY(coords) {
    const yRatio = ((this.max - this.min) / this.height) || 1;
    return coords.map(coord => [
      coord[X],
      this.height - ((coord[V] - this.min) / yRatio) + this.margin[Y] * 1,
      coord[V],
    ]);
  }

  getPoints() {
    const coords = this._calcY(this.coords);
    let next; let Z;
    let last = coords[0];
    coords.shift();
    const coords2 = coords.map((point, i) => {
      next = point;
      Z = this._midPoint(last[X], last[Y], next[X], next[Y]);
      const sum = (next[V] + last[V]) / 2;
      last = next;
      return [Z[X], Z[Y], sum, i + 1];
    });
    return coords2;
  }

  getPath() {
    const coords = this._calcY(this.coords);
    let next; let Z;
    let path = '';
    let last = coords[0];
    path += `M${last[X]},${last[Y]}`;

    coords.forEach((point) => {
      next = point;
      Z = this._midPoint(last[X], last[Y], next[X], next[Y]);
      path += ` ${Z[X]},${Z[Y]}`;
      path += ` Q ${next[X]},${next[Y]}`;
      last = next;
    });
    path += ` ${next[X]},${next[Y]}`;
    return path;
  }

  computeGradient(thresholds) {
    const scale = this._max - this._min;

    return thresholds.map((stop, index, arr) => {
      let color;
      if (stop.value > this._max && arr[index + 1]) {
        const factor = (this._max - arr[index + 1].value) / (stop.value - arr[index + 1].value);
        color = interpolateColor(arr[index + 1].color, stop.color, factor);
      } else if (stop.value < this._min && arr[index - 1]) {
        const factor = (arr[index - 1].value - this._min) / (arr[index - 1].value - stop.value);
        color = interpolateColor(arr[index - 1].color, stop.color, factor);
      }
      return {
        color: color || stop.color,
        offset: scale <= 0 ? 0 : (this._max - stop.value) * (100 / scale),
      };
    });
  }

  getFill(path) {
    const height = this.height + this.margin[Y] * 2;
    let fill = path;
    fill += ` L ${this.width - this.margin[X] * 2}, ${height}`;
    fill += ` L ${this.coords[0][X]}, ${height} z`;
    return fill;
  }

  getBars(position, total) {
    const coords = this._calcY(this.coords);
    const margin = 4;
    const xRatio = ((this.width - margin) / Math.ceil(this.hours * this.points)) / total;
    return coords.map((coord, i) => ({
      x: (xRatio * i * total) + (xRatio * position) + margin,
      y: coord[Y],
      height: this.height - coord[Y] + this.margin[Y] * 3,
      width: xRatio - margin,
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

  _maximum(items) {
    return Math.max(...items.map(item => item.state));
  }

  _minimum(items) {
    return Math.min(...items.map(item => item.state));
  }

  _last(items) {
    return parseFloat(items[items.length - 1].state) || 0;
  }
}
