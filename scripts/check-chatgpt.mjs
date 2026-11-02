import { build } from "vite";
import { mkdir, writeFile } from "node:fs/promises";
const result = await build({
  configFile: false,
  logLevel: "error",
  build: {
    write: false,
    minify: false,
    target: "esnext",
    lib: { entry: "scripts/chatgpt.test.ts", formats: ["es"] },
    rollupOptions: {
      external: (id) => id.startsWith("node:") || id === "jose",
    },
  },
});
const output = Array.isArray(result) ? result[0].output : result.output;
await mkdir("tmp/tests", { recursive: true });
await writeFile(
  "tmp/tests/chatgpt.test.mjs",
  output.find((item) => item.type === "chunk").code,
);
await import(
  new URL(`../tmp/tests/chatgpt.test.mjs?${Date.now()}`, import.meta.url)
);
