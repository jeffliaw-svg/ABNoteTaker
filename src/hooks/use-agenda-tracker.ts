"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AgendaItem, TranscriptSegment } from "@/lib/types";

interface UseAgendaTrackerReturn {
  activeItemId: string | null;
  setActiveItemId: (id: string) => void;
  transcript: TranscriptSegment[];
}

export function useAgendaTracker(
  agendaItems: AgendaItem[],
  finalSegments: string[]
): UseAgendaTrackerReturn {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const processedCountRef = useRef(0);
  const activeItemIdRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    activeItemIdRef.current = activeItemId;
  }, [activeItemId]);

  // Set the first agenda item as active when agenda changes
  useEffect(() => {
    if (agendaItems.length > 0 && !activeItemId) {
      setActiveItemId(agendaItems[0].id);
    }
  }, [agendaItems, activeItemId]);

  // Process new final segments into transcript segments
  useEffect(() => {
    if (finalSegments.length > processedCountRef.current) {
      const newSegments = finalSegments.slice(processedCountRef.current);
      const currentActiveId = activeItemIdRef.current;

      if (currentActiveId) {
        const newTranscriptSegments: TranscriptSegment[] = newSegments.map(
          (text) => ({
            agendaItemId: currentActiveId,
            text,
            timestamp: Date.now(),
          })
        );
        setTranscript((prev) => [...prev, ...newTranscriptSegments]);
      }
      processedCountRef.current = finalSegments.length;
    }
  }, [finalSegments]);

  const handleSetActiveItemId = useCallback((id: string) => {
    setActiveItemId(id);
  }, []);

  return {
    activeItemId,
    setActiveItemId: handleSetActiveItemId,
    transcript,
  };
}
