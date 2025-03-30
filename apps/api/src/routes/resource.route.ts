import express from "express";
import {
  createResource,
  getResource,
  getCommunityResources,
  updateResource,
  deleteResource,
  getUserResources
} from "@/controllers/resource.controller";
import { isLoggedIn } from "@/middleware/isUserLoggedIn";
import { upload } from "@/utils/cloudinary";

const router = express.Router();

// Create a new resource - adding the upload middleware
router.post("/", isLoggedIn, upload.single('file'), createResource);

// Get a specific resource by ID
router.get("/:id", isLoggedIn, getResource);

// Get all resources for a community
router.get("/community/:communityId", isLoggedIn, getCommunityResources);

// Get all resources created by the current user
router.get("/user/me", isLoggedIn, getUserResources);

// Update a resource - adding the upload middleware
router.put("/:id", isLoggedIn, upload.single('file'), updateResource);

// Delete a resource
router.delete("/:id", isLoggedIn, deleteResource);

export default router;
