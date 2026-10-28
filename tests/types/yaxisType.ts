import type { StateMapType, StateMapEntryType } from './stateMapTypes';

export interface YaxisType {
  decimals?: number|string;
  lower_bound?: number|string;
  upper_bound?: number|string;
  min_bound_range?: number|string;
  state_map?: StateMapType | StateMapEntryType[];
};

export interface AllYaxesType {
  primary?: YaxisType;
  secondary?: YaxisType;
};
