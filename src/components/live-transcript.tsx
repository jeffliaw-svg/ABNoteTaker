"use client";

import { useEffect, useRef } from "react";
import { AgendaItem, TranscriptSegment } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LiveTranscriptProps {
  agenda: AgendaItem[];
  transcript: TranscriptSegment[];
  activeAgendaItemId: string | null;
  interimText: string;
  onSelectAgendaItem: (id: string) => void;
}

export function LiveTranscript({
  agenda,
  transcript,
  activeAgendaItemId,
  interimText,
  onSelectAgendaItem,
}: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimText]);

  const getSegmentCount = (itemId: string) =>
    transcript.filter((s) => s.agendaItemId === itemId).length;

  return (
    <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
      {/* Agenda sidebar */}
      <div className="space-y-1 overflow-y-auto rounded-lg border bg-card p-3">
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Agenda
        </h3>
        {agenda.map((item) => {
          const isActive = item.id === activeAgendaItemId;
          const count = getSegmentCount(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onSelectAgendaItem(item.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <span className="truncate">{item.title}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Transcript feed */}
      <div
        ref={scrollRef}
        className="overflow-y-auto rounded-lg border bg-card p-4"
      >
        {transcript.length === 0 && !interimText ? (
          <p className="text-center text-muted-foreground py-12">
            Listening... Start speaking and your transcript will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {transcript.map((segment, i) => {
              const agendaItem = agenda.find(
                (a) => a.id === segment.agendaItemId
              );
              return (
                <div key={i} className="flex gap-3">
                  <span className="shrink-0 mt-0.5 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {agendaItem?.title ?? "Unknown"}
                  </span>
                  <p className="text-sm leading-relaxed">{segment.text}</p>
                </div>
              );
            })}
            {interimText && (
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 rounded bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">
                  {agenda.find((a) => a.id === activeAgendaItemId)?.title ??
                    "..."}
                </span>
                <p className="text-sm leading-relaxed italic text-muted-foreground">
                  {interimText}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
