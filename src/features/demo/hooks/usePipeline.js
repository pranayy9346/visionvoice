import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { analyzeImage } from "../../../services/apiService";
import useAudio from "./useAudio";
import useLidar from "./useLidar";
import useSpeechRecognition from "./useSpeechRecognition";

const VOICE_SPEED_MAP = {
  slow: 0.9,
  normal: 1,
  fast: 1.15,
};

function readSceneObjectName(scene) {
  const firstObject = Array.isArray(scene?.objects) ? scene.objects[0] : null;

  if (typeof firstObject === "string" && firstObject.trim()) {
    return firstObject.trim();
  }

  if (firstObject && typeof firstObject === "object") {
    const candidate =
      firstObject.name || firstObject.label || firstObject.object || "";
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (typeof scene?.primaryObject === "string" && scene.primaryObject.trim()) {
    return scene.primaryObject.trim();
  }

  return "";
}

function detectObjectName(payload) {
  const personalObjectName = payload?.personalObject?.name;
  if (typeof personalObjectName === "string" && personalObjectName.trim()) {
    return personalObjectName.trim();
  }

  const sceneObjectName = readSceneObjectName(payload?.scene);
  if (sceneObjectName) {
    return sceneObjectName;
  }

  return "";
}

function classifyEstimatedDistance({ payload, transcriptText }) {
  const text = [payload?.scene?.summary, payload?.response, transcriptText]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" ")
    .toLowerCase();

  const farSignals = [
    "far",
    "distant",
    "in the distance",
    "across",
    "away",
    "background",
    "far ahead",
  ];

  const nearSignals = [
    "near",
    "nearby",
    "close",
    "in front",
    "next to",
    "beside",
    "within reach",
    "immediate",
  ];

  if (farSignals.some((signal) => text.includes(signal))) {
    return "far";
  }

  if (nearSignals.some((signal) => text.includes(signal))) {
    return "near";
  }

  // Default to near when evidence is weak to keep guidance actionable.
  return "near";
}

function buildDistanceAwareResponse({
  detectedObject,
  distanceInfo,
  fallbackText,
  transcriptText,
}) {
  const normalizedQuery =
    typeof transcriptText === "string" ? transcriptText.toLowerCase() : "";
  const isDistanceQuestion = [
    "distance",
    "how far",
    "near",
    "far",
    "close",
    "how close",
    "where is",
    "where's",
  ].some((token) => normalizedQuery.includes(token));

  if (!isDistanceQuestion && fallbackText && fallbackText.trim()) {
    return fallbackText;
  }

  if (!detectedObject) {
    return fallbackText;
  }

  if (typeof distanceInfo.distanceMeters === "number") {
    return `${distanceInfo.distanceMeters.toFixed(2)} meters ahead, there is a ${detectedObject}.`;
  }

  if (distanceInfo.distanceCategory === "far") {
    return `There is a ${detectedObject} far ahead.`;
  }

  if (distanceInfo.distanceCategory === "near") {
    return `There is a ${detectedObject} nearby.`;
  }

  if (distanceInfo.isLidarAvailable) {
    return `There is a ${detectedObject} ahead. LiDAR is available, but exact distance is not currently readable.`;
  }

  return fallbackText;
}

