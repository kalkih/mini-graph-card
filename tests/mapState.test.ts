/**
 * Tests for MiniGraphCard::_mapState().
 *
 * The file is disabled (renamed to *.dis) & thus is not used during a build process;
 * remove the "dis" extension to use it locally in your VSCode devcontainer.
 */

// @vitest-environment jsdom
import { expect, describe, it, beforeEach } from 'vitest';
import MiniGraphCard from '../src/main';

interface StateMapEntryType {
  value?: string|number;
  label?: string;
  min?: number;
  max?: number;
  tolerance?: number;
  hide_unit?: boolean;
};

interface StateMapType {
  map: StateMapEntryType[];
  keep_values?: boolean;
};

const STATE_MAP_CONFIGS: StateMapType[] = [
  {
    keep_values: false,
    map: [
      {value: 'abc', label: 'ABC'},
      {value: 'def', label: 'DEF', hide_unit: false},
      {value: 'ghi', label: 'GHI', hide_unit: true},
    ],
  },
  {
    keep_values: true,
    map: [
      {value: 0, label: 'ABC'},
      {value: 100, label: 'Danger'},
      //////////////////
      {value: '100', label: 'NUM'}, // will not be found
      {value: '100.0', label: 'NUM-DOT'}, // will not be found
      {value: '100,0', label: 'NUM-COMMA'},
      //////////////////
      {value: 300, label: 'Danger', hide_unit: false},
      {value: -100, label: 'Minus', hide_unit: true},
      //////////////////
      {value: 50, label: '+Middle', tolerance: 0.1},
      {value: -50, label: '-Middle', tolerance: 0.1},
      //////////////////
      {min: 69, max: 71, label: '+Range 0.1'},
      {min: 79.999999, max: 80.000001, label: '+Range 0.000001'},
      {max: -69, min: -71, label: '-Range 0.1'},
      {max: -79.999999, min: -80.000001, label: '-Range 0.000001'},
      //////////////////
      {min: 59, max: 61, label: '+Range 0.1 (exact)'},
      {max: -59, min: -61, label: '-Range 0.1 (exact)'},
    ],
  },
];

const VARIANTS_STRICT: any[] = [
  { descr: 'hideUnit undefined', state: 0, config: STATE_MAP_CONFIGS[0], results: { result: 'ABC' }, },
  { descr: 'hideUnit: false',    state: 1, config: STATE_MAP_CONFIGS[0], results: { hideUnit: false, result: 'DEF' }, },
  { descr: 'hideUnit: true',     state: 2, config: STATE_MAP_CONFIGS[0], results: { hideUnit: true, result: 'GHI' }, },
  { descr: 'absent in map',      state: 3, config: STATE_MAP_CONFIGS[0], results: { result: undefined }, },
  { descr: 'find a string in a map (1)',                state: 'abc',         config: STATE_MAP_CONFIGS[0], results: { result: 'ABC' }, },
  { descr: 'find a string in a map (2)',                state: 'def',         config: STATE_MAP_CONFIGS[0], results: { hideUnit: false, result: 'DEF' }, },
  { descr: 'find a string in a map - cannot find',      state: 'xxx',         config: STATE_MAP_CONFIGS[0], results: { result: undefined }, },
  { descr: 'find "unavailable" in a map - cannot find', state: 'unavailable', config: STATE_MAP_CONFIGS[0], results: { result: undefined }, },
];

const VARIANTS_RELAXED: any[] = [
  { descr: 'hideUnit undefined', state: 'abc', config: STATE_MAP_CONFIGS[0], results: { result: 'ABC' }, },
  { descr: 'hideUnit: false',    state: 'def', config: STATE_MAP_CONFIGS[0], results: { hideUnit: false, result: 'DEF' }, },
  { descr: 'hideUnit: true',     state: 'ghi', config: STATE_MAP_CONFIGS[0], results: { hideUnit: true, result: 'GHI' }, },
  { descr: 'absent in map',      state: 'xxx', config: STATE_MAP_CONFIGS[0], results: { result: undefined }, },
  { descr: 'find a string in a map (1)',                state: 'abc',         config: STATE_MAP_CONFIGS[0], results: { result: 'ABC' }, },
  { descr: 'find a string in a map (2)',                state: 'def',         config: STATE_MAP_CONFIGS[0], results: { hideUnit: false, result: 'DEF' }, },
  { descr: 'find a string in a map - cannot find',      state: 'xxx',         config: STATE_MAP_CONFIGS[0], results: { result: undefined }, },
  { descr: 'find "unavailable" in a map - cannot find', state: 'unavailable', config: STATE_MAP_CONFIGS[0], results: { result: undefined }, },
];

