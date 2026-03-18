const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function parseBase64Image(base64Image, options = {}) {
  const maxBytes =
    typeof options.maxBytes === "number" && options.maxBytes > 0
      ? options.maxBytes
      : 6 * 1024 * 1024;

  const match = base64Image?.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/,
  );

  if (!match) {
    throw new Error("Invalid image data format. Expected base64 data URL.");
  }

  const mimeType = match[1];
  const base64Data = match[2];
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WEBP.");
  }

  const byteLength = Buffer.byteLength(base64Data, "base64");
  if (byteLength > maxBytes) {
    throw new Error(
      `Image too large. Max ${(maxBytes / (1024 * 1024)).toFixed(1)} MB allowed.`,
    );
  }

  return {
    mimeType,
    base64Data,
    byteLength,
  };
}
