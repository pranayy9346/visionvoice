import { useCallback, useRef, useState } from "react";

export default function useSpeechRecognition({ language = "en-US" } = {}) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");

  const getRecognition = useCallback(() => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      return null;
    }

    const recognition = new Recognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognitionRef.current = recognition;
    return recognition;
  }, [language]);

  const listenOnce = useCallback(() => {
    return new Promise((resolve, reject) => {
      setError("");
      const recognition = getRecognition();
      if (!recognition) {
        const message = "Speech recognition is not supported in this browser.";
        setError(message);
        reject(new Error(message));
        return;
      }

      let handled = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        handled = true;
        const transcript = event?.results?.[0]?.[0]?.transcript || "";
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        const message =
          event?.error === "not-allowed"
            ? "Microphone permission denied."
            : "Unable to capture speech. Please try again.";
        setError(message);
        reject(new Error(message));
      };

      recognition.onend = () => {
        setIsListening(false);
        if (!handled) {
          resolve("");
        }
      };

      try {
        recognition.start();
      } catch {
        setIsListening(false);
        reject(new Error("Unable to start microphone listening."));
      }
    });
  }, [getRecognition]);

  return {
    isListening,
    error,
    listenOnce,
  };
}
