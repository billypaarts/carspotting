import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, inviteCode } = body;

  if (!name || !email || !password || !inviteCode) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  const invite = await db.invite.findUnique({
    where: { code: inviteCode },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Invalid invite code" },
      { status: 400 }
    );
  }

  if (invite.usedById) {
    return NextResponse.json(
      { error: "Invite code has already been used" },
      { status: 400 }
    );
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  await db.invite.update({
    where: { id: invite.id },
    data: {
      usedById: user.id,
      usedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
