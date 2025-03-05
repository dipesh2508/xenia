import { MockResponse, createMockRequest } from "../helpers/test-helper";
import * as communityController from "../../controllers/community.controller";
import { 
  createTestUser, 
  cleanupTestUsers, 
  createTestCommunity,
  cleanupTestCommunities,
  addMemberToCommunity
} from "../helpers/db-test-helper";
import { Response } from "express";

describe("Community Controller", () => {
  let res: MockResponse;
  const testEmails: string[] = [];
  const testCommunityIds: string[] = [];
  let testUser: any;
  let testUser2: any;
  
  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    // Create test users that we'll use throughout the tests
    testUser = await createTestUser({
      name: "Test Community Owner",
      email: "community.owner@test.com",
      password: "password123"
    });
    testUser2 = await createTestUser({
      name: "Test Community Member",
      email: "community.member@test.com",
      password: "password123"
    });
    testEmails.push(testUser.email, testUser2.email);
  });

  afterAll(async () => {
    await cleanupTestCommunities(testCommunityIds);
    await cleanupTestUsers(testEmails);
  });

  beforeEach(() => {
    res = new MockResponse();
  });

  describe("createCommunity", () => {
    it("should return 400 if name is missing", async () => {
      const req = createMockRequest({
        user: { id: testUser.id },
        body: { description: "Test description" }
      });

      await communityController.createCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toBe("Community name is required");
    });

    it("should create a community successfully", async () => {
      const communityData = {
        name: "Test Community",
        description: "Test Description"
      };

      const req = createMockRequest({
        user: { id: testUser.id },
        body: communityData
      });

      await communityController.createCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(201);
      const community = res.getJson();
      expect(community.name).toBe(communityData.name);
      expect(community.description).toBe(communityData.description);
      testCommunityIds.push(community.id);
    });

    it("should return 400 if name is too long", async () => {
      const req = createMockRequest({
        user: { id: testUser.id },
        body: { 
          name: "a".repeat(101),
          description: "Test description" 
        }
      });

      await communityController.createCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toBe("Community name must be less than 100 characters");
    });

    it("should return 400 if community name already exists", async () => {
      const communityData = {
        name: "Duplicate Community",
        description: "Test Description"
      };

      // Create first community
      await createTestCommunity({
        name: communityData.name,
        ownerId: testUser.id
      });

      // Try to create duplicate
      const req = createMockRequest({
        user: { id: testUser.id },
        body: communityData
      });

      await communityController.createCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toBe("Community name already exists");
    });
  });

  describe("getCommunity", () => {
    it("should return 404 if community not found", async () => {
      const req = createMockRequest({
        params: { id: "nonexistent-id" }
      });

      await communityController.getCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(404);
      expect(res.getJson().message).toBe("Community not found");
    });

    it("should get community successfully", async () => {
      const community = await createTestCommunity({
        name: "Test Get Community",
        description: "Test Description",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      const req = createMockRequest({
        params: { id: community.id }
      });

      await communityController.getCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      expect(res.getJson().name).toBe(community.name);
    });
  });

  describe("getAllCommunities", () => {
    beforeEach(async () => {
      // Create multiple test communities
      const communities = [
        { name: "Test Community 1", description: "Description 1" },
        { name: "Test Community 2", description: "Description 2" },
        { name: "Another Community", description: "Description 3" },
        { name: "Different Group", description: "Description 4" },
      ];

      for (const comm of communities) {
        const community = await createTestCommunity({
          ...comm,
          ownerId: testUser.id
        });
        testCommunityIds.push(community.id);
      }
    });

    it("should return all communities", async () => {
      const req = createMockRequest({});

      await communityController.getAllCommunities(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      expect(Array.isArray(res.getJson())).toBe(true);
    });

    it("should return paginated results", async () => {
      const req = createMockRequest({
        query: { page: "1", limit: "2" }
      });

      await communityController.getAllCommunities(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      const result = res.getJson();
      expect(Array.isArray(result.communities)).toBe(true);
      expect(result.communities.length).toBe(2);
      expect(result.total).toBeGreaterThan(2);
      expect(result.hasMore).toBe(true);
    });

    it("should return filtered results by search term", async () => {
      const req = createMockRequest({
        query: { search: "Another" }
      });

      await communityController.getAllCommunities(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      const result = res.getJson();
      expect(Array.isArray(result.communities)).toBe(true);
      expect(result.communities.every((c: any) => c.name.includes("Another"))).toBe(true);
    });
  });

  describe("updateCommunity", () => {
    it("should return 404 if community not found", async () => {
      const req = createMockRequest({
        user: { id: testUser.id },
        params: { id: "nonexistent-id" },
        body: { name: "Updated Name" }
      });

      await communityController.updateCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(404);
      expect(res.getJson().message).toBe("Community not found");
    });

    it("should return 403 if user is not owner", async () => {
      const community = await createTestCommunity({
        name: "Test Update Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      const req = createMockRequest({
        user: { id: testUser2.id },
        params: { id: community.id },
        body: { name: "Updated Name" }
      });

      await communityController.updateCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(403);
      expect(res.getJson().message).toBe("Not authorized to update this community");
    });

    it("should update community successfully", async () => {
      const community = await createTestCommunity({
        name: "Test Update Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      const updateData = {
        name: "Updated Community Name",
        description: "Updated Description"
      };

      const req = createMockRequest({
        user: { id: testUser.id },
        params: { id: community.id },
        body: updateData
      });

      await communityController.updateCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      expect(res.getJson().name).toBe(updateData.name);
    });

    it("should return 400 if trying to update to existing community name", async () => {
      const community1 = await createTestCommunity({
        name: "First Community",
        ownerId: testUser.id
      });
      const community2 = await createTestCommunity({
        name: "Second Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community1.id, community2.id);

      const req = createMockRequest({
        user: { id: testUser.id },
        params: { id: community2.id },
        body: { name: "First Community" }
      });

      await communityController.updateCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toBe("Community name already exists");
    });

  });

  describe("deleteCommunity", () => {
    it("should return 404 if community not found", async () => {
      const req = createMockRequest({
        user: { id: testUser.id },
        params: { id: "nonexistent-id" }
      });

      await communityController.deleteCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(404);
      expect(res.getJson().message).toBe("Community not found");
    });

    it("should return 403 if user is not owner", async () => {
      const community = await createTestCommunity({
        name: "Test Delete Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      const req = createMockRequest({
        user: { id: testUser2.id },
        params: { id: community.id }
      });

      await communityController.deleteCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(403);
      expect(res.getJson().message).toBe("Not authorized to delete this community");
    });

    it("should delete community successfully", async () => {
      const community = await createTestCommunity({
        name: "Test Delete Community",
        ownerId: testUser.id
      });

      const req = createMockRequest({
        user: { id: testUser.id },
        params: { id: community.id }
      });

      await communityController.deleteCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      expect(res.getJson().message).toBe("Community deleted successfully");
    });
  });

  describe("joinCommunity", () => {
    it("should return 404 if community not found", async () => {
      const req = createMockRequest({
        user: { id: testUser2.id },
        params: { id: "nonexistent-id" }
      });

      await communityController.joinCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(404);
      expect(res.getJson().message).toBe("Community not found");
    });

    it("should join community successfully", async () => {
      const community = await createTestCommunity({
        name: "Test Join Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      const req = createMockRequest({
        user: { id: testUser2.id },
        params: { id: community.id }
      });

      await communityController.joinCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      expect(res.getJson().userId).toBe(testUser2.id);
      expect(res.getJson().communityId).toBe(community.id);
    });

    it("should return 400 if user is already a member", async () => {
      const community = await createTestCommunity({
        name: "Test Join Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      // Add member first
      await addMemberToCommunity(community.id, testUser2.id);

      const req = createMockRequest({
        user: { id: testUser2.id },
        params: { id: community.id }
      });

      await communityController.joinCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toBe("User is already a member of this community");
    });

  });

  describe("leaveCommunity", () => {
    it("should return 404 if community not found", async () => {
      const req = createMockRequest({
        user: { id: testUser2.id },
        params: { id: "nonexistent-id" }
      });

      await communityController.leaveCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(404);
      expect(res.getJson().message).toBe("Community not found");
    });

    it("should return 400 if owner tries to leave", async () => {
      const community = await createTestCommunity({
        name: "Test Leave Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      const req = createMockRequest({
        user: { id: testUser.id },
        params: { id: community.id }
      });

      await communityController.leaveCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toBe("Owner cannot leave the community");
    });

    it("should leave community successfully", async () => {
      const community = await createTestCommunity({
        name: "Test Leave Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      // Add member first
      await addMemberToCommunity(community.id, testUser2.id);

      const req = createMockRequest({
        user: { id: testUser2.id },
        params: { id: community.id }
      });

      await communityController.leaveCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      expect(res.getJson().message).toBe("Left community successfully");
    });

    it("should return 400 if user is not a member", async () => {
      const community = await createTestCommunity({
        name: "Test Leave Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      const req = createMockRequest({
        user: { id: testUser2.id },
        params: { id: community.id }
      });

      await communityController.leaveCommunity(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(400);
      expect(res.getJson().message).toBe("User is not a member of this community");
    });
  });

  describe("getCommunityMembers", () => {
    it("should get community members successfully", async () => {
      const community = await createTestCommunity({
        name: "Test Members Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      // Add another member
      await addMemberToCommunity(community.id, testUser2.id);

      const req = createMockRequest({
        params: { id: community.id }
      });

      await communityController.getCommunityMembers(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      const members = res.getJson();
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBe(2); // Owner + 1 member
    });

    it("should return paginated members list", async () => {
      const community = await createTestCommunity({
        name: "Test Members Community",
        ownerId: testUser.id
      });
      testCommunityIds.push(community.id);

      // Create and add multiple members
      const memberUsers = await Promise.all([
        createTestUser({ name: "Member 1", email: "member1@test.com", password: "password123" }),
        createTestUser({ name: "Member 2", email: "member2@test.com", password: "password123" }),
        createTestUser({ name: "Member 3", email: "member3@test.com", password: "password123" })
      ]);

      for (const user of memberUsers) {
        testEmails.push(user.email);
        await addMemberToCommunity(community.id, user.id);
      }

      const req = createMockRequest({
        params: { id: community.id },
        query: { page: "1", limit: "2" }
      });

      await communityController.getCommunityMembers(req, res as unknown as Response);
      
      expect(res.getStatus()).toBe(200);
      const result = res.getJson();
      expect(Array.isArray(result.members)).toBe(true);
      expect(result.members.length).toBe(2);
      expect(result.total).toBeGreaterThan(2);
      expect(result.hasMore).toBe(true);
    });
  });
});
