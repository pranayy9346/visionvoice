import dotenv from "dotenv";

dotenv.config();

export function getEnvConfig() {
  const port = Number(process.env.PORT || 5000);
  const mongodbUri = process.env.MONGODB_URI;
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const maxImageBytes = Number(process.env.MAX_IMAGE_BYTES || 6 * 1024 * 1024);

  return {
    port,
    mongodbUri,
    frontendOrigin,
    maxImageBytes,
  };
}
