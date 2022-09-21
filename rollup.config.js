// export default merge(baseConfig, {
//   input: './out-tsc/index.js',
//   output: {
//     file:'bundle.js',
//       format:'cjs'
//   }

import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-polyfill-node";
import nodeResolve from "@rollup/plugin-node-resolve";

// });
export default {
  input: "./out-tsc/index.js",
  external: ["cross-fetch", "cross-fetch/polyfill"],
  output: {
    name: "My Name",
    file: "dist/bundle.js",
    format: "cjs",
  },
  plugins: [commonjs(), nodePolyfills()],
};
