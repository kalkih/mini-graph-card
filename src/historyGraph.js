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

  updateHistory(history = undefined) {
    if (history) {
      this._history = history;
    }
    if (!this._history) return;
    this._updateEndTime();

    this.coords = this._calcHistoryPoints(this._history);
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
    let prevTime = start;

    console.log({ history });
    history.reverse().forEach((item) => {
      const next = (item.last_changed - start) / span;
      const lastChangedDate = new Date(item.last_changed);
      coords.push([prev, next < 0 ? 0 : next, { startTime: lastChangedDate, endTime: prevTime, value: item.state }]);
      prev = next;
      prevTime = lastChangedDate;
    });
    return coords;
  }

  getHistoryBars(stateEntity/* position , spacing = 4 */) {
    return this.coords.map((coord) => {
      const obj = {
        x: (500 * coord[Y]),
        y: 0,
        height: 25,
        width: (500 * (coord[X] - coord[Y])),
        value: coord[V].value,
        startTime: coord[V].startTime,
        endTime: coord[V].endTime,
        stateEntity,
      //   coord,
      };
      console.log({ name: 'getHistoryBars', this: this, obj });
      return obj;
    });
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
