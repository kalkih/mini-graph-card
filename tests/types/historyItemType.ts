import type { AttributeType } from './stateObjType';

export interface HistoryItemType {
  entity_id?: string;
  state: string | any;
  last_changed?: string;
  last_updated?: string;
  attributes?: AttributeType;
};
