import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalContacts,
      totalDeals,
      deals,
      recentContacts,
      recentActivities,
    ] = await Promise.all([
      prisma.contact.count(),
      prisma.deal.count(),
      prisma.deal.findMany({
        select: { stage: true, value: true },
      }),
      prisma.contact.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, firstName: true, lastName: true, company: true, createdAt: true },
      }),
      prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          deal: { select: { id: true, title: true } },
        },
      }),
    ]);

    const pipelineValue = deals
      .filter((d) => d.stage !== "Lost")
      .reduce((sum, d) => sum + d.value, 0);

    const wonValue = deals
      .filter((d) => d.stage === "Won")
      .reduce((sum, d) => sum + d.value, 0);

    const stageBreakdown = deals.reduce(
      (acc, d) => {
        acc[d.stage] = (acc[d.stage] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      totalContacts,
      totalDeals,
      pipelineValue,
      wonValue,
      stageBreakdown,
      recentContacts,
      recentActivities,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
