/* -----------------------------------
 *
 * Jest
 *
 * -------------------------------- */

module.exports = {
  testEnvironment: 'jsdom',
  testURL: 'http://localhost',
  globals: { __DEV__: true },
  roots: ['<rootDir>'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  coverageDirectory: '<rootDir>/tests/coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '(.*).d.ts'],
  // coverageThreshold: {
  //   global: {
  //     statements: 97,
  //     branches: 75,
  //     functions: 100,
  //     lines: 96,
  //   },
  // },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\js$': 'babel-jest',
  },
};
