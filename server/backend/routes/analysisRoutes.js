import { Router } from "express";

export default function createAnalysisRoutes(controller) {
  const router = Router();

  router.post("/analyze", controller.analyze);
  router.get("/history", controller.history);

  return router;
}
