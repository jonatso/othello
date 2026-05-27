import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": "warn",
    },
  },
  fmt: {
    indentWidth: 3,
    lineWidth: 100,
  },
});
