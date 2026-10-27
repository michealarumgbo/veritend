import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const CONNECTION_URI = process.env.MONGOOSE_URI;

// function to establish connection to the db
export const dbConnect = async () => {
  try {
    await mongoose.connect(CONNECTION_URI);
    console.log("DB Connected Successfully");
  } catch (error) {
    throw new Error("DB Connection Error: " + error);
  }
};
