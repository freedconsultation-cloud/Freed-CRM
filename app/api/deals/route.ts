import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
      },
    });
    return NextResponse.json(deals);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const deal = await prisma.deal.create({
      data: {
        title: body.title,
        value: Number(body.value) || 0,
        stage: body.stage ?? "Lead",
        contactId: body.contactId || null,
        notes: body.notes ?? "",
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
      },
    });
    return NextResponse.json(deal, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
