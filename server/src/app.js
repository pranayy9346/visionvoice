import cors from "cors";
import express from "express";
import { createAssistantController } from "./api/controllers/assistant.controller.js";
import { createAssistantRoutes } from "./api/routes/assistant.routes.js";
import { getEnvConfig } from "./config/env.js";
import { connectDatabase } from "./db/connection.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { createAssistantService } from "./services/vision/assistant.service.js";

const env = getEnvConfig();

function createCorsOptions(frontendOrigin) {
  const allowedOrigins = new Set(
    frontendOrigin
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const explicit = allowedOrigins.has(origin);
      const localhost = /^https?:\/\/localhost:\d+$/i.test(origin);
      if (explicit || localhost) return callback(null, true);

      return callback(new Error("CORS origin not allowed"));
    },
  };
}

export async function startServer() {
  await connectDatabase(env.mongodbUri);

  const app = express();
  const assistantService = createAssistantService({
    maxImageBytes: env.maxImageBytes,
  });
  const assistantController = createAssistantController(assistantService);

  app.use(cors(createCorsOptions(env.frontendOrigin)));
  app.use(express.json({ limit: "10mb" }));

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api", createAssistantRoutes(assistantController));
  app.use(errorMiddleware);

  app.listen(env.port, () => {
    console.log(`VisionVoice API running on http://localhost:${env.port}`);
  });
}
