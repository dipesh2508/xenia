import path from "path";
import dotenv from "dotenv";

// Configure environment for tests
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Mock JWT_SECRET if it's not in the test environment
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-secret-key";
}

// Setup global mocks here if needed

// Global test setup
beforeAll(() => {
  console.log("Starting test suite...");
});

afterAll(() => {
  console.log("Test suite completed.");
});
