export const VERSION = 2;

export default function getGraph(graphData, width, height, line_width) {
  const values = getValueArray(graphData);
  const coords = calcCoordinates(values, width, height, line_width);
  return getPath(coords);
}

function getValueArray(graphData) {
  return graphData.map((item) => {
    return Number(item.state);
  })
}

function calcCoordinates(values, width, height, line_width) {
  const margin = line_width;
  width -= margin * 2;
  const min = Math.floor(Math.min.apply(null, values) * 0.95);
  const max = Math.ceil(Math.max.apply(null, values) * 1.05);

  const yRatio = (max - min) / height;
  const xRatio = width / (values.length - 1);

  return values.map((value, i) => {
    let y = height - ((value - min) / yRatio);
    let x = (xRatio * i) + margin;
    return [x,y];
  })
}

function getPath(points) {
  const SPACE = ' ';
  let first, second, next, Z;
  let X = 0;
  let Y = 1;
  let path = '';
  let point = points[0];

  path += 'M' + point[X] + ',' + point[Y];
  first = point;

  for (let i = 0; i < points.length; i++) {
    next = points[i];
    Z = midPoint(point[X], point[Y], next[X], next[Y]);
    path += SPACE + Z[X] + ',' + Z[Y];
    path += 'Q' + Math.floor(next[X]) + ',' + next[Y];
    point = next;
  }

  second = points[1];
  Z = midPoint(first[X], first[Y], second[X], second[Y]);
  path += SPACE + Math.floor(next[X])  + '.' + points[points.length -1];
  return path;
}

function midPoint(Ax, Ay, Bx, By) {
  const Zx = (Ax-Bx) / 2 + Bx;
  const Zy = (Ay-By) / 2 + By;
  return new Array(Zx, Zy);
}
