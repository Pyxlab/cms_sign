import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: ["src/index.ts"],
  splitting: true,
  format: ["cjs", "esm"],
  dts: true,
  bundle: true,
  clean: true,
  sourcemap: true,
  minify: false,
}));
