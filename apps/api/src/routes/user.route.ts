import express from "express";
import {
  checkAuth,
  userLogin,
  userSignup,
} from "@/controllers/user.controller";
import { isLoggedIn } from "@/middleware/isUserLoggedIn";

const router = express.Router();

router.route("/signup").post(userSignup);
router.route("/login").post(userLogin);
router.route("/checkAuth").post(isLoggedIn, checkAuth);

export default router;
