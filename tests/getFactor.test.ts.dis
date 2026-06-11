/**
 * Tests for getFactor().
 *
 * The file is disabled (renamed to *.dis) & thus is not used during a build process;
 * remove the "dis" extension to use it locally in your VSCode devcontainer.
 */

import { assert, describe, it } from 'vitest';
import { getFactor } from '../others';

interface ValueFactorType {
  type?: string | any,
  factor?: number | any,
};

interface EntityConfig {
  y_axis?: "primary" | "secondary";
};

interface ConfigType {
  value_factor?: number | ValueFactorType | any;
  value_factor_secondary?: number | ValueFactorType | any;
  entities?: EntityConfig[];
};

const VALUES: number[] = [
  -2,
  -1,
  -0.3,
  0,
  0.3,
  1,
  2,
];

describe("getFactor", () => {
  VALUES.forEach((value) => {

    //////////////////////////////////////////////////////////////////////////
    // Testing value_factor non-object

    it("value_factor: explicitly set to 0", () => {
      const config: ConfigType = {
        value_factor: 0,
      };
      const result = value * getFactor(config);
      const expectedValue = value;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor: exponent 2", () => {
      const exponent = 2;
      const config: ConfigType = {
        value_factor: exponent,
      };
      const result = value * getFactor(config);
      const expectedValue = value * (10 ** exponent);
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor: invalid", () => {
      const config: ConfigType = {
        value_factor: 'abc',
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "factor = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor: undefined", () => {
      const config: ConfigType = {
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "factor = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    //////////////////////////////////////////////////////////////////////////
    // Testing value_factor_secondary

    it("value_factor_secondary: explicitly set to 0 - still ignored since `index` in `getFactor()` is undefined", () => {
      const config: ConfigType = {
        value_factor_secondary: 0,
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "factor = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: exponent 2 - still ignored since `index` in `getFactor()` is undefined", () => {
      const exponent = 2;
      const config: ConfigType = {
        value_factor_secondary: exponent,
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "factor = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: exponent 2, index -1", () => {
      const exponent = 2;
      const config: ConfigType = {
        value_factor_secondary: exponent,
      };
      const result = value * getFactor(config, -1);
      const expectedValue = value * (10 ** exponent);
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: exponent 2, index 0 (y_axis: undefined)", () => {
      const exponent = 2;
      const config: ConfigType = {
        value_factor_secondary: exponent,
        entities: [
          {},
          {y_axis: 'secondary'},
        ],
      };
      const result = value * getFactor(config, 0);
      const expectedValue = value;  // fallback to "factor = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: exponent 2, index 1 (y_axis: secondary)", () => {
      const exponent = 2;
      const config: ConfigType = {
        value_factor_secondary: exponent,
        entities: [
          {},
          {y_axis: 'secondary'},
        ],
      };
      const result = value * getFactor(config, 1);
      const expectedValue = value * (10 ** exponent);
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: invalid", () => {
      const config: ConfigType = {
        value_factor_secondary: 'abc',
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "factor = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: undefined", () => {
      const config: ConfigType = {
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "factor = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    //////////////////////////////////////////////////////////////////////////
    // Testing value_factor_secondary with value_factor

    it("value_factor_secondary: explicitly set to 0 - still ignored since `index` in `getFactor()` is undefined \
      a global value_factor 'exponent 3' is used instead", () => {
      const exponent = 3;
      const config: ConfigType = {
        value_factor: exponent,
        value_factor_secondary: 0,
      };
      const result = value * getFactor(config);
      const expectedValue = value * (10 ** exponent);
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: explicitly set to 0 - still ignored since `index` in `getFactor()` is set to 0, \
and the 0th entity is not assigned to a 'secondary' y_axis; \
a global value_factor 'exponent 3' is used instead", () => {
      const exponent = 3;
      const config: ConfigType = {
        value_factor: exponent,
        value_factor_secondary: 0,
        entities: [
          {},
          {y_axis: 'secondary'},
        ],
      };
      const result = value * getFactor(config, 0);
      const expectedValue = value * (10 ** exponent);
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: explicitly set to 0, `index` in `getFactor()` is set to 1, \
and the 1st entity is assigned to a 'secondary' y_axis", () => {
      const exponent = 3;
      const config: ConfigType = {
        value_factor: exponent,
        value_factor_secondary: 0,
        entities: [
          {},
          {y_axis: 'secondary'},
        ],
      };
      const result = value * getFactor(config, 1);
      const expectedValue = value;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: set to 4, `index` in `getFactor()` is set to 1, \
and the 1st entity is assigned to a 'secondary' y_axis", () => {
      const exponent = 3;
      const exponent_secondary = 4;
      const config: ConfigType = {
        value_factor: exponent,
        value_factor_secondary: exponent_secondary,
        entities: [
          {},
          {y_axis: 'secondary'},
        ],
      };
      const result = value * getFactor(config, 1);
      const expectedValue = value * (10 ** exponent_secondary);
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor_secondary: set to a wrong 'abc', `index` in `getFactor()` is set to 1, \
and the 1st entity is assigned to a 'secondary' y_axis; \
finally, a value_factor = 1 is used", () => {
      const exponent = 3;
      const exponent_secondary = 'abc';
      const config: ConfigType = {
        value_factor: exponent,
        value_factor_secondary: exponent_secondary,
        entities: [
          {},
          {y_axis: 'secondary'},
        ],
      };
      const result = value * getFactor(config, 1);
      const expectedValue = value;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    //////////////////////////////////////////////////////////////////////////
    // Testing value_factor object

    it("value_factor: value_factor = object, exponent 2", () => {
      const exponent = 2;
      const config: ConfigType = {
        value_factor: {
          type: 'exponent',
          factor: exponent,
        },
      };
      const result = value * getFactor(config);
      const expectedValue = value * (10 ** exponent);
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor: value_factor = object, scale 2", () => {
      const scale = 2;
      const config: ConfigType = {
        value_factor: {
          type: 'scale',
          factor: scale,
        },
      };
      const result = value * getFactor(config);
      const expectedValue = value * scale;
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    //////////////////////////////////////////////////////////////////////////
    // Testing value_factor object, invalid data

    it("value_factor: value_factor = object, type invalid", () => {
      const config: ConfigType = {
        value_factor: {
          type: 'abc',
          factor: 2,
        },
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "exponent = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor: value_factor = object, type undefined", () => {
      const config: ConfigType = {
        value_factor: {
          factor: 2,
        },
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "exponent = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor: value_factor = object, exponent invalid", () => {
      const config: ConfigType = {
        value_factor: {
          type: 'exponent',
          factor: 'abc',
        },
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "exponent = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor: value_factor = object, exponent undefined", () => {
      const config: ConfigType = {
        value_factor: {
          type: 'exponent',
        },
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "exponent = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor: value_factor = object, scale invalid", () => {
      const config: ConfigType = {
        value_factor: {
          type: 'scale',
          factor: 'abc',
        },
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "exponent = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

    it("value_factor: value_factor = object, scale undefined", () => {
      const config: ConfigType = {
        value_factor: {
          type: 'scale',
        },
      };
      const result = value * getFactor(config);
      const expectedValue = value; // fallback to "exponent = 1"
      assert.strictEqual(
        result,
        expectedValue,
      );
    });

  });
});
