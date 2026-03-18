import { resolveUserId } from "../../modules/user/userProfile.service.js";

export function createAssistantController(assistantService) {
  const analyze = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const result = await assistantService.analyze({
        userId,
        query: request.body?.query,
        image: request.body?.image,
        scene: request.body?.scene,
        useCache: request.body?.useCache,
      });
      return response.status(201).json(result);
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to analyze image." });
    }
  };

  const decision = async (request, response) => {
    try {
      const query = request.body?.query;
      if (!query || typeof query !== "string" || !query.trim()) {
        return response
          .status(400)
          .json({ error: "Request body must include query string." });
      }

      const userId = resolveUserId(request);
      const result = await assistantService.decide({
        userId,
        query: query.trim(),
        imageAge:
          typeof request.body?.imageAge === "number"
            ? request.body.imageAge
            : 0,
        conversationHistory: request.body?.conversationHistory,
        lastScene: request.body?.lastScene,
      });

      return response.json(result);
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to determine capture need." });
    }
  };

  const history = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const items = await assistantService.getHistory(userId);
      return response.json(items);
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to load history." });
    }
  };

  const getProfile = async (request, response) => {
    try {
      const userId = request.params?.userId?.trim() || resolveUserId(request);
      const profile = await assistantService.getProfile(userId);
      return response.json(profile);
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to load user profile." });
    }
  };

  const updateProfile = async (request, response) => {
    try {
      const userId = request.params?.userId?.trim() || resolveUserId(request);
      const profile = await assistantService.saveProfile(
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

  const getPersonalObjects = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const items = await assistantService.getPersonalObjects(userId);
      return response.json({ items });
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to load personal objects." });
    }
  };

  const createPersonalObject = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const item = await assistantService.registerPersonalObject(
        userId,
        request.body,
      );
      return response.status(201).json(item);
    } catch (error) {
      return response
        .status(400)
        .json({ error: error.message || "Failed to save personal object." });
    }
  };

  const deletePersonalObject = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const objectId = request.params?.id || request.body?.id;
      const deleted = await assistantService.deletePersonalObject(
        userId,
        objectId,
      );
      return response.json({ deleted });
    } catch (error) {
      return response
        .status(400)
        .json({ error: error.message || "Failed to delete personal object." });
    }
  };

  return {
    analyze,
    decision,
    history,
    getProfile,
    updateProfile,
    getPersonalObjects,
    createPersonalObject,
    deletePersonalObject,
    shouldCapture: decision,
  };
}
