/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: ['lib/**/*.ts'],
  watchPathIgnorePatterns: ['/node_modules/', '/build/'],
  // https://github.com/zaqqaz/jest-allure#uses-jest-circus-or-jest--v-27-
  testRunner: 'jest-jasmine2',
};
