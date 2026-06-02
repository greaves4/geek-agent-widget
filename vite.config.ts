import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "es2018",
    minify: "esbuild",
    lib: {
      entry: resolve(__dirname, "src/widget.ts"),
      name: "GeekAgentWidget",
      formats: ["umd"],
      fileName: () => "widget.umd.js"
    },
    rollupOptions: {
      output: {
        // Single chunk, sin assets externos.
        inlineDynamicImports: true,
        extend: true,
        exports: "named"
      }
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    port: 5173,
    open: "/index.html"
  }
});
