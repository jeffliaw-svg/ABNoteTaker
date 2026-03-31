"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic } from "lucide-react";

interface AgendaInputProps {
  onStart: (agendaText: string) => void;
  isSupported: boolean;
}

export function AgendaInput({ onStart, isSupported }: AgendaInputProps) {
  const [text, setText] = useState("");

  const handleStart = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onStart(trimmed);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Presentation Agenda</h2>
        <p className="text-sm text-muted-foreground">
          Paste your agenda below — one item per line. These will be used to organize your notes.
        </p>
      </div>
      <Textarea
        placeholder={`Example:\nWelcome & Introductions\nQ3 Revenue Overview\nProduct Roadmap Update\nEngineering Milestones\nQ&A`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[200px] text-base"
      />
      <Button
        size="lg"
        onClick={handleStart}
        disabled={!text.trim() || !isSupported}
        className="w-full"
      >
        <Mic className="mr-2 h-5 w-5" />
        Start Presentation
      </Button>
      {!isSupported && (
        <p className="text-center text-sm text-destructive">
          Speech recognition unavailable. Use Chrome to continue.
        </p>
      )}
    </div>
  );
}
