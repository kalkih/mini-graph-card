import type { StateMapType, StateMapEntryType } from './stateMapTypes';
import type { AllYaxesType } from './yaxisType';
import type { EntityConfigType } from './entityConfigType';

export interface ConfigType {
  state_map?: StateMapType | StateMapEntryType[];
  y_axis?: AllYaxesType;
  decimals?: number|string;
  entities?: (EntityConfigType | string)[];

  // just for tests; in fact it cannot be undefined since it is defined in buildConfig()
  line_width?: number|string;
};
