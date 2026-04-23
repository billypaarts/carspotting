import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Dashboard } from "@/components/Dashboard";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
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

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      currentNumber: true,
      managedUsers: {
        select: {
          id: true,
          name: true,
          currentNumber: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <Dashboard
      session={session}
      leaderboard={users}
      currentNumber={currentUser?.currentNumber ?? 0}
      managedUsers={currentUser?.managedUsers ?? []}
    />
  );
}
