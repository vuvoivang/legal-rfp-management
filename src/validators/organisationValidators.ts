import mongoose from "mongoose";
import z from "zod";

export const registerBodyValidationSchema = z.object({
  email: z.string().trim(),
  password: z.string().trim(),
  confirmedPassword: z.string().trim(),
  name: z.string().trim(),
  organisationName: z.string().trim(),
  organisationRole: z.enum(["LEGAL_TEAM", "LAW_FIRM"]),
});

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2),
  role: z.enum(["ADMIN", "NORMAL_USER"]),
  organisationId: z
    .string()
    .refine((v) => mongoose.isValidObjectId(v), "Invalid organisation ID"),
});
