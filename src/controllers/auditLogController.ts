import { Request, Response } from "express";
import AuditLog from "../models/AuditLog";
import { success, failure } from "../utils";
import { listAuditLogsSchema } from "../validators/auditLogValidators";

export const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const { entity, entityId, page, limit } = listAuditLogsSchema.parse(
      req.query
    );

    const filter: any = {};
    if (entity) filter.entity = entity;
    if (entityId) filter.entityId = entityId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("performedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * limit)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return success(res, {
      items: logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch {
    return failure(res, "Internal Server Error", 500);
  }
};
