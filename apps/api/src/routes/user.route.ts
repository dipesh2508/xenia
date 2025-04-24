import express from "express";
import {
  checkAuth,
  userLogin,
  userSignup,
  logout,
  deleteUser,
  getCurrentUser
} from "@/controllers/user.controller";
import { isLoggedIn } from "@/middleware/isUserLoggedIn";

const router = express.Router();

router.route("/signup").post(userSignup);
router.route("/login").post(userLogin);
router.route("/logout").post(logout);
router.route("/checkAuth").get(isLoggedIn, checkAuth);
router.route("/:id").delete(isLoggedIn, deleteUser);
router.get("/me", isLoggedIn, getCurrentUser);

export default router;
