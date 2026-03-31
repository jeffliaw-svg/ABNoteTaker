import { AgendaItem, TranscriptSegment } from "./types";

export function buildPublishPrompt(
  agenda: AgendaItem[],
  transcript: TranscriptSegment[]
): string {
  const agendaList = agenda
    .map((item, i) => `${i + 1}. ${item.title}`)
    .join("\n");

  const groupedTranscript = agenda
    .map((item) => {
      const segments = transcript
        .filter((s) => s.agendaItemId === item.id)
        .map((s) => s.text)
        .join(" ");
      return `## ${item.title}\n${segments || "(No transcript captured for this section)"}`;
    })
    .join("\n\n");

  return `You are an expert note-taking assistant. A presenter just gave a live presentation and you have the transcript of their speech organized by agenda section.

Your job is to produce clean, well-organized notes from this transcript.

## Presentation Agenda
${agendaList}

## Transcript by Section
${groupedTranscript}

## Instructions
Produce a JSON object with exactly these fields:
- "synopsis": A 2-3 sentence executive summary of the entire presentation.
- "briefNotes": An array of objects, one per agenda item, each with "agendaItemTitle" (string) and "content" (string with concise markdown bullet points — key takeaways only).
- "detailedNotes": An array of objects, one per agenda item, each with "agendaItemTitle" (string) and "content" (string with comprehensive markdown notes including all key points, supporting details, examples mentioned, and any Q&A that occurred).

Rules:
- Use markdown formatting in the "content" fields (bullet points, bold for emphasis).
- Clean up filler words, false starts, and repetitions from the transcript.
- If a section has no transcript, note that in the content.
- Output ONLY the JSON object, no other text.`;
}
