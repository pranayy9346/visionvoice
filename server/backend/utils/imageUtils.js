import fs from "node:fs";
import path from "node:path";

export function ensureUploadsDirectory(uploadsDir) {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

export function parseBase64Image(base64Image) {
  const match = base64Image?.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/,
  );

  if (!match) {
    throw new Error("Invalid image data format. Expected base64 data URL.");
  }

  return {
    mimeType: match[1],
    base64Data: match[2],
  };
}

export function generateUniqueFilename(mimeType) {
  const extension = mimeType.includes("png") ? "png" : "jpg";
  return `capture-${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
}

export function saveImageFile({ base64Data, mimeType, uploadsDir, fileName }) {
  const resolvedFileName = fileName || generateUniqueFilename(mimeType);
  const filePath = path.join(uploadsDir, resolvedFileName);
  fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
  return resolvedFileName;
}

export function createPublicImageUrl({ baseUrl, fileName }) {
  return `${baseUrl}/uploads/${fileName}`;
}

export function saveBase64Image({ base64Image, uploadsDir, baseUrl }) {
  const { base64Data, mimeType } = parseBase64Image(base64Image);
  const fileName = saveImageFile({ base64Data, mimeType, uploadsDir });
  const imageUrl = createPublicImageUrl({ baseUrl, fileName });

  return {
    imageUrl,
    fileName,
    base64Data,
    mimeType,
  };
}
