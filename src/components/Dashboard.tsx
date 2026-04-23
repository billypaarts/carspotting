"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import Link from "next/link";

type LeaderboardUser = {
  id: string;
  name: string;
  currentNumber: number;
  isManaged: boolean;
  managedById: string | null;
};

type ManagedUser = {
  id: string;
  name: string;
  currentNumber: number;
};

type Props = {
  session: Session;
  leaderboard: LeaderboardUser[];
  currentNumber: number;
  managedUsers: ManagedUser[];
};

function formatPlate(n: number) {
  return String(n).padStart(3, "0");
}

export function Dashboard({
  session,
  leaderboard,
  currentNumber: initialNumber,
  managedUsers: initialManagedUsers,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentNumber, setCurrentNumber] = useState(initialNumber);
  const [managedUsers] = useState(initialManagedUsers);
  const [confirmingFor, setConfirmingFor] = useState<string | null>(null);
  const [loadingFor, setLoadingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function registerSighting(userId: string) {
    if (confirmingFor !== userId) {
      setConfirmingFor(userId);
      return;
    }

    setLoadingFor(userId);
    setConfirmingFor(null);
    setError(null);

    try {
      const res = await fetch("/api/sighting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Något gick fel");
        return;
      }

      if (userId === session.user.id) {
        setCurrentNumber(data.plateNumber);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Nätverksfel – försök igen");
    } finally {
      setLoadingFor(null);
    }
  }

  const nextPlate = formatPlate(currentNumber + 1);
  const currentPlate = currentNumber > 0 ? formatPlate(currentNumber) : null;

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 sm:p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight">Carspotting</h1>
        <div className="flex items-center gap-3">
          {session.user.isAdmin && (
            <Link
              href="/admin"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Logga ut
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* My card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-4">
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-1">
          Hej, {session.user.name}
        </p>

        {currentPlate ? (
          <p className="text-white/60 text-sm mb-4">
            Du har hittat{" "}
            <span className="text-white font-mono font-bold">{currentPlate}</span>
          </p>
        ) : (
          <p className="text-white/60 text-sm mb-4">Du har inte hittat några än</p>
        )}

        <div className="flex items-center gap-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
              Söker
            </p>
            <p className="text-6xl font-black font-mono tracking-tight">
              {nextPlate}
            </p>
          </div>

          <div className="flex-1 flex justify-end">
            <button
              onClick={() => registerSighting(session.user.id)}
              disabled={loadingFor === session.user.id || isPending}
              className={`
                px-6 py-3 rounded-xl font-semibold text-sm transition-all
                ${
                  confirmingFor === session.user.id
                    ? "bg-white text-black scale-105"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }
                disabled:opacity-40 disabled:cursor-not-allowed
              `}
            >
              {loadingFor === session.user.id
                ? "Sparar..."
                : confirmingFor === session.user.id
                ? `Bekräfta ${nextPlate}?`
                : "Hittad!"}
            </button>
          </div>
        </div>

        {confirmingFor === session.user.id && (
          <p className="mt-3 text-white/40 text-xs text-right">
            Klicka igen för att bekräfta, eller klicka någon annanstans för att avbryta
          </p>
        )}
      </div>

      {/* Managed users */}
      {managedUsers.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-4">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">
            Mina användare
          </p>
          <div className="space-y-3">
            {managedUsers.map((mu) => (
              <div
                key={mu.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-sm">{mu.name}</p>
                  <p className="text-white/40 text-xs font-mono">
                    Söker {formatPlate(mu.currentNumber + 1)}
                    {mu.currentNumber > 0 && (
                      <> · Hittad {formatPlate(mu.currentNumber)}</>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => registerSighting(mu.id)}
                  disabled={loadingFor === mu.id || isPending}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-semibold transition-all
                    ${
                      confirmingFor === mu.id
                        ? "bg-white text-black scale-105"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }
                    disabled:opacity-40 disabled:cursor-not-allowed
                  `}
                >
                  {loadingFor === mu.id
                    ? "Sparar..."
                    : confirmingFor === mu.id
                    ? "Bekräfta?"
                    : "Hittad!"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">
          Topplista
        </p>
        <div className="space-y-2">
          {leaderboard.map((user, i) => {
            const isMe = user.id === session.user.id;
            const rank = i + 1;
            return (
              <div
                key={user.id}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-colors
                  ${isMe ? "bg-white/10" : "hover:bg-white/5"}
                `}
              >
                <span
                  className={`
                    w-6 text-center text-sm font-mono font-bold
                    ${rank === 1 ? "text-white" : "text-white/30"}
                  `}
                >
                  {rank}
                </span>
                <span className="flex-1 text-sm font-medium">
                  {user.name}
                  {isMe && (
                    <span className="ml-2 text-white/30 text-xs">(du)</span>
                  )}
                  {user.isManaged && (
                    <span className="ml-2 text-white/30 text-xs">managed</span>
                  )}
                </span>
                <span
                  className={`
                    font-mono font-bold text-sm
                    ${user.currentNumber === 0 ? "text-white/20" : "text-white"}
                  `}
                >
                  {user.currentNumber === 0
                    ? "—"
                    : formatPlate(user.currentNumber)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Click outside to cancel confirm */}
      {confirmingFor && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setConfirmingFor(null)}
        />
      )}
    </div>
  );
}
