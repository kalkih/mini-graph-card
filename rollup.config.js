import resolve from 'rollup-plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/mini-history-graph-bundle.js',
    format: 'umd',
    name: 'MiniStateCard',
  },
  plugins: [
    json({
      include: 'package.json',
      preferConst: true,
    }),
    resolve(),
  ],
};
