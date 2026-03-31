export interface AgendaItem {
  id: string;
  index: number;
  title: string;
}

export interface TranscriptSegment {
  agendaItemId: string;
  text: string;
  timestamp: number;
}

export interface PublishedNotes {
  synopsis: string;
  briefNotes: AgendaNote[];
  detailedNotes: AgendaNote[];
}

export interface AgendaNote {
  agendaItemTitle: string;
  content: string;
}

export interface PublishRequest {
  agenda: AgendaItem[];
  transcript: TranscriptSegment[];
}

export interface ShareRequest {
  recipientEmails: string[];
  notes: PublishedNotes;
  agenda: AgendaItem[];
}

export type AppPhase = "input" | "recording" | "publishing" | "review";
