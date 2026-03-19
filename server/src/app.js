import cors from "cors";
import express from "express";
import { createAssistantController } from "./api/controllers/assistant.controller.js";
import { createAssistantRoutes } from "./api/routes/assistant.routes.js";
import { createUserController } from "./controllers/userController.js";
import { getEnvConfig } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import {
  errorMiddleware,
  requestLogging,
} from "./middleware/error.middleware.js";
import { createUserRoutes } from "./routes/userRoutes.js";
import { createUserService } from "./services/userService.js";
import { createAssistantService } from "./services/vision/assistant.service.js";

const env = getEnvConfig();

export function startServer() {
  const app = express();

  const assistantService = createAssistantService({
    maxImageBytes: env.maxImageBytes,
  });
  const assistantController = createAssistantController(assistantService);
  const userService = createUserService();
  const userController = createUserController(userService);

  // Security & performance middleware
  app.use(requestLogging);
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ limit: "8mb", extended: true }));
  app.use(cors({ origin: "*" }));
  app.use(authMiddleware);

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

  app.get("/", (_request, response) => {
    response.send("Server is running");
  });

  // Health check with detailed status
  app.get("/health", (_request, response) => {
    response.json({ status: "ready", timestamp: new Date().toISOString() });
  });

  app.use("/api", createUserRoutes(userController));
  app.use("/api", createAssistantRoutes(assistantController));
  app.use(errorMiddleware);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Endpoint not found." });
  });

  const PORT = process.env.PORT || 5000;
  console.log("Starting server...");
  console.log("PORT:", process.env.PORT);
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`VisionVoice API ready on port ${PORT} (${env.nodeEnv})`);
  });

  // Connect DB in the background so port is always opened for Render.
  connectDatabase(env.mongodbUri)
    .then(() => {
      console.log("Database connected successfully.");
    })
    .catch((dbError) => {
      console.error("Database connection failed:", dbError.message);
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

  return server;
}
