const X = 0;
const Y = 1;

export default class Graph {
  constructor(width, height, margin, hours = 24, points = 1) {
    this.coords = [];
    this.width = width - margin[X] * 2;
    this.height = height - margin[Y] * 2;
    this.margin = margin;
    this._max = 0;
    this._min = 0;
    this.points = points;
    this.hours = hours
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

  update(history) {
    const now = new Date().getTime();
    const reduce = (res, item) => {
      const age = now - new Date(item.last_changed).getTime();
      const interval = (age / (1000 * 3600) * this.points) - this.hours * this.points;
      const key = Math.abs(Math.floor(interval));
      if (!res[key]) res[key] = [];
      res[key].push(item);
      return res;
    }
    history = history.reduce((res, item) => reduce(res, item), []);
    history.length = Math.ceil(this.hours * this.points + 1);

    this.coords = this._calcPoints(history);
    this.min = Math.min(...this.coords.map(item => Number(item[2])));
    this.max = Math.max(...this.coords.map(item => Number(item[2])));
  }

  _calcPoints(history) {
    const coords = []
    let xRatio = this.width / (this.hours * this.points);
    xRatio = isFinite(xRatio) ? xRatio : this.width;

    let first = history.filter(Boolean)[0];
    let last = [0, this._average(first)];
    const getCoords = (item, i) => {
      const x = xRatio * i + this.margin[X];
      if (item)
        last = [0, this._average(item)];
      return coords.push([x, ...last]);
    }

    for (let i = 0; i < history.length; i++)
      getCoords(history[i], i);

    if (coords.length === 1) coords[1] = [this.width + this.margin[X], 0, coords[0][2]];
    return coords;
  }

  _calcY(coords) {
    const yRatio = ((this.max - this.min) / this.height) || 1;
    return coords.map(coord => {
      coord[Y] = this.height - ((coord[2] - this.min) / yRatio) + this.margin[Y] * 1.5;
      return coord;
    });
  }

  getPoints() {
    let coords = this._calcY(this.coords);
    let next, Z;
    let last = coords[0];
    coords.shift();
    const coords2 = coords.map((point, i) => {
      next = point;
      Z = this._midPoint(last[X], last[Y], next[X], next[Y]);
      const sum = (next[2] + last[2]) / 2;
      last = next;
      return [Z[X], Z[Y], sum, i];
    });
    return coords2;
  }

  getPath() {
    const coords = this._calcY(this.coords);
    let next, Z;
    let path = '';
    let last = coords.filter(Boolean)[0]
    path += `M${last[X]},${last[Y]}`;

    coords.forEach(point => {
      next = point;
      Z = this._midPoint(last[X], last[Y], next[X], next[Y]);
      path += ` ${Z[X]},${Z[Y]}`;
      path += ` Q ${next[X]},${next[Y]}`;
      last = next;
    });

    path += ` ${next[X]},${next[Y]}`;
    return path;
  }

  getFill(path) {
    const height = this.height + this.margin[Y] * 2;
    path += ` L ${this.width - this.margin[X] * 2}, ${height}`;
    path += ` L ${this.coords[0][X]}, ${height} z`;
    return path;
  }

  _midPoint(Ax, Ay, Bx, By) {
    const Zx = (Ax-Bx) / 2 + Bx;
    const Zy = (Ay-By) / 2 + By;
    return new Array(Zx, Zy);
  }

  _average(item) {
    return item.reduce((sum, entry) => {
      return (sum + parseFloat(entry.state));
    }, 0) / item.length;
  }
}
