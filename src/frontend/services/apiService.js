const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const USER_ID_STORAGE_KEY = "visionvoice-user-id";

export const DEFAULT_PREFERENCES = {
  responseStyle: "short",
  languageLevel: "simple",
  safetySensitivity: "high",
  voiceSpeed: "normal",
};

const DEFAULT_TIMEOUT_MS = 20000;

function createTimeoutSignal(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

export function getUserId() {
  if (typeof window === "undefined") {
    return "demo-user";
  }

  const existing = window.localStorage.getItem(USER_ID_STORAGE_KEY);
  if (existing && existing.trim()) {
    return existing.trim();
  }

  const generated = `user-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(USER_ID_STORAGE_KEY, generated);
  return generated;
}

export async function analyzeImage(
  base64,
  query,
  { signal, timeoutMs, useCache, scene } = {},
) {
  if (!query || typeof query !== "string") {
    throw new Error("A valid speech query is required.");
  }

  if (base64 && typeof base64 !== "string") {
    throw new Error("Image must be a valid base64 string or null.");
  }

  const timeout = signal ? null : createTimeoutSignal(timeoutMs);

  try {
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
      throw new Error(payload?.error || "Failed to analyze image.");
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Analysis request timed out. Please try again.");
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to reach backend API. Start server with 'npm run dev:server' and retry.",
      );
    }

    throw new Error(error?.message || "Failed to analyze image.");
  } finally {
    timeout?.clear();
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

export async function getUserProfile({ signal, timeoutMs } = {}) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 10000);
  const userId = getUserId();

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to load profile.");
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

export async function shouldCaptureImage(query, imageAge = 0, options = {}) {
  const decision = await getDecision(query, { ...options, imageAge });
  return {
    needNewImage: decision?.needNewImage !== false,
    useCache: decision?.useCache === true,
    confidence:
      typeof decision?.confidence === "number" ? decision.confidence : 0.5,
    reason: typeof decision?.reason === "string" ? decision.reason : "",
  };
}

export async function listPersonalObjects({ signal, timeoutMs } = {}) {
  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 10000);
  const userId = getUserId();

  try {
    const response = await fetch(`${API_BASE_URL}/api/objects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to load personal objects.");
    }

    return Array.isArray(payload?.items) ? payload.items : [];
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Personal object request timed out.");
    }
    throw new Error(error?.message || "Failed to load personal objects.");
  } finally {
    timeout?.clear();
  }
}

export async function savePersonalObject(
  name,
  image,
  { signal, timeoutMs } = {},
) {
  if (!name || typeof name !== "string") {
    throw new Error("A valid personal object name is required.");
  }
  if (!image || typeof image !== "string") {
    throw new Error("A valid base64 image is required.");
  }

  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 30000);
  const userId = getUserId();

  try {
    const response = await fetch(`${API_BASE_URL}/api/add-object`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ name: name.trim(), image }),
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to save personal object.");
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Personal object upload timed out.");
    }
    throw new Error(error?.message || "Failed to save personal object.");
  } finally {
    timeout?.clear();
  }
}

export async function deletePersonalObject(
  objectId,
  { signal, timeoutMs } = {},
) {
  if (!objectId || typeof objectId !== "string") {
    throw new Error("A valid object id is required.");
  }

  const timeout = signal ? null : createTimeoutSignal(timeoutMs || 15000);
  const userId = getUserId();

  try {
    const response = await fetch(`${API_BASE_URL}/api/objects/${objectId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      signal: signal || timeout.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to delete personal object.");
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Delete request timed out.");
    }
    throw new Error(error?.message || "Failed to delete personal object.");
  } finally {
    timeout?.clear();
  }
}
