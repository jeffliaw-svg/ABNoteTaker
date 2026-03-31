"use client";

import { PublishedNotes } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface NotesViewProps {
  notes: PublishedNotes;
  onShare: () => void;
  onNewSession: () => void;
}

export function NotesView({ notes, onShare, onNewSession }: NotesViewProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Synopsis */}
      <div className="rounded-lg border bg-primary/5 p-6">
        <h2 className="mb-2 text-lg font-semibold">Synopsis</h2>
        <p className="text-sm leading-relaxed text-foreground/80">
          {notes.synopsis}
        </p>
      </div>

      {/* Notes tabs */}
      <Tabs defaultValue="brief">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="brief">Brief Notes</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Notes</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share via Email
            </Button>
            <Button variant="ghost" size="sm" onClick={onNewSession}>
              <RotateCcw className="mr-2 h-4 w-4" /> New Session
            </Button>
          </div>
        </div>

        <TabsContent value="brief" className="space-y-4 mt-4">
          {notes.briefNotes.map((note, i) => (
            <div key={i} className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">{note.agendaItemTitle}</h3>
              <div className="prose prose-sm max-w-none text-foreground/80">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4 mt-4">
          {notes.detailedNotes.map((note, i) => (
            <div key={i} className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">{note.agendaItemTitle}</h3>
              <div className="prose prose-sm max-w-none text-foreground/80">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
