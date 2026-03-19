const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

const GEMINI_RETRY_ATTEMPTS = 1;
const GEMINI_RETRY_DELAY_MS = 900;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in server environment.");
  }
  return apiKey;
}

async function readError(response) {
  const text = await response.text();
  if (response.status === 429) {
    throw new Error(
      "RATE_LIMITED: Gemini API quota exceeded. Please wait a moment and retry.",
    );
  }
  throw new Error(`Gemini request failed (${response.status}): ${text}`);
}

export async function callGeminiGenerate({ model, parts }) {
  const endpoint = `${GEMINI_API_BASE}/${model}:generateContent?key=${getApiKey()}`;
  let response = null;

  for (let attempt = 0; attempt <= GEMINI_RETRY_ATTEMPTS; attempt += 1) {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts }] }),
    });

    if (response.ok) {
      break;
    }

    const shouldRetry =
      response.status === 429 && attempt < GEMINI_RETRY_ATTEMPTS;
    if (!shouldRetry) {
      await readError(response);
    }

    await delay(GEMINI_RETRY_DELAY_MS * (attempt + 1));
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join(" ");
}

export async function callGeminiEmbedding({ text }) {
  const model = process.env.GEMINI_MODEL_EMBEDDING || "text-embedding-004";
  const endpoint = `${GEMINI_API_BASE}/${model}:embedContent?key=${getApiKey()}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: { parts: [{ text }] } }),
  });

  if (!response.ok) {
    await readError(response);
  }

  const data = await response.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Gemini embedding response was empty.");
  }

  return values.map((value) => Number(value) || 0);
}
