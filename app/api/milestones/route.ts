import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_STAGES = ["Kickoff", "Discovery", "Build", "UAT", "Training", "Live"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get("dealId");
  if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });
  try {
    const milestones = await prisma.milestone.findMany({
      where: { dealId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(milestones);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { dealId } = await req.json();
    const existing = await prisma.milestone.count({ where: { dealId } });
    if (existing > 0) {
      const milestones = await prisma.milestone.findMany({ where: { dealId }, orderBy: { order: "asc" } });
      return NextResponse.json(milestones);
    }
    const milestones = await prisma.$transaction(
      DEFAULT_STAGES.map((name, i) =>
        prisma.milestone.create({
          data: { dealId, name, order: i, status: i === 0 ? "active" : "pending" },
        })
      )
    );
    return NextResponse.json(milestones, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
