import * as faceapi from "face-api.js";

const MODELS_URL = "/models";
const DEFAULT_THRESHOLD = 0.55;

let modelsPromise = null;

function toPlainDescriptor(descriptor) {
  return Array.from(descriptor);
}

export async function loadFaceModels() {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
    ]).catch((error) => {
      modelsPromise = null;
      throw error;
    });
  }

  return modelsPromise;
}

export async function computeEmbeddingFromImageFile(file) {
  await loadFaceModels();

  const htmlImage = await faceapi.bufferToImage(file);
  const detection = await faceapi
    .detectSingleFace(htmlImage, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection?.descriptor) {
    throw new Error(`No face found in image: ${file.name}`);
  }

  return toPlainDescriptor(detection.descriptor);
}

export async function computeEmbeddingFromVideo(videoElement) {
  await loadFaceModels();

  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection?.descriptor) {
    return null;
  }

  return toPlainDescriptor(detection.descriptor);
}

export function euclideanDistance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return Number.POSITIVE_INFINITY;
  }

  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const delta = a[i] - b[i];
    sum += delta * delta;
  }

  return Math.sqrt(sum);
}

export function matchKnownPerson(
  descriptor,
  persons,
  threshold = DEFAULT_THRESHOLD,
) {
  if (!descriptor || !Array.isArray(persons) || persons.length === 0) {
    return { name: "Unknown", distance: Number.POSITIVE_INFINITY };
  }

  let best = { name: "Unknown", distance: Number.POSITIVE_INFINITY };

  persons.forEach((person) => {
    const embeddings = Array.isArray(person?.embeddings)
      ? person.embeddings
      : [];
    embeddings.forEach((embedding) => {
      const distance = euclideanDistance(descriptor, embedding);
      if (distance < best.distance) {
        best = { name: person.name, distance };
      }
    });
  });

  if (best.distance <= threshold) {
    return best;
  }

  return { name: "Unknown", distance: best.distance };
}

export function normalizePersonName(name) {
  return typeof name === "string" ? name.trim() : "";
}
