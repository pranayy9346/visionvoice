const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://visionvoice-l9ki.onrender.com";
const USER_ID_STORAGE_KEY = "visionvoice-user-id";
const DEMO_USER_ID = "demo-user";
let activeUserId = "";

export const DEFAULT_PREFERENCES = {
  responseStyle: "short",
  languageLevel: "simple",
  safetySensitivity: "high",
  voiceSpeed: "normal",
};

const DEFAULT_TIMEOUT_MS = 45000;

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createTimeoutSignal(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

export function setActiveUserId(userId) {
  activeUserId = typeof userId === "string" ? userId.trim() : "";

  if (typeof window !== "undefined") {
    if (activeUserId) {
      window.localStorage.setItem(USER_ID_STORAGE_KEY, activeUserId);
    } else {
      window.localStorage.removeItem(USER_ID_STORAGE_KEY);
    }
  }
}

export function getUserId() {
  if (activeUserId) {
    return activeUserId;
  }

  if (typeof window === "undefined") {
    return DEMO_USER_ID;
  }

  const existing = window.localStorage.getItem(USER_ID_STORAGE_KEY);
  if (existing && existing.trim()) {
    return existing.trim();
  }

  window.localStorage.setItem(USER_ID_STORAGE_KEY, DEMO_USER_ID);
  return DEMO_USER_ID;
}

export async function syncAuthenticatedUser(
  { userId, email, name },
  { signal, timeoutMs } = {},
) {
  if (!userId || typeof userId !== "string") {
    throw new Error("A valid authenticated userId is required.");
  }

  setActiveUserId(userId);
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId.trim(),
        email: typeof email === "string" ? email.trim() : "",
        name: typeof name === "string" ? name.trim() : "",
      }),
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to sync authenticated user.");
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("User sync request timed out.");
    }
    if (error instanceof TypeError) {
      throw new Error("Unable to reach backend API.");
    }
    throw new Error(error?.message || "Failed to sync authenticated user.");
  } finally {
    timeout?.clear();
  }
}

export async function completeOnboarding(
  { userId, name, useCase, email },
  { signal, timeoutMs } = {},
) {
  if (!userId || typeof userId !== "string") {
    throw new Error("A valid authenticated userId is required.");
  }
  if (!name || typeof name !== "string") {
    throw new Error("Name is required for onboarding.");
  }
  if (!useCase || typeof useCase !== "string") {
    throw new Error("Use case is required for onboarding.");
  }

  setActiveUserId(userId);
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId.trim(),
        name: name.trim(),
        useCase: useCase.trim(),
        email: typeof email === "string" ? email.trim() : "",
      }),
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to complete onboarding.");
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Onboarding request timed out.");
    }
    if (error instanceof TypeError) {
      throw new Error("Unable to reach backend API.");
    }
    throw new Error(error?.message || "Failed to complete onboarding.");
  } finally {
    timeout?.clear();
  }
}

export async function analyzeImage(
  base64,
  query,
  { signal, timeoutMs, useCache, scene, recognizedPersonName } = {},
) {
  if (!query || typeof query !== "string") {
    throw new Error("A valid speech query is required.");
  }
  if (base64 && typeof base64 !== "string") {
    throw new Error("Image must be a valid base64 string or null.");
  }

  const body = { query: query.trim(), userId: getUserId() };
  if (base64) {
    body.image = base64;
  }
  if (typeof useCache === "boolean") {
    body.useCache = useCache;
  }
  if (scene && typeof scene === "object") {
    body.scene = scene;
  }
  if (typeof recognizedPersonName === "string" && recognizedPersonName.trim()) {
    body.recognizedPersonName = recognizedPersonName.trim();
  }

  const runAnalyze = async () => {
    const timeout = signal ? null : createTimeoutSignal(timeoutMs);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: signal || timeout.signal,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload?.error || "Failed to analyze image.";
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }

      return payload;
    } finally {
      timeout?.clear();
    }
  };

  try {
    return await runAnalyze();
  } catch (error) {
    const isAbort = error?.name === "AbortError";
    const isNetwork = error instanceof TypeError;
    const isRetryableStatus =
      typeof error?.status === "number" && error.status >= 500;

    if (!isAbort && (isNetwork || isRetryableStatus)) {
      await delay(600);
      return runAnalyze();
    }

    if (error?.name === "AbortError") {
      throw new Error("Analysis request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("Unable to reach backend API.");
    }
    throw new Error(error?.message || "Failed to analyze image.");
  }
}

