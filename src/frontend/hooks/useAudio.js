import { useCallback, useEffect, useRef, useState } from "react";

const MURF_API_URL = "https://api.murf.ai/v1/speech/generate";
const MURF_API_KEY = import.meta.env.VITE_MURF_API_KEY;
const MURF_VOICE_ID = import.meta.env.VITE_MURF_VOICE_ID || "en-US-natalie";

export default function useAudio() {
  const audioRef = useRef(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");

  const stopAudio = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  }, []);

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
    async (text) => {
      if (!text || typeof text !== "string" || !text.trim()) {
        setError("Text input is required for audio playback.");
        return "";
      }

      if (!MURF_API_KEY) {
        setError("VITE_MURF_API_KEY is missing in frontend environment.");
        return "";
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);
      setError("");

      try {
        stopAudio();

        const response = await fetch(MURF_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "api-key": MURF_API_KEY,
          },
          body: JSON.stringify({
            text: text.trim(),
            voiceId: MURF_VOICE_ID,
          }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.error || "Murf request failed.");
        }

        const generatedAudioUrl =
          payload?.audioFile || payload?.audio_url || payload?.audioUrl || "";

        if (!generatedAudioUrl) {
          throw new Error("Murf response did not include an audio URL.");
        }

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return "";
        }

        setAudioUrl(generatedAudioUrl);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        audioRef.current.src = generatedAudioUrl;
        await audioRef.current.play();
        setIsPlaying(true);

        return generatedAudioUrl;
      } catch (playbackError) {
        setIsPlaying(false);
        if (playbackError?.name === "NotAllowedError") {
          setError(
            "Audio autoplay was blocked. Use Replay Audio to play manually.",
          );
        } else {
          setError(
            playbackError?.message || "Unable to generate or play audio.",
          );
        }
        return "";
      } finally {
        if (mountedRef.current && requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [stopAudio],
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
