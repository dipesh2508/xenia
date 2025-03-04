export default {
  spec_dir: "src/tests",
  spec_files: [
    "**/*.spec.ts" 
  ],
  helpers: [
    "helpers/**/*.ts"
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true
  }
};
