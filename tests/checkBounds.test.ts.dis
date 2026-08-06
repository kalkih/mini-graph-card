/**
 * Tests for checkBounds().
 *
 * The file is disabled (renamed to *.dis) & thus is not used during a build process;
 * remove the "dis" extension to use it locally in your VSCode devcontainer.
 */

import { assert, describe, it } from 'vitest';
import { checkBounds } from '../checkOption';

interface ConfigType {
  lower_bound?: number | string | any;
  upper_bound?: number | any;
};

const VARIANTS: any[] = [
  {
    description: 'undefined values',
    config: { },
    expected: { lowerBound: undefined, upperBound: undefined },
  },
  {
    description: 'valid value for lower',
    config: { lower_bound: 123 },
    expected: { lowerBound: 123, upperBound: undefined },
  },
  {
    description: 'valid value for upper',
    config: { upper_bound: 456 },
    expected: { lowerBound: undefined, upperBound: 456 },
  },
  {
    description: 'valid values for lower & upper',
    config: { lower_bound: 123, upper_bound: 456 },
    expected: { lowerBound: 123, upperBound: 456 },
  },
  {
    description: 'valid soft value for lower',
    config: { lower_bound: '~123' },
    expected: { lowerBound: '~123', upperBound: undefined },
  },
  {
    description: 'invalid soft value for upper',
    config: { upper_bound: '~456' },
    expected: { lowerBound: undefined, upperBound: undefined },
  },
  {
    description: 'valid soft value for lower, invalid soft value for upper',
    config: { lower_bound: '~123', upper_bound: '~456' },
    expected: { lowerBound: '~123', upperBound: undefined },
  },
  {
    description: 'valid soft value for lower, valid value for upper',
    config: { lower_bound: '~123', upper_bound: 456 },
    expected: { lowerBound: '~123', upperBound: 456 },
  },
  {
    description: 'lower = upper',
    config: { lower_bound: 123, upper_bound: 123 },
    expected: { lowerBound: 123, upperBound: undefined },
  },
  {
    description: 'soft lower = upper',
    config: { lower_bound: '~123', upper_bound: 123 },
    expected: { lowerBound: '~123', upperBound: undefined },
  },
  {
    description: 'lower > upper',
    config: { lower_bound: 457, upper_bound: 456 },
    expected: { lowerBound: 457, upperBound: undefined },
  },
  {
    description: 'lower > upper(string)',
    config: { lower_bound: 457, upper_bound: '456' },
    expected: { lowerBound: 457, upperBound: undefined },
  },
  {
    description: 'lower(string) > upper',
    config: { lower_bound: '457', upper_bound: 456 },
    expected: { lowerBound: 457, upperBound: undefined },
  },
  {
    description: 'lower(string) > upper(string)',
    config: { lower_bound: '457', upper_bound: '456' },
    expected: { lowerBound: 457, upperBound: undefined },
  },
  {
    description: 'soft lower > upper',
    config: { lower_bound: '~457', upper_bound: 456 },
    expected: { lowerBound: '~457', upperBound: undefined },
  },
  {
    description: 'soft lower > upper(string)',
    config: { lower_bound: '~457', upper_bound: '456' },
    expected: { lowerBound: '~457', upperBound: undefined },
  },
];

describe("checkBounds", () => {
  VARIANTS.forEach((variant) => {
    it(`checkBounds: check [${JSON.stringify(variant)}], ${variant.description}`, () => {
      const result = checkBounds(variant.config);
      const expectedValue = variant.expected;
      assert.deepEqual(
        result,
        expectedValue,
      );
    });
  });

});
