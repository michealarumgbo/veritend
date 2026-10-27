import mongoose from "mongoose";
import { STATUS_CODE } from "../constants.js";
import { BadRequestError } from "../errors.js";
import User from "../models/User.js";
import AttendanceLog from "../models/AttendanceLog.js";
import AttendanceTitle from "../models/AttendanceTitle.js";
import { escapeRegex, getPaging } from "../utils/functions.js";

const isDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

// super admin: all records. admin: only records of sessions they created.
export const getAttendanceReport = async (req, res) => {
  const { page, size, skip } = getPaging(req.query, 5000);
  const sessionFilter =
    req.user.role === "super-admin" ? {} : { createdBy: req.user._id };
  if (req.query.session) {
    if (!mongoose.isValidObjectId(req.query.session))
      throw BadRequestError("Invalid session");
    sessionFilter._id = req.query.session;
  }
  const filter = {
    attendanceTitle: {
      $in: await AttendanceTitle.find(sessionFilter).distinct("_id"),
    },
  };
  const range = {};
  if (isDay(req.query.from))
    range.$gte = new Date(`${req.query.from}T00:00:00.000Z`);
  if (isDay(req.query.to))
    range.$lte = new Date(`${req.query.to}T23:59:59.999Z`);
  if (range.$gte || range.$lte) filter.createdAt = range;
  const search = String(req.query.search || "").trim();
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.userId = {
      $in: await User.find({
        $or: [{ surname: rx }, { firstname: rx }, { regNo: rx }],
      }).distinct("_id"),
    };
  }
  const [logs, total] = await Promise.all([
    AttendanceLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .populate("userId", "surname firstname regNo")
      .populate({
        path: "attendanceTitle",
        select: "name createdBy",
        populate: { path: "createdBy", select: "surname firstname" },
      })
      .lean(),
    AttendanceLog.countDocuments(filter),
  ]);
  const records = logs
    .filter((l) => l.userId && l.attendanceTitle)
    .map((l) => ({
      _id: l._id,
      attendeeName: `${l.userId.surname} ${l.userId.firstname}`,
      attendeeRegNo: l.userId.regNo,
      sessionId: l.attendanceTitle._id,
      attendanceName: l.attendanceTitle.name,
      createdBy: l.attendanceTitle.createdBy
        ? `${l.attendanceTitle.createdBy.surname} ${l.attendanceTitle.createdBy.firstname}`
        : "Unknown",
      recorded: l.createdAt,
    }));
  return res
    .status(STATUS_CODE.SUCCESS)
    .json({ message: "Report retrieved successfully", records, total, page });
};
