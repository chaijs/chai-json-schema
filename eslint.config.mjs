import js from '@eslint/js';

const nodeGlobals = {
  require: 'readonly',
  module: 'readonly',
  exports: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  console: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly'
};

const browserGlobals = {
  define: 'readonly',
  window: 'readonly',
  chai: 'readonly'
};

const mochaGlobals = {
  describe: 'readonly',
  it: 'readonly',
  before: 'readonly',
  after: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly'
};

export default [
  {
    files: ['index.js', 'test/**/*.js'],
    ...js.configs.recommended
  },
  {
    files: ['index.js'],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',
      globals: { ...nodeGlobals, ...browserGlobals }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }]
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',
      globals: { ...nodeGlobals, ...browserGlobals, ...mochaGlobals }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }]
    }
  }
];
