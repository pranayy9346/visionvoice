import UserProfile from "./userProfile.model.js";

export const DEFAULT_PREFERENCES = {
  responseStyle: "short",
  languageLevel: "simple",
  safetySensitivity: "high",
  voiceSpeed: "normal",
};

export const USER_ID_FALLBACK = "demo-user";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

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
  const normalizedUserId = normalizeText(userId) || USER_ID_FALLBACK;

  return UserProfile.findOneAndUpdate(
    { userId: normalizedUserId },
    {
      $setOnInsert: {
        userId: normalizedUserId,
        name: "",
        email: "",
        useCase: "",
        onboarded: false,
        preferences: DEFAULT_PREFERENCES,
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
}

export async function updateProfile(userId, incomingPreferences) {
  const normalizedUserId = normalizeText(userId) || USER_ID_FALLBACK;
  const preferences = {
    ...DEFAULT_PREFERENCES,
    ...(incomingPreferences || {}),
  };

  return UserProfile.findOneAndUpdate(
    { userId: normalizedUserId },
    { $set: { preferences, updatedAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
}

export async function syncAuthUser({ userId, email, name }) {
  const normalizedUserId = normalizeText(userId);
  if (!normalizedUserId) {
    throw new Error("Authenticated userId is required.");
  }

  const normalizedEmail = normalizeText(email);
  const normalizedName = normalizeText(name);

  return UserProfile.findOneAndUpdate(
    { userId: normalizedUserId },
    {
      $setOnInsert: {
        userId: normalizedUserId,
        preferences: DEFAULT_PREFERENCES,
        onboarded: false,
        useCase: "",
      },
      $set: {
        updatedAt: new Date(),
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
        ...(normalizedName ? { name: normalizedName } : {}),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
}

export async function completeUserOnboarding({ userId, name, useCase, email }) {
  const normalizedUserId = normalizeText(userId);
  if (!normalizedUserId) {
    throw new Error("Authenticated userId is required.");
  }

  const normalizedName = normalizeText(name);
  const normalizedUseCase = normalizeText(useCase);
  const normalizedEmail = normalizeText(email);

  if (!normalizedName) {
    throw new Error("Name is required for onboarding.");
  }

  if (!normalizedUseCase) {
    throw new Error("Use case is required for onboarding.");
  }

  return UserProfile.findOneAndUpdate(
    { userId: normalizedUserId },
    {
      $setOnInsert: {
        userId: normalizedUserId,
        preferences: DEFAULT_PREFERENCES,
      },
      $set: {
        name: normalizedName,
        useCase: normalizedUseCase,
        onboarded: true,
        updatedAt: new Date(),
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
}
