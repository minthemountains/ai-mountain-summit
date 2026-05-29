"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Moment {
  id: string;
  photoUrl: string;
  name: string;
  caption: string;
  approved: boolean;
  uploadedAt: string;
}

export default function AdminMomentsPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadMoments = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      // Load all moments (pending + approved) via a separate admin endpoint
      // For simplicity, we call the blob list via the approve endpoint with a GET trick
      // Instead, we load from the public endpoint and then also list pending
      const res = await fetch("/api/admin/moments", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) {
        setError("Falsches Passwort");
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setMoments(data);
      setAuthenticated(true);
      sessionStorage.setItem("admin_pw", pw);
    } catch {
      setError("Fehler beim Laden der Momente");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      loadMoments(saved);
    }
  }, [loadMoments]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await loadMoments(password);
  }

  async function handleApprove(id: string) {
    setActionLoading(id + "-approve");
    try {
      const res = await fetch(`/api/moments/${id}/approve`, {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("Failed");
      setMoments((prev) =>
        prev.map((m) => (m.id === id ? { ...m, approved: true } : m))
      );
    } catch {
      alert("Fehler beim Freigeben");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Dieses Foto wirklich löschen?")) return;
    setActionLoading(id + "-reject");
    try {
      const res = await fetch(`/api/moments/${id}/reject`, {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("Failed");
      setMoments((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Fehler beim Löschen");
    } finally {
      setActionLoading(null);
    }
  }

  const pending = moments.filter((m) => !m.approved);
  const approved = moments.filter((m) => m.approved);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-stone-800 mb-6">Admin — Summit Moments</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin-Passwort"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-brand-400 hover:bg-brand-700 disabled:opacity-40 text-stone-900 font-semibold rounded-xl py-3 transition-colors"
            >
              {loading ? "Laden…" : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Summit Moments — Admin</h1>
        <button
          onClick={() => loadMoments(password)}
          className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          Aktualisieren
        </button>
      </div>

      {/* Pending */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-stone-700 mb-4">
          Ausstehend ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-stone-400 text-sm">Keine ausstehenden Fotos</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pending.map((m) => (
              <MomentCard
                key={m.id}
                moment={m}
                onApprove={() => handleApprove(m.id)}
                onReject={() => handleReject(m.id)}
                approveLoading={actionLoading === m.id + "-approve"}
                rejectLoading={actionLoading === m.id + "-reject"}
              />
            ))}
          </div>
        )}
      </section>

      {/* Approved */}
      <section>
        <h2 className="text-lg font-semibold text-stone-700 mb-4">
          Freigegeben ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-stone-400 text-sm">Noch keine freigegebenen Fotos</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {approved.map((m) => (
              <MomentCard
                key={m.id}
                moment={m}
                onReject={() => handleReject(m.id)}
                rejectLoading={actionLoading === m.id + "-reject"}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MomentCard({
  moment,
  onApprove,
  onReject,
  approveLoading,
  rejectLoading,
}: {
  moment: Moment;
  onApprove?: () => void;
  onReject: () => void;
  approveLoading?: boolean;
  rejectLoading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="relative aspect-square bg-stone-100">
        <Image
          src={moment.photoUrl}
          alt={moment.caption || "Summit Moment"}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="p-3">
        {moment.name && (
          <p className="font-medium text-stone-800 text-sm truncate">{moment.name}</p>
        )}
        {moment.caption && (
          <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">{moment.caption}</p>
        )}
        <p className="text-stone-300 text-xs mt-1">
          {new Date(moment.uploadedAt).toLocaleString("de-CH")}
        </p>
        <div className="flex gap-2 mt-2">
          {onApprove && (
            <button
              onClick={onApprove}
              disabled={approveLoading}
              className="flex-1 bg-brand-400 hover:bg-brand-700 disabled:opacity-40 text-stone-900 text-xs font-semibold rounded-lg py-1.5 transition-colors"
            >
              {approveLoading ? "…" : "Freigeben"}
            </button>
          )}
          <button
            onClick={onReject}
            disabled={rejectLoading}
            className="flex-1 bg-red-100 hover:bg-red-200 disabled:opacity-40 text-red-700 text-xs font-semibold rounded-lg py-1.5 transition-colors"
          >
            {rejectLoading ? "…" : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
