import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionImpl =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function useSpeechRecognition() {
  const recognitionRef = useRef(null);
  const mountedRef = useRef(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const listenOnce = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!SpeechRecognitionImpl) {
        const message = "Speech recognition is not supported in this browser.";
        setError(message);
        reject(new Error(message));
        return;
      }

      setError("");
      let finalTranscript = "";
      const recognition = new SpeechRecognitionImpl();
      recognitionRef.current = recognition;

      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (!mountedRef.current) {
          return;
        }
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript || "")
          .join(" ")
          .trim();

        finalTranscript = transcript;
      };

      recognition.onerror = (event) => {
        const message =
          event?.error === "not-allowed"
            ? "Microphone permission denied. Please allow access and try again."
            : "Speech recognition failed. Please try again.";

        if (mountedRef.current) {
          setError(message);
          setIsListening(false);
        }

        reject(new Error(message));
      };

      recognition.onend = () => {
        if (mountedRef.current) {
          setIsListening(false);
        }

        const normalized = finalTranscript.trim();
        if (!normalized) {
          reject(new Error("I could not hear anything. Please speak again."));
          return;
        }

        resolve(normalized);
      };

      recognition.start();
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    error,
    listenOnce,
    stopListening,
  };
}
