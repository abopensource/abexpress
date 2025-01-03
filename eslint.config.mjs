import pluginJs from "@eslint/js"
import prettierConfig from "eslint-config-prettier"
import prettierPlugin from "eslint-plugin-prettier"
import globals from "globals"

export default [
  pluginJs.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.{cjs,js,jsx,mjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.es2020,
        ...globals.jest,
        ...globals.node,
        log: "writable",
      },
      parserOptions: { ecmaVersion: "latest" },
    },
    plugins: { prettier: prettierPlugin },
    rules: { "prettier/prettier": "error" },
    settings: {},
  },
  {
    ignores: ["logs/**/*"],
  },
]
