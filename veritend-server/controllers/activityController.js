import { STATUS_CODE } from "../constants.js";
import AttendanceLog from "../models/AttendanceLog.js";
import AttendanceTitle from "../models/AttendanceTitle.js";
import { fillDays } from "../utils/functions.js";

// Daily attendance counts + busiest sessions.
// Admins only ever see data from sessions they created; super admin sees everything.
export const getAttendanceActivity = async (req, res) => {
  const days = Math.min(90, Math.max(7, parseInt(req.query.days) || 14));
  const scope =
    req.user.role === "super-admin" ? {} : { createdBy: req.user._id };
  const sessions = await AttendanceTitle.find(scope).select("name").lean();
  const ids = sessions.map((s) => s._id);
  const now = new Date();
  const since = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - (days - 1),
    ),
  );
  const [daily, busiest] = await Promise.all([
    AttendanceLog.aggregate([
      { $match: { attendanceTitle: { $in: ids }, createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },
          n: { $sum: 1 },
        },
      },
    ]),
    AttendanceLog.aggregate([
      { $match: { attendanceTitle: { $in: ids } } },
      { $group: { _id: "$attendanceTitle", n: { $sum: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 5 },
    ]),
  ]);
  const names = new Map(sessions.map((s) => [String(s._id), s.name]));
  return res.status(STATUS_CODE.SUCCESS).json({
    days: fillDays(daily, days, now),
    bySession: busiest.map((b) => ({
      _id: b._id,
      name: names.get(String(b._id)) || "Unknown",
      count: b.n,
    })),
  });
};
