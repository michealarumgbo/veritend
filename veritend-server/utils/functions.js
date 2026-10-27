import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const newAccessToken = (user = {}) =>
  jwt.sign({ id: user._id, regNo: user.regNo }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
export const newRefreshToken = (user = {}) =>
  jwt.sign(
    { id: user._id, regNo: user.regNo },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
// attendance proof tokens use a derived secret so they can never be used as access tokens
export const attendanceSecret = () =>
  `${process.env.JWT_ACCESS_SECRET}:attendance`;
// refresh tokens are stored hashed
export const hashToken = (t) =>
  crypto.createHash("sha256").update(t).digest("hex");
// compared against when the user does not exist, to keep response time uniform
export const DUMMY_HASH = bcrypt.hashSync("veritend-dummy-password", 12);

// generate password - 16 hex chars
export const generatePassword = () => crypto.randomBytes(8).toString("hex");

export const getEuclideanDist = (a = [], b = []) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length)
    return Infinity;
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
};
// smaller distance = more similar. 
export const embeddingsCheck = (
  a = [],
  b = [],
  tolerance = Number(process.env.FACE_MATCH_THRESHOLD) || 0.4,
) => getEuclideanDist(a, b) <= tolerance;

export const generateRef = (length = 0) => {
  if (!(length > 0)) throw new Error("Length must be greater than zero");
  let code = "";
  for (let i = 0; i < length; i++) code += crypto.randomInt(0, 10);
  return code;
};
// staff reg no: STAFF/(six digits)(surname initial)(firstname initial) e.g. STAFF/859845AE
export const getRegNo = (surname, firstname) =>
  `STAFF/${generateRef(6)}${(surname[0] + firstname[0]).toUpperCase()}`;

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const getPaging = (query, maxSize = 100) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const size = Math.min(maxSize, Math.max(1, parseInt(query.size) || 10));
  return { page, size, skip: (page - 1) * size };
};

// zero-filled list of the last `days` UTC days with counts from aggregation rows [{_id:'YYYY-MM-DD', n}]
export const fillDays = (rows, days, now = new Date()) => {
  const byDate = new Map(rows.map((r) => [r._id, r.n]));
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)).toISOString().slice(0, 10);
    out.push({ date, count: byDate.get(date) || 0 });
  }
  return out;
};
