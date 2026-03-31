"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  start: () => void;
  stop: () => void;
  interimText: string;
  finalSegments: string[];
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalSegments, setFinalSegments] = useState<string[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldBeListeningRef = useRef(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setIsSupported(supported);
  }, []);

  const start = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setFinalSegments((prev) => [...prev, transcript.trim()]);
          setInterimText("");
        } else {
          interim += transcript;
        }
      }
      if (interim) {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        shouldBeListeningRef.current = false;
        setIsListening(false);
      }
      // For 'network' or 'aborted' errors, onend will fire and auto-restart
    };

    recognition.onend = () => {
      if (shouldBeListeningRef.current) {
        // Auto-restart — Chrome stops after silence or ~60s
        try {
          recognition.start();
        } catch {
          // Already started, ignore
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    shouldBeListeningRef.current = true;

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // Already running
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    shouldBeListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    start,
    stop,
    interimText,
    finalSegments,
  };
}
