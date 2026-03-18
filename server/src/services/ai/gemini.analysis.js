import { parseBase64Image } from "../../utils/image.js";
import { callGeminiGenerate } from "./gemini.client.js";
import {
  clamp,
  normalizeDescription,
  normalizePreferences,
  normalizeScene,
  parseJsonResponse,
} from "./gemini.normalizers.js";
import {
  buildImagePrompt,
  buildImageSignaturePrompt,
  buildTextPrompt,
} from "./gemini.prompts.js";

function buildInlineImagePart({ base64Image, base64Data, mimeType }) {
  let resolvedMimeType = mimeType;
  let resolvedBase64Data = base64Data;

  if ((!resolvedBase64Data || !resolvedMimeType) && base64Image) {
    const parsed = parseBase64Image(base64Image);
    resolvedMimeType = parsed.mimeType;
    resolvedBase64Data = parsed.base64Data;
  }

  if (!resolvedBase64Data || !resolvedMimeType) {
    throw new Error("Base64 image payload is missing or invalid.");
  }

  return {
    inlineData: { mimeType: resolvedMimeType, data: resolvedBase64Data },
  };
}

export async function analyzeFromImage({
  base64Image,
  base64Data,
  mimeType,
  query,
  history,
  preferences,
  personalObjectContext,
}) {
  const model =
    process.env.GEMINI_MODEL_VISION ||
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash";
  const prompt = buildImagePrompt({
    query,
    history,
    preferences,
    personalObjectContext,
  });

  const raw = await callGeminiGenerate({
    model,
    parts: [
      { text: prompt },
      buildInlineImagePart({ base64Image, base64Data, mimeType }),
    ],
  });

  const parsed = parseJsonResponse(raw);
  return {
    response: normalizeDescription(parsed?.response || ""),
    confidence: clamp(Number(parsed?.confidence) || 0.85, 0, 1),
    reason: parsed?.reason?.trim() || "Used fresh visual analysis.",
    scene: normalizeScene(parsed?.scene),
  };
}

export async function analyzeFromText({ query, history, preferences }) {
  const model =
    process.env.GEMINI_MODEL_TEXT ||
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash";
  const prompt = buildTextPrompt({ query, history, preferences });

  const raw = await callGeminiGenerate({ model, parts: [{ text: prompt }] });
  const parsed = parseJsonResponse(raw);

  return {
    response: normalizeDescription(parsed?.response || ""),
    confidence: clamp(Number(parsed?.confidence) || 0.65, 0, 1),
    reason: parsed?.reason?.trim() || "Used text reasoning without new image.",
  };
}

export function analyzeFromCache({ scene, imageAge, preferences }) {
  const cache = normalizeScene(scene);
  const ageMinutes = Math.max(0, Math.round((Number(imageAge) || 0) / 60));
  const pref = normalizePreferences(preferences);

  const segments = [
    `Based on your last known scene: ${cache.summary || "No scene summary available."}`,
  ];
  if (cache.hazards.length)
    segments.push(`Potential hazards: ${cache.hazards.join(", ")}.`);
  if (cache.text.length)
    segments.push(`Visible text: ${cache.text.join(", ")}.`);
  if (cache.objects.length)
    segments.push(`Key objects: ${cache.objects.slice(0, 5).join(", ")}.`);
  if (pref.safetySensitivity === "high" && cache.hazards.length) {
    segments.unshift(`Safety first: ${cache.hazards.join(", ")}.`);
  }
  if (pref.responseStyle === "short") segments.splice(3);

  return {
    response: normalizeDescription(segments.join(" ")),
    confidence: Number(clamp(0.82 - ageMinutes * 0.03, 0.25, 0.82).toFixed(2)),
    reason: `Used memory cache from ${ageMinutes} minute(s) ago to reduce cost and latency.`,
  };
}

export async function extractImageSignature({
  base64Image,
  base64Data,
  mimeType,
  label,
}) {
  const model =
    process.env.GEMINI_MODEL_VISION ||
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash";
  const prompt = buildImageSignaturePrompt(label);

  const raw = await callGeminiGenerate({
    model,
    parts: [
      { text: prompt },
      buildInlineImagePart({ base64Image, base64Data, mimeType }),
    ],
  });

  const parsed = parseJsonResponse(raw);
  const signature = normalizeDescription(
    parsed?.signature || parsed?.response || "",
  );
  if (!signature || signature === "No scene description was generated.") {
    throw new Error("Unable to generate visual signature for personal object.");
  }
  return signature;
}
