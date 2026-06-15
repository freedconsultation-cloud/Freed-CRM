import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { deals: true } } },
    });
    return NextResponse.json(packages);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pkg = await prisma.package.create({
      data: {
        name: body.name,
        description: body.description ?? "",
        price: Number(body.price) || 0,
        type: body.type ?? "fixed",
      },
    });
    return NextResponse.json(pkg, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
