import {
  DEFAULT_PREFERENCES,
  USER_ID_FALLBACK,
  completeUserOnboarding,
  getOrCreateProfile,
  resolveUserId,
  syncAuthUser,
  updateProfile,
} from "../modules/user/userProfile.service.js";

export function createUserService() {
  async function getProfile(userId) {
    const profile = await getOrCreateProfile(userId);
    return {
      userId: profile?.userId || userId,
      name: profile?.name || "",
      email: profile?.email || "",
      useCase: profile?.useCase || "",
      onboarded: profile?.onboarded === true,
      preferences: { ...DEFAULT_PREFERENCES, ...(profile?.preferences || {}) },
    };
  }

  async function saveProfile(userId, preferences) {
    const profile = await updateProfile(userId, preferences);
    return {
      userId: profile?.userId || userId,
      name: profile?.name || "",
      email: profile?.email || "",
      useCase: profile?.useCase || "",
      onboarded: profile?.onboarded === true,
      preferences: { ...DEFAULT_PREFERENCES, ...(profile?.preferences || {}) },
    };
  }

  async function syncUser({ userId, email, name }) {
    const profile = await syncAuthUser({ userId, email, name });
    return {
      userId: profile.userId,
      name: profile?.name || "",
      email: profile?.email || "",
      useCase: profile?.useCase || "",
      onboarded: profile?.onboarded === true,
      preferences: { ...DEFAULT_PREFERENCES, ...(profile?.preferences || {}) },
    };
  }

  async function completeOnboarding({ userId, name, useCase, email }) {
    const profile = await completeUserOnboarding({
      userId,
      name,
      useCase,
      email,
    });
    return {
      userId: profile.userId,
      name: profile?.name || "",
      email: profile?.email || "",
      useCase: profile?.useCase || "",
      onboarded: profile?.onboarded === true,
      preferences: { ...DEFAULT_PREFERENCES, ...(profile?.preferences || {}) },
    };
  }

  return {
    getProfile,
    saveProfile,
    syncUser,
    completeOnboarding,
    resolveUserId,
    USER_ID_FALLBACK,
  };
}
