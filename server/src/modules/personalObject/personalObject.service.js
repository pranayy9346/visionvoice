import { parseBase64Image } from "../../utils/image.js";
import {
  embedText,
  extractImageSignature,
} from "../../services/ai/gemini.service.js";
import PersonalObject from "./personalObject.model.js";

const MATCH_THRESHOLD = 0.8;
const FALLBACK_EMBEDDING_SIZE = 64;

function normalizeVector(values) {
  if (!Array.isArray(values)) return [];
  return values.map((value) => Number(value) || 0);
}

function cosineSimilarity(first, second) {
  const length = Math.min(first.length, second.length);
  if (length === 0) return 0;

  let dot = 0;
  let firstNorm = 0;
  let secondNorm = 0;

  for (let index = 0; index < length; index += 1) {
    const a = Number(first[index]) || 0;
    const b = Number(second[index]) || 0;
    dot += a * b;
    firstNorm += a * a;
    secondNorm += b * b;
  }

  if (!firstNorm || !secondNorm) return 0;
  return dot / (Math.sqrt(firstNorm) * Math.sqrt(secondNorm));
}

function normalizeName(name) {
  return (name || "").trim().toLowerCase();
}

function isRateLimitedError(error) {
  const message = (error?.message || "").toUpperCase();
  return message.includes("RATE_LIMITED") || message.includes("QUOTA");
}

function buildFallbackSignature(name) {
  return `Personal object identified as ${name}.`;
}

function buildFallbackEmbedding(text) {
  const vector = Array.from({ length: FALLBACK_EMBEDDING_SIZE }, () => 0);
  const normalizedText = (text || "").trim().toLowerCase();

  for (const char of normalizedText) {
    const code = char.charCodeAt(0);
    const index = code % FALLBACK_EMBEDDING_SIZE;
    vector[index] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!norm) return vector;

  return vector.map((value) => Number((value / norm).toFixed(6)));
}

export async function savePersonalObject({
  userId,
  name,
  image,
  maxImageBytes,
}) {
  const normalizedName = normalizeName(name);
  if (!normalizedName) {
    throw new Error("Personal object name is required.");
  }

  const { base64Data, mimeType } = parseBase64Image(image, {
    maxBytes: maxImageBytes,
  });
  let signature = "";
  let embedding = [];
  let warning = "";

  try {
    signature = await extractImageSignature({
      base64Data,
      mimeType,
      label: normalizedName,
    });
    embedding = await embedText(signature);
  } catch (error) {
    if (!isRateLimitedError(error)) {
      throw error;
    }

    signature = buildFallbackSignature(normalizedName);
    embedding = buildFallbackEmbedding(signature);
    warning =
      "Saved with limited AI due to temporary Gemini quota limits. Try again later for stronger recognition quality.";
  }

  const saved = await PersonalObject.findOneAndUpdate(
    { userId, name: normalizedName },
    {
      $set: {
        signature,
        embedding: normalizeVector(embedding),
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userId,
        name: normalizedName,
        createdAt: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    id: String(saved._id),
    name: saved.name,
    signature: saved.signature,
    updatedAt: saved.updatedAt,
    warning,
  };
}

export async function listPersonalObjects(userId) {
  const items = await PersonalObject.find({ userId })
    .sort({ updatedAt: -1 })
    .select({ _id: 1, name: 1, signature: 1, updatedAt: 1 })
    .lean();

  return items.map((item) => ({
    id: String(item._id),
    name: item.name,
    signature: item.signature,
    updatedAt: item.updatedAt,
  }));
}

export async function findBestPersonalObjectMatch({
  userId,
  base64Data,
  mimeType,
  threshold = MATCH_THRESHOLD,
}) {
  const items = await PersonalObject.find({ userId }).lean();
  if (!items.length) return null;

  const currentSignature = await extractImageSignature({
    base64Data,
    mimeType,
  });
  const currentEmbedding = await embedText(currentSignature);

  let best = null;
  for (const item of items) {
    const score = cosineSimilarity(currentEmbedding, item.embedding || []);
    if (!best || score > best.score) {
      best = { item, score };
    }
  }

  if (!best || best.score < threshold) {
    return null;
  }

  return {
    name: best.item.name,
    signature: best.item.signature,
    similarity: Number(best.score.toFixed(3)),
    sceneSignature: currentSignature,
  };
}

export async function deletePersonalObjectById(userId, objectId) {
  const normalizedId = (objectId || "").trim();
  if (!normalizedId) {
    throw new Error("Object id is required.");
  }

  const deleted = await PersonalObject.findOneAndDelete({
    _id: normalizedId,
    userId,
  }).lean();

  if (!deleted) {
    throw new Error("Personal object not found.");
  }

  return {
    id: String(deleted._id),
    name: deleted.name,
  };
}
