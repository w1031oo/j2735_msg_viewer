import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import vuetify from "./src/plugins/vuetify.js";

export default defineConfig({
  plugins: [vue()],
  assetsInclude: ["**/*.bin", "**/*.uper"],
  server: {
    proxy: {
      // 로컬 개발 시 /api로 시작하는 요청을 3301(NestJS)로 보냄
      "/api": {
        target: "http://localhost:3301",
        changeOrigin: true,
        // 만약 NestJS가 모든 경로에 /api가 붙어있지 않다면 아래 설정 추가
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