export async function getDecision(
  query,
  { imageAge = 0, conversationHistory, lastScene, signal, timeoutMs } = {},
) {
  if (!query || typeof query !== "string") {
    throw new Error("A valid query is required.");
  }

  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 10000);

  try {
    const body = { query: query.trim(), imageAge, userId: getUserId() };
    if (conversationHistory) {
      body.conversationHistory = conversationHistory;
    }
    if (lastScene && typeof lastScene === "object") {
      body.lastScene = lastScene;
    }

    const response = await fetch(`${API_BASE_URL}/api/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to determine capture need.");
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Decision request timed out.");
    }
    if (error instanceof TypeError) {
      throw new Error("Unable to reach backend API.");
    }
    throw new Error(error?.message || "Failed to determine capture need.");
  } finally {
    timeout?.clear();
  }
}

export async function getInteractionHistory({ signal, timeoutMs } = {}) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 12000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
      },
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to load interaction history.");
    }

    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("History request timed out.");
    }
    throw new Error(error?.message || "Failed to load interaction history.");
  } finally {
    timeout?.clear();
  }
}

export async function clearInteractionHistory({ signal, timeoutMs } = {}) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 12000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/history`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
      },
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to clear interaction history.");
    }

    return payload?.deletedCount || 0;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Clear history request timed out.");
    }
    throw new Error(error?.message || "Failed to clear interaction history.");
  } finally {
    timeout?.clear();
  }
}

export async function getUserProfile({ userId, signal, timeoutMs } = {}) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 10000);
  const resolvedUserId =
    typeof userId === "string" && userId.trim() ? userId.trim() : getUserId();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/${resolvedUserId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: signal || timeout.signal,
      },
    );

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to load profile.");
    }

    return {
      userId: resolvedUserId,
      name: payload?.name || "",
      email: payload?.email || "",
      useCase: payload?.useCase || "",
      onboarded: payload?.onboarded === true,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(payload?.preferences || {}),
      },
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Profile request timed out.");
    }
    throw new Error(error?.message || "Failed to load profile.");
  } finally {
    timeout?.clear();
  }
}

export async function updateUserProfile(
  preferences,
  { signal, timeoutMs } = {},
) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 10000);
  const userId = getUserId();

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...(preferences || {}),
        },
      }),
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to update profile.");
    }

    return {
      userId,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(payload?.preferences || {}),
      },
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Profile update timed out.");
    }
    throw new Error(error?.message || "Failed to update profile.");
  } finally {
    timeout?.clear();
  }
}

export async function listKnownPersons({ signal, timeoutMs } = {}) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 12000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/known-persons`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
      },
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to load known persons.");
    }

    return Array.isArray(payload?.items) ? payload.items : [];
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Known persons request timed out.");
    }
    throw new Error(error?.message || "Failed to load known persons.");
  } finally {
    timeout?.clear();
  }
}

export async function saveKnownPerson(
  { name, embeddings },
  { signal, timeoutMs } = {},
) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 20000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/known-persons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: getUserId(),
        name,
        embeddings,
      }),
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to save known person.");
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Save known person request timed out.");
    }
    throw new Error(error?.message || "Failed to save known person.");
  } finally {
    timeout?.clear();
  }
}

export async function deleteKnownPerson(personId, { signal, timeoutMs } = {}) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 12000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/known-persons/${personId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": getUserId(),
        },
        signal: signal || timeout.signal,
      },
    );

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to delete known person.");
    }

    return payload?.deleted || null;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Delete known person request timed out.");
    }
    throw new Error(error?.message || "Failed to delete known person.");
  } finally {
    timeout?.clear();
  }
}

export async function clearKnownPersons({ signal, timeoutMs } = {}) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 12000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/known-persons`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
      },
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to clear known persons.");
    }

    return payload?.deletedCount || 0;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Clear known persons request timed out.");
    }
    throw new Error(error?.message || "Failed to clear known persons.");
  } finally {
    timeout?.clear();
  }
}
