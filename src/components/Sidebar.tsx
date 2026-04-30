"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, RefreshCw, Clock, LogOut, Shield, TrendingUp } from "lucide-react";
import { mockEmergencyFund } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/cycle/april-2026", icon: RefreshCw, label: "Current Cycle", matchPrefix: "/cycle" },
  { href: "/history", icon: Clock, label: "History" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const displayName = user?.displayName ?? "User";
  const email = user?.email ?? "";
  const photoURL = user?.photoURL ?? null;
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <aside className="w-60 h-full flex flex-col shrink-0" style={{ background: "#06060C", borderRight: "1px solid #13132A" }}>

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
          style={{ background: "rgba(200,168,75,0.07)", border: "1px solid rgba(200,168,75,0.12)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#C8A84B" }} />
          <span className="text-xs font-medium" style={{ color: "#C8A84B" }}>
            April 2026 · Active
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.matchPrefix
            ? pathname.startsWith(item.matchPrefix)
            : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
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
                if (!isActive) (e.currentTarget as HTMLElement).style.color = "#9A98B4";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = "#8A88A0";
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
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" style={{ color: "#34D399" }} />
            <span className="text-xs font-medium" style={{ color: "#8A88A0" }}>
              Emergency Fund
            </span>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "#EBE5D0" }}>
              ₵{mockEmergencyFund.balance.toLocaleString()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>
              ₵{mockEmergencyFund.remainingBalance.toLocaleString()} after borrowing
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1A1A2C" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(mockEmergencyFund.remainingBalance / mockEmergencyFund.balance) * 100}%`,
                  background: "linear-gradient(90deg, #34D399 0%, #10B981 100%)",
                }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "#8A88A0" }}>Borrowed</span>
              <span className="font-medium" style={{ color: "#C8A84B" }}>
                –₵{mockEmergencyFund.totalBorrowed.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-4 pb-6" style={{ borderTop: "1px solid #13132A", paddingTop: "16px" }}>
        <div className="flex items-center gap-3 cursor-pointer group mt-1">
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
          <button onClick={handleSignOut} title="Sign out">
            <LogOut className="w-4 h-4 shrink-0 transition-colors hover:text-red-400" style={{ color: "#706E88" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
