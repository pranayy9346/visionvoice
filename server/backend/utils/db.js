import mongoose from "mongoose";

export async function connectDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required in server .env");
  }

  await mongoose.connect(mongoUri);
}
