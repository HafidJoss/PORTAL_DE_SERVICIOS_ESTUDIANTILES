import { defineConfig, type UserConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

process.env.VITEST_SKIP_INSTALL_CHECKS ??= "1";

export default defineConfig({
  plugins: [react()] as UserConfig["plugins"],
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000",
      },
    },
    globals: true,
    setupFiles: ["./src/testSetup/setup.ts"],
    css: true,
  },
});
