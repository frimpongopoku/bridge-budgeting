"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ArrowDownCircle,
  Shield,
  Wallet,
  Plus,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useActiveCycle } from "@/hooks/useActiveCycle";
import { useEmergencyFund } from "@/hooks/useEmergencyFund";
import { NewCycleModal } from "@/components/NewCycleModal";
import { calcAllocated } from "@/lib/firestore";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "#131320" }}
    />
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const { cycle, categories, withdrawals, loading } = useActiveCycle(user?.uid);
  const { balance } = useEmergencyFund(user?.uid);

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  const totalBorrowed = withdrawals.reduce((s, w) => s + w.amount, 0);
  const available = cycle ? cycle.expectedIncome - totalBorrowed : 0;
  const borrowedPercent = cycle ? (totalBorrowed / cycle.expectedIncome) * 100 : 0;

  const efAllocationAmount = cycle
    ? calcAllocated(cycle.expectedIncome, cycle.emergencyFundAllocationType, cycle.emergencyFundAllocationValue)
    : 0;
  const projectedEF = balance !== null && cycle
    ? balance + totalBorrowed + efAllocationAmount
    : null;

  const statCards = [
    {
      label: "Expected Income",
      value: cycle ? `₵${cycle.expectedIncome.toLocaleString()}` : "–",
      icon: TrendingUp,
      color: "#C8A84B",
      bg: "rgba(200,168,75,0.08)",
      sub: cycle?.name ?? "No active cycle",
    },
    {
      label: "Total Borrowed",
      value: `₵${totalBorrowed.toLocaleString()}`,
      icon: ArrowDownCircle,
      color: "#E8A838",
      bg: "rgba(232,168,56,0.08)",
      sub: cycle ? `${borrowedPercent.toFixed(0)}% of income` : "–",
    },
    {
      label: "Net Available",
      value: cycle ? `₵${available.toLocaleString()}` : "–",
      icon: Wallet,
      color: "#A78BFA",
      bg: "rgba(167,139,250,0.08)",
      sub: "After all borrowing",
    },
  ];

  return (
    <>
      {showModal && <NewCycleModal onClose={() => setShowModal(false)} />}

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between"
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "#706E88" }}>
              {formatDate()}
            </p>
            <h1 className="text-2xl font-bold mt-0.5" style={{ color: "#EBE5D0" }}>
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
              color: "#000",
              boxShadow: "0 4px 20px rgba(200,168,75,0.3)",
            }}
          >
            <Plus className="w-4 h-4" />
            New Cycle
          </motion.button>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-6">
            <SkeletonBlock className="h-44 rounded-3xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <SkeletonBlock key={i} className="h-28" />)}
            </div>
          </div>
        )}

        {/* No active cycle — empty state */}
        {!loading && !cycle && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-3xl p-12 flex flex-col items-center justify-center text-center"
            style={{
              background: "linear-gradient(135deg, #0E0A1A 0%, #0A0A14 100%)",
              border: "1px solid rgba(200,168,75,0.12)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: "rgba(200,168,75,0.08)",
                border: "1px solid rgba(200,168,75,0.15)",
              }}
            >
              <RefreshCw className="w-8 h-8" style={{ color: "#C8A84B" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#EBE5D0" }}>
              No active cycle
            </h2>
            <p className="text-sm mb-6 max-w-xs" style={{ color: "#8A88A0" }}>
              Start a new income cycle to begin tracking your emergency fund borrowing.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                color: "#000",
                boxShadow: "0 4px 20px rgba(200,168,75,0.3)",
              }}
            >
              <Plus className="w-4 h-4" />
              Create your first cycle
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Active cycle content */}
        {!loading && cycle && (
          <>
            {/* Hero — Active Cycle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              <Link href={`/cycle/${cycle.id}`}>
                <div
                  className="relative rounded-3xl p-7 overflow-hidden cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, #151020 0%, #0E0A1A 50%, #110E08 100%)",
                    border: "1px solid rgba(200,168,75,0.2)",
                  }}
                >
                  {/* Glow orbs */}
                  <div
                    className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(200,168,75,0.12) 0%, transparent 70%)",
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)",
                    }}
                  />

                  <div className="relative flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(200,168,75,0.15)",
                            color: "#C8A84B",
                            border: "1px solid rgba(200,168,75,0.2)",
                          }}
                        >
                          ACTIVE
                        </span>
                        <span className="text-xs" style={{ color: "#8A88A0" }}>
                          Income cycle
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold" style={{ color: "#EBE5D0" }}>
                        {cycle.name}
                      </h2>
                      <p className="text-sm" style={{ color: "#8A88A0" }}>
                        Expected income: ₵{cycle.expectedIncome.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs mb-1" style={{ color: "#8A88A0" }}>
                        Borrowed so far
                      </p>
                      <p className="text-4xl font-bold" style={{ color: "#C8A84B" }}>
                        ₵{totalBorrowed.toLocaleString()}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>
                        of ₵{cycle.expectedIncome.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative mt-7 space-y-2">
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(borrowedPercent, 100)}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            borrowedPercent > 100
                              ? "#F87171"
                              : borrowedPercent > 80
                              ? "#E8A838"
                              : "linear-gradient(90deg, #C8A84B 0%, #DEC070 100%)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#8A88A0" }}>
                        {borrowedPercent.toFixed(1)}% of income borrowed
                      </span>
                      <span
                        className="flex items-center gap-1 transition-all group-hover:gap-2"
                        style={{ color: "#C8A84B" }}
                      >
                        View cycle <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Stat cards */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-4 gap-4"
            >
              {statCards.map((s) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl p-5"
                  style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: s.bg }}
                  >
                    <s.icon style={{ width: 18, height: 18, color: s.color }} />
                  </div>
                  <p className="text-xs font-medium" style={{ color: "#8A88A0" }}>
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: "#EBE5D0" }}>
                    {s.value}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#706E88" }}>
                    {s.sub}
                  </p>
                </motion.div>
              ))}

              {/* EF — projected reconciliation card */}
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -2 }}
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #071A12 0%, #0A0E1A 100%)",
                  border: "1px solid rgba(52,211,153,0.2)",
                }}
              >
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)" }}
                />
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(52,211,153,0.1)" }}
                >
                  <Shield style={{ width: 18, height: 18, color: "#34D399" }} />
                </div>
                <p className="text-xs font-medium" style={{ color: "#8A88A0" }}>
                  Emergency Fund
                </p>
                {/* Current balance */}
                <p className="text-sm font-semibold mt-0.5" style={{ color: "#5A7A6A" }}>
                  {balance !== null ? `₵${balance.toLocaleString()}` : "–"} now
                </p>
                {/* Projected reconciled */}
                <p className="text-2xl font-bold mt-1" style={{ color: "#34D399" }}>
                  {projectedEF !== null ? `₵${projectedEF.toLocaleString()}` : "–"}
                </p>
                <p className="text-xs mt-1" style={{ color: "#4A9A6A" }}>
                  after reconciliation
                </p>
              </motion.div>
            </motion.div>

            {/* Categories + Activity */}
            <div className="grid grid-cols-5 gap-6">
              {/* Categories — 3/5 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 }}
                className="col-span-3 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>
                    Budget Categories
                  </h2>
                  <Link
                    href={`/cycle/${cycle.id}`}
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: "#C8A84B" }}
                  >
                    Manage <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {categories.length === 0 ? (
                  <div
                    className="rounded-2xl p-8 text-center"
                    style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                  >
                    <p className="text-sm" style={{ color: "#8A88A0" }}>
                      No categories yet.{" "}
                      <Link href={`/cycle/${cycle.id}`} style={{ color: "#C8A84B" }}>
                        Add one →
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((cat, i) => {
                      const allocated = calcAllocated(
                        cycle.expectedIncome,
                        cat.allocationType,
                        cat.allocationValue
                      );
                      const catWithdrawals = withdrawals
                        .filter((w) => w.categoryId === cat.id)
                        .reduce((s, w) => s + w.amount, 0);
                      const pct = allocated > 0 ? Math.min((catWithdrawals / allocated) * 100, 100) : 0;
                      const isOver = catWithdrawals > allocated;
                      const isWarning = !isOver && pct > 80;
                      const barColor = isOver ? "#F87171" : isWarning ? "#E8A838" : "#C8A84B";

                      return (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
                          whileHover={{ y: -1 }}
                          className="rounded-2xl p-4"
                          style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                                style={{ background: "#131320" }}
                              >
                                {cat.emoji}
                              </div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: "#C5C0D0" }}>
                                  {cat.name}
                                </p>
                                <p className="text-xs" style={{ color: "#706E88" }}>
                                  {cat.allocationType === "percent"
                                    ? `${cat.allocationValue}% of income`
                                    : `₵${cat.allocationValue.toLocaleString()} fixed`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className="text-sm font-bold"
                                style={{ color: isOver ? "#F87171" : "#EBE5D0" }}
                              >
                                ₵{catWithdrawals.toLocaleString()}
                                <span
                                  className="text-xs font-normal ml-1"
                                  style={{ color: "#706E88" }}
                                >
                                  / ₵{allocated.toLocaleString()}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: "#151520" }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{
                                duration: 0.8,
                                delay: 0.4 + i * 0.08,
                                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                              }}
                              className="h-full rounded-full"
                              style={{ background: barColor }}
                            />
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs" style={{ color: "#706E88" }}>
                              ₵{(allocated - catWithdrawals).toLocaleString()} remaining
                            </span>
                            <span className="text-xs font-medium" style={{ color: barColor }}>
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Recent activity — 2/5 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
                className="col-span-2 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>
                    Recent Withdrawals
                  </h2>
                  <Link
                    href={`/cycle/${cycle.id}`}
                    className="text-xs font-medium"
                    style={{ color: "#C8A84B" }}
                  >
                    See all
                  </Link>
                </div>

                {withdrawals.length === 0 ? (
                  <div
                    className="rounded-2xl p-6 text-center"
                    style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                  >
                    <p className="text-sm" style={{ color: "#8A88A0" }}>
                      No withdrawals yet.
                    </p>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                  >
                    {withdrawals.slice(0, 5).map((w, i) => {
                      const date =
                        w.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }) ?? "";
                      return (
                        <motion.div
                          key={w.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.35 + i * 0.06 }}
                          className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                          style={{
                            borderBottom:
                              i !== Math.min(withdrawals.length, 5) - 1
                                ? "1px solid #131320"
                                : "none",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                            style={{ background: "#131320" }}
                          >
                            {w.categoryEmoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: "#C5C0D0" }}
                            >
                              {w.note || w.categoryName}
                            </p>
                            <p className="text-xs" style={{ color: "#706E88" }}>
                              {date}
                            </p>
                          </div>
                          <span
                            className="text-sm font-semibold shrink-0"
                            style={{ color: "#E8A838" }}
                          >
                            –₵{w.amount.toLocaleString()}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Quick borrow CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="rounded-2xl p-4 space-y-3"
                  style={{ background: "#0B0B16", border: "1px solid #1A1A2C" }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>
                      Log a withdrawal
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#706E88" }}>
                      From your emergency fund
                    </p>
                  </div>
                  <Link href={`/cycle/${cycle.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                        color: "#000",
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Withdrawal
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
