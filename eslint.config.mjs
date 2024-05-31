import pluginJs from "@eslint/js";
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from "globals";
import tseslint from "typescript-eslint";


export default [
  {languageOptions: { globals: { ...globals.node, jest: true } } },
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
      ".serverless",
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
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],
      'semi': ['error', 'always'],
      '@typescript-eslint/semi': ['error', 'always'],
    }
  }
];
