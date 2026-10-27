import z from "zod";

export const verifyCredSchema = z.object({
  regNo: z
    .string("regNo is required")
    .trim()
    .min(1, "regNo is required")
    .max(30, "regNo should not be more than 30 characters"),
  password: z.string("Password is required").min(1, "Password is required"),
});
export const verifyAttendeeSchema = verifyCredSchema.extend({
  sessionId: z.string("sessionId is required"),
});
