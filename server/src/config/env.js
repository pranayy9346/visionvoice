import dotenv from "dotenv";

dotenv.config();

export function getEnvConfig() {
  const port = Number(process.env.PORT || 5000);
  const mongodbUri = process.env.MONGODB_URI;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const murfinApiKey = process.env.MURF_API_KEY;
  const murfVoiceId = process.env.MURF_VOICE_ID || "en-US-natalie";
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const maxImageBytes = Number(process.env.MAX_IMAGE_BYTES || 6 * 1024 * 1024);
  const nodeEnv = process.env.NODE_ENV || "development";

  // Validate required production env vars
  if (nodeEnv === "production") {
    const required = { MONGODB_URI: mongodbUri, GEMINI_API_KEY: geminiApiKey };
    const missing = Object.entries(required)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    if (missing.length) {
      throw new Error(`Missing required env vars: ${missing.join(", ")}`);
    }
  }

  return {
    port,
    mongodbUri,
    geminiApiKey,
    geminiModel,
    murfinApiKey,
    murfVoiceId,
    frontendOrigin,
    maxImageBytes,
    nodeEnv,
  };
}
