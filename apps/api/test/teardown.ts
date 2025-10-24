import { TestApp } from './test-utils';

module.exports = async function globalTeardown() {
  if (global.testApp) {
    await global.testApp.close();
  }
};
