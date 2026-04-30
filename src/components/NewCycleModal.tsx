"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { mockHistoryCycles, mockCategories, calcAllocated } from "@/lib/mock-data";

const INCOME = 3200;

interface Props {
  onClose: () => void;
}

export function NewCycleModal({ onClose }: Props) {
  const [cycleName, setCycleName] = useState("May 2026");
  const [expectedIncome, setExpectedIncome] = useState("3200");
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [copyMode, setCopyMode] = useState<"copy" | "fresh">("copy");

  const selectedCycle = mockHistoryCycles.find((c) => c.id === selectedCycleId);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-lg rounded-3xl pointer-events-auto overflow-hidden"
          style={{ background: "#0E0E1C", border: "1px solid #1E1E32" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5" style={{ borderBottom: "1px solid #1A1A2C" }}>
            <div>
              <h2 className="text-base font-bold" style={{ color: "#EBE5D0" }}>New Income Cycle</h2>
              <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>Set up your next budget cycle</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "#1A1A2C" }}
            >
              <X className="w-4 h-4" style={{ color: "#6E6C82" }} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>Cycle name</label>
                <input
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: "#151520", border: "1px solid #1E1E30", color: "#EBE5D0" }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>Expected income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "#6E6C82" }}>$</span>
                  <input
                    type="number"
                    value={expectedIncome}
                    onChange={(e) => setExpectedIncome(e.target.value)}
                    className="w-full pl-6 pr-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: "#151520", border: "1px solid #1E1E30", color: "#EBE5D0" }}
                  />
                </div>
              </div>
            </div>

            {/* Setup mode toggle */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#8A88A0" }}>
                Category setup
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCopyMode("copy")}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left"
                  style={
                    copyMode === "copy"
                      ? { background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)", color: "#DEC070" }
                      : { background: "#131320", border: "1px solid #1E1E30", color: "#8A88A0" }
                  }
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  Copy from previous
                </button>
                <button
                  onClick={() => { setCopyMode("fresh"); setSelectedCycleId(null); }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left"
                  style={
                    copyMode === "fresh"
                      ? { background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)", color: "#DEC070" }
                      : { background: "#131320", border: "1px solid #1E1E30", color: "#8A88A0" }
                  }
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  Start fresh
                </button>
              </div>
            </div>

            {/* Cycle picker (copy mode) */}
            <AnimatePresence>
              {copyMode === "copy" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3 overflow-hidden"
                >
                  <p className="text-xs" style={{ color: "#8A88A0" }}>
                    Select a past cycle to copy its category allocations
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {mockHistoryCycles.slice(0, 3).map((cycle) => (
                      <button
                        key={cycle.id}
                        onClick={() => setSelectedCycleId(cycle.id === selectedCycleId ? null : cycle.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                        style={
                          selectedCycleId === cycle.id
                            ? { background: "rgba(200,168,75,0.15)", border: "1px solid #C8A84B", color: "#DEC070" }
                            : { background: "#131320", border: "1px solid #1E1E30", color: "#6E6C82" }
                        }
                      >
                        {selectedCycleId === cycle.id && <Check className="w-3 h-3" />}
                        {cycle.name}
                      </button>
                    ))}
                  </div>

                  {/* Category preview */}
                  <AnimatePresence>
                    {selectedCycleId && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-2xl p-4 space-y-3"
                        style={{ background: "#0B0B16", border: "1px solid #1A1A2C" }}
                      >
                        <p className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                          Will copy these {mockCategories.length} categories:
                        </p>
                        <div className="space-y-2">
                          {mockCategories.map((cat) => {
                            const income = Number(expectedIncome) || INCOME;
                            const allocated = calcAllocated(income, cat.allocationType, cat.allocationValue);
                            return (
                              <div key={cat.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{cat.emoji}</span>
                                  <span className="text-xs font-medium" style={{ color: "#C5C0D0" }}>
                                    {cat.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs" style={{ color: "#8A88A0" }}>
                                    {cat.allocationValue}%
                                  </span>
                                  <span className="text-xs font-semibold" style={{ color: "#C8A84B" }}>
                                    ${allocated.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div
                          className="flex items-center justify-between pt-2"
                          style={{ borderTop: "1px solid #1A1A2C" }}
                        >
                          <span className="text-xs" style={{ color: "#8A88A0" }}>Total allocated</span>
                          <span className="text-xs font-bold" style={{ color: "#DEC070" }}>
                            {mockCategories.reduce((s, c) => s + c.allocationValue, 0)}% · $
                            {mockCategories
                              .reduce((s, c) => s + calcAllocated(Number(expectedIncome) || INCOME, c.allocationType, c.allocationValue), 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: "1px solid #1A1A2C" }}
          >
            <button
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              style={{ color: "#8A88A0" }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                color: "#000",
                boxShadow: "0 4px 16px rgba(200,168,75,0.3)",
              }}
            >
              Create Cycle
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
