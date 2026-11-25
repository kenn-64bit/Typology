import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// `npx vitest run` from the workspace root runs every package's tests as its own project.
// apps/web is declared inline: its sveltekit() plugin resolves `$lib` against the current directory, which is wrong
// when Vitest starts at the root, so the web project maps `$lib` itself. Its tests import plain TS modules only.
const web = fileURLToPath(new URL("./apps/web/", import.meta.url));
export default defineConfig({
  test: {
    projects: [
      "packages/*",
      {
        root: web,
        resolve: { alias: { $lib: `${web}src/lib` } },
        test: { name: "@typo/web", include: ["src/**/*.test.ts"] },
      },
    ],
  },
});
