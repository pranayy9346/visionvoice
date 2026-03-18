import UserProfile from "./userProfile.model.js";

export const DEFAULT_PREFERENCES = {
  responseStyle: "short",
  languageLevel: "simple",
  safetySensitivity: "high",
  voiceSpeed: "normal",
};

export const USER_ID_FALLBACK = "demo-user";

export function resolveUserId(request) {
  const fromBody = request?.body?.userId;
  const fromHeader = request?.get?.("x-user-id");

  if (typeof fromBody === "string" && fromBody.trim()) {
    return fromBody.trim();
  }

  if (typeof fromHeader === "string" && fromHeader.trim()) {
    return fromHeader.trim();
  }

  return USER_ID_FALLBACK;
}

export function applyAdaptivePreferences(preferences, query) {
  const base = { ...DEFAULT_PREFERENCES, ...(preferences || {}) };
  const isFollowUp =
    /\b(it|that|those|again|same|previous|before|still|what about|and now)\b/i.test(
      query || "",
    );

  if (base.responseStyle === "short" && isFollowUp) {
    return { ...base, responseStyle: "detailed" };
  }

  return base;
}

export async function getOrCreateProfile(userId) {
  return UserProfile.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        preferences: DEFAULT_PREFERENCES,
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
}

export async function updateProfile(userId, incomingPreferences) {
  const preferences = {
    ...DEFAULT_PREFERENCES,
    ...(incomingPreferences || {}),
  };

  return UserProfile.findOneAndUpdate(
    { userId },
    { $set: { preferences, updatedAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
}
