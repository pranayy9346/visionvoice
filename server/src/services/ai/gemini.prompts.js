import { normalizePreferences } from "./gemini.normalizers.js";

const BASE_PROMPT = `
You are an intelligent AI assistant designed to help visually impaired users understand their surroundings.

Your priorities:
- Safety first
- Clear and simple communication
- Real-world usefulness
- Avoid hallucinations
- Be concise but informative
`;

export function buildPreferenceInstructions(preferences) {
  const normalized = normalizePreferences(preferences);

  return `
${normalized.responseStyle === "detailed"
    ? "Provide slightly detailed responses with clear sequencing."
    : "Keep responses short and direct."}

${normalized.languageLevel === "moderate"
    ? "Use moderate language with slightly richer explanations."
    : "Use very simple, everyday language and short sentences."}

${normalized.safetySensitivity === "high"
    ? "Prioritize safety warnings immediately."
    : "Mention hazards when relevant."}
`;
}

export function buildDecisionPrompt({
  query,
  conversationHistory,
  lastScene,
  imageAge,
}) {
  return `You are a decision engine for a real-time visual assistant.

Query: ${query}
History: ${conversationHistory || "None"}
Scene: ${lastScene ? JSON.stringify(lastScene) : "None"}
Image age: ${Math.round(Number(imageAge) || 0)} seconds

Decide:
- Use cache?
- Need new image?

Respond JSON:
{
  "useCache": boolean,
  "needNewImage": boolean,
  "confidence": number,
  "reason": "short"
}`;
}

export function buildImagePrompt({
  query,
  history,
  preferences,
  recognitionContext,
  distanceInfo,
}) {
  return `${BASE_PROMPT}

Query: ${query}
History: ${history || "None"}

${recognitionContext ? `Context: ${recognitionContext}` : ""}
${distanceInfo ? `Distance: ${distanceInfo}` : ""}

Instructions:
- Describe scene clearly
- Mention hazards first
- Keep simple language
- Avoid guessing

${buildPreferenceInstructions(preferences)}

Respond JSON:
{
  "response": "",
  "confidence": 0,
  "reason": "",
  "scene": {
    "objects": [],
    "positions": [],
    "hazards": [],
    "text": [],
    "summary": ""
  }
}`;
}

export function buildTextPrompt({ query, history, preferences }) {
  return `${BASE_PROMPT}

Query: ${query}
History: ${history || "None"}

${buildPreferenceInstructions(preferences)}

Respond JSON:
{
  "response": "",
  "confidence": 0,
  "reason": ""
}`;
}

export function buildImageSignaturePrompt(label = "") {
  return `${BASE_PROMPT}

Analyze visual features:
- shape
- color
- texture
- unique marks

Label: ${label || "unknown"}

Respond JSON:
{
  "signature": ""
}`;
}