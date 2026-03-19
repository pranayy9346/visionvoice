import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearKnownPersons as clearKnownPersonsInDb,
  deleteKnownPerson,
  listKnownPersons,
  saveKnownPerson,
} from "../../../services/apiService";
import {
  computeEmbeddingFromImageFile,
  computeEmbeddingFromVideo,
  loadFaceModels,
  matchKnownPerson,
  normalizePersonName,
} from "../utils/faceUtils";

const RECOGNITION_INTERVAL_MS = 1500;

export default function useFaceRecognition({ videoRef } = {}) {
  const [persons, setPersons] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSyncingPersons, setIsSyncingPersons] = useState(false);
  const [detectionLabel, setDetectionLabel] = useState("Detecting...");
  const [detectedName, setDetectedName] = useState("");
  const [error, setError] = useState("");

  const mounted = useRef(true);
  const intervalRef = useRef(null);
  const modelsReadyRef = useRef(false);

  const loadModels = useCallback(async ({ silent = false } = {}) => {
    setIsModelLoading(true);
    if (!silent) {
      setError("");
    }

    try {
      await loadFaceModels();
      modelsReadyRef.current = true;
      return true;
    } catch {
      modelsReadyRef.current = false;
      if (!silent) {
        setError(
          "Failed to load face recognition models. Ensure /public/models files exist.",
        );
      }
      return false;
    } finally {
      if (mounted.current) {
        setIsModelLoading(false);
      }
    }
  }, []);

  const refreshPersons = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setError("");
    }

    setIsSyncingPersons(true);
    try {
      const items = await listKnownPersons();
      if (mounted.current) {
        setPersons(Array.isArray(items) ? items : []);
      }
      return true;
    } catch (apiError) {
      if (mounted.current && !silent) {
        setError(
          apiError?.message || "Failed to load known persons from database.",
        );
      }
      return false;
    } finally {
      if (mounted.current) {
        setIsSyncingPersons(false);
      }
    }
  }, []);

  const upsertPerson = useCallback(
    async ({ name, files }) => {
      const normalized = normalizePersonName(name);
      if (!normalized) {
        throw new Error("Person name is required.");
      }

      const imageFiles = Array.from(files || []).slice(0, 5);
      if (imageFiles.length < 1) {
        throw new Error("Please upload at least 1 image.");
      }

      await loadModels();

      const embeddings = [];
      for (const file of imageFiles) {
        const embedding = await computeEmbeddingFromImageFile(file);
        embeddings.push(embedding);
      }

      const saved = await saveKnownPerson({
        name: normalized,
        embeddings,
      });

      const next = [
        ...persons.filter(
          (entry) => entry.name?.toLowerCase() !== normalized.toLowerCase(),
        ),
        saved,
      ];

      // Update the list immediately after a successful save.
      setPersons(next);
      return saved;
    },
    [loadModels, persons],
  );

  const removePerson = useCallback(
    async (id) => {
      await deleteKnownPerson(id);
      const next = persons.filter((entry) => entry.id !== id);
      setPersons(next);
    },
    [persons],
  );

  const clearPersons = useCallback(async () => {
    await clearKnownPersonsInDb();
    setPersons([]);
  }, []);

  const detectFromVideo = useCallback(async () => {
    if (!modelsReadyRef.current) {
      return;
    }

    const videoElement = videoRef?.current;
    if (!videoElement || videoElement.readyState < 2) {
      return;
    }

    let descriptor = null;
    try {
      descriptor = await computeEmbeddingFromVideo(videoElement);
    } catch {
      // Frame-level failures are expected occasionally (motion blur / partial face);
      // keep the UI smooth instead of surfacing noisy errors.
      if (mounted.current) {
        setDetectedName("");
        setDetectionLabel("No face detected");
      }
      return;
    }

    if (!mounted.current) {
      return;
    }

    if (!descriptor) {
      setDetectedName("");
      setDetectionLabel("No face detected");
      return;
    }

    const matched = matchKnownPerson(descriptor, persons);
    setDetectedName(matched.name === "Unknown" ? "" : matched.name);
    setDetectionLabel(`Detected: ${matched.name}`);
  }, [persons, videoRef]);

  const startRecognition = useCallback(async () => {
    if (intervalRef.current) {
      return;
    }

    const loaded = await loadModels({ silent: true });
    if (!mounted.current) {
      return;
    }

    if (!loaded) {
      setIsDetecting(false);
      setDetectionLabel("Face models unavailable");
      return;
    }

    setIsDetecting(true);
    setDetectionLabel("Detecting...");

    intervalRef.current = window.setInterval(() => {
      detectFromVideo().catch(() => {
        if (mounted.current) {
          setDetectedName("");
          setDetectionLabel("No face detected");
        }
      });
    }, RECOGNITION_INTERVAL_MS);
  }, [detectFromVideo, loadModels]);

  const stopRecognition = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsDetecting(false);
    setDetectedName("");
  }, []);

  useEffect(() => {
    mounted.current = true;
    refreshPersons({ silent: true });
    return () => {
      mounted.current = false;
      stopRecognition();
    };
  }, [refreshPersons, stopRecognition]);

  const hasKnownPersons = useMemo(() => persons.length > 0, [persons.length]);

  return {
    persons,
    hasKnownPersons,
    isModelLoading,
    isSyncingPersons,
    isDetecting,
    detectionLabel,
    detectedName,
    error,
    loadModels,
    refreshPersons,
    upsertPerson,
    removePerson,
    clearPersons,
    startRecognition,
    stopRecognition,
  };
}
