import type { BoundsType } from '../types/boundsType';

export const GRAPH_SETTINGS = {
  margin: [5, 5],
  width: 300,
  height: 100,
};

interface GraphMockType extends BoundsType {
  overall?: number;
};

export const GRAPH_OBJECTS_VALID: GraphMockType[] = [
  { min: 50, max: 150 },
  { min: 0, max: 100 },
  { min: -100, max: 50 },
  { min: -200, max: 0 },
  { min: -300, max: -100 },
];

export const GRAPH_OBJECTS = [ ...GRAPH_OBJECTS_VALID ];
