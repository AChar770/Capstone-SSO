import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/greet": "http://localhost:3001",
      "/seed": "http://localhost:3001",
    },
  },
});
