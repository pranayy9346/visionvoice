import { Router } from "express";

export function createAssistantRoutes(controller) {
  const router = Router();

  router.post("/analyze", controller.analyze);
  router.post("/decision", controller.decision);
  router.post("/should-capture", controller.shouldCapture);
  router.get("/history", controller.history);
  router.get("/profile/:userId", controller.getProfile);
  router.put("/profile/:userId", controller.updateProfile);
  router.get("/personal-objects", controller.getPersonalObjects);
  router.post("/personal-objects", controller.createPersonalObject);
  router.delete("/personal-objects/:id", controller.deletePersonalObject);
  router.get("/objects", controller.getPersonalObjects);
  router.post("/add-object", controller.createPersonalObject);
  router.delete("/objects/:id", controller.deletePersonalObject);
  router.post("/speech", controller.generateSpeech);

  return router;
}