const VARIANTS_RELAXED_NUMBERS: any[] = [
  { descr: 'number 0', state: 0,       config: STATE_MAP_CONFIGS[1], results: { result: 'ABC' }, },
  { descr: 'number',   state: 100,     config: STATE_MAP_CONFIGS[1], results: { result: 'Danger' }, },
  ///////////////
  { descr: 'string',   state: '100',   config: STATE_MAP_CONFIGS[1], results: { result: 'Danger' }, },
  { descr: 'string',   state: '100.0', config: STATE_MAP_CONFIGS[1], results: { result: 'Danger' }, },
  { descr: 'string',   state: '100,0', config: STATE_MAP_CONFIGS[1], results: { result: 'NUM-COMMA' }, },
  ///////////////
  { descr: 'number, hideUnit=false', state: 300,  config: STATE_MAP_CONFIGS[1], results: { result: 'Danger', hideUnit: false }, },
  { descr: 'number, hideUnit=true',  state: -100, config: STATE_MAP_CONFIGS[1], results: { result: 'Minus', hideUnit: true }, },
  ///////////////
  { descr: 'number, tolerance-, pass', state: 49.9,  config: STATE_MAP_CONFIGS[1], results: { result: '+Middle' }, },
  { descr: 'number, tolerance+, pass', state: 50.1,  config: STATE_MAP_CONFIGS[1], results: { result: '+Middle' }, },
  { descr: 'number, tolerance-, fail', state: 49.89, config: STATE_MAP_CONFIGS[1], results: { }, },
  { descr: 'number, tolerance+, fail', state: 50.11, config: STATE_MAP_CONFIGS[1], results: { }, },
  /////
  { descr: '-number, tolerance-, pass', state: -49.9,  config: STATE_MAP_CONFIGS[1], results: { result: '-Middle' }, },
  { descr: '-number, tolerance+, pass', state: -50.1,  config: STATE_MAP_CONFIGS[1], results: { result: '-Middle' }, },
  { descr: '-number, tolerance-, fail', state: -49.89, config: STATE_MAP_CONFIGS[1], results: { }, },
  { descr: '-number, tolerance+, fail', state: -50.11, config: STATE_MAP_CONFIGS[1], results: { }, },
  ///////////////
  { descr: 'number, range, pass', state: 70,  config: STATE_MAP_CONFIGS[1], results: { result: '+Range 0.1' }, },
  { descr: 'number, range, pass', state: 80,  config: STATE_MAP_CONFIGS[1], results: { result: '+Range 0.000001' }, },
  { descr: '-number, range, pass', state: -70,  config: STATE_MAP_CONFIGS[1], results: { result: '-Range 0.1' }, },
  { descr: '-number, range, pass', state: -80,  config: STATE_MAP_CONFIGS[1], results: { result: '-Range 0.000001' }, },
  ///////////////
  { descr: 'number, range, pass, exact', state: 59,  config: STATE_MAP_CONFIGS[1], results: { result: '+Range 0.1 (exact)' }, },
  { descr: 'number, range, fail, exact', state: 61,  config: STATE_MAP_CONFIGS[1], results: { }, },
  { descr: '-number, range, pass, exact', state: -61,  config: STATE_MAP_CONFIGS[1], results: { result: '-Range 0.1 (exact)' }, },
  { descr: '-number, range, fail, exact', state: -59,  config: STATE_MAP_CONFIGS[1], results: { }, },
];

describe("MiniGraphCard::_mapState()", () => {
  let card: MiniGraphCard;
  let stateMapConfig: StateMapType;

  beforeEach(() => {
    card = new MiniGraphCard();
  });

  describe("strict, strings", () => {
    VARIANTS_STRICT.forEach((variant) => {
      it(variant.descr, () => {
        const resultsObj = card._mapState(variant.config, variant.state);
        expect(resultsObj).toEqual(variant.results);
      });
    });
  });

  describe("relaxed, strings", () => {
    VARIANTS_RELAXED.forEach((variant) => {
      it(variant.descr, () => {
        const config = {...variant.config};
        config.keep_values = true;
        const resultsObj = card._mapState(config, variant.state);
        expect(resultsObj).toEqual(variant.results);
      });
    });
  });

  describe("relaxed, numbers", () => {
    VARIANTS_RELAXED_NUMBERS.forEach((variant) => {
      it(variant.descr, () => {
        const resultsObj = card._mapState(variant.config, variant.state);
        expect(resultsObj).toEqual(variant.results);
      });
    });
  });
});
