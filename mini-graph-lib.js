export default function getGraph(graphData, width, height) {
  const values = getValueArray(graphData);
  const coordinates = calcCoordinates(values, width, height);
  return getPath(coordinates);
}

function getValueArray(graphData) {
  return graphData.map((item) => {
    return item.state;
  })
}

function calcCoordinates(values, width, height) {
  const min = Math.floor(Math.min.apply(null, values) * 0.98);
  const max = Math.ceil(Math.max.apply(null, values) * 1.02);

  const yRatio = (max - min) / height;
  const xRatio = width / (values.length - 2);

  return values.map((value, i) => {
    let y = height - ((value - min) / yRatio );
    let x = (xRatio * i) - (xRatio / 2);
    return [x,y];
  })
}

function getPath(points) {
  let first, second, next, Z;
  let X = 0;
  let Y = 1;
  let path = '';
  let point = points[0];

  path += 'M' + point[X] + ',' + point[Y];
  first = point;

  for (let i = 1; i < points.length; i++) {
    next = points[i];
    Z = midPoint(point[X], point[Y], next[X], next[Y]);
    path += ' ' + Z[X] + ',' + Z[Y];
    path += 'Q' + next[X] + ',' + next[Y];
    point = next;
  }

  second = points[1];
  Z = midPoint(first[X], first[Y], second[X], second[Y]);

  path += 'Q' + first[X] + ',' + first[Y];
  path += ' ' + Z[X] + ',' + Z[Y];
  path += 'Z';
  return path;
}

function midPoint(Ax, Ay, Bx, By) {
  const Zx = (Ax-Bx)/2 + Bx;
  const Zy = (Ay-By)/2 + By;
  return new Array(Zx, Zy);
}
