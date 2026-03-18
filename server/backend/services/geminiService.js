import { parseBase64Image } from "../utils/imageUtils.js";

const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const SCENE_PROMPT =
  "Describe the scene clearly for a visually impaired person. Mention important objects, text, and potential hazards. Keep it short and natural.";

function normalizeDescription(value) {
  const text = (value || "").replace(/\s+/g, " ").trim();

  if (!text) {
    return "No scene description was generated.";
  }

  const sentences =
    text
      .match(/[^.!?]+[.!?]?/g)
      ?.map((item) => item.trim())
      .filter(Boolean) || [];

  const limited = sentences.slice(0, 3).join(" ").trim();
  return limited || text;
}

export async function describeSceneFromBase64Image({
  base64Image,
  base64Data,
  mimeType,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in server environment.");
  }

  let resolvedMimeType = mimeType;
  let resolvedBase64Data = base64Data;

  if ((!resolvedBase64Data || !resolvedMimeType) && base64Image) {
    const parsed = parseBase64Image(base64Image);
    resolvedMimeType = parsed.mimeType;
    resolvedBase64Data = parsed.base64Data;
  }

  if (!resolvedBase64Data || !resolvedMimeType) {
    throw new Error("Base64 image payload is missing or invalid.");
  }

  const endpoint = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: SCENE_PROMPT,
            },
            {
              inlineData: {
                mimeType: resolvedMimeType,
                data: resolvedBase64Data,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const data = await response.json();
  const description = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join(" ");

  return normalizeDescription(description);
}
