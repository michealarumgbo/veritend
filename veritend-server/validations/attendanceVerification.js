import z from "zod";

export const createAttendanceSchema = z.object({
  name: z
    .string("Title name is required")
    .trim()
    .max(150, "A maximum of 150 charcters ia accepted for the name"),
});

export const descriptorSchema = z.object({
  descriptor: z.array(z.number()).length(128, {
    message: "Descriptor must contain exactly 128 numbers in the array",
  }),
});
