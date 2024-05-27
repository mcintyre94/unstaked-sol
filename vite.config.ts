import { Plugin, defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// web3js currently includes `process["env"].NODE_ENV
// we switch this at build time to the Vite mode (typically development or production)
function replaceProcessEnv(mode: string): Plugin {
  const nodeEnvRegex = /process(\.env(\.NODE_ENV)|\["env"\]\.NODE_ENV)/g;
  return {
    name: "replace-process-env",
    renderChunk(code) {
      return code.replace(nodeEnvRegex, JSON.stringify(mode));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), replaceProcessEnv(mode)],
}));
