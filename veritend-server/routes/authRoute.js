import express from "express";
import { auth, authRefreshToken } from "../middlewares/auth.middleware.js";
import { loginLimiter } from "../middlewares/rateLimit.middleware.js";
import {
  login,
  logout,
  refreshAccessToken,
} from "../controllers/authController.js";

const router = express.Router();
router.post("/login", loginLimiter, login);
router.post("/logout", auth(), logout);
router.patch("/token/refresh", authRefreshToken(), refreshAccessToken);
export default router;
