import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    host: "localhost",
    port: 5173,
    https: true, // mkcert가 자동으로 HTTPS 설정
  },
});
