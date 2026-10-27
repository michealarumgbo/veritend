import z, { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { BaseError } from "../errors.js";
import { STATUS_CODE } from "../constants.js";

export default function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err instanceof BaseError)
    return res.status(err.status).json({ error: err.message });
  if (err instanceof ZodError) {
    const e = z.flattenError(err);
    const fields = Object.values(e.fieldErrors).map((m) => m[0]);
    return res.status(STATUS_CODE.BAD_REQUEST).json({
      error: [...e.formErrors, ...fields].join(", ") || "Invalid input",
    });
  }
  if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError
  )
    return res
      .status(STATUS_CODE.UNAUTHOURIZED)
      .json({ error: "Invalid or expired token" });
  if (err?.code === 11000)
    return res.status(409).json({ error: "That record already exists" });
  if (err?.name === "CastError")
    return res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Invalid id" });
  if (err?.type === "entity.parse.failed")
    return res
      .status(STATUS_CODE.BAD_REQUEST)
      .json({ error: "Invalid JSON body" });
  console.error(err);
  return res
    .status(STATUS_CODE.SERVER_ERROR)
    .json({ error: "Something went wrong, please try again later" });
}
