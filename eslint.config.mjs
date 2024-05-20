import pluginJs from "@eslint/js";
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from "globals";
import tseslint from "typescript-eslint";


export default [
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "node_modules",
      ".build",
      ".git",
      ".dynamodb",
      ".github",
      "local-seeders",
    ]
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
];
