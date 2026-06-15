import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(templates);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const template = await prisma.emailTemplate.create({
      data: { name: body.name, subject: body.subject ?? "", body: body.body ?? "" },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
