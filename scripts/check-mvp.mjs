import { build } from "vite";
import { mkdir, writeFile } from "node:fs/promises";
const result = await build({
  configFile: false,
  logLevel: "error",
  esbuild: { jsx: "automatic" },
  build: {
    write: false,
    minify: false,
    target: "esnext",
    lib: { entry: "scripts/mvp.test.tsx", formats: ["es"] },
    rollupOptions: {
      external: (id) =>
        id.startsWith("node:") ||
        /^(react|react-dom|zustand|motion|lucide-react|react-router-dom)(\/|$)/.test(
          id,
        ),
    },
  },
});
await mkdir("tmp/tests", { recursive: true });
const output = Array.isArray(result) ? result[0].output : result.output;
const chunk = output.find((item) => item.type === "chunk");
await writeFile("tmp/tests/mvp.test.mjs", chunk.code);
// Isolated memory storage: never touch the user's browser profile.
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
  key: (i) => [...storage.keys()][i] ?? null,
  get length() {
    return storage.size;
  },
};
await import(
  new URL(`../tmp/tests/mvp.test.mjs?${Date.now()}`, import.meta.url)
);
