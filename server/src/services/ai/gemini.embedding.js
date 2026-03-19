import { callGeminiEmbedding } from "./gemini.client.js";

const cache = new Map();

export async function embedText(text) {
  const clean = (text || "").trim();
  if (!clean) throw new Error("Empty embedding input");

  if (cache.has(clean)) return cache.get(clean);

  const emb = await callGeminiEmbedding({ text: clean });
  cache.set(clean, emb);

  return emb;
}