const average = items => items.reduce((sum, val) => sum + val, 0) / items.length;

const median = (items) => {
  const itemsDup = [...items].sort((a, b) => a - b);
  const mid = Math.floor(itemsDup.length / 2);
  if (itemsDup.length % 2 === 1)
    return itemsDup[mid];
  return (itemsDup[mid - 1] + itemsDup[mid]) / 2;
};

const maximum = items => Math.max(...items);
const minimum = items => Math.min(...items);

const first = items => items[0];
const last = items => items[items.length - 1];

const sum = items => items.reduce((sum, val) => sum + val, 0);

const delta = items => maximum(items) - minimum(items);

const diff = items => last(items) - first(items);

const aggregateFuncMap = {
  avg: average,
  median,
  max: maximum,
  min: minimum,
  first,
  last,
  sum,
  delta,
  diff,
};

export {
  aggregateFuncMap,
};
