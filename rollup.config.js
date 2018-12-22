import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

export default {
  input: 'mini-graph-card.js',
  output: {
    file: 'mini-graph-card-bundle.js',
    format: 'umd'
  },
  plugins: [
    replace({
      include: 'mini-graph-card.js',
      'https://unpkg.com/@polymer/lit-element@^0.6.3/lit-element.js?module': '@polymer/lit-element'
    }),
    resolve(),
    terser()
  ]
};
