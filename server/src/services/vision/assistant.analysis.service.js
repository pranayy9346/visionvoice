import {
  analyzeFromCache,
  analyzeFromImage,
  analyzeFromText,
} from "../ai/gemini.service.js";
import { createAnalysisRecord } from "../../modules/scene/scene.repository.js";
import { findBestPersonalObjectMatch } from "../../modules/personalObject/personalObject.service.js";
import { buildPersonalObjectContext } from "./assistant.helpers.js";

function createFallback(error, sceneFromMemory) {
  const isRate = (error?.message || "").includes("RATE_LIMITED");
  return {
    response: isRate
      ? "API rate limit reached. Gemini quota exceeded. Please wait a moment and try again."
      : "Live analysis is temporarily unavailable. Please try again in a moment.",
    confidence: 0.25,
    reason: isRate
      ? "Rate-limited by AI provider."
      : "Live model request failed.",
    source: "fallback",
    scene: sceneFromMemory,
    analysisSource: "fallback",
  };
}

async function runAdaptiveAnalysis({
  normalizedQuery,
  history,
  sceneFromMemory,
  useCache,
  imageAge,
  imageInput,
  preferences,
  userId,
}) {
  if (imageInput.hasImage) {
    const match = await findBestPersonalObjectMatch({
      userId,
      base64Data: imageInput.base64Data,
      mimeType: imageInput.mimeType,
    });

    const result = await analyzeFromImage({
      base64Data: imageInput.base64Data,
      mimeType: imageInput.mimeType,
      query: normalizedQuery,
      history,
      preferences,
      personalObjectContext: buildPersonalObjectContext(match),
    });

    return {
      ...result,
      source: "image",
      scene: { ...result.scene, timestamp: new Date() },
      personalObject: match,
      analysisSource: "gemini",
    };
  }

  if (useCache === true && sceneFromMemory) {
    return {
      ...analyzeFromCache({
        query: normalizedQuery,
        scene: sceneFromMemory,
        imageAge,
        preferences,
      }),
      source: "cache",
      scene: sceneFromMemory,
      personalObject: null,
      analysisSource: "gemini",
    };
  }

  const result = await analyzeFromText({
    query: normalizedQuery,
    history,
    preferences,
  });

  return {
    ...result,
    source: "text",
    scene: sceneFromMemory,
    personalObject: null,
    analysisSource: "gemini",
  };
}

export async function analyzeWithPersistence({
  userId,
  normalizedQuery,
  imageInput,
  history,
  sceneFromMemory,
  useCache,
  imageAge,
  preferences,
}) {
  let output;
  try {
    output = await runAdaptiveAnalysis({
      normalizedQuery,
      history,
      sceneFromMemory,
      useCache,
      imageAge,
      imageInput,
      preferences,
      userId,
    });
  } catch (error) {
    output = createFallback(error, sceneFromMemory);
  }

  const saved = await createAnalysisRecord({
    userId,
    imageUrl: imageInput.hasImage ? imageInput.originalImage : null,
    query: normalizedQuery,
    description: output.response,
    confidence: output.confidence,
    reason: output.reason,
    source: output.source,
    scene: output.scene,
  });

  return {
    query: saved.query,
    response: saved.description,
    description: saved.description,
    imageUrl: saved.imageUrl,
    scene: saved.scene,
    usedImage: imageInput.hasImage,
    source: saved.source,
    confidence: saved.confidence,
    reason: saved.reason,
    personalObject: output.personalObject || null,
    analysisSource: output.analysisSource,
  };
}
