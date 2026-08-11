/**
 * Tests for getBound().
 *
 * The file is disabled (renamed to *.dis) & thus is not used during a build process;
 * remove the "dis" extension to use it locally in your VSCode devcontainer.
 */

import { assert, describe, it } from 'vitest';
import { getBound } from '../others';

const NUMBERS: number[] = [
  -1234567890,
  -200.1,
  -5,
  -0.000000003,
  0,
  0.000000003,
  5,
  200.1,
  1234567890,
];

const NUMBERS_AS_STRINGS: string[] = [
  '-1234567890',
  '-200.1',
  '-5',
  '-0.000000003',
  '0',
  '0.000000003',
  '5',
  '200.1',
  '1234567890',
];

const NUMBERS_AS_STRINGS_WITH_WRONG_DELIMITER: string[] = [
  '-200,1',
  '-0,000000003',
  '0,000000003',
  '200,1',
];

const NUMBERS_WITH_SOFT: string[] = [
  '~-1234567890',
  '~-200.1',
  '~-5',
  '~-0.000000003',
  '~0',
  '~0.000000003',
  '~5',
  '~200.1',
  '~1234567890',
];

const NUMBERS_WITH_SOFT_WITH_WRONG_DELIMITER: string[] = [
  '~-200,1',
  '~-0,000000003',
  '~0,000000003',
  '~200,1',
];

const STRINGS: string[] = [
  '~abc',
  '~-200.1abc',
  'abc',
];

const OBJECTS: any[] = [
  ['~123', 345],
  { abc: 123, def: 456},
];

describe("getBound", () => {
  NUMBERS.forEach((value) => {
    it(`getBound: check a number [${value}]`, () => {
      const result = getBound(value);
      const expectedValue = { value, soft: false };
      assert.deepEqual(
        result,
        expectedValue,
      );
    });
  });

  NUMBERS_AS_STRINGS.forEach((value) => {
    it(`getBound: check a string presentation of a number [${value}]`, () => {
      const result = getBound(value);
      const expectedValue = { value: Number(value), soft: false };
      assert.deepEqual(
        result,
        expectedValue,
      );
    });
  });

  NUMBERS_AS_STRINGS_WITH_WRONG_DELIMITER.forEach((value) => {
    it(`getBound: check a string presentation of a number with a wrong delimiter [${value}]`, () => {
      const result = getBound(value);
      const expectedValue = undefined;
      assert.deepEqual(
        result,
        expectedValue,
      );
    });
  });

  NUMBERS_WITH_SOFT.forEach((value) => {
    it(`getBound: check a ~value [${value}]`, () => {
      const result = getBound(value);
      const expectedValue = { value: Number(value.slice(1)), soft: true };
      assert.deepEqual(
        result,
        expectedValue,
      );
    });
  });

  NUMBERS_WITH_SOFT_WITH_WRONG_DELIMITER.forEach((value) => {
    it(`getBound: check a ~value with a wrong delimiter [${value}]`, () => {
      const result = getBound(value);
      const expectedValue = undefined;
      assert.deepEqual(
        result,
        expectedValue,
      );
    });
  });

  STRINGS.forEach((value) => {
    it(`getBound: check an obvious string [${value}]`, () => {
      const result = getBound(value);
      const expectedValue = undefined;
      // check a value only
      assert.deepEqual(
        result,
        expectedValue,
      );
    });
  });

  OBJECTS.forEach((value) => {
    it(`getBound: check an object [${JSON.stringify(value)}]`, () => {
      const result = getBound(value);
      const expectedValue = undefined;
      assert.deepEqual(
        result,
        expectedValue,
      );
    });
  });

});
