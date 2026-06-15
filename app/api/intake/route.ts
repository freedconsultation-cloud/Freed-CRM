import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const contact = await prisma.contact.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        tags: ["intake"],
        notes: [
          body.useCase && `Use case: ${body.useCase}`,
          body.teamSize && `Team size: ${body.teamSize}`,
          body.timeline && `Timeline: ${body.timeline}`,
          body.budget && `Budget: ${body.budget}`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });

    const dealTitle = body.company
      ? `${body.company} — Smartsheet Project`
      : `${body.firstName} ${body.lastName} — Smartsheet Project`;

    await prisma.deal.create({
      data: {
        title: dealTitle,
        stage: "Lead",
        contactId: contact.id,
        notes: body.useCase ?? "",
      },
    });

    return NextResponse.json({ ok: true, contactId: contact.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
