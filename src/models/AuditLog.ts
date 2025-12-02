import { Schema, model, Types } from "mongoose";

const auditLogSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["RFP", "PROPOSAL"],
      required: true,
    },
    entityId: { type: Types.ObjectId, required: true },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "ACCEPT"],
      required: true,
    },
    performedBy: { type: Types.ObjectId, ref: "User", required: true },
    changes: { type: Object },
  },
  { timestamps: true }
);

export default model("AuditLog", auditLogSchema);
