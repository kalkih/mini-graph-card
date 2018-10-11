export default function getGraph(graphData, width, height, line_width) {
  const values = getValueArray(graphData);
  const coords = calcCoordinates(values, width, height, line_width);
  return getPath(coords);
}

function getValueArray(items) {
  return items.map(item => Number(item.state) || 0);
}

function calcCoordinates(values, width, height, line_width) {
  const margin = line_width;
  width -= margin * 2;
  height -= margin * 2;
  const min = Math.floor(Math.min.apply(null, values) * 0.995);
  const max = Math.ceil(Math.max.apply(null, values) * 1.005);

  const yRatio = (max - min) / height;
  const xRatio = width / (values.length - 1);

  return values.map((value, i) => {
    const x = (xRatio * i) + margin;
    const y = height - ((value - min) / yRatio);
    return [x,y];
  })
}

function getPath(points) {
  let next, Z;
  let X = 0;
  let Y = 1;
  let path = '';
  let point = points[0];

  path += `M ${point[X]},${point[Y]}`;

  for (let i = 0; i < points.length; i++) {
    next = points[i];
    Z = midPoint(point[X], point[Y], next[X], next[Y]);
    path += ` ${Z[X]},${Z[Y]}`;
    path += ` Q${next[X]},${next[Y]}`;
    point = next;
  }

  path += ` ${next[X]},${next[Y]}`;
  return path;
}

function midPoint(Ax, Ay, Bx, By) {
  const Zx = (Ax-Bx) / 2 + Bx;
  const Zy = (Ay-By) / 2 + By;
  return new Array(Zx, Zy);
}
