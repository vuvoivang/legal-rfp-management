import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name?: string;
  email: string;
  role: "NORMAL_USER" | "ADMIN";
  refreshTokenVersion: number;
  hashedPassword: string;
  organisationId: mongoose.Types.ObjectId;
  comparePassword(password: string): Promise<boolean>;
}
