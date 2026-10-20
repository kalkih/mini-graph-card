import type { StateMapType, StateMapEntryType } from './stateMapTypes';
import type { AllYaxesType } from './yaxisType';

export interface ConfigType {
  state_map?: StateMapType | StateMapEntryType[];
  y_axis?: AllYaxesType;
  decimals?: number|string;
};
