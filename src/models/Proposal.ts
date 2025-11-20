import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    rfpId: { type: mongoose.Schema.ObjectId, ref: "Rfp", require: true },
    estimatedCost: { type: Number, require: true },
    experience: { type: String, require: true },
    lawFirmId: { type: mongoose.Schema.ObjectId, ref: 'Organisation', require: true },
    status: {
        type: String,
        enum: ['DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED'],
        default: 'DRAFT'
    }
  },
  { timestamps: true }
);

export default mongoose.model("Proposal", proposalSchema);
