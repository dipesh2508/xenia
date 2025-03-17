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
  getUserCommunities
} from "@/controllers/community.controller";
import { isLoggedIn } from "@/middleware/isUserLoggedIn";

const router = express.Router();

router.post("/", isLoggedIn, upload.optional().single('image'), createCommunity);
router.get("/", getAllCommunities);
router.get("/user", isLoggedIn, getUserCommunities);
router.get("/:id", getCommunity);
router.put("/:id", isLoggedIn, upload.optional().single('image'), updateCommunity);
router.delete("/:id", isLoggedIn, deleteCommunity);
router.post("/:id/join", isLoggedIn, joinCommunity);
router.post("/:id/leave", isLoggedIn, leaveCommunity);
router.get("/:id/members", getCommunityMembers);

export default router;
