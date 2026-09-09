/**
 * Tests for isNumeric().
 *
 * The file is disabled (renamed to *.dis) & thus is not used during a build process;
 * remove the "dis" extension to use it locally in your VSCode devcontainer.
 */

import { assert, describe, it } from 'vitest';
import { isNumeric } from '../others';

const NUMBERS: number[] = [
  -200.1,
  -1.002345,
  0,
  0.000000003,
  2.3,
  5,
  1234567890,
  1234.567,
];

const NUMBERS_AS_STRINGS: string[] = [
  '-200.1',
  '-1.002345',
  '0',
  '0.000000003',
  '2.3',
  '5',
  '1234567890',
  //////////////
  ' 1234.567 ',
  '-200.1  ',
  '  -1.002345',
  '0  ',
  '    0.000000003',
  '2.3    ',
  ' 5  ',
  '   1234567890  ',
  ' 1234.567 ',
];

const NUMBERS_AS_STRINGS_WITH_WRONG_DELIMITER: string[] = [
  '-200,1',
  '-1,002345',
  '0,000000003',
  '2,3',
  '1234,567',
];

const STRINGS: string[] = [
  '-123abc',
  'abc123',
  'abc',
  '@#123%^&',
  '',
  ' ',
  '  ',
];

const OBJECTS: any[] = [
  [123, 345],
  { abc: 123, def: 456},
];

describe("isNumeric", () => {
  NUMBERS.forEach((value) => {
    it(`isNumeric: check a number [${value}]`, () => {
      const result = isNumeric(value);
      const expectedValue = true;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });
  });

  NUMBERS_AS_STRINGS.forEach((value) => {
    it(`isNumeric: check a string presentation of a number [${value}]`, () => {
      const result = isNumeric(value);
      const expectedValue = false;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });
  });

  NUMBERS_AS_STRINGS.forEach((value) => {
    it(`isNumeric: check a string presentation of a number [${value}] with allowString=true`, () => {
      const result = isNumeric(value, true);
      const expectedValue = true;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });
  });

  NUMBERS_AS_STRINGS_WITH_WRONG_DELIMITER.forEach((value) => {
    it(`isNumeric: check a string presentation of a number with a wrong delimiter [${value}]`, () => {
      const result = isNumeric(value);
      const expectedValue = false;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });
  });

  NUMBERS_AS_STRINGS_WITH_WRONG_DELIMITER.forEach((value) => {
    it(`isNumeric: check a string presentation of a number with a wrong delimiter [${value}] with allowString=true`, () => {
      const result = isNumeric(value, true);
      const expectedValue = false;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });
  });

  STRINGS.forEach((value) => {
    it(`isNumeric: check an obvious string [${value}]`, () => {
      const result = isNumeric(value);
      const expectedValue = false;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });
  });

  STRINGS.forEach((value) => {
    it(`isNumeric: check an obvious string [${value}] with allowString=true`, () => {
      const result = isNumeric(value, true);
      const expectedValue = false;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });
  });

  OBJECTS.forEach((value) => {
    it(`isNumeric: check an object [${JSON.stringify(value)}]`, () => {
      const result = isNumeric(value);
      const expectedValue = false;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });
  });

});
