import {
  X, Y,
} from './const';

Date.prototype.addHours = (h) => {
  const dateReturn = new Date();
  dateReturn.setTime(dateReturn.getTime() + (new Date(h) * 60 * 60 * 1000));
  return dateReturn;
};

export default class HistoryGraph {
  constructor(width, height, margin, hours = 24) {
    this._history = undefined;
    this.coords = [];
    this.width = width - margin[X] * 2;
    this.height = height - margin[Y] * 4;
    this.margin = margin;
    this.hours = hours;
    this._endTime = 0;
  }

  set history(data) { this._history = data; }

  update(history = undefined) {
    if (history) {
      this._history = history;
    }
    if (!this._history) return;
    this._updateEndTime();

    this.coords = this._calcHistoryPoints(this._history);
  }

  _calcHistoryPoints(history) {
    const coords = [];
    const end = new Date(this._endTime);
    const start = (new Date(end)).addHours(0 - this.hours);
    const span = end - start;
    let prev = 1;
    let prevTime = new Date(start);

    history.sort((a, b) => ((a.last_changed < b.last_changed) ? 1 : -1)).forEach((item) => {
      const next = (item.last_changed - start) / span;
      const lastChangedDate = new Date(item.last_changed);

      const coord = {
        endRatio: prev,
        startRatio: next < 0 ? 0 : next,
        startTime: lastChangedDate,
        endTime: prevTime,
        value: item.state,
      };

      coords.push(coord);
      prev = next;
      prevTime = new Date(lastChangedDate);
    });
    return coords;
  }

  getHistoryBars(stateEntity/* position , spacing = 4 */) {
    return this.coords.map((coord) => {
      const obj = {
        x: (this.width * coord.startRatio),
        width: (this.width * (coord.endRatio - coord.startRatio)),
        value: coord.value,
        startTime: coord.startTime,
        endTime: coord.endTime,
        stateEntity,
      };
      return obj;
    });
  }

  _updateEndTime() {
    this._endTime = new Date();
  }
}
