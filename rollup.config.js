import resolve from 'rollup-plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/mini-graph-card-bundle.js',
    format: 'umd',
    name: 'MiniGraphCard',
  },
  plugins: [
    json({
      include: 'package.json',
      preferConst: true,
    }),
    resolve(),
  ],
};
