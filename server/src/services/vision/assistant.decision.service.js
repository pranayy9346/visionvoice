import { decideInteraction } from "../ai/gemini.service.js";
import { canAnswerFromCache } from "./cacheDecision.service.js";

export async function resolveDecision({
  query,
  imageAge,
  conversationHistory,
  scene,
}) {
  const cacheReadiness = canAnswerFromCache(scene, imageAge);
  if (cacheReadiness.forceNewImage) {
    return {
      useCache: false,
      needNewImage: true,
      confidence: cacheReadiness.confidence,
      reason: cacheReadiness.reason,
    };
  }

  try {
    return await decideInteraction({
      query,
      conversationHistory,
      lastScene: scene,
      imageAge,
    });
  } catch (error) {
    const isRate = (error?.message || "").includes("RATE_LIMITED");
    return {
      useCache: cacheReadiness.canUseCache,
      needNewImage: !cacheReadiness.canUseCache,
      confidence: cacheReadiness.confidence,
      reason: isRate
        ? "Decision model rate-limited; using cache freshness fallback."
        : "Controller unavailable; using cache freshness fallback.",
    };
  }
}
