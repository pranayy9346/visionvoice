import {
  clearHistoryByUser,
  getHistoryByUser,
  getRecentAnalysesByUser,
} from "../../modules/scene/scene.repository.js";
import {
  DEFAULT_PREFERENCES,
  applyAdaptivePreferences,
  completeUserOnboarding,
  getOrCreateProfile,
  syncAuthUser,
  updateProfile,
} from "../../modules/user/userProfile.service.js";
import {
  deletePersonalObjectById,
  listPersonalObjects,
  savePersonalObject,
} from "../../modules/personalObject/personalObject.service.js";
import {
  clearKnownPersons,
  deleteKnownPersonById,
  listKnownPersons,
  saveKnownPerson,
} from "../../modules/knownPerson/knownPerson.service.js";
import { generateSpeechAudioUrl } from "../audio/murf.service.js";
import {
  buildConversationText,
  findLastScene,
  normalizeImageInput,
  resolveSceneAgeSeconds,
} from "./assistant.helpers.js";
import { analyzeWithPersistence } from "./assistant.analysis.service.js";
import { detectIntent, resolveDecision } from "./assistant.decision.service.js";

export function createAssistantService({ maxImageBytes }) {
  function resolvePreferredVoiceId(profile, overrideVoiceId) {
    const override =
      typeof overrideVoiceId === "string" ? overrideVoiceId.trim() : "";
    if (override === "default") {
      return process.env.MURF_VOICE_ID || "en-US-natalie";
    }
    if (override) {
      return override;
    }

    const mode = profile?.preferences?.ttsVoiceMode;
    const customVoiceId =
      typeof profile?.preferences?.ttsCustomVoiceId === "string"
        ? profile.preferences.ttsCustomVoiceId.trim()
        : "";

    if (mode === "custom" && customVoiceId) {
      return customVoiceId;
    }

    return process.env.MURF_VOICE_ID || "en-US-natalie";
  }

  async function analyze({
    userId,
    query,
    image,
    scene,
    useCache,
    recognizedPersonName,
  }) {
    const normalizedQuery =
      query?.trim() || "Please describe what is around me.";
    const profile = await getOrCreateProfile(userId);
    const preferences = applyAdaptivePreferences(
      profile?.preferences,
      normalizedQuery,
    );

    const imageInput = normalizeImageInput(image, maxImageBytes);
    const recent = await getRecentAnalysesByUser(userId, 10);
    const history = buildConversationText(recent);
    const sceneFromMemory = scene || findLastScene(recent);
    const imageAge = resolveSceneAgeSeconds(sceneFromMemory);
    const intent = detectIntent(normalizedQuery);
    const resolvedUseCache = intent === "identity" ? false : useCache;

    const analysis = await analyzeWithPersistence({
      userId,
      normalizedQuery,
      imageInput,
      history,
      sceneFromMemory,
      useCache: resolvedUseCache,
      imageAge,
      preferences,
      recognizedPersonName,
    });

    return {
      ...analysis,
      preferences,
    };
  }

  async function decide({
    userId,
    query,
    imageAge,
    conversationHistory,
    lastScene,
  }) {
    const normalizedQuery = query.trim();
    const recent = await getRecentAnalysesByUser(userId, 10);
    const history =
      conversationHistory?.trim() || buildConversationText(recent);
    const scene = lastScene || findLastScene(recent);

    return resolveDecision({
      query: normalizedQuery,
      imageAge,
      conversationHistory: history,
      scene,
    });
  }

  async function getHistory(userId) {
    return getHistoryByUser(userId, 10);
  }

  async function clearHistory(userId) {
    return clearHistoryByUser(userId);
  }

  async function getProfile(userId) {
    const profile = await getOrCreateProfile(userId);
    return {
      userId,
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

  async function saveProfile(userId, preferences) {
    const profile = await updateProfile(userId, preferences);
    return { userId, preferences: profile.preferences };
  }

  async function getPersonalObjects(userId) {
    return listPersonalObjects(userId);
  }

  async function registerPersonalObject(userId, payload) {
    return savePersonalObject({
      userId,
      name: payload?.name,
      image: payload?.image,
      maxImageBytes,
    });
  }

  async function deletePersonalObject(userId, objectId) {
    return deletePersonalObjectById(userId, objectId);
  }

  async function generateSpeech(text, { userId, voiceId } = {}) {
    const profile = userId ? await getOrCreateProfile(userId) : null;
    const preferredVoiceId = resolvePreferredVoiceId(profile, voiceId);
    return generateSpeechAudioUrl(text, preferredVoiceId);
  }

  async function getKnownPersons(userId) {
    return listKnownPersons(userId);
  }

  async function registerKnownPerson(userId, payload) {
    return saveKnownPerson({
      userId,
      name: payload?.name,
      embeddings: payload?.embeddings,
    });
  }

  async function deleteKnownPerson(userId, personId) {
    return deleteKnownPersonById(userId, personId);
  }

  async function removeAllKnownPersons(userId) {
    return clearKnownPersons(userId);
  }

  return {
    analyze,
    decide,
    getHistory,
    clearHistory,
    getProfile,
    syncUser,
    completeOnboarding,
    saveProfile,
    getPersonalObjects,
    registerPersonalObject,
    deletePersonalObject,
    generateSpeech,
    getKnownPersons,
    registerKnownPerson,
    deleteKnownPerson,
    removeAllKnownPersons,
  };
}
