import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes ?? "",
        completedAt: body.status === "complete" ? new Date() : null,
      },
    });
    return NextResponse.json(milestone);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
