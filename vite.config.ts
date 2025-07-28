import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    watch: {
      ignored: ['**/src/backend/data-file.json']
    }
  }
  // server: {
  //   proxy: {
  //     "/track": {
  //       target: "http://localhost:4000",
  //       changeOrigin: true,
  //     },
  //     // Proxy Socket.IO connections
  //     "/socket.io/": {
  //       target: "http://localhost:4000", // your backend port
  //       changeOrigin: true,
  //       ws: true,
  //     },
  //   },
  // },
});
