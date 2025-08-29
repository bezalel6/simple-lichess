// export default merge(baseConfig, {
//   input: './out-tsc/index.js',
//   output: {
//     file:'bundle.js',
//       format:'cjs'
//   }

import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-polyfill-node";

// });
export default {
  input: "./out-tsc/index.js",
  external: ["cross-fetch", "@bity/oauth2-auth-code-pkce"],
  output: {
    name: "SimpleLichessAPI",
    file: "dist/bundle.js",
    format: "cjs",
  },
  plugins: [commonjs(), nodePolyfills()],
};
