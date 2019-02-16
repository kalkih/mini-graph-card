import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'main.js',
  output: {
    file: 'mini-graph-card-bundle.js',
    format: 'umd',
  },
  plugins: [
    resolve(),
    terser(),
  ],
};
