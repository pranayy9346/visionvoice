const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const RETRY_ATTEMPTS = 1;
const RETRY_DELAY_MS = 900;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in server environment.");
  }
  return process.env.GEMINI_API_KEY;
}

async function throwGeminiError(res) {
  const text = await res.text().catch(() => "Unknown Gemini error");
  if (res.status === 429) {
    throw new Error(
      "RATE_LIMITED: Gemini API quota exceeded. Please wait a moment and retry.",
    );
  }
  if (text.includes("API_KEY_INVALID") || text.includes("API key not valid")) {
    throw new Error("API_KEY_INVALID: Gemini API key is invalid.");
  }
  throw new Error(`Gemini request failed (${res.status}): ${text}`);
}

export async function callGeminiGenerate({ model, parts }) {
  const endpoint = `${BASE}/${model}:generateContent?key=${getKey()}`;
  let res = null;

  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts }] }),
    });

    if (res.ok) {
      break;
    }

    const shouldRetry = res.status === 429 && attempt < RETRY_ATTEMPTS;
    if (!shouldRetry) {
      await throwGeminiError(res);
    }

    await delay(RETRY_DELAY_MS * (attempt + 1));
  }

  const data = await res.json();

  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join(" ");
}

export async function callGeminiEmbedding({ text }) {
  const res = await fetch(
    `${BASE}/text-embedding-004:embedContent?key=${getKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
    },
  );

  if (!res.ok) {
    await throwGeminiError(res);
  }

  const data = await res.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Gemini embedding response was empty.");
  }
  return values;
}
