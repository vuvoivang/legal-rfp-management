import { z } from "zod";

export const listAuditLogsSchema = z.object({
  entity: z.enum(["RFP", "Proposal"]).optional(),
  entityId: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});
