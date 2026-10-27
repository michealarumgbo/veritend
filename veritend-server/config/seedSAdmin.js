import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generatePassword } from "../utils/functions.js";

// Creates the super admin (login id SA/0000) once, if none exists.
// Set SUPER_ADMIN_PASSWORD in .env, otherwise a password is generated and printed once.
export const seedSuperAdmin = async () => {
  if (await User.exists({ role: "super-admin" })) return;
  const password = process.env.SUPER_ADMIN_PASSWORD || generatePassword();
  await User.create({
    surname: process.env.SUPER_ADMIN_SURNAME || "Super",
    firstname: process.env.SUPER_ADMIN_FIRSTNAME || "Admin",
    regNo: "SA/0000",
    role: "super-admin",
    password: await bcrypt.hash(password, 13),
  });
  console.log(
    `Super admin created. Login ID: SA/0000${process.env.SUPER_ADMIN_PASSWORD ? "" : `  Password: ${password}  (shown once)`}`,
  );
};
