import { aggregateFuncMap } from '../../src/aggregate';

// aggregation method
export type AggregateKey = keyof typeof aggregateFuncMap;

// array of aggregation methods
export const AGGREGATE_FUNCS = Object.keys(aggregateFuncMap) as AggregateKey[];
