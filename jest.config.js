module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup.js'],
  verbose: true,
  testMatch: [
    "**/__tests__/**/*.test.js"
  ],
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testTimeout: 10000
};