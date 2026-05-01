"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, RefreshCw, Clock, LogOut, Shield, TrendingUp, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEmergencyFund } from "@/hooks/useEmergencyFund";
import { useActiveCycle } from "@/hooks/useActiveCycle";
import { signOut } from "@/lib/auth";
import { setEmergencyFundBalance } from "@/lib/firestore";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/cycle", icon: RefreshCw, label: "Current Cycle", matchPrefix: "/cycle" },
  { href: "/history", icon: Clock, label: "History" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const { balance } = useEmergencyFund(user?.uid);
  const { cycle, withdrawals } = useActiveCycle(user?.uid);

  const [editingEF, setEditingEF] = useState(false);
  const [efInput, setEfInput] = useState("");
  const [efSaving, setEfSaving] = useState(false);

  const totalBorrowed = withdrawals.reduce((s, w) => s + w.amount, 0);
  const remainingBalance = balance !== null ? balance : 0;

  const displayName = user?.displayName ?? "User";
  const email = user?.email ?? "";
  const photoURL = user?.photoURL ?? null;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  function startEditEF() {
    setEfInput(balance !== null ? String(balance) : "");
    setEditingEF(true);
  }

  async function handleSaveEF() {
    if (!user) return;
    const value = parseFloat(efInput);
    if (isNaN(value) || value < 0) return;
    setEfSaving(true);
    try {
      await setEmergencyFundBalance(user.uid, value);
      setEditingEF(false);
    } finally {
      setEfSaving(false);
    }
  }

  const cycleHref = cycle ? `/cycle/${cycle.id}` : "/dashboard";

  return (
    <aside
      className="w-60 h-full flex flex-col shrink-0"
      style={{ background: "#06060C", borderRight: "1px solid #13132A" }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-5" style={{ borderBottom: "1px solid #13132A" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
              boxShadow: "0 4px 16px rgba(200,168,75,0.3)",
            }}
          >
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: "#EBE5D0" }}>
            Bridge
          </span>
        </div>
      </div>

      {/* Active cycle pill */}
      <div className="px-4 pt-5 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: cycle ? "rgba(200,168,75,0.07)" : "rgba(110,108,130,0.07)",
            border: cycle ? "1px solid rgba(200,168,75,0.12)" : "1px solid rgba(110,108,130,0.12)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: cycle ? "#C8A84B" : "#706E88" }}
          />
          <span
            className="text-xs font-medium truncate"
            style={{ color: cycle ? "#C8A84B" : "#706E88" }}
          >
            {cycle ? `${cycle.name} · Active` : "No active cycle"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const href = item.label === "Current Cycle" ? cycleHref : item.href;
          const isActive = item.matchPrefix
            ? pathname.startsWith(item.matchPrefix)
            : pathname === item.href;

          return (
            <Link
              key={item.label}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={
                isActive
                  ? {
                      background: "rgba(200,168,75,0.1)",
                      borderLeft: "2px solid #C8A84B",
                      paddingLeft: "10px",
                      color: "#DEC070",
                    }
                  : { color: "#8A88A0" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "#C5C0D0";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "#8A88A0";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Emergency Fund widget */}
      <div className="px-4 py-4">
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" style={{ color: "#34D399" }} />
              <span className="text-xs font-medium" style={{ color: "#8A88A0" }}>
                Emergency Fund
              </span>
            </div>
            {!editingEF && balance !== null && (
              <button
                onClick={startEditEF}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                style={{ color: "#706E88" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.color = "#C5C0D0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#706E88";
                }}
                title="Edit balance"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>

          {balance === null ? (
            <div className="space-y-2">
              <div className="h-6 rounded-lg animate-pulse" style={{ background: "#131320" }} />
              <div className="h-3 rounded-lg animate-pulse w-2/3" style={{ background: "#131320" }} />
            </div>
          ) : editingEF ? (
            <div className="space-y-2">
              <div className="relative">
                <span
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: "#C8A84B" }}
                >
                  ₵
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={efInput}
                  onChange={(e) => setEfInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveEF(); if (e.key === "Escape") setEditingEF(false); }}
                  autoFocus
                  className="w-full pl-6 pr-2 py-1.5 rounded-lg text-sm font-semibold"
                  style={{
                    background: "#131320",
                    border: "1px solid rgba(200,168,75,0.3)",
                    color: "#EBE5D0",
                    outline: "none",
                  }}
                />
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleSaveEF}
                  disabled={efSaving}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-opacity"
                  style={{ background: "rgba(52,211,153,0.15)", color: "#34D399", opacity: efSaving ? 0.6 : 1 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(52,211,153,0.25)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(52,211,153,0.15)"; }}
                >
                  <Check className="w-3 h-3" />
                  {efSaving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditingEF(false)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: "#131320", color: "#706E88" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1A1A2C"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#131320"; }}
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xl font-bold" style={{ color: "#EBE5D0" }}>
                  ₵{remainingBalance.toLocaleString()}
                </p>
                {totalBorrowed > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>
                    ₵{totalBorrowed.toLocaleString()} borrowed this cycle
                  </p>
                )}
              </div>
              {totalBorrowed > 0 && remainingBalance + totalBorrowed > 0 && (
                <div className="space-y-1.5">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1A1A2C" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, (remainingBalance / (remainingBalance + totalBorrowed)) * 100))}%`,
                        background: "linear-gradient(90deg, #34D399 0%, #10B981 100%)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "#8A88A0" }}>Borrowed</span>
                    <span className="font-medium" style={{ color: "#C8A84B" }}>
                      –₵{totalBorrowed.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User */}
      <div
        className="px-4 pb-6"
        style={{ borderTop: "1px solid #13132A", paddingTop: "16px" }}
      >
        <div className="flex items-center gap-3 mt-1">
          <div
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0"
            style={
              photoURL
                ? undefined
                : { background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)", color: "#000" }
            }
          >
            {photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "#C5C0D0" }}>
              {displayName}
            </p>
            <p className="text-xs truncate" style={{ color: "#706E88" }}>
              {email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "#706E88" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)";
              (e.currentTarget as HTMLElement).style.color = "#F87171";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#706E88";
            }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}
