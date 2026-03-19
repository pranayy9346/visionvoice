import { DEFAULT_PREFERENCES } from "../../modules/user/userProfile.service.js";

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function normalizeDescription(text) {
  return (text || "").replace(/\s+/g, " ").trim() || "No description.";
}

export function normalizePreferences(pref) {
  const p = pref || {};

  return {
    responseStyle: p.responseStyle === "detailed" ? "detailed" : DEFAULT_PREFERENCES.responseStyle,
    languageLevel: p.languageLevel === "moderate" ? "moderate" : DEFAULT_PREFERENCES.languageLevel,
    safetySensitivity: p.safetySensitivity === "high" ? "high" : DEFAULT_PREFERENCES.safetySensitivity,
    voiceSpeed: ["slow", "normal", "fast"].includes(p.voiceSpeed)
      ? p.voiceSpeed
      : DEFAULT_PREFERENCES.voiceSpeed,
  };
}

export function normalizeScene(scene) {
  return {
    objects: scene?.objects || [],
    positions: scene?.positions || [],
    hazards: scene?.hazards || [],
    text: scene?.text || [],
    summary: scene?.summary || "",
  };
}

export function parseJsonResponse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON");
    return JSON.parse(match[0]);
  }
}