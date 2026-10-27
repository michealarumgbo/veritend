import z from "zod";

const name = (label) =>
  z
    .string(`${label} is required`)
    .trim()
    .min(1, `${label} is required`)
    .max(25, `${label} must be less than 25 Characters`);
export const registerAttendeeSchema = z.object({
  surname: name("surname"),
  firstname: name("firstname"),
  regNo: z
    .string("regNo is required")
    .trim()
    .min(1, "regNo is required")
    .max(30, "regNo should not be more than 30 characters"),
});
export const registerAdminSchema = z.object({
  surname: name("surname"),
  firstname: name("firstname"),
});
export const updateAttendeeSchema = z.object({
  surname: name("surname"),
  firstname: name("firstname"),
});
