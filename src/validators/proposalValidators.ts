import { z } from "zod";
import { Types } from "mongoose";

const objectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createProposalSchema = z.object({
  rfpId: objectId,
  fee: z.number().nonnegative(),
  experience: z.string().min(3),
  details: z.string().optional(),
});

export const updateProposalSchema = z.object({
  fee: z.number().nonnegative().optional(),
  experience: z.string().optional(),
  details: z.string().optional(),
  status: z.enum(["SUBMITTED", "REVIEWED", "REJECTED", "ACCEPTED"]).optional(),
});

export const listProposalsByRfpSchema = {
  params: z.object({
    rfpId: z.string().min(1, "rfpId is required"),
  }),
};

export const acceptProposalSchema = {
  params: z.object({
    id: z.string().min(1, "Proposal ID is required"),
  }),
};
