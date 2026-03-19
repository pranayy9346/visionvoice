import { DEFAULT_PREFERENCES } from "../../modules/user/userProfile.service.js";

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeDescription(value) {
  const text = (value || "").replace(/\s+/g, " ").trim();
  if (!text) return "No scene description was generated.";

  return text
    .replace(
      /^here(?:'s| is)\s+(?:a\s+)?(?:brief\s+)?description\s*[:\-]?\s*/i,
      "",
    )
    .replace(/^description\s*[:\-]?\s*/i, "")
    .replace(/^output\s*[:\-]?\s*/i, "")
    .trim();
}

export function normalizePreferences(preferences) {
  const candidate =
    preferences && typeof preferences === "object" ? preferences : {};

  return {
    responseStyle:
      candidate.responseStyle === "detailed"
        ? "detailed"
        : DEFAULT_PREFERENCES.responseStyle,
    languageLevel:
      candidate.languageLevel === "moderate"
        ? "moderate"
        : DEFAULT_PREFERENCES.languageLevel,
    safetySensitivity:
      candidate.safetySensitivity === "normal"
        ? "normal"
        : DEFAULT_PREFERENCES.safetySensitivity,
    voiceSpeed: ["slow", "normal", "fast"].includes(candidate.voiceSpeed)
      ? candidate.voiceSpeed
      : DEFAULT_PREFERENCES.voiceSpeed,
  };
}

export function normalizeScene(scene) {
  const normalized = scene && typeof scene === "object" ? scene : {};
  return {
    objects: Array.isArray(normalized.objects)
      ? normalized.objects.map(String).filter(Boolean).slice(0, 20)
      : [],
    positions: Array.isArray(normalized.positions)
      ? normalized.positions.map(String).filter(Boolean).slice(0, 20)
      : [],
    hazards: Array.isArray(normalized.hazards)
      ? normalized.hazards.map(String).filter(Boolean).slice(0, 15)
      : [],
    text: Array.isArray(normalized.text)
      ? normalized.text.map(String).filter(Boolean).slice(0, 15)
      : [],
    summary:
      typeof normalized.summary === "string" ? normalized.summary.trim() : "",
  };
}

export function parseJsonResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Model did not return text content.");
  }

  const trimmed = rawText
    .replace(/^```json\n?/i, "")
    .replace(/^```\n?/i, "")
    .replace(/\n?```$/, "")
    .trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Gemini can prepend commentary; recover by extracting the first JSON object.
    const start = trimmed.indexOf("{");
    if (start < 0) {
      throw new Error("Model response did not include JSON content.");
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < trimmed.length; index += 1) {
      const char = trimmed[index];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) {
        continue;
      }

      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          const candidate = trimmed.slice(start, index + 1);
          return JSON.parse(candidate);
        }
      }
    }

    throw new Error("Model JSON response was incomplete.");
  }
}
