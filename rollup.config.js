import { terser } from "rollup-plugin-terser";
export default {
  target: "node",
  mode: "production",
  input: "server.js",
  plugins: [terser()],
  output: {
    file: "output.js",
    format: "esm",
  },
};