export default function usePipeline({
  captureImage,
  clearCapturedImage,
  voiceSpeed = "normal",
  ttsVoiceMode = "default",
  ttsCustomVoiceId = "",
  detectedName = "",
}) {
  const {
    isLidarAvailable,
    isCheckingLidar,
    isDepthSessionActive,
    lidarError,
    lidarSupportMessage,
    ensureDepthSession,
    getDepthMeters,
  } = useLidar();

  const {
    isLoading: isAudioLoading,
    isPlaying,
    error: audioError,
    playText,
    stopAudio,
    replayAudio,
  } = useAudio();

  const {
    isListening,
    error: speechError,
    listenOnce,
  } = useSpeechRecognition();

  const mounted = useRef(true);
  const lastSceneRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [pipelineError, setPipelineError] = useState("");
  const [resultMeta, setResultMeta] = useState({
    confidence: 0,
    reason: "",
    source: "text",
    usedImage: false,
    detectedObject: "",
    distanceDisplay: "",
    distanceCategory: "",
    lidarStatus: "LiDAR: Not Available",
    lidarLabel: "LiDAR not available",
    distanceIndicator: "Using AI estimation",
  });

  const getDistanceInfo = useCallback(
    async ({ payload, transcriptText }) => {
      if (isLidarAvailable) {
        const depthMeters = await getDepthMeters();
        const hasDepth =
          typeof depthMeters === "number" &&
          Number.isFinite(depthMeters) &&
          depthMeters > 0;

        if (hasDepth) {
          return {
            isLidarAvailable: true,
            distanceMeters: depthMeters,
            distanceCategory: "meters",
            distanceDisplay: `${depthMeters.toFixed(2)} meters`,
            lidarStatus: "LiDAR: Available",
            lidarLabel: "LiDAR used",
            distanceIndicator: "Using LiDAR",
          };
        }

        return {
          isLidarAvailable: true,
          distanceMeters: null,
          distanceCategory: "unknown",
          distanceDisplay: "distance unavailable",
          lidarStatus: "LiDAR: Available",
          lidarLabel: "LiDAR used",
          distanceIndicator: "Using LiDAR",
        };
      }

      const distanceCategory = classifyEstimatedDistance({
        payload,
        transcriptText,
      });

      return {
        isLidarAvailable: false,
        distanceMeters: null,
        distanceCategory,
        distanceDisplay: distanceCategory,
        lidarStatus: lidarSupportMessage || "LiDAR: Not Available",
        lidarLabel: "LiDAR not available",
        distanceIndicator:
          lidarSupportMessage && lidarSupportMessage.includes("blocked")
            ? "Using AI estimation (browser limitation)"
            : "Using AI estimation",
      };
    },
    [getDepthMeters, isLidarAvailable, lidarSupportMessage],
  );

  const captureImageAsync = useCallback(async () => {
    try {
      const image = await new Promise((resolve) => {
        window.setTimeout(() => {
          resolve(captureImage());
        }, 0);
      });

      if (typeof image === "string" && image) {
        if (mounted.current) {
          setCapturedImage(image);
        }
        return image;
      }

      if (mounted.current) {
        setCapturedImage("");
      }
      return "";
    } catch {
      if (mounted.current) {
        setCapturedImage("");
      }
      return "";
    }
  }, [captureImage]);

  const playResponse = useCallback(
    async (text) => {
      if (!text || !text.trim()) {
        return;
      }

      await playText(text, {
        playbackRate: VOICE_SPEED_MAP[voiceSpeed] || 1,
        voiceId: ttsVoiceMode === "custom" ? ttsCustomVoiceId : "",
        allowBrowserFallback: ttsVoiceMode !== "custom",
      });
    },
    [playText, ttsCustomVoiceId, ttsVoiceMode, voiceSpeed],
  );

  const processRequest = useCallback(
    async ({ transcriptText, pendingCapture }) => {
      if (!transcriptText || !transcriptText.trim()) {
        return;
      }

      setIsProcessing(true);
      setPipelineError("");

      let backgroundImage = "";
      try {
        backgroundImage = (await pendingCapture) || "";

        const payload = await analyzeImage(
          backgroundImage || null,
          transcriptText,
          {
            scene: lastSceneRef.current || undefined,
            recognizedPersonName: backgroundImage ? detectedName || "" : "",
          },
        );

        if (!mounted.current) {
          return;
        }

        const responseText =
          payload?.response ||
          payload?.description ||
          "I could not generate a response.";

        const detectedObjectName = detectObjectName(payload);
        const distanceInfo = await getDistanceInfo({
          payload,
          transcriptText,
        });
        const spokenResponse = buildDistanceAwareResponse({
          detectedObject: detectedObjectName,
          distanceInfo,
          fallbackText: responseText,
          transcriptText,
        });

        const usedImage =
          payload?.usedImage === true || payload?.source === "image";
        if (!usedImage) {
          clearCapturedImage();
          setCapturedImage("");
        }

        if (usedImage) {
          setIsAnalyzingImage(true);
        }

        setTranscript(transcriptText);
        setResponse(spokenResponse);
        setResultMeta({
          confidence:
            typeof payload?.confidence === "number" ? payload.confidence : 0,
          reason: payload?.reason || "",
          source: typeof payload?.source === "string" ? payload.source : "text",
          usedImage,
          detectedObject: detectedObjectName,
          distanceDisplay: distanceInfo.distanceDisplay,
          distanceCategory: distanceInfo.distanceCategory,
          lidarStatus: distanceInfo.lidarStatus,
          lidarLabel: distanceInfo.lidarLabel,
          distanceIndicator: distanceInfo.distanceIndicator,
        });

        lastSceneRef.current = payload?.scene || lastSceneRef.current;

        await playResponse(spokenResponse);
      } catch (error) {
        if (!mounted.current) {
          return;
        }

        setPipelineError(error?.message || "Failed to process request.");
      } finally {
        if (mounted.current) {
          setIsAnalyzingImage(false);
          setIsProcessing(false);
        }
      }
    },
    [clearCapturedImage, detectedName, getDistanceInfo, playResponse],
  );

  const startListening = useCallback(async () => {
    if (isListening || isProcessing) {
      return;
    }

    setPipelineError("");

    if (isLidarAvailable && !isDepthSessionActive) {
      // This runs in a direct tap path to satisfy WebXR user-activation requirements.
      await ensureDepthSession();
    }

    const pendingCapture = captureImageAsync();

    try {
      const transcriptText = await listenOnce();

      if (!mounted.current) {
        return;
      }

      if (!transcriptText || !transcriptText.trim()) {
        return;
      }

      await processRequest({ transcriptText, pendingCapture });
    } catch (error) {
      if (!mounted.current) {
        return;
      }

      setPipelineError(
        error?.message || "Unable to capture speech. Please try again.",
      );
      setIsProcessing(false);
      setIsAnalyzingImage(false);
    }
  }, [
    ensureDepthSession,
    captureImageAsync,
    isDepthSessionActive,
    isLidarAvailable,
    isListening,
    isProcessing,
    listenOnce,
    processRequest,
  ]);

  const resetPipeline = useCallback(() => {
    stopAudio();
    clearCapturedImage();
    setCapturedImage("");
    setTranscript("");
    setResponse("");
    setPipelineError("");
    setResultMeta({
      confidence: 0,
      reason: "",
      source: "text",
      usedImage: false,
      detectedObject: "",
      distanceDisplay: "",
      distanceCategory: "",
      lidarStatus: isLidarAvailable
        ? "LiDAR: Available"
        : lidarSupportMessage || "LiDAR: Not Available",
      lidarLabel: isLidarAvailable ? "LiDAR used" : "LiDAR not available",
      distanceIndicator: isLidarAvailable
        ? "Using LiDAR"
        : lidarSupportMessage && lidarSupportMessage.includes("blocked")
          ? "Using AI estimation (browser limitation)"
          : "Using AI estimation",
    });
  }, [clearCapturedImage, isLidarAvailable, lidarSupportMessage, stopAudio]);

  const errorMessage = useMemo(
    () => pipelineError || speechError || audioError || lidarError,
    [audioError, lidarError, pipelineError, speechError],
  );

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isListening,
    isProcessing,
    isAnalyzingImage,
    isAudioLoading,
    isPlaying,
    isLidarAvailable,
    isCheckingLidar,
    capturedImage,
    transcript,
    response,
    resultMeta,
    errorMessage,
    startListening,
    captureImage: captureImageAsync,
    processRequest,
    playResponse,
    replayAudio,
    stopAudio,
    resetPipeline,
  };
}
