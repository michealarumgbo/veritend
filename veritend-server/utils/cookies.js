const prod = process.env.NODE_ENV === "production";
const base = {
  signed: true,
  httpOnly: true,
  secure: prod,
  sameSite: prod ? "none" : "lax",
};
export const accessCookieOptions = { ...base, maxAge: 60 * 60 * 1000 };
export const refreshCookieOptions = {
  ...base,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
export const attendanceCookieOptions = { ...base, maxAge: 10 * 60 * 1000 };
