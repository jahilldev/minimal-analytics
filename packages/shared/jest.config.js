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
      statements: 59,
      branches: 52,
      functions: 42,
      lines: 58,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\js$': 'babel-jest',
  },
};
