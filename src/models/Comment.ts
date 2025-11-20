import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    rfpId: { type: mongoose.Schema.ObjectId, ref: "Rfp", require: true },
    content: { type: String, require: true },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    entityType: {
      type: String,
      enum: ["RFP", "PROPOSAL"],
      require: true,
    },
    entityId: { // Rfp or Proposal id
      type: mongoose.Schema.ObjectId,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
