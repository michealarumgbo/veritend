import mongoose, { Schema } from "mongoose";

const biometricSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    descriptor: { type: [Number], required: true }, //store image embedding
  },
  { timestamps: true },
);
const BiometricTemplate = mongoose.model("BiometricTemplate", biometricSchema);

export default BiometricTemplate;
