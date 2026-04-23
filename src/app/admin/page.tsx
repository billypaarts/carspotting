import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPanel } from "@/components/AdminPanel";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (!session.user.isAdmin) redirect("/");

  const invites = await db.invite.findMany({
    orderBy: { createdAt: "desc" },
    include: { usedBy: { select: { name: true } } },
  });

  const allUsers = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      currentNumber: true,
      isManaged: true,
      isAdmin: true,
      managedById: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return <AdminPanel session={session} invites={invites} allUsers={allUsers} />;
}
