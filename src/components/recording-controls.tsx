"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";

interface RecordingControlsProps {
  isListening: boolean;
  hasTranscript: boolean;
  isPublishing: boolean;
  onToggleRecording: () => void;
  onPublish: () => void;
}

export function RecordingControls({
  isListening,
  hasTranscript,
  isPublishing,
  onToggleRecording,
  onPublish,
}: RecordingControlsProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isListening]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {isListening && (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
          )}
          <span className="font-mono text-sm text-muted-foreground">
            {formatTime(elapsed)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isListening ? "destructive" : "secondary"}
            onClick={onToggleRecording}
            disabled={isPublishing}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Resume
              </>
            )}
          </Button>

          <Button
            onClick={onPublish}
            disabled={!hasTranscript || isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Publish Notes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
