import { analyzeFromImage } from "../ai/gemini.service.js";
import { createAnalysisRecord } from "../../modules/scene/scene.repository.js";
import { findBestPersonalObjectMatch } from "../../modules/personalObject/personalObject.service.js";
import {
  buildPersonalObjectContext,
  buildRecognizedPersonContext,
  combineRecognitionContext,
} from "./assistant.helpers.js";

function createFallback(error) {
  const isRate = (error?.message || "").includes("RATE_LIMITED");
  return {
    response: "Live analysis is temporarily unavailable. Please try again.",
    confidence: 0.25,
    reason: isRate
      ? "Live model rate limit reached."
      : "Live model request failed.",
    source: "fallback",
    scene: null,
    analysisSource: "fallback",
  };
}

async function runAdaptiveAnalysis({
  normalizedQuery,
  history,
  imageInput,
  preferences,
  userId,
  recognizedPersonName,
  intent,
}) {
  if (!imageInput.hasImage) {
    throw new Error("Live analysis requires a fresh image.");
  }

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

  const result = await analyzeFromImage({
    base64Data: imageInput.base64Data,
    mimeType: imageInput.mimeType,
    query: normalizedQuery,
    history,
    preferences,
    recognitionContext,
    distanceInfo: intent === "identity" ? "identity-query" : "",
  });

  return {
    ...result,
    source: "image",
    scene: { ...result.scene, timestamp: new Date() },
    personalObject: match,
    analysisSource: "gemini",
  };
}

export async function analyzeWithPersistence({
  userId,
  normalizedQuery,
  imageInput,
  history,
  preferences,
  recognizedPersonName,
  intent,
}) {
  let output;
  try {
    output = await runAdaptiveAnalysis({
      normalizedQuery,
      history,
      imageInput,
      preferences,
      userId,
      recognizedPersonName,
      intent,
    });
  } catch (error) {
    console.error(
      "Adaptive analysis failed; using fallback response:",
      error?.message || error,
    );
    output = createFallback(error);
  }

  const safeResponse =
    typeof output?.response === "string" && output.response.trim()
      ? output.response.trim()
      : "I could not generate a response.";
  const safeReason =
    typeof output?.reason === "string" && output.reason.trim()
      ? output.reason.trim()
      : "No reasoning available.";
  const safeConfidence =
    typeof output?.confidence === "number"
      ? output.confidence
      : output?.analysisSource === "gemini"
        ? 0.65
        : 0.25;

  const usedImage = output?.source === "image";

  const saved = await createAnalysisRecord({
    userId,
    imageUrl: usedImage ? imageInput.originalImage : null,
    query: normalizedQuery,
    description: safeResponse,
    confidence: safeConfidence,
    reason: safeReason,
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
