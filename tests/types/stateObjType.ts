export type AttributeType = Record<string, any>;

export interface stateObjType {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: AttributeType;
};
