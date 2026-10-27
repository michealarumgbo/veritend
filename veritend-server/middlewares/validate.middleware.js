import mongoose from "mongoose";
import { BadRequestError } from "../errors.js";

export const validateObjectId =
  (...names) =>
  (req, res, next) => {
    for (const n of names)
      if (!mongoose.isValidObjectId(req.params[n]))
        return next(BadRequestError("Invalid id"));
    next();
  };
