import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      where: { company: { not: null } },
      include: {
        deals: { select: { id: true, value: true, stage: true, title: true } },
        _count: { select: { activities: true } },
      },
      orderBy: { company: "asc" },
    });

    const companyMap: Record<string, {
      name: string;
      contacts: typeof contacts;
      totalDeals: number;
      totalValue: number;
      wonValue: number;
      openDeals: number;
    }> = {};

    for (const c of contacts) {
      if (!c.company) continue;
      if (!companyMap[c.company]) {
        companyMap[c.company] = { name: c.company, contacts: [], totalDeals: 0, totalValue: 0, wonValue: 0, openDeals: 0 };
      }
      companyMap[c.company].contacts.push(c);
      for (const d of c.deals) {
        companyMap[c.company].totalDeals++;
        companyMap[c.company].totalValue += d.value;
        if (d.stage === "Won") companyMap[c.company].wonValue += d.value;
        if (d.stage !== "Won" && d.stage !== "Lost") companyMap[c.company].openDeals++;
      }
    }

    const accounts = Object.values(companyMap).sort((a, b) => b.totalValue - a.totalValue);
    return NextResponse.json(accounts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
