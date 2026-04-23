import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await getSession();
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invites = await db.invite.findMany({
    where: { createdById: session.user.id },
    include: { usedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invites });
}

export async function POST() {
  const session = await getSession();
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const code = randomBytes(8).toString("hex");

  const invite = await db.invite.create({
    data: {
      code,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ invite });
}
