"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, TrendingDown, TrendingUp, BarChart3, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCycles } from "@/hooks/useCycles";
import { calcAllocated } from "@/lib/firestore";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "#131320" }}
    />
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { cycles, loading } = useCycles(user?.uid);

  const reconciledCycles = cycles.filter((c) => c.status === "reconciled");

  // Derive stats dynamically
  const totalReconciled = reconciledCycles.length;

  // For history we store totalBorrowed on each cycle — we calculate EF impact as:
  // efAllocation (from income * percent) — but we don't store withdrawals here,
  // so we use efAllocationPercent * expectedIncome as a proxy for the net EF gain
  // (borrowed is repaid + allocation added, so net gain = allocation amount)
  const totalEFGain = reconciledCycles.reduce(
    (s, c) => s + calcAllocated(c.expectedIncome, c.emergencyFundAllocationType, c.emergencyFundAllocationValue),
    0
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <SkeletonBlock className="h-10 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonBlock key={i} className="h-28" />)}
        </div>
        <SkeletonBlock className="h-64" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-20" />)}
        </div>
      </div>
    );
  }

  // Empty state — no reconciled cycles
  if (!loading && reconciledCycles.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-2xl font-bold" style={{ color: "#EBE5D0" }}>
            History
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#8A88A0" }}>
            All past income cycles and their outcomes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="rounded-3xl p-12 flex flex-col items-center justify-center text-center"
          style={{
            background: "linear-gradient(135deg, #0E0A1A 0%, #0A0A14 100%)",
            border: "1px solid rgba(200,168,75,0.12)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}
          >
            <RefreshCw className="w-8 h-8" style={{ color: "#34D399" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#EBE5D0" }}>
            No history yet
          </h2>
          <p className="text-sm mb-6 max-w-xs" style={{ color: "#8A88A0" }}>
            Reconcile your first income cycle to start building your financial history.
          </p>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
              color: "#000",
              boxShadow: "0 4px 20px rgba(200,168,75,0.3)",
            }}
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Cycles Completed",
      value: totalReconciled.toString(),
      icon: CheckCircle2,
      color: "#34D399",
      bg: "rgba(52,211,153,0.08)",
      sub: "Reconciled cycles",
    },
    {
      label: "Total Borrowed",
      value: `₵${reconciledCycles.reduce((s, c) => {
        // We don't store totalBorrowed on cycle doc — show EF allocation as proxy
        return s;
      }, 0).toLocaleString()}`,
      icon: TrendingDown,
      color: "#E8A838",
      bg: "rgba(232,168,56,0.08)",
      sub: "All time from EF",
    },
    {
      label: "Avg EF Allocation",
      value:
        totalReconciled > 0
          ? `₵${Math.round(totalEFGain / totalReconciled).toLocaleString()}`
          : "–",
      icon: BarChart3,
      color: "#C8A84B",
      bg: "rgba(200,168,75,0.08)",
      sub: "Per cycle average",
    },
    {
      label: "EF Net Growth",
      value: `+₵${totalEFGain.toLocaleString()}`,
      icon: TrendingUp,
      color: "#A78BFA",
      bg: "rgba(167,139,250,0.08)",
      sub: "From income allocations",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold" style={{ color: "#EBE5D0" }}>
          History
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#8A88A0" }}>
          All past income cycles and their outcomes
        </p>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
        className="grid grid-cols-4 gap-4"
      >
        {statCards.map((s) => (
          <motion.div
            key={s.label}
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
      </motion.div>

      {/* EF Allocation trend chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.14 }}
        className="rounded-2xl p-6"
        style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>
              EF Allocation by Cycle
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>
              Amount added to emergency fund per reconciled cycle
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "#706E88" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#C8A84B" }} />
              <span>EF Allocation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#1E1E2C" }} />
              <span>Income</span>
            </div>
          </div>
        </div>

        {reconciledCycles.length === 0 ? (
          <div className="h-36 flex items-center justify-center">
            <p className="text-sm" style={{ color: "#8A88A0" }}>
              No data yet
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-6 h-36">
            {[...reconciledCycles].reverse().slice(0, 6).map((cycle, i) => {
              const efAmount = calcAllocated(
                cycle.expectedIncome,
                cycle.emergencyFundAllocationType,
                cycle.emergencyFundAllocationValue
              );
              const maxEF = Math.max(
                ...[...reconciledCycles].map((c) =>
                  calcAllocated(c.expectedIncome, c.emergencyFundAllocationType, c.emergencyFundAllocationValue)
                )
              );
              const pct = maxEF > 0 ? (efAmount / maxEF) * 100 : 0;

              return (
                <div key={cycle.id} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: "#C8A84B" }}>
                    ₵{efAmount.toLocaleString()}
                  </span>
                  <div
                    className="w-full rounded-xl overflow-hidden h-24"
                    style={{ background: "#131320" }}
                  >
                    <div className="w-full h-full flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.3 + i * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="w-full rounded-xl"
                        style={{
                          background: "linear-gradient(180deg, #DEC070 0%, #8B6520 100%)",
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-xs text-center truncate w-full"
                    style={{ color: "#706E88" }}
                  >
                    {cycle.name.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Cycle list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>
          Past Cycles
        </h2>

        {reconciledCycles.map((cycle, i) => {
          const efAmount = calcAllocated(
            cycle.expectedIncome,
            cycle.emergencyFundAllocationType,
            cycle.emergencyFundAllocationValue
          );
          const efLabel = cycle.emergencyFundAllocationType === "percent"
            ? `${cycle.emergencyFundAllocationValue}%`
            : `₵${cycle.emergencyFundAllocationValue.toLocaleString()} fixed`;
          const reconciledDate = cycle.reconciledAt
            ?.toDate?.()
            ?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

          return (
            <motion.div
              key={cycle.id}
              custom={i}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              whileHover={{ y: -1 }}
            >
              <Link href={`/cycle/${cycle.id}`}>
                <div
                  className="rounded-2xl p-5 cursor-pointer group transition-all"
                  style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(200,168,75,0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#1A1A2C")
                  }
                >
                  <div className="flex items-center gap-5">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(52,211,153,0.08)" }}
                    >
                      <CheckCircle2 className="w-5 h-5" style={{ color: "#34D399" }} />
                    </div>

                    {/* Name */}
                    <div className="w-36 shrink-0">
                      <p className="text-sm font-semibold" style={{ color: "#C5C0D0" }}>
                        {cycle.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#706E88" }}>
                        {reconciledDate ? `Closed ${reconciledDate}` : "Reconciled"}
                      </p>
                    </div>

                    {/* Income bar */}
                    <div className="flex-1 space-y-1.5">
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "#151520" }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cycle.emergencyFundAllocationType === "percent" ? cycle.emergencyFundAllocationValue : (cycle.emergencyFundAllocationValue / cycle.expectedIncome) * 100}%` }}
                          transition={{
                            duration: 0.7,
                            delay: 0.2 + i * 0.08,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="h-full rounded-full"
                          style={{
                            background: "linear-gradient(90deg, #C8A84B 0%, #DEC070 100%)",
                          }}
                        />
                      </div>
                      <div
                        className="flex justify-between text-xs"
                        style={{ color: "#706E88" }}
                      >
                        <span>
                          EF allocation: {efLabel} (₵{efAmount.toLocaleString()})
                        </span>
                        <span>Income: ₵{cycle.expectedIncome.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* EF impact */}
                    <div className="text-right w-28 shrink-0">
                      <p className="text-xs mb-0.5" style={{ color: "#706E88" }}>
                        EF added
                      </p>
                      <p className="text-sm font-bold" style={{ color: "#34D399" }}>
                        +₵{efAmount.toLocaleString()}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0"
                      style={{ color: "#5E5C74" }}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
