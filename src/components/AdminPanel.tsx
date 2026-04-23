"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Session } from "next-auth";

type Invite = {
  id: string;
  code: string;
  createdAt: Date;
  usedAt: Date | null;
  usedBy: { name: string } | null;
};

type User = {
  id: string;
  name: string;
  email: string | null;
  currentNumber: number;
  isManaged: boolean;
  isAdmin: boolean;
  managedById: string | null;
  createdAt: Date;
};

type Props = {
  session: Session;
  invites: Invite[];
  allUsers: User[];
};

function formatPlate(n: number) {
  return String(n).padStart(3, "0");
}

export function AdminPanel({ invites: initialInvites, allUsers: initialUsers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [invites, setInvites] = useState(initialInvites);
  const [users] = useState(initialUsers);
  const [newUserName, setNewUserName] = useState("");
  const [managedByUserId, setManagedByUserId] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const realUsers = users.filter((u) => !u.isManaged);

  async function createInvite() {
    setCreatingInvite(true);
    setError(null);
    try {
      const res = await fetch("/api/invite", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setInvites((prev) => [data.invite, ...prev]);
    } catch {
      setError("Nätverksfel");
    } finally {
      setCreatingInvite(false);
    }
  }

  async function createManagedUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserName.trim() || !managedByUserId) return;
    setCreatingUser(true);
    setError(null);

    try {
      const res = await fetch("/api/managed-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUserName.trim(), managedById: managedByUserId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setNewUserName("");
      setManagedByUserId("");
      startTransition(() => router.refresh());
    } catch {
      setError("Nätverksfel");
    } finally {
      setCreatingUser(false);
    }
  }

  function getInviteUrl(code: string) {
    return `${window.location.origin}/register?code=${code}`;
  }

  function copyInviteUrl(code: string) {
    navigator.clipboard.writeText(getInviteUrl(code));
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 sm:p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight">Admin</h1>
        <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">
          ← Tillbaka
        </Link>
      </header>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Invites */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
            Inbjudningskoder
          </p>
          <button
            onClick={createInvite}
            disabled={creatingInvite}
            className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            {creatingInvite ? "Skapar..." : "+ Ny kod"}
          </button>
        </div>

        {invites.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">Inga koder ännu</p>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  invite.usedBy ? "opacity-40" : "hover:bg-white/5"
                }`}
              >
                <code className="flex-1 font-mono text-xs text-white/70 truncate">
                  {invite.code}
                </code>
                {invite.usedBy ? (
                  <span className="text-xs text-white/30">
                    Använd av {invite.usedBy.name}
                  </span>
                ) : (
                  <button
                    onClick={() => copyInviteUrl(invite.code)}
                    className="text-xs text-white/50 hover:text-white transition-colors shrink-0"
                  >
                    {copied === invite.code ? "Kopierad!" : "Kopiera länk"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create managed user */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-4">
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">
          Lägg till hanterad användare
        </p>
        <form onSubmit={createManagedUser} className="space-y-3">
          <div>
            <label className="block text-xs text-white/40 mb-2">Namn</label>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
              placeholder="T.ex. Mamma"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-2">Hanteras av</label>
            <select
              value={managedByUserId}
              onChange={(e) => setManagedByUserId(e.target.value)}
              required
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
            >
              <option value="">Välj användare</option>
              {realUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={creatingUser || isPending}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40 text-sm"
          >
            {creatingUser ? "Skapar..." : "Skapa hanterad användare"}
          </button>
        </form>
      </div>

      {/* All users */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">
          Alla användare ({users.length})
        </p>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  {user.isAdmin && (
                    <span className="text-xs text-white/30 bg-white/10 px-2 py-0.5 rounded-full">
                      admin
                    </span>
                  )}
                  {user.isManaged && (
                    <span className="text-xs text-white/30 bg-white/10 px-2 py-0.5 rounded-full">
                      managed
                    </span>
                  )}
                </div>
                {user.email && (
                  <p className="text-xs text-white/30 truncate">{user.email}</p>
                )}
              </div>
              <span className="font-mono text-sm font-bold shrink-0">
                {user.currentNumber === 0 ? "—" : formatPlate(user.currentNumber)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
