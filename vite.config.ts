/// <reference types="vitest" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
  },
  test: {
    globals: true,
    fakeTimers: {
      toFake: [...(configDefaults.fakeTimers.toFake ?? []), "performance"],
    },
  },
});
