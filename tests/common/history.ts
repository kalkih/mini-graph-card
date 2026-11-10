import type { AggregateKey } from '../types/aggregate';
import type { AttributeType } from '../types/stateObjType';
import { sortHistoryByDate } from './utils';

export interface HistoryItemType {
  entity_id?: string;
  state: string | any;
  last_changed?: string;
  last_updated?: string;
  attributes?: AttributeType;
};

// history array (number only)
export const HISTORY_NUMERIC: HistoryItemType[] = sortHistoryByDate([
  { state: 22.5,    last_changed: "2026-11-01T10:00:00.000Z", last_updated: "2026-11-01T10:00:01.000Z", attributes: { xyz: 11 } },
  { state: '-10.5', last_changed: "2026-11-01T10:00:10.000Z", last_updated: "2026-11-01T10:00:11.000Z", attributes: { xyz: 11 } },
  { state: 0,       last_changed: "2026-11-01T10:00:20.000Z", last_updated: "2026-11-01T10:00:21.000Z", attributes: { xyz: 12 } },
  { state: '100',   last_changed: "2026-11-01T10:05:00.000Z", last_updated: "2026-11-01T10:05:01.000Z", attributes: { xyz: 12 } },
  { state: '45.2',  last_changed: "2026-11-01T10:05:10.000Z", last_updated: "2026-11-01T10:05:11.000Z", attributes: { xyz: 12 } },
  { state: -3.14,   last_changed: "2026-11-01T10:10:00.000Z", last_updated: "2026-11-01T10:10:01.000Z", attributes: {  } },
  { state: '7',     last_changed: "2026-11-01T10:10:10.000Z", last_updated: "2026-11-01T10:10:11.000Z", attributes: {  } },
  { state: 7,       last_changed: "2026-11-01T10:10:20.000Z", last_updated: "2026-11-01T10:10:21.000Z", attributes: { xyz: 14 } },
  { state: '15.8',  last_changed: "2026-11-01T10:15:00.000Z", last_updated: "2026-11-01T10:15:01.000Z", attributes: { xyz: 17 } },
  { state: '-88',   last_changed: "2026-11-01T10:15:10.000Z", last_updated: "2026-11-01T10:15:11.000Z", attributes: { xyz: 17 } },
  { state: 50,      last_changed: "2026-11-01T10:15:10.000Z", last_updated: "2026-11-01T10:15:11.000Z", attributes: { xyz: 17 } },
]);

// history array (numbers only)
export const HISTORY_STRINGS: HistoryItemType[] = sortHistoryByDate([
  { state: 'on',    last_changed: "2026-11-01T10:00:00.000Z", last_updated: "2026-11-01T10:00:01.000Z", attributes: { xyz: 11 } },
  { state: 'on',    last_changed: "2026-11-01T10:00:10.000Z", last_updated: "2026-11-01T10:00:11.000Z", attributes: { xyz: 11 } },
  { state: 'off',   last_changed: "2026-11-01T10:00:20.000Z", last_updated: "2026-11-01T10:00:21.000Z", attributes: { xyz: 12 } },
  { state: 'on',    last_changed: "2026-11-01T10:05:00.000Z", last_updated: "2026-11-01T10:05:01.000Z", attributes: { xyz: 12 } },
  { state: 'off',   last_changed: "2026-11-01T10:05:10.000Z", last_updated: "2026-11-01T10:05:11.000Z", attributes: { xyz: 12 } },
  { state: 'off',   last_changed: "2026-11-01T10:10:00.000Z", last_updated: "2026-11-01T10:10:01.000Z", attributes: {  } },
  { state: 'off',   last_changed: "2026-11-01T10:10:10.000Z", last_updated: "2026-11-01T10:10:11.000Z", attributes: {  } },
  { state: 'on',    last_changed: "2026-11-01T10:10:20.000Z", last_updated: "2026-11-01T10:10:21.000Z", attributes: { xyz: 14 } },
  { state: 'off',   last_changed: "2026-11-01T10:15:00.000Z", last_updated: "2026-11-01T10:15:01.000Z", attributes: { xyz: 17 } },
  { state: 'on',    last_changed: "2026-11-01T10:15:10.000Z", last_updated: "2026-11-01T10:15:11.000Z", attributes: { xyz: 17 } },
  { state: 'xxxx',  last_changed: "2026-11-01T10:15:10.000Z", last_updated: "2026-11-01T10:15:11.000Z", attributes: { xyz: 17 } },
]);

// history array (junk data only)
export const HISTORY_JUNK: HistoryItemType[] = sortHistoryByDate([
  { state: 'abc',   last_changed: "2026-11-01T10:01:00.000Z", last_updated: "2026-11-01T10:01:01.000Z", attributes: { xyz: 12 } },
  { state: NaN,     last_changed: "2026-11-01T10:01:10.000Z", last_updated: "2026-11-01T10:01:11.000Z", attributes: { xyz: 12 } },
  { state: '',      last_changed: "2026-11-01T10:01:20.000Z", last_updated: "2026-11-01T10:01:21.000Z", attributes: { xyz: 12 } },
  { state: NaN,     last_changed: "2026-11-01T10:11:00.000Z", last_updated: "2026-11-01T10:11:01.000Z", attributes: { } },
  { state: 'abc',   last_changed: "2026-11-01T10:11:10.000Z", last_updated: "2026-11-01T10:11:11.000Z", attributes: { xyz: 14 } },
  { state: '',      last_changed: "2026-11-01T10:16:00.000Z", last_updated: "2026-11-01T10:16:01.000Z", attributes: { xyz: 17 } },
  { state: NaN,     last_changed: "2026-11-01T10:16:10.000Z", last_updated: "2026-11-01T10:16:11.000Z", attributes: { xyz: 17 } },
  { state: 'abc',   last_changed: "2026-11-01T10:16:20.000Z", last_updated: "2026-11-01T10:16:21.000Z", attributes: { xyz: 17 } },
]);

// history array (numbers & junk)
export const HISTORY_ALL_NUMERIC: HistoryItemType[] = sortHistoryByDate([
  ...HISTORY_NUMERIC,
  ...HISTORY_JUNK,
]);

// history array (numbers & junk)
export const HISTORY_ALL_STRINGS: HistoryItemType[] = sortHistoryByDate([
  ...HISTORY_STRINGS,
  ...HISTORY_JUNK,
]);

// expected aggregated results for "numbers only" array
export const AGGREGATED_EXPECTED: Record<AggregateKey, number> = {
  avg: 13.26,
  median: 7,
  max: 100,
  min: -88,
  sum: 145.86,
  first: 22.5,
  last: 50,
  delta: 188,
  diff: 27.5,
};

// expected aggregated results for "numbers + junk" array
export const AGGREGATED_EXPECTED_JUNK: Record<AggregateKey, number> = {
  avg: 13.26,
  median: 7,
  max: 100,
  min: -88,
  sum: 145.86,
  first: 22.5,
  last: NaN,
  delta: 188,
  diff: NaN,
};

export const getNumbersCountInHistory = (arr: HistoryItemType[]) =>
  arr.filter((item) => !Number.isNaN(parseFloat(item.state))).length;

export const getNansCountInHistory = (arr: HistoryItemType[]) =>
  arr.filter((item) => Number.isNaN(item.state)).length;
