import type { AttributeType } from './stateObjType';

export interface HistoryItemType {
  entity_id?: string;
  state: string | any;
  last_changed?: Date | string;
  last_updated?: Date | string;
  attributes?: AttributeType;
};
