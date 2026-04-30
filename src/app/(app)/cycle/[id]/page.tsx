"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import {
  mockCycle,
  mockCategories,
  mockWithdrawals,
  mockEmergencyFund,
  calcAllocated,
} from "@/lib/mock-data";

const totalBorrowed = mockCategories.reduce((s, c) => s + c.borrowed, 0);
const efAllocation = calcAllocated(mockCycle.expectedIncome, "percent", mockCycle.emergencyFundAllocation);

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function CyclePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: "#6E6C82" }} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold" style={{ color: "#EBE5D0" }}>{mockCycle.name}</h1>
              <span
                className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: "rgba(200,168,75,0.12)", color: "#C8A84B", border: "1px solid rgba(200,168,75,0.2)" }}
              >
                ACTIVE
              </span>
            </div>
            <p className="text-sm mt-0.5" style={{ color: "#8A88A0" }}>
              Expected income: ${mockCycle.expectedIncome.toLocaleString()} · Started Apr 1, 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            style={{ background: "#0E0E1C", border: "1px solid #1A1A2C", color: "#6E6C82" }}
          >
            <Pencil className="w-4 h-4" />
            Edit Allocations
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
              color: "#000",
              boxShadow: "0 4px 20px rgba(52,211,153,0.25)",
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Reconcile Cycle
          </motion.button>
        </div>
      </motion.div>

      {/* Summary strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
        className="grid grid-cols-4 gap-4"
      >
        {[
          { label: "Expected Income", value: `$${mockCycle.expectedIncome.toLocaleString()}`, color: "#EBE5D0" },
          { label: "Total Borrowed", value: `$${totalBorrowed.toLocaleString()}`, color: "#E8A838" },
          { label: "EF After Borrowing", value: `$${mockEmergencyFund.remainingBalance.toLocaleString()}`, color: "#34D399" },
          { label: "EF Replenishment", value: `$${efAllocation.toLocaleString()}`, color: "#C8A84B" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4"
            style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "#8A88A0" }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-5 gap-6">
        {/* Allocations — 3/5 */}
        <div className="col-span-3 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>Category Allocations</h2>

            {mockCategories.map((cat, i) => {
              const allocated = calcAllocated(mockCycle.expectedIncome, cat.allocationType, cat.allocationValue);
              const remaining = allocated - cat.borrowed;
              const pct = Math.min((cat.borrowed / allocated) * 100, 100);
              const isOver = cat.borrowed > allocated;
              const isWarning = !isOver && pct > 80;
              const barColor = isOver ? "#F87171" : isWarning ? "#E8A838" : "#C8A84B";

              return (
                <motion.div
                  key={cat.id}
                  custom={i}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  whileHover={{ y: -1 }}
                  className="rounded-2xl p-5"
                  style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: "#131320", border: "1px solid #1A1A2C" }}
                      >
                        {cat.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#C5C0D0" }}>{cat.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#706E88" }}>
                          {cat.allocationValue}% · ${allocated.toLocaleString()} allocated
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOver && (
                        <div
                          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                          style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Over
                        </div>
                      )}
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "#131320" }}
                      >
                        <Pencil className="w-3.5 h-3.5" style={{ color: "#8A88A0" }} />
                      </button>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#131320" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: barColor }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span style={{ color: "#8A88A0" }}>
                      Borrowed: <span className="font-semibold" style={{ color: "#C5C0D0" }}>${cat.borrowed.toLocaleString()}</span>
                    </span>
                    <span className="font-semibold" style={{ color: remaining < 0 ? "#F87171" : "#34D399" }}>
                      {remaining < 0 ? "–" : "+"}${Math.abs(remaining).toLocaleString()} {remaining < 0 ? "over" : "left"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Emergency fund allocation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(52,211,153,0.05)",
              border: "1px solid rgba(52,211,153,0.12)",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(52,211,153,0.1)" }}
                >
                  <Shield className="w-5 h-5" style={{ color: "#34D399" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#C5C0D0" }}>Emergency Fund Replenishment</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>
                    {mockCycle.emergencyFundAllocation}% of income · ${efAllocation.toLocaleString()} allocated on reconciliation
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium" style={{ color: "#34D399" }}>
                Edit <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Withdrawal log — 2/5 */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="col-span-2 space-y-4"
        >
          {/* Quick borrow form */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "#0B0B16", border: "1px solid #1A1A2C" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "#EBE5D0" }}>Log a Withdrawal</p>
              <p className="text-xs mt-0.5" style={{ color: "#706E88" }}>From emergency fund</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: "#8A88A0" }}
                >
                  $
                </span>
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full pl-6 pr-3 py-2.5 rounded-xl text-sm placeholder-[#5E5C74] transition-colors"
                  style={{ background: "#131320", border: "1px solid #1E1E2C", color: "#EBE5D0" }}
                />
              </div>
              <select
                className="w-full px-3 py-2.5 rounded-xl text-sm transition-colors appearance-none"
                style={{ background: "#131320", border: "1px solid #1E1E2C", color: "#6E6C82" }}
              >
                <option value="" disabled>Select category</option>
                {mockCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Note (optional)"
                className="w-full px-3 py-2.5 rounded-xl text-sm placeholder-[#5E5C74] transition-colors"
                style={{ background: "#131320", border: "1px solid #1E1E2C", color: "#EBE5D0" }}
              />
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                  color: "#000",
                }}
              >
                <Plus className="w-4 h-4" />
                Log Withdrawal
              </motion.button>
            </div>
          </div>

          {/* Withdrawal list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>Withdrawal Log</h3>
              <span className="text-xs" style={{ color: "#706E88" }}>{mockWithdrawals.length} entries</span>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}>
              {mockWithdrawals.map((w, i) => (
                <motion.div
                  key={w.id}
                  custom={i}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className="flex items-center gap-3 px-4 py-3.5 group"
                  style={{ borderBottom: i !== mockWithdrawals.length - 1 ? "1px solid #131320" : "none" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                    style={{ background: "#131320" }}
                  >
                    {w.categoryEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#C5C0D0" }}>
                      {w.note || w.categoryName}
                    </p>
                    <p className="text-xs" style={{ color: "#706E88" }}>
                      {w.categoryName} · {w.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: "#E8A838" }}>
                      –${w.amount.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                        style={{ background: "#131320" }}
                      >
                        <Pencil className="w-3 h-3" style={{ color: "#8A88A0" }} />
                      </button>
                      <button
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                        style={{ background: "rgba(248,113,113,0.08)" }}
                      >
                        <Trash2 className="w-3 h-3" style={{ color: "#F87171" }} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div
              className="rounded-2xl px-4 py-3 flex justify-between items-center"
              style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
            >
              <span className="text-sm font-medium" style={{ color: "#8A88A0" }}>Total borrowed this cycle</span>
              <span className="text-base font-bold" style={{ color: "#E8A838" }}>–${totalBorrowed.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
