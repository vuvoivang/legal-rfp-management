import mongoose from "mongoose";
import { maxLength, minLength } from "zod";

const rfpSchema = new mongoose.Schema(
  {
    title: { type: String, require: true, minLength: 8, maxLength: 255 },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "PUBLISHED", "CLOSED", "DELETED"],
      require: true,
      default: "DRAFT",
    },
    description: String,
    budget: { type: Number, require: true },
    createdBy: { type: mongoose.Schema.ObjectId, ref: "User", require: true },
    dueDate: { type: Date, require: true },
  },
  { timestamps: true }
);

// enable $text - full text search - tokens mapping
// example: 'website' word -> ids [1], 'developer' word -> ids [1, 3]
// them break input into words
// search by mapping table
// similar to Google Search does internally
rfpSchema.index({ title: "text", description: "text" });

// optimize queries filtering/sorting
// example: jump directly to all documents (status = 'PUBLISHED')
rfpSchema.index({
  status: 1,
  budget: 1,
  dueDate: 1,
});

// prevent race condition - mark unique at db level
// prevent inserting 2 identical documents at the same time (e.g: from 2 different servers)
// MongoDB throws E11000 error code, mongoose catches and rethrows
rfpSchema.index({ title: 1, createdBy: 1 }, { unique: true });

export default mongoose.model("Rfp", rfpSchema);
