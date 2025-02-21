import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  // 配置路径别名，用@替代./src
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
