import { parseBase64Image } from "../../utils/image.js";

export function buildConversationText(items) {
  return items
    .filter((item) => item?.source !== "fallback")
    .slice()
    .reverse()
    .map((item) => `User: ${item.query}\nAssistant: ${item.description}`)
    .join("\n\n");
}

export function findLastScene(items) {
  const record = items.find(
    (item) => item.scene?.summary || item.scene?.objects?.length,
  );
  return record?.scene || null;
}

export function resolveSceneAgeSeconds(scene) {
  const sceneTime = scene?.timestamp
    ? new Date(scene.timestamp).getTime()
    : null;
  if (!sceneTime) return 0;
  return Math.max(0, Math.round((Date.now() - sceneTime) / 1000));
}

export function normalizeImageInput(image, maxImageBytes) {
  if (!image || typeof image !== "string") {
    return {
      hasImage: false,
      base64Data: "",
      mimeType: "",
      originalImage: null,
    };
  }

  const parsed = parseBase64Image(image, { maxBytes: maxImageBytes });
  return {
    hasImage: true,
    base64Data: parsed.base64Data,
    mimeType: parsed.mimeType,
    originalImage: image,
  };
}

export function buildPersonalObjectContext(match) {
  if (!match) return "";
  return `Matched personal object: ${match.name} (similarity ${match.similarity}). Signature: ${match.signature}.`;
}
