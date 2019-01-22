export default class Graph {
  constructor(width, height, margin) {
    this.coords = [];
    this.width = width - margin * 2;
    this.height = height - margin * 4;
    this.margin = margin;
    this._max = 0;
    this._min = 0;
  }

  get max() {
    return this._max;
  }
  set max(max) {
    this._max = max;
  }
  get min() {
    return this._min;
  }
  set min(min) {
    this._min = min;
  }

  update(history, hours, detail) {
    history = history.filter(item => !Number.isNaN(Number(item.state)));
    const now = new Date().getTime();

    const reduce = (res, item, min = false) => {
      const age = now - new Date(item.last_changed).getTime();
      let key = Math.abs(age / (1000 * 3600) - hours);
      if (min) {
        key = ((key - Math.floor(key)) * 60);
        key = (Math.round(key / 10) * 10).toString()[0];
      } else {
        key = Math.floor(key);
      }
      if (!res[key]) res[key] = [];
      res[key].push(item);
      return res;
    }
    history = history.reduce((res, item) => reduce(res, item), []);
    if (detail > 1) {
      history = history.map(entry => {
        return entry.reduce((res, item) => reduce(res, item, true), []);
      });
    }
    this.coords = this._calcCoords(history, hours, detail);

    this.min = Math.min.apply(Math, this.coords.map(item =>  Number(item[1])));
    this.max = Math.max.apply(Math, this.coords.map(item =>  Number(item[1])));
  }

  _calcCoords(history, hours, detail = 1) {
    const coords = []
    let xRatio = this.width / (hours - (detail === 1 ? 1 : 0));
    xRatio = isFinite(xRatio) ? xRatio : this.width;

    const getCoords = (item, i, offset = 0, depth = 1) => {
      if (depth > 1)
        return item.forEach((item, index) => getCoords(item, i, index, depth - 1));
      const average = item.reduce((sum, entry) => {
        return (sum + parseFloat(entry.state));
      }, 0) / item.length;
      const x = xRatio * (i + (offset / 6)) + this.margin;
      coords.push([x,average]);
    }
    history.forEach((item, i) => getCoords(item, i, 0, detail))
    if (coords.length === 1) coords[1] = [this.width + this.margin, coords[0][1]];
    coords.push([this.width + this.margin, coords[coords.length -1][1]]);
    return coords;
  }

  getPath(hours, detail = 1) {
    const coords = this.coords;
    const yRatio = ((this.max - this.min) / this.height) || 1;
    coords.forEach(coord => {
      coord[1] = this.height - ((coord[1] - this.min) / yRatio) + this.margin * 2;
    });
    let next, Z;
    const X = 0;
    const Y = 1;
    let path = '';
    let last = coords.filter(Boolean)[0]
    path += `M${last[X]},${last[Y]}`;

    coords.forEach(point => {
      next = point;
      Z = this._midPoint(last[X], last[Y], next[X], next[Y]);
      path += ` ${Z[X]},${Z[Y]}`;
      path += ` Q${next[X]},${next[Y]}`;
      last = next;
    });

    path += ` ${next[X]},${next[Y]}`;
    return path;
  }

  _midPoint(Ax, Ay, Bx, By) {
    const Zx = (Ax-Bx) / 2 + Bx;
    const Zy = (Ay-By) / 2 + By;
    return new Array(Zx, Zy);
  }
}
