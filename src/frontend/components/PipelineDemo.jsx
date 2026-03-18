import { useEffect, useRef, useState } from "react";
import useAudio from "../hooks/useAudio";
import useCamera from "../hooks/useCamera";
import { analyzeImage } from "../services/apiService";

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

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState({ description: "", imageUrl: "" });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const initializeCamera = async () => {
      await startCamera();
    };

    initializeCamera();

    return () => {
      mountedRef.current = false;
      stopAudio();
    };
  }, [startCamera, stopAudio]);

  const handleAnalyze = async () => {
    if (isAnalyzing || isStarting) {
      return;
    }

    const base64 = captureImage();
    if (!base64) {
      return;
    }

    setIsAnalyzing(true);
    setApiError("");

    try {
      const payload = await analyzeImage(base64);
      if (!mountedRef.current) {
        return;
      }

      const description = payload?.description || "No description returned.";
      const imageUrl = payload?.imageUrl || "";

      setResult({ description, imageUrl });
      await playText(description);
    } catch (error) {
      if (mountedRef.current) {
        setApiError(error?.message || "Failed to analyze image.");
      }
    } finally {
      if (mountedRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const statusText =
    isStarting || isAnalyzing || isAudioLoading ? "Processing..." : "Ready";

  return (
    <section className="pipeline-demo" id="demo-section" aria-label="Live pipeline demo">
      <h2>Live Demo Pipeline</h2>
      <p className="tech-description">
        Capture → Send → Analyze → Store → Return → Speak
      </p>

      <div className="pipeline-grid">
        <article className="pipeline-card">
          <h3>Live Camera</h3>
          <div className="pipeline-media-frame">
            <video ref={videoRef} className="pipeline-media" autoPlay muted playsInline />
            {!isActive && <span className="pipeline-overlay">Camera not active</span>}
          </div>
          <p className="pipeline-meta">Permission: {permissionState}</p>
        </article>

        <article className="pipeline-card">
          <h3>Captured / Stored Image</h3>
          <div className="pipeline-media-frame">
            {(result.imageUrl || capturedImage) ? (
              <img
                src={result.imageUrl || capturedImage}
                alt="Captured scene"
                className="pipeline-media"
              />
            ) : (
              <span className="pipeline-overlay">Capture preview will appear here</span>
            )}
          </div>
          <p className="pipeline-meta">Status: {statusText}</p>
        </article>
      </div>

      <div className="pipeline-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing || isStarting || !isActive}
        >
          {isAnalyzing ? "Analyzing..." : "Capture & Analyze"}
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={replayAudio}
          disabled={!result.description || isAnalyzing}
        >
          Replay Audio
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={stopAudio}
          disabled={!isPlaying}
        >
          Stop Audio
        </button>
      </div>

      <div className="pipeline-output">
        <h3>Scene Description</h3>
        <p>{result.description || "Run analysis to hear and view the result."}</p>
      </div>

      {(cameraError || apiError || audioError) && (
        <div className="pipeline-error" role="alert">
          {cameraError || apiError || audioError}
        </div>
      )}
    </section>
  );
}
