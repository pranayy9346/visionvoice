import { useCallback, useEffect, useRef, useState } from "react";

const DEPTH_FRESHNESS_MS = 1800;

function isLikelyIOSDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = Number(navigator.maxTouchPoints || 0);

  return (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Mac/i.test(platform) && maxTouchPoints > 1)
  );
}

function isPositiveFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function createSessionOptions() {
  const options = {
    requiredFeatures: ["local"],
    optionalFeatures: ["depth-sensing"],
    depthSensing: {
      usagePreference: ["cpu-optimized", "gpu-optimized"],
      dataFormatPreference: ["float32", "luminance-alpha"],
    },
  };

  if (typeof document !== "undefined" && document.body) {
    options.optionalFeatures.push("dom-overlay");
    options.domOverlay = { root: document.body };
  }

  return options;
}

function getDepthFromFrame(frame, refSpace) {
  if (
    !frame ||
    !refSpace ||
    typeof frame.getViewerPose !== "function" ||
    typeof frame.getDepthInformation !== "function"
  ) {
    return null;
  }

  const viewerPose = frame.getViewerPose(refSpace);
  const firstView = viewerPose?.views?.[0];
  if (!firstView) {
    return null;
  }

  const depthInfo = frame.getDepthInformation(firstView);
  if (!depthInfo || typeof depthInfo.getDepthInMeters !== "function") {
    return null;
  }

  const centerX = Math.max(0, Math.floor((depthInfo.width || 0) / 2));
  const centerY = Math.max(0, Math.floor((depthInfo.height || 0) / 2));
  const depthMeters = depthInfo.getDepthInMeters(centerX, centerY);

  return isPositiveFiniteNumber(depthMeters) ? depthMeters : null;
}

export default function useLidar() {
  const [isLidarAvailable, setIsLidarAvailable] = useState(false);
  const [isCheckingLidar, setIsCheckingLidar] = useState(true);
  const [isDepthSessionActive, setIsDepthSessionActive] = useState(false);
  const [lidarError, setLidarError] = useState("");
  const [lidarSupportMessage, setLidarSupportMessage] = useState(
    "LiDAR: Not Available",
  );

  const xrSessionRef = useRef(null);
  const xrRefSpaceRef = useRef(null);
  const xrFrameRequestRef = useRef(0);
  const latestDepthRef = useRef({ meters: null, timestamp: 0 });

  const stopDepthSession = useCallback(async () => {
    const session = xrSessionRef.current;
    xrSessionRef.current = null;
    xrRefSpaceRef.current = null;

    if (xrFrameRequestRef.current && session?.cancelAnimationFrame) {
      session.cancelAnimationFrame(xrFrameRequestRef.current);
      xrFrameRequestRef.current = 0;
    }

    latestDepthRef.current = { meters: null, timestamp: 0 };
    setIsDepthSessionActive(false);

    if (session) {
      try {
        await session.end();
      } catch {
        // Ignore session end failures during cleanup.
      }
    }
  }, []);

  const onXRFrame = useCallback((_, frame) => {
    const session = xrSessionRef.current;
    if (!session) {
      return;
    }

    xrFrameRequestRef.current = session.requestAnimationFrame(onXRFrame);

    const depthMeters = getDepthFromFrame(frame, xrRefSpaceRef.current);
    if (isPositiveFiniteNumber(depthMeters)) {
      latestDepthRef.current = {
        meters: depthMeters,
        timestamp: Date.now(),
      };
    }
  }, []);

  const ensureDepthSession = useCallback(async () => {
    if (!isLidarAvailable) {
      return false;
    }

    if (xrSessionRef.current) {
      return true;
    }

    const xr = navigator?.xr;
    if (!xr || typeof xr.requestSession !== "function") {
      return false;
    }

    try {
      setLidarError("");
      const session = await xr.requestSession(
        "immersive-ar",
        createSessionOptions(),
      );

      const refSpace = await session.requestReferenceSpace("local");

      session.addEventListener(
        "end",
        () => {
          xrSessionRef.current = null;
          xrRefSpaceRef.current = null;
          latestDepthRef.current = { meters: null, timestamp: 0 };
          setIsDepthSessionActive(false);
        },
        { once: true },
      );

      xrSessionRef.current = session;
      xrRefSpaceRef.current = refSpace;
      setIsDepthSessionActive(true);
      xrFrameRequestRef.current = session.requestAnimationFrame(onXRFrame);
      return true;
    } catch (error) {
      const message = error?.message || "Unable to start LiDAR depth session.";
      setLidarError(message);
      setIsDepthSessionActive(false);
      return false;
    }
  }, [isLidarAvailable, onXRFrame]);

  useEffect(() => {
    let cancelled = false;

    async function detectLidarSupport() {
      if (typeof window === "undefined") {
        if (!cancelled) {
          setIsLidarAvailable(false);
          setLidarSupportMessage("LiDAR: Not Available");
          setIsCheckingLidar(false);
        }
        return;
      }

      if (!window.isSecureContext) {
        if (!cancelled) {
          setIsLidarAvailable(false);
          setLidarSupportMessage("LiDAR: Requires HTTPS secure context");
          setIsCheckingLidar(false);
        }
        return;
      }

      const xr = navigator?.xr;
      if (!xr || typeof xr.isSessionSupported !== "function") {
        if (!cancelled) {
          setIsLidarAvailable(false);
          setLidarSupportMessage(
            isLikelyIOSDevice()
              ? "LiDAR: Browser API blocked on iPhone Safari"
              : "LiDAR: WebXR not supported in this browser",
          );
          setIsCheckingLidar(false);
        }
        return;
      }

      try {
        const supportsImmersiveAR = await xr.isSessionSupported("immersive-ar");
        if (!cancelled) {
          setIsLidarAvailable(Boolean(supportsImmersiveAR));
          setLidarSupportMessage(
            supportsImmersiveAR
              ? "LiDAR: Available"
              : "LiDAR: Immersive AR not supported on this device/browser",
          );
        }
      } catch {
        if (!cancelled) {
          setIsLidarAvailable(false);
          setLidarSupportMessage("LiDAR: Detection failed");
        }
      } finally {
        if (!cancelled) {
          setIsCheckingLidar(false);
        }
      }
    }

    detectLidarSupport();

    return () => {
      cancelled = true;
    };
  }, []);

  const getDepthMeters = useCallback(async () => {
    if (!isLidarAvailable) {
      return null;
    }

    const sample = latestDepthRef.current;
    const isFresh = Date.now() - sample.timestamp <= DEPTH_FRESHNESS_MS;
    if (isFresh && isPositiveFiniteNumber(sample.meters)) {
      return sample.meters;
    }

    // Keep this explicit to avoid fabricating values when no valid depth sample is available.
    return null;
  }, [isLidarAvailable]);

  useEffect(() => {
    return () => {
      stopDepthSession();
    };
  }, [stopDepthSession]);

  return {
    isLidarAvailable,
    isCheckingLidar,
    isDepthSessionActive,
    lidarError,
    lidarSupportMessage,
    ensureDepthSession,
    stopDepthSession,
    getDepthMeters,
  };
}
