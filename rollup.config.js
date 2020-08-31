import resolve from "rollup-plugin-node-resolve";
import json from "@rollup/plugin-json";

import minifyHTML from 'rollup-plugin-minify-html-literals';

export default {
  input: "src/main.js",
  output: {
    file: "dist/mini-graph-card-bundle.js",
    format: "umd",
    name: "MiniGraphCard",
  },
  plugins: [
    json({
      include: "package.json",
      preferConst: true,
    }),
    resolve(),
    minifyHTML(),
  ],
};
