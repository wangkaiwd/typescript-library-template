module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'import/no-extraneous-dependencies': 0,
    'class-methods-use-this': 0,
    'no-param-reassign': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'import/prefer-default-export': 0,
    'prefer-destructuring': 0,
    'no-shadow': 0,
    'prefer-promise-reject-errors': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-restricted-syntax': 0,
    'no-plusplus': 0,
    'guard-for-in': 0,
    'func-names': 0,
  },
  settings: {
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  ignorePatterns: ['.husky/**', 'build/**/*']
};
