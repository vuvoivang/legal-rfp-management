import mongoose from "mongoose";

const organisationSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    type: {
      type: String,
      enum: ["LEGAL_TEAM", "LAW_FIRM"],
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Organisation", organisationSchema);
