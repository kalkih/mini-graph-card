import type { StateMapType, StateMapEntryType } from './stateMapTypes';

export interface EntityConfigType {
  decimals?: number|string;
  line_width?: number|string;
  show_graph?: boolean;
  state_map?: StateMapType | StateMapEntryType[];
  y_axis?: string;
};
