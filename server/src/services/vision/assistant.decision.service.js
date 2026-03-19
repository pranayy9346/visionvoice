import { decideInteraction } from "../ai/gemini.service.js";
import { canAnswerFromCache } from "./cacheDecision.service.js";

const IDENTITY_PATTERNS = [
  /\bwho\b.*\b(front|here|there|ahead|with me|in front)\b/i,
  /\bwho\s+is\s+(in\s+front|here|there|this|that)\b/i,
  /\bidentify\b.*\b(person|face|who)\b/i,
  /\bwho\s+am\s+i\s+looking\s+at\b/i,
  /\bperson\s+in\s+front\b/i,
  /\bwhose\s+face\b/i,
];

export function detectIntent(query = "") {
  const normalized = typeof query === "string" ? query.trim() : "";
  if (!normalized) {
    return "general";
  }

  if (IDENTITY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "identity";
  }

  return "general";
}

export async function resolveDecision({
  query,
  imageAge,
  conversationHistory,
  scene,
}) {
  const intent = detectIntent(query);
  if (intent === "identity") {
    return {
      intent,
      useCache: false,
      needNewImage: true,
      confidence: 1,
      reason: "Identity intent requires fresh image analysis.",
    };
  }

  const cacheReadiness = canAnswerFromCache(scene, imageAge);
  if (cacheReadiness.forceNewImage) {
    return {
      intent,
      useCache: false,
      needNewImage: true,
      confidence: cacheReadiness.confidence,
      reason: cacheReadiness.reason,
    };
  }

  try {
    const decision = await decideInteraction({
      query,
      conversationHistory,
      lastScene: scene,
      imageAge,
    });

    return {
      intent,
      ...decision,
    };
  } catch (error) {
    const isRate = (error?.message || "").includes("RATE_LIMITED");
    return {
      intent,
      useCache: cacheReadiness.canUseCache,
      needNewImage: !cacheReadiness.canUseCache,
      confidence: cacheReadiness.confidence,
      reason: isRate
        ? "Decision model rate-limited; using cache freshness fallback."
        : "Controller unavailable; using cache freshness fallback.",
    };
  }
}
