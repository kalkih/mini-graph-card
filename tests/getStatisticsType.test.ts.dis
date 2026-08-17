/**
 * Tests for getStatisticsType().
 *
 * The file is disabled (renamed to *.dis) & thus is not used during a build process;
 * remove the "dis" extension to use it locally in your VSCode devcontainer.
 */

import { expect, describe, it } from 'vitest';
import { getStatisticsType } from '../others';
import { STATISTICS_TYPES } from '../const';

// buckets as returned by "recorder/statistics_during_period",
// one set per state_class (see DEFAULT_STATISTICS in HA sensor/recorder.py)
const MEASUREMENT = [
  { start: 1786215600000, end: 1786219200000, last_reset: null, mean: 16.15, min: 15.6, max: 17.6 },
  { start: 1786219200000, end: 1786222800000, last_reset: null, mean: 16.4, min: 16.1, max: 17.2 },
];
// a circular mean: min/max are present but always null
const MEASUREMENT_ANGLE = [
  { start: 1786215600000, end: 1786219200000, last_reset: null, mean: 225.34, min: null, max: null },
  { start: 1786219200000, end: 1786222800000, last_reset: null, mean: 231.02, min: null, max: null },
];
const TOTAL_INCREASING = [
  { start: 1786215600000, end: 1786219200000, last_reset: null, sum: 335632.3, state: 39.96, change: 0.02 },
  { start: 1786219200000, end: 1786222800000, last_reset: null, sum: 335632.31, state: 39.97, change: 0.01 },
];

describe('getStatisticsType', () => {

  it('getStatisticsType: measurement, no type requested -> mean', () => {
    expect(getStatisticsType(MEASUREMENT)).toBe('mean');
  });

  it('getStatisticsType: measurement_angle, no type requested -> mean', () => {
    expect(getStatisticsType(MEASUREMENT_ANGLE)).toBe('mean');
  });

  it('getStatisticsType: total_increasing, no type requested -> state', () => {
    expect(getStatisticsType(TOTAL_INCREASING)).toBe('state');
  });

  ['mean', 'min', 'max'].forEach((type) => {
    it(`getStatisticsType: measurement has [${type}]`, () => {
      expect(getStatisticsType(MEASUREMENT, type)).toBe(type);
    });
  });

  ['sum', 'state', 'change'].forEach((type) => {
    it(`getStatisticsType: total_increasing has [${type}]`, () => {
      expect(getStatisticsType(TOTAL_INCREASING, type)).toBe(type);
    });
  });

  // a circular mean has no min/max, even though the keys are there
  ['min', 'max'].forEach((type) => {
    it(`getStatisticsType: measurement_angle has no [${type}] -> mean`, () => {
      expect(getStatisticsType(MEASUREMENT_ANGLE, type)).toBe('mean');
    });
  });

  ['sum', 'state', 'change'].forEach((type) => {
    it(`getStatisticsType: measurement has no [${type}] -> mean`, () => {
      expect(getStatisticsType(MEASUREMENT, type)).toBe('mean');
    });
  });

  ['mean', 'min', 'max'].forEach((type) => {
    it(`getStatisticsType: total_increasing has no [${type}] -> state`, () => {
      expect(getStatisticsType(TOTAL_INCREASING, type)).toBe('state');
    });
  });

  it('getStatisticsType: "last_reset" is not a graph type', () => {
    expect(STATISTICS_TYPES).not.toContain('last_reset');
    expect(getStatisticsType(MEASUREMENT, 'last_reset')).toBe('mean');
  });

  it('getStatisticsType: a gap in a single bucket does not hide a type', () => {
    const stats = [{ ...MEASUREMENT[0], mean: null }, MEASUREMENT[1]];
    expect(getStatisticsType(stats, 'mean')).toBe('mean');
  });

  it('getStatisticsType: neither default is available -> a first available type', () => {
    expect(getStatisticsType([{ start: 1, min: 1, max: 2 }])).toBe('min');
  });

  [undefined, null, [], [{}], [{ start: 1, end: 2, last_reset: null }]].forEach((stats) => {
    it(`getStatisticsType: no types in [${JSON.stringify(stats)}] -> undefined`, () => {
      expect(getStatisticsType(stats, 'mean')).toBeUndefined();
    });
  });
});
