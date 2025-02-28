import express from "express";
import {
  checkAuth,
  userLogin,
  userSignup,
  logout
} from "@/controllers/user.controller";
import { isLoggedIn } from "@/middleware/isUserLoggedIn";

const router = express.Router();

router.route("/signup").post(userSignup);
router.route("/login").post(userLogin);
router.route("/logout").post(logout);
router.route("/checkAuth").post(isLoggedIn, checkAuth);

export default router;
