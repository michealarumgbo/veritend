import mongoose, { Schema } from "mongoose";

const attendanceTitleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true },
);

const AttendanceTitle = mongoose.model(
  "AttendanceTitle",
  attendanceTitleSchema,
);
export default AttendanceTitle;
