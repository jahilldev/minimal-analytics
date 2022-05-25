/* -----------------------------------
 *
 * Jest
 *
 * -------------------------------- */

module.exports = {
  testEnvironment: 'jsdom',
  globals: { __DEV__: true },
  roots: ['<rootDir>'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  coverageDirectory: '<rootDir>/tests/coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '(.*).d.ts'],
  coverageThreshold: {
    global: {
      statements: 94,
      branches: 63,
      functions: 83,
      lines: 93,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\js$': 'babel-jest',
  },
};
