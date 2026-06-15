import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        activities: { orderBy: { createdAt: "desc" }, include: { contact: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(deal);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const deal = await prisma.deal.update({
      where: { id },
      data: {
        title: body.title,
        value: Number(body.value) || 0,
        stage: body.stage,
        contactId: body.contactId || null,
        notes: body.notes ?? "",
        closedAt: body.stage === "Won" || body.stage === "Lost" ? new Date() : null,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
      },
    });
    return NextResponse.json(deal);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.deal.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
