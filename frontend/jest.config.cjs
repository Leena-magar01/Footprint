module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  transform: {
    '^.+\\.ts$': './jest-transformer.cjs'
  }
};
