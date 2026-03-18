const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DEFAULT_TIMEOUT_MS = 20000;

function createTimeoutSignal(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

export async function analyzeImage(base64, { signal, timeoutMs } = {}) {
  if (!base64 || typeof base64 !== "string") {
    throw new Error("A valid base64 image is required.");
  }

  const timeout = signal ? null : createTimeoutSignal(timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64 }),
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

export async function analyzeImageWithState(
  base64,
  { setLoading, setError } = {},
) {
  try {
    setLoading?.(true);
    setError?.("");
    return await analyzeImage(base64);
  } catch (error) {
    const message = error?.message || "Failed to analyze image.";
    setError?.(message);
    throw new Error(message);
  } finally {
    setLoading?.(false);
  }
}
