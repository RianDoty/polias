import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    outDir: "build"
  },
  server: {
    //strictPort: true,
    //hmr: {
    //  port: 443, // Run the websocket server on the SSL port
    //},
    proxy: {
      "/api": {
        target: "http://localhost:3001"
      },

      "/socket.io": {
        //Express/socket.io server runs at 3001
        target: "ws://localhost:3001",
        ws: true
      }
    }
  }
});
