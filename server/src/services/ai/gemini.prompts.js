import { normalizePreferences } from "./gemini.normalizers.js";

const BASE_PROMPT = "You are a helpful assistant for visually impaired users.";

export function buildPreferenceInstructions(preferences) {
  const normalized = normalizePreferences(preferences);
  const detailInstruction =
    normalized.responseStyle === "detailed"
      ? "Provide detailed responses with brief context and clear sequencing."
      : "Keep responses short and direct unless user asks follow-up details.";
  const languageInstruction =
    normalized.languageLevel === "moderate"
      ? "Use moderate language with clear but slightly richer explanations."
      : "Use very simple, everyday language and short sentences.";
  const safetyInstruction =
    normalized.safetySensitivity === "high"
      ? "Prioritize safety warnings and mention hazards early."
      : "Mention hazards when relevant but keep balance with general context.";

  return `${detailInstruction}\n${languageInstruction}\n${safetyInstruction}`;
}

export function buildDecisionPrompt({
  query,
  conversationHistory,
  lastScene,
  imageAge,
}) {
  const historyText =
    conversationHistory?.trim() || "No previous conversation.";
  const sceneText = lastScene
    ? JSON.stringify(lastScene)
    : "No previous scene cache available.";
  const ageMinutes = Math.max(0, Math.round((Number(imageAge) || 0) / 60));

  return `You are an intelligent controller for a visual assistant.\n\nUser query: ${query}\nConversation: ${historyText}\nLast known scene: ${sceneText}\nImage age: ${ageMinutes} minutes\n\nDecide:\n1. Can the query be answered using previous scene?\n2. Is a new image required?\n\nRespond ONLY in valid JSON:\n{\n  "useCache": true,\n  "needNewImage": false,\n  "confidence": 0.0,\n  "reason": "short explanation"\n}\n\nPrioritize safety. If uncertain, prefer new image.`;
}

export function buildImagePrompt({
  query,
  history,
  preferences,
  recognitionContext,
}) {
  const historyText = history?.trim() || "No previous conversation.";
  const preferenceInstructions = buildPreferenceInstructions(preferences);
  const recognitionSection = recognitionContext
    ? `\nMatched context from saved images:\n${recognitionContext}\n`
    : "";

  return `${BASE_PROMPT}\n\nUser query:\n${query}\n\nConversation:\n${historyText}${recognitionSection}\nInstructions:\n- Describe important objects first\n- Mention hazards clearly\n- Mention readable text\n- Keep language simple and natural\n- Prioritize safety information\n- If matched context from saved images is relevant, mention it clearly\n- Treat recognized-person or matched-object context as supporting context only\n- Do not replace the direct answer with matched-context text alone\n${preferenceInstructions}\n\nRespond ONLY as valid JSON:\n{\n  "response": "short natural response",\n  "confidence": 0.0,\n  "reason": "short explanation",\n  "scene": {\n    "objects": ["..."],\n    "positions": ["..."],\n    "hazards": ["..."],\n    "text": ["..."],\n    "summary": "..."\n  }\n}`;
}

export function buildTextPrompt({ query, history, preferences }) {
  const historyText = history?.trim() || "No previous conversation.";
  const preferenceInstructions = buildPreferenceInstructions(preferences);

  return `${BASE_PROMPT}\n\nUser query:\n${query}\n\nConversation:\n${historyText}\n\nRespond naturally for a visually impaired user. Keep it clear and concise.\n${preferenceInstructions}\n\nRespond ONLY as valid JSON:\n{\n  "response": "short natural response",\n  "confidence": 0.0,\n  "reason": "short explanation"\n}`;
}

export function buildImageSignaturePrompt(label = "") {
  const labelHint = label ? `The object name hint is: ${label}.` : "";

  return `${BASE_PROMPT}\n\nAnalyze the image and produce a compact signature for recognition.\n${labelHint}\nDescribe distinctive shape, color, texture, logos, and unique marks in one short paragraph.\nReturn ONLY JSON:\n{\n  "signature": "distinctive visual description"\n}`;
}
