import pluginJs from "@eslint/js"
import globals from "globals"

export default [
  pluginJs.configs.recommended,
  {
    extends: ["prettier"],
    files: ["**/*.{cjs,js,jsx,mjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.es2020,
        ...globals.jest,
        ...globals.node,
      },
    },
    parserOptions: { ecmaVersion: "latest" },
    plugins: ["prettier"],
    rules: {},
    settings: {},
  },
  {
    ignores: ["logs/**/*"],
  },
]
