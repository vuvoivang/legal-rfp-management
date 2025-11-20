import AuditLog from "../models/AuditLog";

export const createAuditLog = async ({
  entity,
  entityId,
  action,
  performedBy,
  changes,
}: {
  entity: "RFP" | "PROPOSAL";
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  performedBy: string;
  changes?: any;
}) => {
  await AuditLog.create({
    entityType: entity,
    entityId,
    action,
    performedBy,
    changes,
  });
};
