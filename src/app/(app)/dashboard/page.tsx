"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowDownCircle, Shield, Wallet, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  mockCycle,
  mockCategories,
  mockWithdrawals,
  mockEmergencyFund,
  calcAllocated,
} from "@/lib/mock-data";
import { NewCycleModal } from "@/components/NewCycleModal";

const totalBorrowed = mockCategories.reduce((s, c) => s + c.borrowed, 0);
const available = mockCycle.expectedIncome - totalBorrowed;
const borrowedPercent = (totalBorrowed / mockCycle.expectedIncome) * 100;

const statCards = [
  {
    label: "Expected Income",
    value: `₵${mockCycle.expectedIncome.toLocaleString()}`,
    icon: TrendingUp,
    color: "#C8A84B",
    bg: "rgba(200,168,75,0.08)",
    sub: "April 2026",
  },
  {
    label: "Total Borrowed",
    value: `₵${totalBorrowed.toLocaleString()}`,
    icon: ArrowDownCircle,
    color: "#E8A838",
    bg: "rgba(232,168,56,0.08)",
    sub: `${borrowedPercent.toFixed(0)}% of income`,
  },
  {
    label: "Emergency Fund",
    value: `₵${mockEmergencyFund.balance.toLocaleString()}`,
    icon: Shield,
    color: "#34D399",
    bg: "rgba(52,211,153,0.08)",
    sub: `₵${mockEmergencyFund.remainingBalance.toLocaleString()} remaining`,
  },
  {
    label: "Net Available",
    value: `₵${available.toLocaleString()}`,
    icon: Wallet,
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.08)",
    sub: "After all borrowing",
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);

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
              Wednesday, April 30, 2026
            </p>
            <h1 className="text-2xl font-bold mt-0.5" style={{ color: "#EBE5D0" }}>
              Good morning, Emmanuel
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

        {/* Hero — Active Cycle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <Link href="/cycle/april-2026">
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
                style={{ background: "radial-gradient(circle, rgba(200,168,75,0.12) 0%, transparent 70%)" }}
              />
              <div
                className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)" }}
              />

              <div className="relative flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(200,168,75,0.15)", color: "#C8A84B", border: "1px solid rgba(200,168,75,0.2)" }}
                    >
                      ACTIVE
                    </span>
                    <span className="text-xs" style={{ color: "#8A88A0" }}>Income cycle</span>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: "#EBE5D0" }}>
                    {mockCycle.name}
                  </h2>
                  <p className="text-sm" style={{ color: "#8A88A0" }}>
                    Expected income: ₵{mockCycle.expectedIncome.toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs mb-1" style={{ color: "#8A88A0" }}>Borrowed so far</p>
                  <p className="text-4xl font-bold" style={{ color: "#C8A84B" }}>
                    ₵{totalBorrowed.toLocaleString()}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>
                    of ₵{mockCycle.expectedIncome.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative mt-7 space-y-2">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${borrowedPercent}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #C8A84B 0%, #DEC070 100%)" }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#8A88A0" }}>{borrowedPercent.toFixed(1)}% of income borrowed</span>
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
              <p className="text-xs font-medium" style={{ color: "#8A88A0" }}>{s.label}</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: "#EBE5D0" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "#706E88" }}>{s.sub}</p>
            </motion.div>
          ))}
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
              <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>Budget Categories</h2>
              <Link
                href="/cycle/april-2026"
                className="flex items-center gap-1 text-xs font-medium transition-colors"
                style={{ color: "#C8A84B" }}
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {mockCategories.map((cat, i) => {
                const allocated = calcAllocated(mockCycle.expectedIncome, cat.allocationType, cat.allocationValue);
                const pct = Math.min((cat.borrowed / allocated) * 100, 100);
                const isOver = cat.borrowed > allocated;
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
                          <p className="text-sm font-semibold" style={{ color: "#C5C0D0" }}>{cat.name}</p>
                          <p className="text-xs" style={{ color: "#706E88" }}>{cat.allocationValue}% of income</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: isOver ? "#F87171" : "#EBE5D0" }}>
                          ₵{cat.borrowed.toLocaleString()}
                          <span className="text-xs font-normal ml-1" style={{ color: "#706E88" }}>
                            / ₵{allocated.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#151520" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: barColor }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs" style={{ color: "#706E88" }}>
                        ₵{(allocated - cat.borrowed).toLocaleString()} remaining
                      </span>
                      <span className="text-xs font-medium" style={{ color: barColor }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent activity — 2/5 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="col-span-2 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>Recent Withdrawals</h2>
              <Link href="/cycle/april-2026" className="text-xs font-medium" style={{ color: "#C8A84B" }}>
                See all
              </Link>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}>
              {mockWithdrawals.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  className="flex items-center gap-3 px-4 py-3.5"
                  style={{
                    borderBottom: i !== mockWithdrawals.length - 1 ? "1px solid #131320" : "none",
                  }}
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
                    <p className="text-xs" style={{ color: "#706E88" }}>{w.date}</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0" style={{ color: "#E8A838" }}>
                    –₵{w.amount.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Quick borrow CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "#0B0B16", border: "1px solid #1A1A2C" }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>Log a withdrawal</p>
                <p className="text-xs mt-0.5" style={{ color: "#706E88" }}>From your emergency fund</p>
              </div>
              <Link href="/cycle/april-2026">
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
      </div>
    </>
  );
}
