import { rateLimit } from "express-rate-limit";

const limiter = (windowMs, limit) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts, please wait and try again." },
  });
export const loginLimiter = limiter(15 * 60 * 1000, 20);
export const verifyLimiter = limiter(15 * 60 * 1000, 30);
export const markLimiter = limiter(10 * 60 * 1000, 40);
