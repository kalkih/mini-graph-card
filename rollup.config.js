import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'main.js',
  output: {
    file: 'mini-graph-card-bundle.js',
    format: 'umd',
    name: 'MiniGraphCard',
  },
  plugins: [
    resolve(),
  ],
};
