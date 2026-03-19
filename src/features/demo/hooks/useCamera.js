import { useCallback, useEffect, useRef, useState } from "react";

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

      const stream = await navigator.mediaDevices.getUserMedia(
        constraintsRef.current,
      );

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
    permissionState,
    isStarting,
    isActive,
    startCamera,
    stopCamera,
    captureImage,
    clearCapturedImage,
  };
}
