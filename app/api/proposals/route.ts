import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { dealId, notes } = await req.json();

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        contact: true,
        package: true,
      },
    });

    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const contactName = deal.contact
      ? `${deal.contact.firstName} ${deal.contact.lastName}`
      : "the client";
    const company = deal.contact?.company ?? "their organization";
    const pkg = deal.package;
    const packageInfo = pkg
      ? `Package: ${pkg.name} — $${pkg.price.toLocaleString()}${pkg.type === "monthly" ? "/mo" : ""}\n${pkg.description}`
      : `Deal value: $${deal.value.toLocaleString()}`;

    const prompt = `You are a professional consultant at Freed, a software consulting firm specializing in Smartsheet implementations.

Write a polished consulting proposal for the following engagement:

Client: ${contactName} at ${company}
${packageInfo}
Additional context: ${notes || deal.notes || "N/A"}

Write the full proposal with these sections:
1. Executive Summary (2-3 sentences)
2. Understanding of Your Needs (what problem we're solving)
3. Proposed Scope of Work (specific Smartsheet deliverables)
4. Project Timeline (reference our 6-phase process: Kickoff → Discovery → Build → UAT → Training → Live)
5. Investment (pricing breakdown)
6. Why Freed (2-3 differentiators)
7. Next Steps

Be specific, professional, and confident. Address the client directly. Do not use placeholder text.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    return NextResponse.json({ proposal: text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Proposal generation failed" }, { status: 500 });
  }
}
