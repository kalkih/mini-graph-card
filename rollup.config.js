import resolve from 'rollup-plugin-node-resolve';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';
import commonjs from '@rollup/plugin-commonjs';

const dev = process.env.ROLLUP_WATCH;
const preview = process.env.PREVIEW;

function getServeOptions() {
  return {
    contentBase: preview ? ['./preview', './dist'] : ['./dist'],
    host: '0.0.0.0',
    port: 5000,
    allowCrossOrigin: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
}

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/mini-graph-card-bundle.js',
    format: 'umd',
    name: 'MiniGraphCard',
    sourcemap: dev ? true : false,
  },
  plugins: [
    commonjs(),
    json({
      include: 'package.json',
      preferConst: true,
    }),
    resolve(),
    dev && serve(getServeOptions()),
  ],
};
