import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { authorise } from "../middlewares/authorise.middleware.js";
import { validateObjectId } from "../middlewares/validate.middleware.js";
import {
  getAdmins,
  getAttendees,
  getMe,
  getUser,
  reactivateUser,
  registerAdmin,
  registerattendee,
  storeFace,
  suspendUser,
  updateAttendee,
} from "../controllers/userController.js";

const router = express.Router();
router.use(auth()); // every user route needs a signed-in staff member
router.get("/me", getMe);
// fixed paths first, so "/:userId" cannot swallow them
router.get("/attendees", authorise("admin", "super-admin"), getAttendees);
router.post("/attendees", authorise("admin"), registerattendee);
router.patch(
  "/attendees/:attendeeId",
  authorise("admin"),
  validateObjectId("attendeeId"),
  updateAttendee,
);
router.post(
  "/attendees/:attendeeId/store-face",
  authorise("admin"),
  validateObjectId("attendeeId"),
  storeFace,
);
router.get("/admins", authorise("super-admin"), getAdmins);
router.post("/admins", authorise("super-admin"), registerAdmin);
router.post(
  "/:userId/suspend",
  authorise("super-admin"),
  validateObjectId("userId"),
  suspendUser,
);
router.post(
  "/:userId/reactivate",
  authorise("super-admin"),
  validateObjectId("userId"),
  reactivateUser,
);
router.get(
  "/:userId",
  authorise("admin", "super-admin"),
  validateObjectId("userId"),
  getUser,
);
export default router;
