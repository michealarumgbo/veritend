import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import BiometricTemplate from "../models/BiometricTemplate.js";
import AttendanceLog from "../models/AttendanceLog.js";
import AttendanceTitle from "../models/AttendanceTitle.js";
import { verifyAttendeeSchema } from "../validations/authValidation.js";
import {
  createAttendanceSchema,
  descriptorSchema,
} from "../validations/attendanceVerification.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnAuthenticatedError,
  UnauthourizedError,
} from "../errors.js";
import {
  attendanceSecret,
  DUMMY_HASH,
  embeddingsCheck,
} from "../utils/functions.js";
import { attendanceCookieOptions } from "../utils/cookies.js";
import { STATUS_CODE } from "../constants.js";

const openSession = async (id) => {
  const s = await AttendanceTitle.findById(id);
  if (!s) throw NotFoundError("Attendance session not found");
  if (s.status !== "open")
    throw BadRequestError("This attendance session is closed");
  return s;
};
const expired = () =>
  UnauthourizedError("Verification expired. Please start again.");

// public: lets the terminal show the session title/status
export const getPublicSession = async (req, res) => {
  const s = await AttendanceTitle.findById(req.params.attendanceSessionId)
    .select("name status")
    .lean();
  if (!s) throw NotFoundError("Attendance session not found");
  return res.status(STATUS_CODE.SUCCESS).json({ session: s });
};

// phase 1: credentials. On success a short-lived signed cookie proves phase 1 for this attendee + session.
export const verifyCredentials = async (req, res) => {
  const { regNo, password, sessionId } = verifyAttendeeSchema.parse(req.body);
  if (!mongoose.isValidObjectId(sessionId))
    throw BadRequestError("Invalid session");
  const session = await openSession(sessionId);

  const user = await User.findOne({ regNo });
  const ok = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !ok || user.role !== "attendee")
    throw UnauthourizedError("Invalid Reg No or Password");
  if (user.status !== "active")
    throw UnAuthenticatedError("This account has been suspended");
  if (!(await BiometricTemplate.exists({ userId: user._id })))
    throw BadRequestError(
      "Your face is not enrolled yet. Please see an administrator.",
    );
  if (
    await AttendanceLog.exists({
      userId: user._id,
      attendanceTitle: session._id,
    })
  )
    throw ConflictError("You have already taken attendance for this session");

  const token = jwt.sign(
    { id: user._id, sid: session._id, purpose: "attendance" },
    attendanceSecret(),
    { expiresIn: "10m" },
  );
  res.cookie("attendanceToken", token, attendanceCookieOptions);
  return res.status(STATUS_CODE.SUCCESS).json({
    message: "Attendee details verified successfully",
    attendee: {
      _id: user._id,
      name: `${user.surname} ${user.firstname}`,
      regNo: user.regNo,
    },
  });
};

// phase 2: face. verify face and if successful marks attndance
export const markAttendance = async (req, res) => {
  const token = req.signedCookies.attendanceToken;
  if (!token) throw expired();
  let payload;
  try {
    payload = jwt.verify(token, attendanceSecret());
  } catch {
    throw expired();
  }
  if (payload.purpose !== "attendance") throw expired();

  const { descriptor } = descriptorSchema.parse(req.body);
  const session = await openSession(payload.sid);
  const user = await User.findById(payload.id);
  if (!user || user.role !== "attendee" || user.status !== "active")
    throw UnAuthenticatedError("This account cannot take attendance");
  const template = await BiometricTemplate.findOne({ userId: user._id });
  if (!template)
    throw BadRequestError(
      "Your face is not enrolled yet. Please see an administrator.",
    );
  if (!embeddingsCheck(descriptor, template.descriptor))
    throw ForbiddenError("Face does not match. Please try again.");

  let log;
  try {
    log = await AttendanceLog.create({
      userId: user._id,
      attendanceTitle: session._id,
    });
  } catch (e) {
    if (e.code === 11000)
      throw ConflictError("You have already taken attendance for this session");
    throw e;
  }

  res.clearCookie("attendanceToken", attendanceCookieOptions);
  return res.status(STATUS_CODE.CREATED).json({
    message: "Face matched! Attendance has been recorded",
    attendee: { name: `${user.surname} ${user.firstname}`, regNo: user.regNo },
    session: { name: session.name },
    timestamp: log.createdAt,
  });
};

// admins: own sessions. super admin: all sessions. Includes attendance counts.
export const listAttendance = async (req, res) => {
  const filter =
    req.user.role === "super-admin" ? {} : { createdBy: req.user._id };
  const sessions = await AttendanceTitle.find(filter)
    .sort({ createdAt: -1 })
    .populate("createdBy", "surname firstname")
    .lean();
  const counts = await AttendanceLog.aggregate([
    { $match: { attendanceTitle: { $in: sessions.map((s) => s._id) } } },
    { $group: { _id: "$attendanceTitle", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  const attendanceSessions = sessions.map((s) => ({
    _id: s._id,
    name: s.name,
    status: s.status,
    createdAt: s.createdAt,
    count: byId.get(String(s._id)) || 0,
    createdBy: {
      _id: s.createdBy?._id,
      name: s.createdBy
        ? `${s.createdBy.surname} ${s.createdBy.firstname}`
        : "Unknown",
    },
  }));
  return res.status(STATUS_CODE.SUCCESS).json({ attendanceSessions });
};

// create new attendance session
export const createAttendance = async (req, res) => {
  const { name } = createAttendanceSchema.parse(req.body);
  const attendanceSession = await AttendanceTitle.create({
    name,
    createdBy: req.user._id,
    status: "open",
  });
  return res.status(STATUS_CODE.CREATED).json({
    message: "Attendance Session created successfully",
    attendanceSession,
  });
};

const setSessionStatus = (status) => async (req, res) => {
  const s = await AttendanceTitle.findById(req.params.attendanceSessionId);
  if (!s) throw NotFoundError("Attendance session not found");
  if (!s.createdBy.equals(req.user._id))
    throw ForbiddenError(
      "You are not authorized to modify this attendance session",
    );
  s.status = status;
  await s.save();
  return res
    .status(STATUS_CODE.SUCCESS)
    .json({ message: `Attendance Session ${status}` });
};
export const openAttendance = setSessionStatus("open");
export const closeAttendance = setSessionStatus("closed");
