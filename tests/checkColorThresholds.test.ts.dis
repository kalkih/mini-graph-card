/**
 * Tests for checkColorThresholds().
 *
 * The file is disabled (renamed to *.dis) & thus is not used during a build process;
 * remove the "dis" extension to use it locally in your VSCode devcontainer.
 */

import { expect, describe, it } from 'vitest';
import { checkColorThresholds } from '../checkOption';

// prevent logging
global.log = () => { };

interface ConfigType {
  color_thresholds?: any;
};const COLORS: string[] = [

  "red",
  "#ff00ff",
  "var(--red-color)",
];

describe("isNumeric", () => {

  it('checkColorThresholds: check for undefined или null', () => {
    const config1: ConfigType = {}; // check for undefined
    const config2 = { color_thresholds: null }; // check for null
    checkColorThresholds(config1, 'config');
    checkColorThresholds(config2, 'config');
    expect(config1.color_thresholds).toBeUndefined();
    expect(config2.color_thresholds).toBeNull();
  });

  it('checkColorThresholds: if not an array (number) -> unsetting to []', () => {
    const config = { color_thresholds: 123 };
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual([]);
  });

  it('checkColorThresholds: if not an array (string) -> unsetting to []', () => {
    const config = { color_thresholds: 'abc' };
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual([]);
  });

  it('checkColorThresholds: if not an array (dict) -> unsetting to []', () => {
    const config = { color_thresholds: { color: 'red', value: 123 } };
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual([]);
  });

  COLORS.forEach((color) => {
    it(`checkColorThresholds: shorthand "color-only" [${color}] element`, () => {
      const config = {
        color_thresholds: [color],
      };
      const expected = [{ color: color }];
      checkColorThresholds(config, 'config');
      expect(config.color_thresholds).toEqual(expected);
    });
  });

  COLORS.forEach((color) => {
    it(`checkColorThresholds: shorthand "color-only" [${color}] dict element`, () => {
      const config = {
        color_thresholds: [{ color: color }],
      };
      const expected = [{ color: color }];
      checkColorThresholds(config, 'config');
      expect(config.color_thresholds).toEqual(expected);
    });
  });

  it(`checkColorThresholds: color is missing`, () => {
    const config = {
      color_thresholds: ['red', {value: 123}],
    };
    const expected = [{ color: 'red' }, {color: 'var(--primary-text-color)', value: 123}];
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual(expected);
  });

  it(`checkColorThresholds: color is not a string`, () => {
    const config = {
      color_thresholds: ['red', {color: 123, value: 123}],
    };
    const expected = [{ color: 'red' }, {color: 'var(--primary-text-color)', value: 123}];
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual(expected);
  });

  it(`checkColorThresholds: value is undefined`, () => {
    const config = {
      color_thresholds: ['red', {color: 'red', value: undefined}],
    };
    const expected = [{ color: 'red' }, {color: 'red'}];
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual(expected);
  });

  it(`checkColorThresholds: value is null`, () => {
    const config = {
      color_thresholds: ['red', {color: 'red', value: null}],
    };
    const expected = [{ color: 'red' }, {color: 'red'}];
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual(expected);
  });

  it(`checkColorThresholds: value is non-numeric ['abc']`, () => {
    const config = {
      color_thresholds: ['red', {color: 'red', value: 'abc'}],
    };
    const expected = [{ color: 'red' }, {color: 'red'}];
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual(expected);
  });

  it(`checkColorThresholds: value is non-numeric [{xyz: 123}]`, () => {
    const config = {
      color_thresholds: ['red', {color: 'red', value: {xyz: 123}}],
    };
    const expected = [{ color: 'red' }, {color: 'red'}];
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual(expected);
  });

  it(`checkColorThresholds: value is non-numeric [[123, 456]]`, () => {
    const config = {
      color_thresholds: ['red', {color: 'red', value: [123, 456]}],
    };
    const expected = [{ color: 'red' }, {color: 'red'}];
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual(expected);
  });

  it(`checkColorThresholds: value is non-numeric ['123']`, () => {
    const config = {
      color_thresholds: ['red', {color: 'red', value: '123'}],
    };
    const expected = [{ color: 'red' }, {color: 'red', value: 123}];
    checkColorThresholds(config, 'config');
    expect(config.color_thresholds).toEqual(expected);
  });
});
