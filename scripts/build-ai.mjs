import { build } from "vite";
await build({
  configFile: false,
  logLevel: "warn",
  build: {
    outDir: "dist-server",
    target: "node20",
    minify: false,
    lib: {
      entry: "server/main.ts",
      formats: ["es"],
      fileName: () => "server.mjs",
    },
    rollupOptions: { external: (id) => id.startsWith("node:") },
  },
});
