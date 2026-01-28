module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|xml)$': [
      '<rootDir>/jest.ts-transformer.cjs',
      {
        isolatedModules: true,
        stringifyContentPathRegex: '.(xml)$',
      },
    ],
  },
  setupFilesAfterEnv: ['./test-setup.ts'],
  coveragePathIgnorePatterns: ['.(xml)$'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!**/*.d.ts',
  ],
  coverageReporters: ['html', 'lcov', 'text', 'json-summary'],
  // this is required because imports end in ".js"
  moduleNameMapper: {
    '^(..?/.+)\\.c?jsx?$': '$1',
  },
};
