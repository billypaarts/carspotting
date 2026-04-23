import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const managedUsers = await db.user.findMany({
    where: { managedById: session.user.id },
    select: {
      id: true,
      name: true,
      currentNumber: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ managedUsers });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, managedById } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Admins can specify who manages the user, otherwise default to session user
  const ownerId =
    session.user.isAdmin && managedById ? managedById : session.user.id;

  // Validate that ownerId is a real user
  if (ownerId !== session.user.id) {
    const owner = await db.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return NextResponse.json({ error: "Manager user not found" }, { status: 404 });
    }
  }

  const managedUser = await db.user.create({
    data: {
      name: name.trim(),
      isManaged: true,
      managedById: ownerId,
    },
  });

  return NextResponse.json({ managedUser });
}
