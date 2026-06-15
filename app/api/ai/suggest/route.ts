import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { type, context } = await req.json();

    const prompts: Record<string, string> = {
      email: `Write a concise, professional follow-up email for this CRM context. Return only the email body (no subject line, no preamble).\n\nContext:\n${context}`,
      summary: `Summarize this contact's CRM history in 2-3 sentences. Focus on relationship status and next steps.\n\nContext:\n${context}`,
      nextStep: `Based on this CRM context, suggest the single most impactful next action to advance the relationship. Be specific and brief (1-2 sentences).\n\nContext:\n${context}`,
    };

    const prompt = prompts[type] ?? prompts.summary;

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
