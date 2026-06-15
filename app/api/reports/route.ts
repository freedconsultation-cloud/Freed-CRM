import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STAGE_PROBABILITY: Record<string, number> = {
  Lead: 0.10,
  Qualified: 0.25,
  Proposal: 0.50,
  Negotiation: 0.75,
  Won: 1.0,
  Lost: 0,
};

export async function GET() {
  try {
    const [allDeals, allContacts] = await Promise.all([
      prisma.deal.findMany({
        include: { package: { select: { id: true, name: true } } },
        orderBy: { closedAt: "asc" },
      }),
      prisma.contact.findMany({ select: { source: true } }),
    ]);

    const won = allDeals.filter((d) => d.stage === "Won");
    const lost = allDeals.filter((d) => d.stage === "Lost");
    const closed = won.length + lost.length;
    const totalRevenue = won.reduce((s, d) => s + d.value, 0);
    const winRate = closed > 0 ? won.length / closed : 0;
    const avgDealSize = won.length > 0 ? totalRevenue / won.length : 0;

    // Weighted pipeline forecast
    const openDeals = allDeals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
    const weightedForecast = openDeals.reduce(
      (s, d) => s + d.value * (STAGE_PROBABILITY[d.stage] ?? 0),
      0
    );

    // Monthly revenue (last 12 months)
    const now = new Date();
    const months: { label: string; revenue: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const y = d.getFullYear();
      const m = d.getMonth();
      const wonThisMonth = won.filter((deal) => {
        const cd = deal.closedAt ? new Date(deal.closedAt) : null;
        return cd && cd.getFullYear() === y && cd.getMonth() === m;
      });
      months.push({ label, revenue: wonThisMonth.reduce((s, d) => s + d.value, 0), count: wonThisMonth.length });
    }

    // Package performance
    const pkgMap: Record<string, { name: string; revenue: number; count: number }> = {};
    for (const deal of won) {
      if (deal.package) {
        const n = deal.package.name;
        if (!pkgMap[n]) pkgMap[n] = { name: n, revenue: 0, count: 0 };
        pkgMap[n].revenue += deal.value;
        pkgMap[n].count++;
      }
    }
    const packagePerformance = Object.values(pkgMap).sort((a, b) => b.revenue - a.revenue);

    // Stage breakdown
    const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
    const stageBreakdown = stages.map((stage) => {
      const stageDeal = allDeals.filter((d) => d.stage === stage);
      return {
        stage,
        count: stageDeal.length,
        value: stageDeal.reduce((s, d) => s + d.value, 0),
        probability: STAGE_PROBABILITY[stage] ?? 0,
      };
    });

    // Source breakdown
    const sourceMap: Record<string, number> = {};
    for (const c of allContacts) {
      const s = c.source || "Unknown";
      sourceMap[s] = (sourceMap[s] ?? 0) + 1;
    }
    const sourceBreakdown = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalRevenue,
      winRate,
      avgDealSize,
      totalWon: won.length,
      totalLost: lost.length,
      weightedForecast,
      monthlyRevenue: months,
      packagePerformance,
      stageBreakdown,
      sourceBreakdown,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
