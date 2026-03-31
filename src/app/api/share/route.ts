import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ShareRequest } from "@/lib/types";
import { buildEmailHtml } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ShareRequest;

    if (!body.recipientEmails?.length || !body.notes) {
      return NextResponse.json(
        { error: "Recipients and notes are required." },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = buildEmailHtml(body.notes);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ABNoteTaker <notes@resend.dev>",
      to: body.recipientEmails,
      subject: "Presentation Notes — ABNoteTaker",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}
