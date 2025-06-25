import { interpolateRgb } from 'd3-interpolate';
import {
  isAssumingCssVar,
  convertCssVarToValue,
} from './utils';

export default (start, end, y) => {
  const _start = isAssumingCssVar(start)
    ? convertCssVarToValue(start)
    : start;
  const _end = isAssumingCssVar(end)
    ? convertCssVarToValue(end)
    : end;
  return interpolateRgb(_start, _end)(y);
};
