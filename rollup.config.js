import resolve from 'rollup-plugin-node-resolve';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';

const dev = process.env.ROLLUP_WATCH;
const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/mini-history-graph-bundle.js',
    format: 'umd',
    name: 'MiniStateCard',
    sourcemap: !!dev,
  },
  plugins: [
    json({
      include: 'package.json',
      preferConst: true,
    }),
    resolve(),
    dev && serve(serveopts),
  ],
};
