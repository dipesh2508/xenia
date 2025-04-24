import express from "express";
import { upload } from "@/utils/cloudinary";
import {
  createCommunity,
  getCommunity,
  getAllCommunities,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  getUserCommunities,
  checkMembership
} from "@/controllers/community.controller";
import { isLoggedIn } from "@/middleware/isUserLoggedIn";
import { isCommunityMember } from "@/middleware/isCommunityMember";

const router = express.Router();

router.post("/", isLoggedIn, upload.single('image'), createCommunity);
router.get("/", getAllCommunities);
router.get("/user", isLoggedIn, getUserCommunities);
router.get("/:id", getCommunity);
router.put("/:id", isLoggedIn, upload.single('image'), updateCommunity);
router.delete("/:id", isLoggedIn, deleteCommunity);
router.post("/:id/join", isLoggedIn, joinCommunity);
router.post("/:id/leave", isLoggedIn, leaveCommunity);
router.get("/:id/members", getCommunityMembers);
router.get("/:communityId/membership", isLoggedIn, checkMembership);

export default router;
