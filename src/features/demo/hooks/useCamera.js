import { useCallback, useEffect, useRef, useState } from "react";

function buildCameraAttempts(baseConstraints) {
  const hasObjectConstraints =
    baseConstraints &&
    typeof baseConstraints === "object" &&
    !Array.isArray(baseConstraints);

  const baseVideo =
    hasObjectConstraints &&
    baseConstraints.video &&
    typeof baseConstraints.video === "object" &&
    !Array.isArray(baseConstraints.video)
      ? baseConstraints.video
      : {};

  const audio =
    hasObjectConstraints && typeof baseConstraints.audio !== "undefined"
      ? baseConstraints.audio
      : false;

  return [
    {
      label: "back-exact",
      notice: "",
      requireBackFacing: true,
      constraints: {
        audio,
        video: {
          ...baseVideo,
          facingMode: { exact: "environment" },
        },
      },
    },
    {
      label: "back-ideal",
      notice: "",
      requireBackFacing: true,
      constraints: {
        audio,
        video: {
          ...baseVideo,
          facingMode: { ideal: "environment" },
        },
      },
    },
    {
      label: "front",
      notice: "Using front camera because back camera was not available.",
      requireBackFacing: false,
      constraints: {
        audio,
        video: {
          ...baseVideo,
          facingMode: { exact: "user" },
        },
      },
    },
    {
      label: "default",
      notice: "Using available camera.",
      requireBackFacing: false,
      constraints: hasObjectConstraints
        ? { ...baseConstraints, audio }
        : { video: true, audio },
    },
  ];
}

function streamLooksBackFacing(stream) {
  const videoTrack = stream?.getVideoTracks?.()[0];
  if (!videoTrack) {
    return false;
  }

  const settings =
    typeof videoTrack.getSettings === "function"
      ? videoTrack.getSettings()
      : {};
  const facingMode = String(settings?.facingMode || "").toLowerCase();
  if (facingMode.includes("environment") || facingMode.includes("rear")) {
    return true;
  }

  const label = String(videoTrack.label || "").toLowerCase();
  return /rear|back|environment|world/.test(label);
}

export default function useCamera({
  videoConstraints = { video: true },
  imageType = "image/jpeg",
  imageQuality = 0.92,
  maxCaptureDimension = 1280,
} = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const requestIdRef = useRef(0);
  const constraintsRef = useRef(videoConstraints);

  const [capturedImage, setCapturedImage] = useState("");
  const [error, setError] = useState("");
  const [permissionState, setPermissionState] = useState("unknown");
  const [isStarting, setIsStarting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [cameraNotice, setCameraNotice] = useState("");

  useEffect(() => {
    if (!cameraNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCameraNotice("");
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [cameraNotice]);

  useEffect(() => {
    constraintsRef.current = videoConstraints;
  }, [videoConstraints]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("This browser does not support camera access.");
      setPermissionState("unsupported");
      return false;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsStarting(true);
    setError("");

    try {
      stopCamera();

      const attempts = buildCameraAttempts(constraintsRef.current);
      let stream = null;
      let selectedAttempt = null;
      let lastAttemptError = null;

      for (const attempt of attempts) {
        try {
          const candidate = await navigator.mediaDevices.getUserMedia(
            attempt.constraints,
          );

          if (attempt.requireBackFacing && !streamLooksBackFacing(candidate)) {
            candidate.getTracks().forEach((track) => track.stop());
            continue;
          }

          stream = candidate;
          selectedAttempt = attempt;
          break;
        } catch (attemptError) {
          lastAttemptError = attemptError;
        }
      }

      if (!stream) {
        throw lastAttemptError || new Error("Unable to start camera stream.");
      }

      if (requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setPermissionState("granted");
      setIsActive(true);
      setCameraNotice(selectedAttempt?.notice || "");
      return true;
    } catch (cameraError) {
      if (cameraError?.name === "NotAllowedError") {
        setPermissionState("denied");
        setError(
          "Camera permission denied. Please allow access and try again.",
        );
      } else if (cameraError?.name === "NotFoundError") {
        setPermissionState("not-found");
        setError("No camera device found on this system.");
      } else {
        setPermissionState("error");
        setError("Unable to start camera. Please try again.");
      }

      setIsActive(false);
      setCameraNotice("");
      return false;
    } finally {
      if (requestId === requestIdRef.current) {
        setIsStarting(false);
      }
    }
  }, [stopCamera]);

  const captureImage = useCallback(() => {
    const videoElement = videoRef.current;

    if (!videoElement || !isActive) {
      setError("Camera is not ready yet.");
      return "";
    }

    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;

    if (!width || !height) {
      setError("Unable to capture image from camera stream.");
      return "";
    }

    const ratio =
      width > height
        ? maxCaptureDimension / width
        : maxCaptureDimension / height;
    const scale = Number.isFinite(ratio) && ratio > 0 && ratio < 1 ? ratio : 1;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Unable to process image right now.");
      return "";
    }

    context.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
    const base64Image = canvas.toDataURL(imageType, imageQuality);

    setCapturedImage(base64Image);
    setError("");
    return base64Image;
  }, [imageQuality, imageType, isActive, maxCaptureDimension]);

  const clearCapturedImage = useCallback(() => {
    setCapturedImage("");
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    capturedImage,
    error,
    cameraNotice,
    permissionState,
    isStarting,
    isActive,
    startCamera,
    stopCamera,
    captureImage,
    clearCapturedImage,
  };
}
