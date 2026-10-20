import type { RangeType } from './rangeType';

export interface StateMapEntryType extends RangeType {
  label?: string;
  hide_unit?: boolean;
};

export interface StateMapType {
  map?: StateMapEntryType[];
  keep_values?: boolean;
  label?: string;
  hide_unit?: boolean;
};
