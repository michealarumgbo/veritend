import { ForbiddenError, UnauthourizedError } from "../errors.js";

export const authorise =
  (...roles) =>
  async (req, res, next) => {
    if (!req.user) throw UnauthourizedError("Not signed in");
    if (!roles.includes(req.user.role))
      throw ForbiddenError("You do not have permission to do this");
    next();
  };
