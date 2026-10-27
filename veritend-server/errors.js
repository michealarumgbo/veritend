import { STATUS_CODE } from "./constants.js";

export class BaseError extends Error {
  status = 500;
  constructor(message, options) {
    super(message, options);
    this.status = options.status;
  }
}
const make = (status) =>
  function (message, options = {}) {
    return new BaseError(message, { ...options, status });
  };
export const NotFoundError = make(STATUS_CODE.NOTFOUND); // 404
export const UnauthourizedError = make(STATUS_CODE.UNAUTHOURIZED); // 401 (not signed in / bad credentials)
export const UnAuthenticatedError = make(STATUS_CODE.FORBIDDEN); // 403 (signed in but not allowed)
export const ForbiddenError = UnAuthenticatedError;
export const BadRequestError = make(STATUS_CODE.BAD_REQUEST); // 400
export const ConflictError = make(409);
