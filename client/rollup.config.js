import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "umd",
      name: "ChatbotAI",
      globals: {
        "socket.io-client": "io",
      },
    },
    {
      file: "dist/index.esm.js",
      format: "es",
    },
  ],
  external: ["socket.io-client"],
  plugins: [
    string({
      include: "**/*.css",
    }),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],
};
