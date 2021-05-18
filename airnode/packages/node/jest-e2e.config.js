const config = require('../../jest.config.base');

module.exports = {
  ...config,
  // Add custom settings below
  name: 'e2e',
  displayName: 'e2e',
  setupFiles: ['<rootDir>/test/setup/init/set-define-property.ts', '<rootDir>/test/setup/init/set-env-vars.ts'],
  testMatch: ['**/?(*.)+(feature).[tj]s?(x)'],
};
