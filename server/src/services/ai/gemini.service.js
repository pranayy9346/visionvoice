export {
  analyzeFromCache,
  analyzeFromImage,
  analyzeFromText,
  extractImageSignature,
} from "./gemini.analysis.js";

export { decideInteraction } from "./gemini.decision.js";
export { embedText } from "./gemini.embedding.js";

/*
🔥 Semantic Intent Detection + Utilities
*/

// 🔹 Predefined intent meanings (NOT logic, just semantic anchors)
const INTENT_DEFINITIONS = {
  identity: "identify a person in front of me",
  scene: "describe surroundings and environment",
  navigation: "describe what is ahead or in front",
  general: "general knowledge question",
};

// 🔹 Cache for embeddings (VERY IMPORTANT)
const embeddingCache = new Map();

// 🔹 Get embedding with cache
async function getCachedEmbedding(text, embedText) {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text);
  }

  const embedding = await embedText(text);
  embeddingCache.set(text, embedding);

  return embedding;
}

// 🔹 Cosine similarity
function cosineSimilarity(a = [], b = []) {
  if (!a.length || !b.length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (!magA || !magB) return 0;

  return dot / (magA * magB);
}

// 🔹 Semantic intent detection (MAIN FEATURE)
export async function detectIntentSemantic({ query }) {
  if (!query) return "general";

  const { embedText } = await import("./gemini.embedding.js");

  const queryEmbedding = await getCachedEmbedding(query, embedText);

  let bestMatch = { intent: "general", score: 0 };

  for (const [intent, text] of Object.entries(INTENT_DEFINITIONS)) {
    const intentEmbedding = await getCachedEmbedding(text, embedText);

    const score = cosineSimilarity(queryEmbedding, intentEmbedding);

    if (score > bestMatch.score) {
      bestMatch = { intent, score };
    }
  }

  return bestMatch.intent;
}

// 🔹 Image reuse logic (based on freshness)
export function shouldReuseImage({ imageAge = 0 }) {
  const ageSeconds = Number(imageAge) || 0;
  return ageSeconds > 0 && ageSeconds < 10;
}

// 🔹 Distance builder (NO fake data)
export function buildDistanceInfo({
  isLidarAvailable,
  distance,
  visualConfidence,
}) {
  if (isLidarAvailable && typeof distance === "number") {
    return `${distance} meters`;
  }

  // semantic fallback (based on visual confidence)
  if (typeof visualConfidence === "number") {
    if (visualConfidence > 0.7) return "near";
    if (visualConfidence < 0.4) return "far";
  }

  return null;
}

// 🔹 Response enhancer (safe injection)
export function enhanceResponse({
  baseResponse,
  detectedName,
  distanceInfo,
}) {
  let response = baseResponse || "";

  if (detectedName) {
    response = `Detected: ${detectedName}. ${response}`;
  }

  if (distanceInfo) {
    response = `${response} (Distance: ${distanceInfo})`;
  }

  return response.trim();
}