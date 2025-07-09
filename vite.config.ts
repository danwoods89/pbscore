/// <reference types="vitest" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
  },
  build: {
    lib: {
      entry: "src/index.ts", // Adjust if your package entry point is different
      name: "React Game Clock",
      formats: ["es", "cjs"],
      fileName: (format) => `react-game-clock.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    fakeTimers: {
      toFake: [...(configDefaults.fakeTimers.toFake ?? []), "performance"],
    },
  },
});
