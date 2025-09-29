import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});
// export default {
//   esbuild: {
//     loader: "jsx",
//     include: /src\/.*\.[jt]sx?$/,
//     exclude: [],
//   },
// };
