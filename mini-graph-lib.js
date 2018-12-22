export default class Graph {
  constructor(width, height, margin) {
    this.width = width - margin * 2;
    this.height = height - margin * 4;
    this.margin = margin;
    this.min = null;
    this.max = null;
  }

  coordinates(history, hours, detail = 1) {
    history = history.filter(item => !Number.isNaN(Number(item.state)));
    this.min = Math.min.apply(Math, history.map(item =>  Number(item.state)));
    this.max = Math.max.apply(Math, history.map(item =>  Number(item.state)));
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
    return this._calcCoords(history, hours, detail);
  }

  _calcCoords(history, hours, detail = 1) {
    const coords = []
    let xRatio = this.width / (hours - (detail === 1 ? 1 : 0));
    xRatio = isFinite(xRatio) ? xRatio : this.width;
    const yRatio = ((this.max - this.min) / this.height) || 1;

    const getCoords = (item, i, offset = 0, depth = 1) => {
      if (depth > 1)
        return item.forEach((item, index) => getCoords(item, i, index, depth - 1));
      const average = item.reduce((sum, entry) => {
        return (sum + parseFloat(entry.state));
      }, 0) / item.length;
      const x = xRatio * (i + (offset / 6)) + this.margin;
      const y = this.height - ((average - this.min) / yRatio) + this.margin * 2;
      coords.push([x,y]);
    }

    history.forEach((item, i) => getCoords(item, i, 0, detail))
    if (coords.length === 1) coords[1] = [this.width + this.margin, coords[0][1]];
    coords.push([this.width + this.margin, coords[coords.length -1][1]]);
    return coords;
  }

  getPath(coords) {
    let next, Z;
    let X = 0;
    let Y = 1;
    let path = '';
    let last = coords.filter(Boolean)[0]
    path += `M ${last[X]},${last[Y]}`;

    coords.forEach(point => {
      next = point;
      Z = this._midPoint(last[X], last[Y], next[X], next[Y]);
      path += ` ${Z[X]},${Z[Y]}`;
      path += ` Q${next[X]},${next[Y]}`;
      last = next;
    })

    path += ` ${next[X]},${next[Y]}`;
    return path;
  }

  _midPoint(Ax, Ay, Bx, By) {
    const Zx = (Ax-Bx) / 2 + Bx;
    const Zy = (Ay-By) / 2 + By;
    return new Array(Zx, Zy);
  }
}
