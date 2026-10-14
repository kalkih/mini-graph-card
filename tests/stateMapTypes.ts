export interface StateMapEntryType {
  value?: string|number;
  label?: string;
  max?: string|number;
  min?: string|number;
  tolerance?: string|number;
  hide_unit?: boolean;
};

export interface StateMapType {
  map?: StateMapEntryType[];
  keep_values?: boolean;
  label?: string;
  hide_unit?: boolean;
};

export interface ConfigWithStateMapType {
  state_map?: StateMapType | StateMapEntryType[];
};
