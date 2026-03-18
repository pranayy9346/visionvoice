import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAnalysisController } from "./backend/controllers/analysisController.js";
import createAnalysisRoutes from "./backend/routes/analysisRoutes.js";
import { connectDatabase } from "./backend/utils/db.js";
import { ensureUploadsDirectory } from "./backend/utils/imageUtils.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

ensureUploadsDirectory(uploadsDir);

const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const allowedOrigins = new Set(
  FRONTEND_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowedExplicit = allowedOrigins.has(origin);
      const isAllowedLocalhost = /^https?:\/\/localhost:\d+$/i.test(origin);

      if (isAllowedExplicit || isAllowedLocalhost) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

const analysisController = createAnalysisController({
  uploadsDir,
});
app.use("/api", createAnalysisRoutes(analysisController));

const start = async () => {
  await connectDatabase(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`VisionVoice API running on http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
