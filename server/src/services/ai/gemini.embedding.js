import { callGeminiEmbedding } from "./gemini.client.js";

export async function embedText(text) {
  const normalized = (text || "").trim();
  if (!normalized) {
    throw new Error("Embedding input text is empty.");
  }

  return callGeminiEmbedding({ text: normalized });
}
