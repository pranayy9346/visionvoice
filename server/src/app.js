import cors from "cors";
import express from "express";
import { createAssistantController } from "./api/controllers/assistant.controller.js";
import { createAssistantRoutes } from "./api/routes/assistant.routes.js";
import { getEnvConfig } from "./config/env.js";
import { connectDatabase } from "./db/connection.js";
import {
  errorMiddleware,
  requestLogging,
} from "./middleware/error.middleware.js";
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
      const isProdLocalhost =
        env.nodeEnv === "development" &&
        /^https?:\/\/localhost:\d+$/i.test(origin);
      if (explicit || isProdLocalhost) return callback(null, true);

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    maxAge: 86400,
  };
}

export async function startServer() {
  const app = express();

  // Connect database before starting server
  try {
    await connectDatabase(env.mongodbUri);
    console.log("Database connected successfully.");
  } catch (dbError) {
    console.error("Database connection failed:", dbError.message);
    process.exit(1);
  }

  const assistantService = createAssistantService({
    maxImageBytes: env.maxImageBytes,
  });
  const assistantController = createAssistantController(assistantService);

  // Security & performance middleware
  app.use(requestLogging);
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ limit: "8mb", extended: true }));
  app.use(cors(createCorsOptions(env.frontendOrigin)));

  // Security headers
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    });
    next();
  });

  // Health check with detailed status
  app.get("/health", (_request, response) => {
    response.json({ status: "ready", timestamp: new Date().toISOString() });
  });

  app.use("/api", createAssistantRoutes(assistantController));
  app.use(errorMiddleware);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Endpoint not found." });
  });

  const PORT = process.env.PORT || env.port || 5000;
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`VisionVoice API ready on port ${PORT} (${env.nodeEnv})`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Graceful shutdown initiated...`);
    server.close(async () => {
      try {
        console.log("Server closed.");
        process.exit(0);
      } catch (err) {
        console.error("Shutdown error:", err.message);
        process.exit(1);
      }
    });
    setTimeout(() => {
      console.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
