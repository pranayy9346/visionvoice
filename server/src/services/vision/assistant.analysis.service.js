import {
  analyzeFromCache,
  analyzeFromImage,
  analyzeFromText,
} from "../ai/gemini.service.js";
import { createAnalysisRecord } from "../../modules/scene/scene.repository.js";
import { findBestPersonalObjectMatch } from "../../modules/personalObject/personalObject.service.js";
import {
  buildPersonalObjectContext,
  buildRecognizedPersonContext,
  combineRecognitionContext,
} from "./assistant.helpers.js";

function createFallback(error, sceneFromMemory) {
  const isRate = (error?.message || "").includes("RATE_LIMITED");
  return {
    response:
      "Live analysis is temporarily unavailable. Please try again in a moment.",
    confidence: 0.25,
    reason: isRate
      ? "Live model rate limit reached."
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
  recognizedPersonName,
}) {
  if (imageInput.hasImage) {
    let match = null;
    try {
      match = await findBestPersonalObjectMatch({
        userId,
        base64Data: imageInput.base64Data,
        mimeType: imageInput.mimeType,
      });
    } catch (error) {
      console.warn(
        "Personal object matching unavailable; continuing without match:",
        error?.message || error,
      );
    }

    const recognitionContext = combineRecognitionContext(
      buildPersonalObjectContext(match),
      buildRecognizedPersonContext(recognizedPersonName),
    );

    try {
      const result = await analyzeFromImage({
        base64Data: imageInput.base64Data,
        mimeType: imageInput.mimeType,
        query: normalizedQuery,
        history,
        preferences,
        recognitionContext,
      });

      return {
        ...result,
        source: "image",
        scene: { ...result.scene, timestamp: new Date() },
        personalObject: match,
        analysisSource: "gemini",
      };
    } catch (error) {
      console.warn(
        "Image analysis unavailable; falling back to text reasoning:",
        error?.message || error,
      );
      const textFallback = await analyzeFromText({
        query: normalizedQuery,
        history,
        preferences,
      });

      return {
        ...textFallback,
        source: "text",
        scene: sceneFromMemory,
        personalObject: match,
        analysisSource: "gemini",
        reason:
          textFallback.reason ||
          "Image analysis unavailable; used text reasoning instead.",
      };
    }
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
  recognizedPersonName,
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
      recognizedPersonName,
    });
  } catch (error) {
    console.error(
      "Adaptive analysis failed; using fallback response:",
      error?.message || error,
    );
    output = createFallback(error, sceneFromMemory);
  }

  const usedImage = output?.source === "image";

  const saved = await createAnalysisRecord({
    userId,
    imageUrl: usedImage ? imageInput.originalImage : null,
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
    usedImage,
    source: saved.source,
    confidence: saved.confidence,
    reason: saved.reason,
    personalObject: output.personalObject || null,
    analysisSource: output.analysisSource,
  };
}
