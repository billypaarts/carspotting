import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      currentNumber: true,
      isManaged: true,
      managedById: true,
    },
    orderBy: [{ currentNumber: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ users });
}
