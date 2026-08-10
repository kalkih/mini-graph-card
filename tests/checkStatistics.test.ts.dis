/**
 * Tests for checkStatistics().
 *
 * The file is disabled (renamed to *.dis) & thus is not used during a build process;
 * remove the "dis" extension to use it locally in your VSCode devcontainer.
 */

import { expect, describe, it, vi, afterEach } from 'vitest';
import { checkStatistics } from '../checkOption';
import { STATISTICS_PERIODS, STATISTICS_TYPES } from '../const';

interface ConfigType {
  entities: any[];
  statistics?: any;
  state_map?: any;
};

const ENTITY = 'sensor.test';

const makeConfig = (entity: any, cardWide?: any, stateMap?: any): ConfigType => {
  const config: ConfigType = { entities: [entity] };
  if (cardWide !== undefined) config.statistics = cardWide;
  if (stateMap !== undefined) config.state_map = stateMap;
  return config;
};

// log() -> console.warn
const mockWarn = () => vi.spyOn(console, 'warn').mockImplementation(() => { });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('checkStatistics', () => {

  it('checkStatistics: option not set -> undefined', () => {
    const config = makeConfig({ entity: ENTITY });
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toBeUndefined();
  });

  it('checkStatistics: [false] -> unsetting to undefined', () => {
    const config = makeConfig({ entity: ENTITY, statistics: false });
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toBeUndefined();
  });

  it('checkStatistics: [true] -> an empty object', () => {
    const config = makeConfig({ entity: ENTITY, statistics: true });
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toEqual({});
  });

  it('checkStatistics: card-wide [true] applies to an entity', () => {
    const config = makeConfig({ entity: ENTITY }, true);
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toEqual({});
  });

  it('checkStatistics: card-wide [true], entity [false] -> entity opts out', () => {
    const config = makeConfig({ entity: ENTITY, statistics: false }, true);
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toBeUndefined();
  });

  it('checkStatistics: an entity option overrides a card-wide option', () => {
    const config = makeConfig({ entity: ENTITY, statistics: { type: 'max' } }, { type: 'min' });
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toEqual({ type: 'max' });
  });

  STATISTICS_PERIODS.forEach((period) => {
    it(`checkStatistics: valid period [${period}]`, () => {
      const config = makeConfig({ entity: ENTITY, statistics: { period } });
      checkStatistics(config, 0);
      expect(config.entities[0].statistics).toEqual({ period });
    });
  });

  STATISTICS_TYPES.forEach((type) => {
    it(`checkStatistics: valid type [${type}]`, () => {
      const config = makeConfig({ entity: ENTITY, statistics: { type } });
      checkStatistics(config, 0);
      expect(config.entities[0].statistics).toEqual({ type });
    });
  });

  it('checkStatistics: period is not set -> not stored', () => {
    const config = makeConfig({ entity: ENTITY, statistics: { type: 'max' } });
    checkStatistics(config, 0);
    expect(config.entities[0].statistics.period).toBeUndefined();
  });

  ['minute', '5MINUTE', 'decade', '', 123, null].forEach((period) => {
    it(`checkStatistics: invalid period [${JSON.stringify(period)}] -> throws`, () => {
      const config = makeConfig({ entity: ENTITY, statistics: { period } });
      expect(() => checkStatistics(config, 0)).toThrowError(/statistics.period/);
    });
  });

  ['average', 'MEAN', 'median', 'last_reset', '', 123, null].forEach((type) => {
    it(`checkStatistics: invalid type [${JSON.stringify(type)}] -> throws`, () => {
      const config = makeConfig({ entity: ENTITY, statistics: { type } });
      expect(() => checkStatistics(config, 0)).toThrowError(/statistics.type/);
    });
  });

  ['mean', 123, ['mean'], []].forEach((statistics) => {
    it(`checkStatistics: not a boolean or an object [${JSON.stringify(statistics)}] -> throws`, () => {
      const config = makeConfig({ entity: ENTITY, statistics });
      expect(() => checkStatistics(config, 0)).toThrowError(/must be a boolean or an object/);
    });
  });

  it('checkStatistics: an unknown sub-option is kept as is', () => {
    const config = makeConfig({ entity: ENTITY, statistics: { some_option: 123 } });
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toEqual({ some_option: 123 });
  });

  it('checkStatistics: with [attribute] -> warns & falls back to a raw history', () => {
    const warn = mockWarn();
    const config = makeConfig({ entity: ENTITY, statistics: true, attribute: 'some_attribute' });
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toBeUndefined();
    expect(config.entities[0].attribute).toBe('some_attribute');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0].join(' ')).toContain('attribute');
  });

  it('checkStatistics: with [state_map] -> warns & falls back to a raw history', () => {
    const warn = mockWarn();
    const config = makeConfig({ entity: ENTITY, statistics: true }, undefined, ['off', 'on']);
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toBeUndefined();
    expect(config.state_map).toEqual(['off', 'on']);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0].join(' ')).toContain('state_map');
  });

  it('checkStatistics: card-wide statistics with [state_map] -> falls back too', () => {
    const warn = mockWarn();
    const config = makeConfig({ entity: ENTITY }, true, ['off', 'on']);
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('checkStatistics: [attribute] without statistics -> no warning', () => {
    const warn = mockWarn();
    const config = makeConfig({ entity: ENTITY, attribute: 'some_attribute' });
    checkStatistics(config, 0);
    expect(config.entities[0].attribute).toBe('some_attribute');
    expect(warn).not.toHaveBeenCalled();
  });

  it('checkStatistics: [state_map] without statistics -> no warning', () => {
    const warn = mockWarn();
    const config = makeConfig({ entity: ENTITY }, undefined, ['off', 'on']);
    checkStatistics(config, 0);
    expect(warn).not.toHaveBeenCalled();
  });

  it('checkStatistics: card-wide statistics, entity opts out of an incompatible one', () => {
    const warn = mockWarn();
    const config = makeConfig(
      { entity: ENTITY, statistics: false, attribute: 'some_attribute' }, true, ['off', 'on'],
    );
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  // buildConfig() defaults state_map to []
  [[], undefined, null, 'off', 123, { off: 0 }].forEach((state_map) => {
    it(`checkStatistics: state_map [${JSON.stringify(state_map)}] is not a configured map`, () => {
      const warn = mockWarn();
      const config = makeConfig({ entity: ENTITY, statistics: true }, undefined, state_map);
      checkStatistics(config, 0);
      expect(config.entities[0].statistics).toEqual({});
      expect(warn).not.toHaveBeenCalled();
    });
  });

  it('checkStatistics: [attribute] wins over [state_map] in a warning', () => {
    const warn = mockWarn();
    const config = makeConfig(
      { entity: ENTITY, statistics: true, attribute: 'some_attribute' }, undefined, ['off', 'on'],
    );
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0].join(' ')).toContain('attribute');
  });

  it('checkStatistics: only an addressed entity is affected', () => {
    const config: ConfigType = {
      entities: [
        { entity: 'sensor.first', statistics: true },
        { entity: 'sensor.second' },
      ],
    };
    checkStatistics(config, 0);
    expect(config.entities[0].statistics).toEqual({});
    expect(config.entities[1].statistics).toBeUndefined();
  });
});
