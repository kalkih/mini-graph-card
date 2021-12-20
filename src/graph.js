import { interpolateColor } from './utils';
import {
  X, Y, V,
  ONE_HOUR,
} from './const';

Date.prototype.addHours = (h) => {
  const dateReturn = new Date();
  dateReturn.setTime(dateReturn.getTime() + (h * 60 * 60 * 1000));
  return dateReturn;
};

export default class Graph {
  constructor(width, height, margin, hours = 24, points = 1, aggregateFuncName = 'avg', groupBy = 'interval', smoothing = true) {
    this._history = undefined;
    this.coords = [];
    this.width = width - margin[X] * 2;
    this.height = height - margin[Y] * 4;
    this.margin = margin;
    this._max = 0;
    this._min = 0;
    this.points = points;
    this.hours = hours;
    this.aggregateFuncName = aggregateFuncName;
    this._calcPoint = this._average;
    this._smoothing = smoothing;
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

    console.log({ update: this._history, histGroups });

    // drop potential out of bound entry's except one
    if (histGroups[0] && histGroups[0].length) {
      histGroups[0] = [histGroups[0][histGroups[0].length - 1]];
    }

    // extend length to fill missing history
    const requiredNumOfPoints = Math.ceil(this.hours * this.points);
    histGroups.length = requiredNumOfPoints;


    // this.coords = this._calcPoints2(this._history);
    this.coords = this._calcPoints(histGroups);
    this.min = Math.min(...this.coords.map(item => Number(item[V])));
    this.max = Math.max(...this.coords.map(item => Number(item[V])));
  }

  updateHistory(history = undefined) {
    if (history) {
      this._history = history;
    }
    if (!this._history) return;
    this._updateEndTime();

    // const histGroups = this._history.reduce((res, item) => this._reducer(res, item), []);

    // console.log({ updateHistory: this._history, histGroups });

    // // drop potential out of bound entry's except one
    // if (histGroups[0] && histGroups[0].length) {
    //   histGroups[0] = [histGroups[0][histGroups[0].length - 1]];
    // }

    // // extend length to fill missing history
    // const requiredNumOfPoints = Math.ceil(this.hours * this.points);
    // histGroups.length = requiredNumOfPoints;

    this.coords = this._calcHistoryPoints(this._history);
    // this.min = Math.min(...this.coords.map(item => Number(item[V])));
    // this.max = Math.max(...this.coords.map(item => Number(item[V])));
  }

  _reducer(res, item) {
    const age = this._endTime - new Date(item.last_changed).getTime();
    const interval = (age / ONE_HOUR * this.points) - this.hours * this.points;
    const key = interval < 0 ? Math.floor(Math.abs(interval)) : 0;
    if (!res[key]) res[key] = [];
    res[key].push(item);
    return res;
  }


  _calcHistoryPoints(history) {
    const coords = [];
    const end = this._endTime;
    const start = end.addHours(0 - this.hours);
    const span = end - start;
    let prev = 1;

    history.reverse().forEach((item) => {
      const next = (item.last_changed - start) / span;
      coords.push([prev, next < 0 ? 0 : next, item.state]);
      prev = next;
    });
    return coords;
  }

  _calcPoints(history) {
    const coords = [];
    let xRatio = this.width / (this.hours * this.points - 1);
    xRatio = Number.isFinite(xRatio) ? xRatio : this.width;

    const first = history.filter(Boolean)[0];
    let last = [this._calcPoint(first), this._lastValue(first)];

    console.log({
      name: '_calcPoints(history)',
      this: this,
      history,
      first,
      last,
      xRatio,
    });

    // let prev = null;
    const getCoords = (item, i) => {
      const x = xRatio * i + this.margin[X];
      if (item) {
        // prev = item;
        last = [this._calcPoint(item), this._lastValue(item)];

        // console.log({ this: this, coord: [x, 0, item ? last[0] : last[1]] });
        return coords.push([x, 0, item ? last[0] : last[1]]);
      }
    };

    for (let i = 0; i < history.length; i += 1)
      getCoords(history[i], i);

    return coords;
  }

  _calcY(coords) {
    const yRatio = ((this.max - this.min) / this.height) || 1;
    return coords.map(coord => [
      coord[X],
      this.height - ((coord[V] - this.min) / yRatio) + this.margin[Y] * 2,
      coord[V],
    ]);
  }

  getPoints() {
    let { coords } = this;
    if (coords.length === 1) {
      coords[1] = [this.width + this.margin[X], 0, coords[0][V]];
    }
    coords = this._calcY(this.coords);
    let next; let Z;
    let last = coords[0];
    coords.shift();
    const coords2 = coords.map((point, i) => {
      next = point;
      Z = this._smoothing ? this._midPoint(last[X], last[Y], next[X], next[Y]) : next;
      const sum = this._smoothing ? (next[V] + last[V]) / 2 : next[V];
      last = next;
      return [Z[X], Z[Y], sum, i + 1];
    });
    return coords2;
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
    const height = this.height + this.margin[Y] * 4;
    let fill = path;
    fill += ` L ${this.width - this.margin[X] * 2}, ${height}`;
    fill += ` L ${this.coords[0][X]}, ${height} z`;
    return fill;
  }

  getBars(position, total, spacing = 4) {
    const coords = this._calcY(this.coords);
    const xRatio = ((this.width - spacing) / Math.ceil(this.hours * this.points)) / total;
    return coords.map((coord, i) => ({
      x: (xRatio * i * total) + (xRatio * position) + spacing,
      y: coord[Y],
      height: this.height - coord[Y] + this.margin[Y] * 4,
      width: xRatio - spacing,
      value: coord[V],
    }));
  }

  getHistoryBars(stateEntity/* position , spacing = 4 */) {
    return this.coords.map((coord) => {
      const obj = {
        x: (500 * coord[Y]),
        y: 0,
        height: 25,
        width: (500 * (coord[X] - coord[Y])),
        value: coord[V],
        stateEntity,
      //   coord,
      };
      console.log({ name: 'getHistoryBars', this: this, obj });
      return obj;
    });
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

  _lastValue(items) {
    if (this.aggregateFuncName === 'delta') {
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
