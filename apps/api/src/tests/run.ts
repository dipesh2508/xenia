import Jasmine from 'jasmine';
import { SpecReporter } from 'jasmine-spec-reporter';
import path from 'path';
import dotenv from 'dotenv';
import { register } from 'tsconfig-paths';

// Register path aliases from tsconfig
const tsConfig = require('../../tsconfig.test.json');

// Register the path mappings
register({
  baseUrl: path.join(process.cwd()),
  paths: tsConfig.compilerOptions.paths
});

// Configure environment for tests
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Mock JWT_SECRET if it's not in the test environment
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key';
}

// Initialize Jasmine
const jasmine = new Jasmine({});

// Configure Jasmine
jasmine.loadConfig({
  spec_dir: 'src/tests',
  spec_files: ['**/*.spec.ts'],
  helpers: ['helpers/**/*.ts'],
  random: false,
  stopSpecOnExpectationFailure: false
});

// Setup spec reporter
jasmine.env.clearReporters();
jasmine.env.addReporter(
  new SpecReporter({
    spec: {
      displayPending: true,
      displayDuration: true,
    },
    summary: {
      displaySuccessful: true,
      displayFailed: true,
      displayPending: true,
    },
  })
);

console.log('Starting test suite...');

// Run the tests
jasmine.execute().then(() => {
  console.log('Test suite completed.');
});
