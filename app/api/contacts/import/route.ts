import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) ?? [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").trim().replace(/^"|"$/g, "");
    });
    return row;
  });
}

function mapRow(row: Record<string, string>) {
  const get = (...keys: string[]) =>
    keys.map((k) => row[k] ?? "").find((v) => v) ?? "";

  const firstName =
    get("first name", "firstname", "first_name") ||
    get("name", "full name", "fullname").split(" ")[0] || "";
  const lastName =
    get("last name", "lastname", "last_name") ||
    get("name", "full name", "fullname").split(" ").slice(1).join(" ") || "";
  const email = get("email", "email address", "e-mail");
  const phone = get("phone", "phone number", "mobile", "cell");
  const company = get("company", "organization", "org", "employer");
  const tags = get("tags", "tag", "labels")
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
  const notes = get("notes", "note", "comments", "description");

  return { firstName, lastName, email, phone, company, tags, notes };
}

export async function POST(req: Request) {
  try {
    const { csv } = await req.json();
    if (!csv) return NextResponse.json({ error: "No CSV data" }, { status: 400 });

    const rows = parseCSV(csv);
    if (rows.length === 0) return NextResponse.json({ error: "No rows parsed" }, { status: 400 });

    const mapped = rows.map(mapRow).filter((r) => r.firstName);

    const created = await prisma.contact.createMany({
      data: mapped.map((r) => ({
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email || null,
        phone: r.phone || null,
        company: r.company || null,
        tags: r.tags,
        notes: r.notes,
      })),
      skipDuplicates: false,
    });

    return NextResponse.json({ imported: created.count, total: rows.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
