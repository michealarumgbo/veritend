import mongoose, { Schema } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
