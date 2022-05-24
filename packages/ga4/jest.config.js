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
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 70,
      functions: 93,
      lines: 89,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\js$': 'babel-jest',
  },
};
