"use client";

import { useState } from "react";
import { AppPhase, AgendaItem, PublishedNotes } from "@/lib/types";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useAgendaTracker } from "@/hooks/use-agenda-tracker";
import { BrowserWarning } from "@/components/browser-warning";
import { AgendaInput } from "@/components/agenda-input";
import { LiveTranscript } from "@/components/live-transcript";
import { RecordingControls } from "@/components/recording-controls";
import { NotesView } from "@/components/notes-view";
import { ShareDialog } from "@/components/share-dialog";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

function AppContent() {
  const [phase, setPhase] = useState<AppPhase>("input");
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [publishedNotes, setPublishedNotes] = useState<PublishedNotes | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { isSupported, isListening, start, stop, interimText, finalSegments } =
    useSpeechRecognition();
  const { activeItemId, setActiveItemId, transcript } = useAgendaTracker(
    agenda,
    finalSegments
  );
  const { toast } = useToast();

  const handleStart = (agendaText: string) => {
    const items: AgendaItem[] = agendaText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title, index) => ({
        id: crypto.randomUUID(),
        index,
        title,
      }));

    if (items.length === 0) {
      toast({
        title: "Empty agenda",
        description: "Please enter at least one agenda item.",
        variant: "destructive",
      });
      return;
    }

    setAgenda(items);
    setPhase("recording");
    start();
  };

  const handleToggleRecording = () => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  };

  const handlePublish = async () => {
    stop();
    setPhase("publishing");

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenda, transcript }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to publish notes.");
      }

      const notes: PublishedNotes = await res.json();
      setPublishedNotes(notes);
      setPhase("review");
    } catch (err) {
      toast({
        title: "Publishing failed",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
      setPhase("recording");
    }
  };

  const handleNewSession = () => {
    setPhase("input");
    setAgenda([]);
    setPublishedNotes(null);
    setShareDialogOpen(false);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight">ABNoteTaker</h1>
          {phase !== "input" && (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {phase === "recording" && "Recording"}
              {phase === "publishing" && "Processing..."}
              {phase === "review" && "Notes Ready"}
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {!isSupported && phase === "input" && <BrowserWarning />}

        {phase === "input" && (
          <AgendaInput onStart={handleStart} isSupported={isSupported} />
        )}

        {phase === "recording" && (
          <div className="pb-20">
            <LiveTranscript
              agenda={agenda}
              transcript={transcript}
              activeAgendaItemId={activeItemId}
              interimText={interimText}
              onSelectAgendaItem={setActiveItemId}
            />
            <RecordingControls
              isListening={isListening}
              hasTranscript={transcript.length > 0}
              isPublishing={false}
              onToggleRecording={handleToggleRecording}
              onPublish={handlePublish}
            />
          </div>
        )}

        {phase === "publishing" && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Claude is generating your notes...
            </p>
          </div>
        )}

        {phase === "review" && publishedNotes && (
          <>
            <NotesView
              notes={publishedNotes}
              onShare={() => setShareDialogOpen(true)}
              onNewSession={handleNewSession}
            />
            <ShareDialog
              open={shareDialogOpen}
              onClose={() => setShareDialogOpen(false)}
              notes={publishedNotes}
              agenda={agenda}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
