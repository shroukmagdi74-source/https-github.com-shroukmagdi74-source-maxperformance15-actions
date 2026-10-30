/**
 * Storefront-only vitest config (STUDIO-REG-1 · section 3-ب).
 *
 * The repository has no `vitest.config.*`; suites normally run through the
 * project `vite.config.ts` with no `test` block. Adding a global `setupFiles`
 * there would change every suite in the repo, so the storefront setup is wired
 * here instead and used explicitly by `scripts/run-studio-tests.mjs`.
 *
 * Kept under `scripts/` on purpose: the ticket only allows test files,
 * `scripts/`, the studio CI workflow and `package.json` to change.
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";
import type { UserConfig } from "vitest/config";
import viteConfigFactory from "../vite.config";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

type ViteConfigFactory = (env: { mode: string; command: string }) => UserConfig;
const viteConfig = (viteConfigFactory as unknown as ViteConfigFactory)({
  mode: "test",
  command: "serve",
});

export default mergeConfig(
  viteConfig,
  defineConfig({
    root: frontendRoot,
    test: {
      environment: "jsdom",
      setupFiles: [resolve(frontendRoot, "src/storefront/__tests__/setup/storefrontTestSetup.ts")],
      include: ["src/storefront/__tests__/**/*.test.{ts,tsx}"],
      // Storefront suites assert DOM/behaviour, not shipped CSS.
      css: false,
      testTimeout: 30000,
      hookTimeout: 30000,
    },
  }),
);
