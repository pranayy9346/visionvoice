import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const DB_TIMEOUT_MS = 30000;

async function connectWithRetry(mongoUri, attempt = 1) {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: DB_TIMEOUT_MS,
      connectTimeoutMS: DB_TIMEOUT_MS,
      socketTimeoutMS: DB_TIMEOUT_MS,
      maxPoolSize: 10,
    });
    console.log(`MongoDB connected (attempt ${attempt}/${MAX_RETRIES})`);
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      console.warn(
        `Connection attempt ${attempt} failed. Retrying in ${RETRY_DELAY_MS}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectWithRetry(mongoUri, attempt + 1);
    }
    throw new Error(
      `MongoDB connection failed after ${MAX_RETRIES} attempts: ${error.message}`,
    );
  }
}

export async function connectDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required in server .env file");
  }

  return connectWithRetry(mongoUri);
}
