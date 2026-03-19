const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing API key");
  }
  return process.env.GEMINI_API_KEY;
}

export async function callGeminiGenerate({ model, parts }) {
  const res = await fetch(`${BASE}/${model}:generateContent?key=${getKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts }] }),
  });

  if (!res.ok) throw new Error("Gemini failed");

  const data = await res.json();

  return data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .join(" ");
}

export async function callGeminiEmbedding({ text }) {
  const res = await fetch(`${BASE}/text-embedding-004:embedContent?key=${getKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: { parts: [{ text }] } }),
  });

  if (!res.ok) throw new Error("Embedding failed");

  const data = await res.json();
  return data.embedding.values;
}