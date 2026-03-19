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
        recognizedPersonName: request.body?.recognizedPersonName,
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

  const clearHistory = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const result = await assistantService.clearHistory(userId);
      return response.json(result);
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to clear history." });
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

  const syncUser = async (request, response) => {
    try {
      const userId = request.body?.userId;
      if (!userId || typeof userId !== "string" || !userId.trim()) {
        return response
          .status(400)
          .json({ error: "Request body must include authenticated userId." });
      }

      const profile = await assistantService.syncUser({
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

      const profile = await assistantService.completeOnboarding({
        userId: userId.trim(),
        name: request.body?.name,
        useCase: request.body?.useCase,
        email: request.body?.email,
      });

      return response.json(profile);
    } catch (error) {
      return response
        .status(400)
        .json({ error: error.message || "Failed to complete onboarding." });
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

  const generateSpeech = async (request, response) => {
    try {
      const text = request.body?.text;
      if (!text || typeof text !== "string" || !text.trim()) {
        return response
          .status(400)
          .json({ error: "Request body must include text string." });
      }
      const userId = resolveUserId(request);
      const voiceId = request.body?.voiceId;
      const audioUrl = await assistantService.generateSpeech(text.trim(), {
        userId,
        voiceId,
      });
      return response.json({ audioUrl });
    } catch (error) {
      const status =
        typeof error?.statusCode === "number" && error.statusCode >= 400
          ? error.statusCode
          : 503;
      return response
        .status(status)
        .json({ error: "Speech service is temporarily unavailable." });
    }
  };

  const getKnownPersons = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const items = await assistantService.getKnownPersons(userId);
      return response.json({ items });
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to load known persons." });
    }
  };

  const createKnownPerson = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const item = await assistantService.registerKnownPerson(
        userId,
        request.body,
      );
      return response.status(201).json(item);
    } catch (error) {
      return response
        .status(400)
        .json({ error: error.message || "Failed to save known person." });
    }
  };

  const deleteKnownPerson = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const personId = request.params?.id || request.body?.id;
      const deleted = await assistantService.deleteKnownPerson(
        userId,
        personId,
      );
      return response.json({ deleted });
    } catch (error) {
      return response
        .status(400)
        .json({ error: error.message || "Failed to delete known person." });
    }
  };

  const clearKnownPersons = async (request, response) => {
    try {
      const userId = resolveUserId(request);
      const result = await assistantService.removeAllKnownPersons(userId);
      return response.json(result);
    } catch (error) {
      return response
        .status(500)
        .json({ error: error.message || "Failed to clear known persons." });
    }
  };

  return {
    analyze,
    decision,
    history,
    clearHistory,
    getProfile,
    updateProfile,
    syncUser,
    completeOnboarding,
    getPersonalObjects,
    createPersonalObject,
    deletePersonalObject,
    generateSpeech,
    getKnownPersons,
    createKnownPerson,
    deleteKnownPerson,
    clearKnownPersons,
    shouldCapture: decision,
  };
}
