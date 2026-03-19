import { Router } from "express";

export function createUserRoutes(controller) {
  const router = Router();

  router.post("/auth/sync", controller.syncUser);
  router.post("/onboarding", controller.completeOnboarding);
  router.get("/profile/:userId", controller.getProfile);
  router.put("/profile/:userId", controller.updateProfile);

  return router;
}
