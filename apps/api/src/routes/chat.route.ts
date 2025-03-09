import express from "express";
import { 
  createChat,
  getCommunityChats,
  getChatById,
  deleteChat
} from "@/controllers/chat.controller";
import { isLoggedIn } from "@/middleware/isUserLoggedIn";

const router = express.Router();

// Chat room routes with authentication
router.post("/", isLoggedIn, createChat);
router.get("/community/:communityId", isLoggedIn, getCommunityChats);
router.get("/:chatId", isLoggedIn, getChatById);
router.delete("/:chatId", isLoggedIn, deleteChat);

export default router;
