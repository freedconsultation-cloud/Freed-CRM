import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const staleThreshold = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  try {
    const [
      totalContacts,
      totalDeals,
      deals,
      recentContacts,
      recentActivities,
      overdueTasks,
      todayTasks,
      openDealsWithActivity,
    ] = await Promise.all([
      prisma.contact.count(),
      prisma.deal.count(),
      prisma.deal.findMany({ select: { stage: true, value: true } }),
      prisma.contact.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, firstName: true, lastName: true, company: true, createdAt: true },
      }),
      prisma.activity.findMany({
        where: { type: { not: "stage_change" } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          deal: { select: { id: true, title: true } },
        },
      }),
      prisma.task.findMany({
        where: { completed: false, dueDate: { lt: now } },
        orderBy: { dueDate: "asc" },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          deal: { select: { id: true, title: true } },
        },
      }),
      prisma.task.findMany({
        where: { completed: false, dueDate: { gte: now, lte: todayEnd } },
        orderBy: { dueDate: "asc" },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          deal: { select: { id: true, title: true } },
        },
      }),
      prisma.deal.findMany({
        where: { stage: { notIn: ["Won", "Lost"] } },
        include: {
          activities: { orderBy: { createdAt: "desc" }, take: 1 },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    const pipelineValue = deals.filter((d) => d.stage !== "Lost").reduce((s, d) => s + d.value, 0);
    const wonValue = deals.filter((d) => d.stage === "Won").reduce((s, d) => s + d.value, 0);
    const stageBreakdown = deals.reduce(
      (acc, d) => { acc[d.stage] = (acc[d.stage] ?? 0) + 1; return acc; },
      {} as Record<string, number>
    );

    const staleDeals = openDealsWithActivity
      .filter((d) => {
        const lastActive = d.activities[0]
          ? new Date(d.activities[0].createdAt)
          : new Date(d.createdAt);
        return lastActive < staleThreshold;
      })
      .slice(0, 5)
      .map((d) => ({ id: d.id, title: (d as any).title, contact: d.contact, stage: (d as any).stage }));

    return NextResponse.json({
      totalContacts,
      totalDeals,
      pipelineValue,
      wonValue,
      stageBreakdown,
      recentContacts,
      recentActivities,
      overdueTasks,
      todayTasks,
      staleDeals,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
