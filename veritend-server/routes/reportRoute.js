import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { authorise } from "../middlewares/authorise.middleware.js";
import { getAttendanceReport } from "../controllers/reportCotroller.js";
import { getAttendanceActivity } from "../controllers/activityController.js";

const router = express.Router();
router.get(
  "/attendance",
  auth(),
  authorise("admin", "super-admin"),
  getAttendanceReport,
);
router.get(
  "/activity",
  auth(),
  authorise("admin", "super-admin"),
  getAttendanceActivity,
);
export default router;
