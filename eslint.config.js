import globals from 'globals';
import { defineConfig } from 'eslint/config';
import importEslintPlugin from 'eslint-plugin-import';
import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['**/dist/', '**/coverage/'],
  },
  {
    extends: [js.configs.recommended, typescriptEslint.configs.recommended],
    plugins: {
      import: importEslintPlugin,
    },
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'import/extensions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/__mocks__/**/*'],
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['*.cjs'],
    languageOptions: {
      globals: {
        ...globals.commonjs,
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
