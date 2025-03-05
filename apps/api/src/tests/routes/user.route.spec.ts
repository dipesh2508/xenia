import { MockResponse, createMockRequest } from "../helpers/test-helper";
import * as userController from "../../controllers/user.controller";
import { createTestUser, cleanupTestUsers } from "../helpers/db-test-helper";
import { Response } from "express";

describe("User Controller", () => {
  let res: MockResponse;
  const testEmails: string[] = [];
  
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterAll(async () => {
    // Cleanup all test users
    await cleanupTestUsers(testEmails);
  });

  beforeEach(() => {
    res = new MockResponse();
  });

  describe("userSignup", () => {
    it("should return 400 if fields are missing", async () => {
      const req = createMockRequest({
        body: { name: "Test User", email: "", password: "" }
      });

      await userController.userSignup(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toContain("Please provide all fields");
    });

    it("should return 400 if password is less than 6 characters", async () => {
      const req = createMockRequest({
        body: { name: "Test User", email: "test@example.com", password: "12345" }
      });

      await userController.userSignup(req as any, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toContain("Password must be at least 6 characters");
    });

    it("should return 400 if user already exists", async () => {
      const userData = {
        name: "Existing Test User",
        email: "existing.test@example.com",
        password: "password123"
      };
      
      // Create a user first
      await createTestUser(userData);
      testEmails.push(userData.email);

      // Try to create the same user again
      const req = createMockRequest({
        body: userData
      });

      await userController.userSignup(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toBe("User with the provided email already exist.");
    });

    it("should create a new user successfully", async () => {
      const userData = {
        name: "New Test User",
        email: "new.test@example.com",
        password: "password123"
      };
      testEmails.push(userData.email);

      const req = createMockRequest({ body: userData });
      await userController.userSignup(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(201);
      const response = res.getJson();
      expect(response).toEqual({
        id: jasmine.any(String),
        name: userData.name,
        email: userData.email
      });
      expect(res.getCookies().token).toBeDefined();
    });
  });

  describe("userLogin", () => {
    it("should return 400 if email or password is missing", async () => {
      const req = createMockRequest({
        body: { email: "", password: "" }
      });

      await userController.userLogin(req as any, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toContain("Please provide all fields");
    });

    it("should return 400 if user not found", async () => {
      const req = createMockRequest({
        body: { email: "nonexistent@example.com", password: "password" }
      });

      await userController.userLogin(req as any, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toContain("Invalid credentials");
    });

    it("should return 400 if password does not match", async () => {
      const req = createMockRequest({
        body: { email: "user@example.com", password: "wrongpassword" }
      });

      await userController.userLogin(req as any, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toContain("Invalid credentials");
    });

    it("should login successfully with valid credentials", async () => {
      const userData = {
        name: "Login Test User",
        email: "login.test@example.com",
        password: "password123"
      };
      
      // Create test user first
      const user = await createTestUser(userData);
      testEmails.push(userData.email);

      const req = createMockRequest({
        body: { 
          email: userData.email, 
          password: userData.password
        }
      });

      await userController.userLogin(req, res as unknown as Response);

      expect(res.getStatus()).toBe(200);
      expect(res.getJson()).toEqual({
        id: user.id,
        name: user.name,
        email: user.email
      });
      expect(res.getCookies().token).toBeDefined();
    });
  });

  describe("logout", () => {
    it("should clear the token cookie", async () => {
      const req = createMockRequest({});

      await userController.logout(req as any, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      expect(res.getClearedCookies()).toContain("token");
      expect(res.getJson().message).toContain("Logged out successfully");
    });
  });

  describe("checkAuth", () => {
    it("should return the user information", async () => {
      const user = { id: "4", name: "Auth User", email: "auth@example.com" };
      const req = createMockRequest({ user });

      await userController.checkAuth(req as any, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      expect(res.getJson()).toEqual(user);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const userData = {
        name: "Delete Test User",
        email: "delete.test@example.com",
        password: "password123"
      };
      
      // Create test user first
      const user = await createTestUser(userData);
      testEmails.push(userData.email);

      const req = createMockRequest({
        params: { id: user.id }
      });

      await userController.deleteUser(req, res as unknown as Response);

      expect(res.getStatus()).toBe(200);
      expect(res.getJson().message).toBe("User deleted successfully.");
    });

    it("should return 404 if user not found", async () => {
      const userId = "nonexistent-user";
      const req = createMockRequest({
        params: { id: userId }
      });

      await userController.deleteUser(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(500);
      expect(res.getJson().message).toBe("Internal server error.");
    });
  });
});
