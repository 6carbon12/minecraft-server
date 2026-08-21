import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from 'vite-plugin-svgr';
import process from 'node:process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(), svgr()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_SERVER_IP,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
