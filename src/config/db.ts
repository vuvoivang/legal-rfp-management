import mongoose from "mongoose";

export const connectMongoDB = async () => {
  const dbUri = process.env.MONGO_URI || "";

  try {
    const res = await mongoose.connect(dbUri);
    console.log("MongoDB connected:", res.connection.host);
  } catch (e) {
    // TODO: handle retry
    console.error("MongoDB connection error", e);
    process.exit(1);
  }
};
