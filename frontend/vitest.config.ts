import { defineConfig, type UserConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

process.env.VITEST_SKIP_INSTALL_CHECKS ??= "1";

export default defineConfig({
  plugins: [react()] as UserConfig["plugins"],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
