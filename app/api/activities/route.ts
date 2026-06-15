import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");
  const dealId = searchParams.get("dealId");
  const limit = Number(searchParams.get("limit") ?? "50");
  try {
    const activities = await prisma.activity.findMany({
      where: {
        ...(contactId ? { contactId } : {}),
        ...(dealId ? { dealId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(activities);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const activity = await prisma.activity.create({
      data: {
        type: body.type,
        content: body.content,
        contactId: body.contactId || null,
        dealId: body.dealId || null,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
