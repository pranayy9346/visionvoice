// Live-only mode: always require a fresh image for every query.

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

export async function resolveDecision({ query }) {
  const intent = detectIntent(query);
  return {
    intent,
    useCache: false,
    needNewImage: true,
    confidence: 1,
    reason:
      intent === "identity"
        ? "Identity intent requires fresh image analysis."
        : "Live-only mode requires fresh image analysis.",
  };
}
