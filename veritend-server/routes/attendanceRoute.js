import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { authorise } from "../middlewares/authorise.middleware.js";
import { validateObjectId } from "../middlewares/validate.middleware.js";
import {
  markLimiter,
  verifyLimiter,
} from "../middlewares/rateLimit.middleware.js";
import {
  closeAttendance,
  createAttendance,
  getPublicSession,
  listAttendance,
  markAttendance,
  openAttendance,
  verifyCredentials,
} from "../controllers/attendanceController.js";

const router = express.Router();
// public terminal endpoints (phase 2 is protected by the signed cookie from phase 1)
router.post("/verify-credentials", verifyLimiter, verifyCredentials);
router.post("/mark", markLimiter, markAttendance);
router.get(
  "/:attendanceSessionId/public",
  validateObjectId("attendanceSessionId"),
  getPublicSession,
);
// staff
router.get("/", auth(), authorise("admin", "super-admin"), listAttendance);
router.post("/", auth(), authorise("admin"), createAttendance);
router.patch(
  "/:attendanceSessionId/open",
  auth(),
  authorise("admin"),
  validateObjectId("attendanceSessionId"),
  openAttendance,
);
router.patch(
  "/:attendanceSessionId/close",
  auth(),
  authorise("admin"),
  validateObjectId("attendanceSessionId"),
  closeAttendance,
);
export default router;
