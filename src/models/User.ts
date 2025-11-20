import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    hashedPassword: { type: String, require: true },
    role: {
      type: String,
      enum: ["ADMIN", "NORMAL_USER"],
      require: true,
    },
    organisationId: {
      type: mongoose.Schema.ObjectId,
      ref: "Organisation",
      require: true,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.hashedPassword);
};

export default mongoose.model<IUser>("User", userSchema);
