import { z } from "zod";
import { Types } from "mongoose";

const objectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: "Invalid ObjectId" });

export const createCommentSchema = z.object({
  entityId: objectId, // rfpId or proposalId
  entityType: z.enum(["RFP", "PROPOSAL"]),
  content: z.string().min(1, "Message cannot be empty"),
});
