import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts"],  // This will pick up all .ts files in src and subdirectories
  format: ["cjs"],
  clean: true,
  sourcemap: true,
  noExternal: ["@repo/database"],
  platform: "node",
  target: "node18",
  outDir: "dist",
  treeshake: true,
  splitting: true,
  dts: true,
});
