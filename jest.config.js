module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./scripts/setupJestEnv.ts'],
  globals: {
    __DEV__: true,
    __TEST__: true,
    __VERSION__: require('./package.json').version,
    __BROWSER__: false,
    __GLOBAL__: false,
    __ESM_BUNDLER__: true,
    __ESM_BROWSER__: false,
    __NODE_JS__: true,
    __FEATURE_OPTIONS_API__: true,
    __FEATURE_SUSPENSE__: true,
    __FEATURE_PROD_DEVTOOLS__: false
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/runtime-test/src/utils/**',
    '!packages/template-explorer/**',
    '!packages/sfc-playground/**',
    '!packages/size-check/**',
    '!packages/runtime-core/src/profiling.ts',
    '!packages/runtime-core/src/customFormatter.ts',
    // DOM transitions are tested via e2e so no coverage is collected
    '!packages/runtime-dom/src/components/Transition*',
    // only called in browsers
    '!packages/vue/src/devCheck.ts',
    // only used as a build entry
    '!packages/vue/src/runtime.ts'
  ],
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@vue/(.*?)$': '<rootDir>/packages/$1/src',
    vue: '<rootDir>/packages/vue/src'
  },
  rootDir: __dirname,
  testMatch: ['<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)'],
  testPathIgnorePatterns: process.env.SKIP_E2E
    ? // ignore example tests on netlify builds since they don't contribute
      // to coverage and can cause netlify builds to fail
      ['/node_modules/', '/examples/__tests__']
    : ['/node_modules/']
}
