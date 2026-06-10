module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'es2022',
        module: 'commonjs',
        lib: ['es2022'],
        types: ['jest', 'node'],
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        moduleResolution: 'node',
        noEmit: true
      }
    }]
  }
};
