import bcrypt from "bcrypt";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import {
  newAccessToken,
  newRefreshToken,
  hashToken,
  DUMMY_HASH,
} from "../utils/functions.js";
import { accessCookieOptions, refreshCookieOptions } from "../utils/cookies.js";
import { verifyCredSchema } from "../validations/authValidation.js";
import { STATUS_CODE } from "../constants.js";
import { UnAuthenticatedError, UnauthourizedError } from "../errors.js";

const issueCookies = async (res, user) => {
  const accessToken = newAccessToken(user);
  const refreshToken = newRefreshToken(user);
  await RefreshToken.findOneAndUpdate(
    { userId: user._id },
    { refreshToken: hashToken(refreshToken) },
    { upsert: true },
  );
  res
    .cookie("accessToken", accessToken, accessCookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions);
};

// login for admins and super admins
export const login = async (req, res) => {
  const { regNo, password } = verifyCredSchema.parse(req.body);
  const user = await User.findOne({ regNo: regNo.toUpperCase() });
  const ok = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !ok) throw UnauthourizedError("Invalid Reg No or Password");
  if (!["admin", "super-admin"].includes(user.role))
    throw UnAuthenticatedError("You are not an Admin");
  if (user.status !== "active")
    throw UnAuthenticatedError("This account has been suspended");

  await issueCookies(res, user);
  const userData = user.toObject();
  delete userData.password;
  return res
    .status(STATUS_CODE.SUCCESS)
    .json({ message: "User logged in successfully", user: userData });
};

export const logout = async (req, res) => {
  await RefreshToken.deleteOne({ userId: req.user._id });
  res
    .clearCookie("accessToken", accessCookieOptions)
    .clearCookie("refreshToken", refreshCookieOptions);
  return res
    .status(STATUS_CODE.SUCCESS)
    .json({ message: "User logged out successfully" });
};

// rotates both tokens
export const refreshAccessToken = async (req, res) => {
  await issueCookies(res, req.user);
  return res
    .status(STATUS_CODE.SUCCESS)
    .json({ message: "New Token Generated Successfully" });
};
