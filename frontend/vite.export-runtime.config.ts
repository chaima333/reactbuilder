import {
  defineConfig
} from "vite";

import react from "@vitejs/plugin-react";

import {
  fileURLToPath
} from "node:url";

export default defineConfig({
  plugins: [
    react()
  ],

  base: "/",

  build: {
    outDir:
      "dist-export-runtime",

    emptyOutDir:
      true,

    manifest:
      true,

    rollupOptions: {
      input: {
        visitorAuthExportRuntime:
          fileURLToPath(
            new URL(
              "./src/modules/pageBuilder/export/visitorAuthRuntime.tsx",
              import.meta.url
            )
          )
      }
    }
  }
});