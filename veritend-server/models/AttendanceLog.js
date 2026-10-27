import mongoose, { Schema } from "mongoose";

const attendanceLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    attendanceTitle: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceTitle",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);
// one record per attendee per session, enforced by the database
attendanceLogSchema.index({ userId: 1, attendanceTitle: 1 }, { unique: true });

export default mongoose.model("AttendanceLog", attendanceLogSchema);
