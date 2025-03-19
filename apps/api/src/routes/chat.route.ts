import express from "express";
import { 
  createChat,
  getCommunityChats,
  getChatById,
  deleteChat
} from "@/controllers/chat.controller";
import {
  createMessage,
  getMessagesByChat,
  updateMessage,
  deleteMessage
} from "@/controllers/message.controller";
import { isLoggedIn } from "@/middleware/isUserLoggedIn";

const router = express.Router();

// Chat room routes with authentication
router.post("/", isLoggedIn, createChat);
router.get("/community/:communityId", isLoggedIn, getCommunityChats);
router.get("/:chatId", isLoggedIn, getChatById);
router.delete("/:chatId", isLoggedIn, deleteChat);

// Message routes with authentication
router.post("/messages", isLoggedIn, createMessage);
router.get("/:chatId/messages", isLoggedIn, getMessagesByChat);
router.patch("/messages/:id", isLoggedIn, updateMessage);
router.delete("/messages/:id", isLoggedIn, deleteMessage);

export default router;
