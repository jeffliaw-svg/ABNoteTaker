import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PublishRequest, PublishedNotes } from "@/lib/types";
import { buildPublishPrompt } from "@/lib/prompt";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublishRequest;

    if (!body.agenda?.length || !body.transcript?.length) {
      return NextResponse.json(
        { error: "Agenda and transcript are required." },
        { status: 400 }
      );
    }

    const prompt = buildPublishPrompt(body.agenda, body.transcript);

    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from Claude." },
        { status: 500 }
      );
    }

    // Extract JSON from response — handle both raw JSON and ```json blocks
    let jsonStr = textBlock.text.trim();
    const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const notes: PublishedNotes = JSON.parse(jsonStr);

    if (!notes.synopsis || !notes.briefNotes || !notes.detailedNotes) {
      return NextResponse.json(
        { error: "Invalid response structure from Claude." },
        { status: 500 }
      );
    }

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: "Failed to generate notes. Please try again." },
      { status: 500 }
    );
  }
}
