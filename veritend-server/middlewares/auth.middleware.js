import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { UnAuthenticatedError, UnauthourizedError } from "../errors.js";
import { hashToken } from "../utils/functions.js";

const loadActiveUser = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw UnauthourizedError("User no longer exists");
  if (user.status !== "active")
    throw UnAuthenticatedError("This account has been suspended");
  return user;
};

export const auth =
  (secret = process.env.JWT_ACCESS_SECRET) =>
  async (req, res, next) => {
    const token = req.signedCookies.accessToken;
    if (!token) throw UnauthourizedError("Access token required");
    const payload = jwt.verify(token, secret); // throws -> 401 via error middleware
    const user = await loadActiveUser(payload.id);
    if (!(await RefreshToken.exists({ userId: user._id })))
      throw UnauthourizedError("Session ended, please log in again");
    req.user = user;
    next();
  };

export const authRefreshToken =
  (secret = process.env.JWT_REFRESH_SECRET) =>
  async (req, res, next) => {
    const token = req.signedCookies.refreshToken;
    if (!token) throw UnauthourizedError("Refresh token required");
    const payload = jwt.verify(token, secret);
    const user = await loadActiveUser(payload.id);
    if (
      !(await RefreshToken.exists({
        userId: user._id,
        refreshToken: hashToken(token),
      }))
    )
      throw UnauthourizedError("Session ended, please log in again");
    req.user = user;
    next();
  };
