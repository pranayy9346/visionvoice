export function createUserController(userService) {
  const getProfile = async (request, response) => {
    try {
      const userId =
        request.params?.userId?.trim() || userService.resolveUserId(request);
      const profile = await userService.getProfile(userId);
      return response.json(profile);
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to load user profile." });
    }
  };

  const updateProfile = async (request, response) => {
    try {
      const userId =
        request.params?.userId?.trim() || userService.resolveUserId(request);
      const profile = await userService.saveProfile(
        userId,
        request.body?.preferences || {},
      );
      return response.json(profile);
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to update user profile." });
    }
  };

  const syncUser = async (request, response) => {
    try {
      const userId = request.body?.userId;
      if (!userId || typeof userId !== "string" || !userId.trim()) {
        return response
          .status(400)
          .json({ error: "Request body must include authenticated userId." });
      }

      const profile = await userService.syncUser({
        userId: userId.trim(),
        email: request.body?.email,
        name: request.body?.name,
      });

      return response.json(profile);
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to sync user profile." });
    }
  };

  const completeOnboarding = async (request, response) => {
    try {
      const userId = request.body?.userId;
      if (!userId || typeof userId !== "string" || !userId.trim()) {
        return response
          .status(400)
          .json({ error: "Request body must include authenticated userId." });
      }

      const profile = await userService.completeOnboarding({
        userId: userId.trim(),
        email: request.body?.email,
        name: request.body?.name,
        useCase: request.body?.useCase,
      });

      return response.json(profile);
    } catch (error) {
      return response
        .status(400)
        .json({ error: error.message || "Failed to complete onboarding." });
    }
  };

  return {
    getProfile,
    updateProfile,
    syncUser,
    completeOnboarding,
  };
}
