import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const targetUserId: string = body.userId ?? session.user.id;

  // Only admins can register for other users
  if (targetUserId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const nextNumber = targetUser.currentNumber + 1;

  const [, sighting] = await db.$transaction([
    db.user.update({
      where: { id: targetUserId },
      data: { currentNumber: nextNumber },
    }),
    db.sighting.create({
      data: {
        userId: targetUserId,
        plateNumber: nextNumber,
        registeredById: session.user.id,
      },
    }),
  ]);

  return NextResponse.json({ success: true, plateNumber: nextNumber, sighting });
}
