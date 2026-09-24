import js from "@eslint/js";
import globals from "globals";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["public/assets/vendor/**", "public/assets/html2pdf.bundle.min.js"] },
  { files: ["public/**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  { files: ["*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
  {
    files: ["public/resume/*.js", "public/cover-letter/*.js"],
    languageOptions: { globals: { html2pdf: "readonly" } },
  },
  { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"], rules: { "css/use-baseline": "off" } },
]);
