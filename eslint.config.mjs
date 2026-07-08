// @ts-check
import js from '@eslint/js';
import ts from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';
import vitest from '@vitest/eslint-plugin';
import pluginQuery from '@tanstack/eslint-plugin-query';
import reactHooks from 'eslint-plugin-react-hooks';

const config = ts.config(
  {
    ignores: [
      'dist/*',
      '.react-router/*',
      'server/*',
      './.lintstagedrc.mjs',
      'coverage',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...pluginQuery.configs['flat/recommended'],
  reactHooks.configs['recommended-latest'],
  eslintConfigPrettier,
  {
    // Node-ympäristön skriptit (esim. preview-server.mjs)
    files: ['*.mjs', '*.cjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-shadow': ['error'],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@mui/*/*/*', '../../*'],
          paths: [
            {
              name: '@mui/material',
              importNames: ['styled'],
              message:
                'Please use styled from @/lib/theme or @mui/material/styles instead.',
            },
          ],
        },
      ],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
        },
      ],
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/e2e/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      '@typescript-eslint/no-floating-promises': 'error',
      'playwright/expect-expect': 'off',
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
    },
  },
  {
    files: ['src/**/*.test.ts*'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/max-nested-describe': ['error', { max: 2 }],
    },
  },
);

export default config;
