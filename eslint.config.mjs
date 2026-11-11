// From the harness default (core/eslint.config.mjs), with TypeScript rules for src/, bin/ and test/.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Copied harness tools and generated or example data are not this project's source.
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'tools/**', 'examples/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Input validation matches control characters on purpose.
      'no-control-regex': 'off',
      // Fixed error texts are deliberate where a cause could carry private or untrusted text.
      'preserve-caught-error': 'off',
      // TypeScript resolves names; `no-undef` only misreports Node globals in .mjs files.
      'no-undef': 'off',
    },
  },
);
