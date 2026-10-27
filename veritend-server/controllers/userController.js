import bcrypt from "bcrypt";
import { STATUS_CODE } from "../constants.js";
import { BadRequestError, NotFoundError } from "../errors.js";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import BiometricTemplate from "../models/BiometricTemplate.js";
import {
  escapeRegex,
  generatePassword,
  getPaging,
  getRegNo,
} from "../utils/functions.js";
import {
  registerAdminSchema,
  registerAttendeeSchema,
  updateAttendeeSchema,
} from "../validations/userValidation.js";
import { descriptorSchema } from "../validations/attendanceVerification.js";

export const getMe = async (req, res) =>
  res.status(STATUS_CODE.SUCCESS).json({ user: req.user });

export const getUser = async (req, res) => {
  const user = await User.findOne({
    _id: req.params.userId,
    role: { $ne: "super-admin" },
  })
    .select("-password")
    .lean();
  if (!user) throw NotFoundError("User not found");
  if (user.role === "attendee")
    user.hasFace = !!(await BiometricTemplate.exists({ userId: user._id }));
  return res.status(STATUS_CODE.SUCCESS).json({ user });
};

// paginated, searchable list. Never returns password hashes or descriptors.
const listUsers = (role, key) => async (req, res) => {
  const { page, size, skip } = getPaging(req.query);
  const filter = { role };
  if (["active", "suspended"].includes(req.query.status))
    filter.status = req.query.status;
  const search = String(req.query.search || "").trim();
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ surname: rx }, { firstname: rx }, { regNo: rx }];
  }
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    User.countDocuments(filter),
  ]);
  if (role === "attendee") {
    const enrolled = new Set(
      (
        await BiometricTemplate.find({
          userId: { $in: users.map((u) => u._id) },
        })
          .select("userId")
          .lean()
      ).map((t) => String(t.userId)),
    );
    users.forEach((u) => (u.hasFace = enrolled.has(String(u._id))));
  }
  return res.status(STATUS_CODE.SUCCESS).json({ [key]: users, total, page });
};
export const getAttendees = listUsers("attendee", "attendees");
export const getAdmins = listUsers("admin", "admins");

// super admin only. Login id and password are generated; the password is returned once.
export const registerAdmin = async (req, res) => {
  const { surname, firstname } = registerAdminSchema.parse(req.body);
  let regNo;
  for (let i = 0; i < 5 && !regNo; i++) {
    const candidate = getRegNo(surname, firstname);
    if (!(await User.exists({ regNo: candidate }))) regNo = candidate;
  }
  if (!regNo)
    throw BadRequestError("Could not generate a unique reg no, try again");
  const password = generatePassword();
  const user = await User.create({
    surname,
    firstname,
    regNo,
    password: await bcrypt.hash(password, 13),
    role: "admin",
  });
  return res
    .status(STATUS_CODE.CREATED)
    .json({
      message: "Admin created successfully",
      admin: { _id: user._id, surname, firstname, regNo, password },
    });
};

export const registerattendee = async (req, res) => {
  const { surname, firstname, regNo } = registerAttendeeSchema.parse(req.body);
  if (await User.exists({ regNo }))
    throw BadRequestError("RegNo exists already");
  const password = generatePassword();
  const user = await User.create({
    surname,
    firstname,
    regNo,
    password: await bcrypt.hash(password, 13),
    role: "attendee",
  });
  return res
    .status(STATUS_CODE.CREATED)
    .json({
      message: "Attendee created successfully",
      attendee: { _id: user._id, surname, firstname, regNo, password },
    });
};

export const updateAttendee = async (req, res) => {
  const data = updateAttendeeSchema.parse(req.body);
  const user = await User.findOneAndUpdate(
    { _id: req.params.attendeeId, role: "attendee" },
    data,
    { new: true },
  ).select("-password");
  if (!user) throw NotFoundError("Attendee not found");
  return res
    .status(STATUS_CODE.SUCCESS)
    .json({ message: "Attendee updated", attendee: user });
};

// store/replace an attendee's face descriptor - admin only
export const storeFace = async (req, res) => {
  const { descriptor } = descriptorSchema.parse(req.body);
  if (!(await User.exists({ _id: req.params.attendeeId, role: "attendee" })))
    throw NotFoundError("Attendee not found");
  await BiometricTemplate.findOneAndUpdate(
    { userId: req.params.attendeeId },
    { descriptor },
    { upsert: true },
  );
  return res
    .status(STATUS_CODE.CREATED)
    .json({ message: "Biometric Descriptor registered successfully" });
};

// super admin: suspend / reactivate any attendee or admin
const setStatus = (status) => async (req, res) => {
  const target = await User.findById(req.params.userId);
  if (!target) throw NotFoundError("User not found");
  if (target.role === "super-admin" || target._id.equals(req.user._id))
    throw BadRequestError("This account cannot be changed");
  if (target.status === status)
    throw BadRequestError(`User is already ${status}`);
  target.status = status;
  await target.save();
  if (status === "suspended")
    await RefreshToken.deleteOne({ userId: target._id }); // ends any admin session immediately
  return res
    .status(STATUS_CODE.SUCCESS)
    .json({ message: `User ${status} successfully` });
};
export const suspendUser = setStatus("suspended");
export const reactivateUser = setStatus("active");
