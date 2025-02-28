import { defineConfig } from "tsup";
import { execSync } from "child_process";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  clean: true,
  sourcemap: true,
  noExternal: ["@repo/database"],
  platform: "node",
  target: "node18",
  outDir: "dist",
  treeshake: true,
  splitting: false,
  dts: true,
  onSuccess: async () => {
    console.log("Build completed successfully!");
    
    if (process.env.NODE_ENV === "development") {
      try {
        console.log("Starting server...");
        const proc = execSync("node dist/index.js", { stdio: "inherit" });
      } catch (error) {
        console.error("Failed to start server:", error);
      }
    }
  },
});
