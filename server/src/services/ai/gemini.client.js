const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

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
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts }] }),
  });

  if (!response.ok) {
    await readError(response);
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
