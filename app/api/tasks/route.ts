import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");
  const dealId = searchParams.get("dealId");
  const filter = searchParams.get("filter"); // "open" | "overdue" | "today" | "all"

  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  let where: any = {};
  if (contactId) where.contactId = contactId;
  if (dealId) where.dealId = dealId;
  if (filter === "open") where.completed = false;
  if (filter === "overdue") {
    where.completed = false;
    where.dueDate = { lt: now };
  }
  if (filter === "today") {
    where.completed = false;
    where.dueDate = { lte: todayEnd };
  }

  try {
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(tasks);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const task = await prisma.task.create({
      data: {
        title: body.title,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        contactId: body.contactId || null,
        dealId: body.dealId || null,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
