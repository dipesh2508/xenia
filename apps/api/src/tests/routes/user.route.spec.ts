import { MockResponse, createMockRequest } from "../helpers/test-helper";
import * as userController from "../../controllers/user.controller";
import { prisma } from "@repo/database";
import bcrypt from "bcrypt";
import { Response } from "express";

// Manual mocks for Jasmine testing
const mockPrisma = {
  user: {
    findUnique: jasmine.createSpy('findUnique'),
    create: jasmine.createSpy('create')
  }
};

const mockBcrypt = {
  genSalt: jasmine.createSpy('genSalt'),
  hash: jasmine.createSpy('hash'),
  compare: jasmine.createSpy('compare')
};

const mockGenerateToken = {
  generateJwtToken: jasmine.createSpy('generateJwtToken')
};

// Replace the actual implementations with mocks
(prisma as any) = mockPrisma;
(bcrypt as any).genSalt = mockBcrypt.genSalt;
(bcrypt as any).hash = mockBcrypt.hash;
(bcrypt as any).compare = mockBcrypt.compare;

// Mock the generateJwtToken function
(userController as any).generateJwtToken = mockGenerateToken.generateJwtToken;

describe("User Controller", () => {
  let res: MockResponse;

  beforeEach(() => {
    res = new MockResponse();
    // Reset mocks
    mockPrisma.user.findUnique.calls.reset();
    mockPrisma.user.create.calls.reset();
    mockBcrypt.genSalt.calls.reset();
    mockBcrypt.hash.calls.reset();
    mockBcrypt.compare.calls.reset();
    mockGenerateToken.generateJwtToken.calls.reset();
  });

  describe("userSignup", () => {
    it("should return 400 if fields are missing", async () => {
      const req = createMockRequest({
        body: { name: "Test User", email: "", password: "" }
      });

      await userController.userSignup(req as any, res as unknown as Response);
      
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
      const req = createMockRequest({
        body: { name: "Test User", email: "existing@example.com", password: "123456" }
      });

      mockPrisma.user.findUnique.and.returnValue(Promise.resolve({ 
        id: "1", 
        email: "existing@example.com" 
      }));

      await userController.userSignup(req as any, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toContain("User with the provided email already exist");
    });

    it("should create a new user successfully", async () => {
      const req = createMockRequest({
        body: { 
          name: "New User", 
          email: "new@example.com", 
          password: "123456" 
        }
      });

      mockPrisma.user.findUnique.and.returnValue(Promise.resolve(null));
      mockBcrypt.genSalt.and.returnValue(Promise.resolve("salt"));
      mockBcrypt.hash.and.returnValue(Promise.resolve("hashedPassword"));
      mockPrisma.user.create.and.returnValue(Promise.resolve({ 
        id: "2", 
        name: "New User", 
        email: "new@example.com",
        password: "hashedPassword" 
      }));

      await userController.userSignup(req as any, res as unknown as Response);
      
      expect(res.getStatus()).toBe(201);
      expect(res.getJson()).toEqual(jasmine.objectContaining({
        id: "2",
        name: "New User",
        email: "new@example.com"
      }));
    });
  });

  // Example of a login test
  describe("userLogin", () => {
    it("should return 400 if email or password is missing", async () => {
      const req = createMockRequest({
        body: { email: "", password: "" }
      });

      await userController.userLogin(req as any, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toContain("Please provide all fields");
    });
  });
});
