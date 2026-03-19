import { useEffect, useRef, useState } from "react";
import useAudio from "../hooks/useAudio";
import useCamera from "../hooks/useCamera";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import {
  DEFAULT_PREFERENCES,
  analyzeImage,
  getDecision,
  getUserProfile,
} from "../services/apiService";
import PipelineMediaCards from "./PipelineMediaCards";
import PipelineResult from "./PipelineResult";
import VoiceAssistantControls from "./VoiceAssistantControls";

const INACTIVITY_TIMEOUT_MS = 60000;

const VOICE_SPEED_MAP = {
  slow: 0.9,
  normal: 1,
  fast: 1.15,
};

export default function PipelineDemo() {
  const {
    videoRef,
    capturedImage,
    error: cameraError,
    permissionState,
    isStarting,
    isActive,
    startCamera,
    captureImage,
  } = useCamera();

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

  const [state, setState] = useState("idle");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState({
    transcript: "",
    response: "",
    imageUrl: "",
    confidence: 0,
    reason: "",
    usedImage: false,
    source: "text",
    scene: null,
  });
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [lastCaptureTime, setLastCaptureTime] = useState(0);
  const mounted = useRef(true);
  const inactivityTimer = useRef(null);
  const lastActivityTime = useRef(Date.now());

  const resetInactivityTimer = () => {
    lastActivityTime.current = Date.now();
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    if (state !== "idle" && state !== "timeout") {
      inactivityTimer.current = setTimeout(() => {
        if (mounted.current) {
          setState("timeout");
          stopAudio();
        }
      }, INACTIVITY_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    mounted.current = true;

    const initializeCamera = async () => {
      await startCamera();
    };

    initializeCamera();

    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (mounted.current) {
          setPreferences(profile.preferences || DEFAULT_PREFERENCES);
        }
      } catch {
        if (mounted.current) {
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
    };

    loadProfile();

    return () => {
      mounted.current = false;
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      stopAudio();
    };
  }, [startCamera, stopAudio]);

  useEffect(() => {
    if (state === "idle" || state === "timeout") {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    } else {
      resetInactivityTimer();
    }

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [state]);

  const handleTapToSpeak = async () => {
    if (!mounted.current) return;
    if (state !== "idle" && state !== "timeout") return;
    if (isStarting || !isActive) return;

    setState("listening");
    setIsAnalyzing(true);
    setApiError("");

    try {
      const transcript = await listenOnce();

      if (!mounted.current) return;

      if (!transcript || !transcript.trim()) {
        setState("idle");
        return;
      }

      setState("processing");
      resetInactivityTimer();

      const imageAgeSeconds = Math.round((Date.now() - lastCaptureTime) / 1000);
      let decision = {
        needNewImage: true,
        useCache: false,
        confidence: 0.2,
        reason: "Fallback safety decision.",
      };

      try {
        decision = await getDecision(transcript, {
          imageAge: imageAgeSeconds,
          lastScene: result.scene,
        });
      } catch {
        decision = {
          needNewImage: true,
          useCache: false,
          confidence: 0.2,
          reason: "Controller unavailable, capturing for safety.",
        };
      }

      if (!mounted.current) return;

      let base64 = "";
      if (decision.needNewImage) {
        base64 = captureImage();
        if (!base64) {
          throw new Error("Unable to capture image from camera.");
        }
        setLastCaptureTime(Date.now());
      }

      const payload = await analyzeImage(base64 || null, transcript, {
        useCache: decision?.useCache === true,
        scene: decision?.useCache ? result.scene : undefined,
      });
      if (!mounted.current) return;

      const responseText =
        payload?.response || payload?.description || "I could not generate a response.";
      const imageUrl = payload?.imageUrl || "";
      const confidence =
        typeof payload?.confidence === "number"
          ? payload.confidence
          : typeof decision?.confidence === "number"
            ? decision.confidence
            : 0;
      const reason =
        typeof payload?.reason === "string" && payload.reason
          ? payload.reason
          : decision?.reason || "";
      const usedImage = payload?.usedImage === true;
      const source = typeof payload?.source === "string" ? payload.source : "text";
      const scene = payload?.scene || result.scene || null;

      setResult({
        transcript,
        response: responseText,
        imageUrl,
        confidence,
        reason,
        usedImage,
        source,
        scene,
      });

      setState("speaking");
      resetInactivityTimer();

      await playText(responseText, {
        playbackRate: VOICE_SPEED_MAP[preferences.voiceSpeed] || 1,
      });

      if (mounted.current) {
        setState("idle");
      }
    } catch (error) {
      if (mounted.current) {
        setApiError(error?.message || "Failed to process request.");
        setState("idle");
      }
    } finally {
      if (mounted.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleResetAfterTimeout = () => {
    setResult({
      transcript: "",
      response: "",
      imageUrl: "",
      confidence: 0,
      reason: "",
      usedImage: false,
      source: "text",
      scene: null,
    });
    setState("idle");
  };

  const displayState =
    state === "listening"
      ? "listening"
      : state === "processing" || isAnalyzing || isAudioLoading
        ? "processing"
        : state === "speaking"
          ? "speaking"
          : state === "timeout"
            ? "timeout"
            : "idle";

  return (
    <section className="pipeline-demo" id="demo-section" aria-label="Live pipeline demo">
      <h2>Live Demo Pipeline</h2>
      <p className="tech-description">
        Listen → Decide → Capture (if needed) → Analyze → Speak → Repeat
      </p>

      <PipelineMediaCards
        videoRef={videoRef}
        isActive={isActive}
        permissionState={permissionState}
        capturedImage={capturedImage}
        resultImageUrl={result.imageUrl}
        statusText={state === "timeout" ? "Session ended" : state === "speaking" ? "Speaking..." : "Live"}
      />

      <VoiceAssistantControls
        state={displayState}
        disabled={isStarting || !isActive || state === "timeout"}
        onTap={state === "timeout" ? handleResetAfterTimeout : handleTapToSpeak}
        canReplay={Boolean(result.response)}
        isPlaying={isPlaying}
        onReplay={replayAudio}
        onStop={stopAudio}
        buttonLabel={state === "timeout" ? "Restart Session" : undefined}
      />

      <PipelineResult
        transcript={result.transcript}
        responseText={result.response}
        confidence={result.confidence}
        reason={result.reason}
        usedImage={result.usedImage}
        source={result.source}
        errorMessage={cameraError || speechError || apiError || audioError}
        showTimeout={state === "timeout"}
      />
    </section>
  );
}

