"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Copy, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { mockHistoryCycles } from "@/lib/mock-data";

const totalReconciled = mockHistoryCycles.length;
const totalBorrowedAllTime = mockHistoryCycles.reduce((s, c) => s + c.totalBorrowed, 0);
const avgBorrowed = Math.round(totalBorrowedAllTime / totalReconciled);
const totalEFGain = mockHistoryCycles.reduce((s, c) => s + c.emergencyFundImpact, 0);

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const statCards = [
  { label: "Cycles Completed", value: totalReconciled.toString(), icon: CheckCircle2, color: "#34D399", bg: "rgba(52,211,153,0.08)", sub: "Since Jan 2026" },
  { label: "Total Borrowed", value: `₵${totalBorrowedAllTime.toLocaleString()}`, icon: TrendingDown, color: "#E8A838", bg: "rgba(232,168,56,0.08)", sub: "All time from EF" },
  { label: "Avg per Cycle", value: `₵${avgBorrowed.toLocaleString()}`, icon: BarChart3, color: "#C8A84B", bg: "rgba(200,168,75,0.08)", sub: "Borrowed on average" },
  { label: "EF Net Growth", value: `+₵${totalEFGain.toLocaleString()}`, icon: TrendingUp, color: "#A78BFA", bg: "rgba(167,139,250,0.08)", sub: "From income allocations" },
];

export default function HistoryPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold" style={{ color: "#EBE5D0" }}>History</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8A88A0" }}>All past income cycles and their outcomes</p>
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
            <p className="text-xs font-medium" style={{ color: "#8A88A0" }}>{s.label}</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "#EBE5D0" }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "#706E88" }}>{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Borrowing trend */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.14 }}
        className="rounded-2xl p-6"
        style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>Borrowing Trend</h2>
            <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>Amount borrowed per cycle</p>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "#706E88" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#C8A84B" }} />
              <span>Borrowed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#1E1E2C" }} />
              <span>Income</span>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-6 h-36">
          {[...mockHistoryCycles].reverse().map((cycle, i) => {
            const pct = (cycle.totalBorrowed / cycle.expectedIncome) * 100;
            return (
              <div key={cycle.id} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "#C8A84B" }}>
                  ₵{cycle.totalBorrowed.toLocaleString()}
                </span>
                <div className="w-full rounded-xl overflow-hidden h-24" style={{ background: "#131320" }}>
                  <div className="w-full h-full flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full rounded-xl"
                      style={{ background: "linear-gradient(180deg, #DEC070 0%, #8B6520 100%)" }}
                    />
                  </div>
                </div>
                <span className="text-xs text-center" style={{ color: "#706E88" }}>
                  {cycle.name.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Cycle list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>Past Cycles</h2>

        {mockHistoryCycles.map((cycle, i) => {
          const pct = (cycle.totalBorrowed / cycle.expectedIncome) * 100;
          const efPos = cycle.emergencyFundImpact > 0;

          return (
            <motion.div key={cycle.id} custom={i} initial="hidden" animate="show" variants={fadeUp} whileHover={{ y: -1 }}>
              <Link href={`/cycle/${cycle.id}`}>
                <div
                  className="rounded-2xl p-5 cursor-pointer group transition-all"
                  style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(200,168,75,0.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1A1A2C")}
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
                      <p className="text-sm font-semibold" style={{ color: "#C5C0D0" }}>{cycle.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#706E88" }}>Closed {cycle.closedAt}</p>
                    </div>

                    {/* Progress */}
                    <div className="flex-1 space-y-1.5">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#151520" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #C8A84B 0%, #DEC070 100%)" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs" style={{ color: "#706E88" }}>
                        <span> ₵{cycle.totalBorrowed.toLocaleString()} borrowed ({pct.toFixed(0)}%)</span>
                        <span>Income: ₵{cycle.expectedIncome.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* EF impact */}
                    <div className="text-right w-24 shrink-0">
                      <p className="text-xs mb-0.5" style={{ color: "#706E88" }}>EF impact</p>
                      <p className="text-sm font-bold" style={{ color: efPos ? "#34D399" : "#F87171" }}>
                        {efPos ? "+" : ""}${cycle.emergencyFundImpact.toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => e.preventDefault()}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: "#131320", color: "#6E6C82", border: "1px solid #1E1E2C" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,168,75,0.3)";
                          (e.currentTarget as HTMLElement).style.color = "#C8A84B";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "#1E1E2C";
                          (e.currentTarget as HTMLElement).style.color = "#6E6C82";
                        }}
                      >
                        <Copy className="w-3 h-3" />
                        Use as template
                      </button>
                      <ChevronRight
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        style={{ color: "#5E5C74" }}
                      />
                    </div>
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
