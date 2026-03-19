import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://visionvoice-l9ki.onrender.com";

const SPEECH_TIMEOUT_MS = 20000;

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function useAudio() {
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");

  const fetchSpeechAudioUrl = useCallback(async (text) => {
    const runRequest = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SPEECH_TIMEOUT_MS);

      try {
        const response = await fetch(`${API_BASE_URL}/api/speech`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const err = new Error(payload?.error || "Speech request failed.");
          err.status = response.status;
          throw err;
        }

        return (
          payload?.audioFile || payload?.audio_url || payload?.audioUrl || ""
        );
      } finally {
        clearTimeout(timeoutId);
      }
    };

    try {
      return await runRequest();
    } catch (error) {
      const isAbort = error?.name === "AbortError";
      const isNetwork = error instanceof TypeError;
      const isRetryableStatus =
        typeof error?.status === "number" && error.status >= 500;

      if (!isAbort && (isNetwork || isRetryableStatus)) {
        await delay(500);
        return runRequest();
      }

      throw error;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  const speakWithBrowser = useCallback(
    (text, playbackRate) =>
      new Promise((resolve) => {
        if (
          typeof window === "undefined" ||
          !window.speechSynthesis ||
          typeof window.SpeechSynthesisUtterance !== "function"
        ) {
          resolve(false);
          return;
        }

        try {
          stopAudio();

          // Trigger voice list population for browsers that lazy-load voices.
          window.speechSynthesis.getVoices();

          const utterance = new window.SpeechSynthesisUtterance(text);
          utterance.rate = playbackRate;

          const voices = window.speechSynthesis.getVoices();
          const preferredVoice =
            voices.find((voice) => /en/i.test(voice.lang || "")) || voices[0];
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          utteranceRef.current = utterance;

          let hasStarted = false;
          const startTimeout = window.setTimeout(() => {
            if (!hasStarted) {
              utteranceRef.current = null;
              if (mountedRef.current) {
                setIsPlaying(false);
              }
              resolve(false);
            }
          }, 2500);

          utterance.onstart = () => {
            hasStarted = true;
            if (mountedRef.current) {
              setIsPlaying(true);
            }
          };

          utterance.onend = () => {
            window.clearTimeout(startTimeout);
            utteranceRef.current = null;
            if (mountedRef.current) {
              setIsPlaying(false);
              setError("");
            }
            resolve(true);
          };

          utterance.onerror = () => {
            window.clearTimeout(startTimeout);
            utteranceRef.current = null;
            if (mountedRef.current) {
              setIsPlaying(false);
            }
            resolve(false);
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          resolve(false);
        }
      }),
    [stopAudio],
  );

  const replayAudio = useCallback(async () => {
    if (!audioRef.current || !audioUrl) {
      return false;
    }

    try {
      stopAudio();
      await audioRef.current.play();
      setIsPlaying(true);
      return true;
    } catch {
      setError(
        "Audio replay was blocked. Click replay again to allow playback.",
      );
      setIsPlaying(false);
      return false;
    }
  }, [audioUrl, stopAudio]);

  const playText = useCallback(
    async (text, options = {}) => {
      if (!text || typeof text !== "string" || !text.trim()) {
        setError("Text input is required for audio playback.");
        return "";
      }

      const playbackRate =
        typeof options.playbackRate === "number" && options.playbackRate > 0
          ? options.playbackRate
          : 1;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);
      setError("");

      try {
        stopAudio();

        const generatedAudioUrl = await fetchSpeechAudioUrl(text.trim());

        if (!generatedAudioUrl) {
          throw new Error("Speech response did not include an audio URL.");
        }

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return "";
        }

        setAudioUrl(generatedAudioUrl);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        audioRef.current.src = generatedAudioUrl;
        audioRef.current.playbackRate = playbackRate;
        await audioRef.current.play();
        setIsPlaying(true);

        return generatedAudioUrl;
      } catch (playbackError) {
        const browserSpoken = await speakWithBrowser(text.trim(), playbackRate);
        if (browserSpoken) {
          return "browser-fallback";
        }

        setIsPlaying(false);
        if (playbackError?.name === "NotAllowedError") {
          setError(
            "Audio autoplay was blocked. Use Replay Audio to play manually.",
          );
        } else if (playbackError instanceof TypeError) {
          setError("Unable to reach backend speech API.");
        } else {
          setError("Speech service is unavailable right now.");
        }

        return "";
      } finally {
        if (mountedRef.current && requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [fetchSpeechAudioUrl, speakWithBrowser, stopAudio],
  );

  useEffect(() => {
    mountedRef.current = true;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audioElement = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("play", handlePlay);

    return () => {
      mountedRef.current = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("play", handlePlay);
      audioElement.pause();
      audioElement.currentTime = 0;
    };
  }, []);

  return {
    audioUrl,
    isLoading,
    isPlaying,
    error,
    playText,
    stopAudio,
    replayAudio,
  };
}
