import { defineConfig, loadEnv } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_PUBLIC_PATH } = env;
  return {
    plugins: [vue()],
    base: VITE_APP_PUBLIC_PATH || "/",
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        "~": path.resolve(__dirname, "./"),
        // 设置别名
        "@": path.resolve(__dirname, "./src"),
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
    server: {
      port: 80,
      host: true,
      open: true,
      proxy: {
        "/api/v1": {
          target: "http://163.177.65.65:8082",
          changeOrigin: true,
        },
      },
    },
  };
});
