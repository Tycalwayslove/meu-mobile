import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    target: ["chrome70", "ios13"],
    cssTarget: "chrome70"
  }
});
