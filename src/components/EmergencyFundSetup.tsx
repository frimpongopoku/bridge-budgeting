"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, TrendingUp } from "lucide-react";
import { setEmergencyFundBalance } from "@/lib/firestore";

interface Props {
  userId: string;
}

export function EmergencyFundSetup({ userId }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const value = parseFloat(amount);
    if (!amount || isNaN(value) || value < 0) {
      setError("Please enter a valid balance (0 or greater).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await setEmergencyFundBalance(userId, value);
      // The real-time listener in useEmergencyFund will pick up the change
      // and the parent (layout) will unmount this modal automatically
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden"
          style={{ background: "#0E0E1C", border: "1px solid #1E1E32" }}
        >
          {/* Top glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #C8A84B, transparent)" }}
          />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            {/* Logo icon */}
            <div className="flex justify-center mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                  boxShadow: "0 8px 32px rgba(200,168,75,0.35)",
                }}
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-xl font-bold mb-2" style={{ color: "#EBE5D0" }}>
              Welcome to Bridge
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#8A88A0" }}>
              Before we get started, let&apos;s set up your Emergency Fund. This is
              the pool of money you draw from between paychecks.
            </p>
          </div>

          {/* EF info card */}
          <div className="px-8">
            <div
              className="rounded-2xl p-4 flex items-start gap-3 mb-6"
              style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(52,211,153,0.12)" }}
              >
                <Shield className="w-4 h-4" style={{ color: "#34D399" }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: "#34D399" }}>
                  Emergency Fund
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#8A88A0" }}>
                  Enter the current balance sitting in your emergency fund account.
                  Bridge will track withdrawals and replenishments from here.
                </p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="px-8 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                Current emergency fund balance
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold"
                  style={{ color: "#C8A84B" }}
                >
                  ₵
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="w-full pl-9 pr-4 py-3.5 rounded-xl text-lg font-semibold transition-colors"
                  style={{
                    background: "#131320",
                    border: error ? "1px solid rgba(248,113,113,0.5)" : "1px solid #1E1E30",
                    color: "#EBE5D0",
                    outline: "none",
                  }}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs" style={{ color: "#F87171" }}>
                  {error}
                </p>
              )}
              <p className="text-xs" style={{ color: "#5E5C74" }}>
                You can set this to ₵0 if you&apos;re starting fresh.
              </p>
            </div>

            {/* Save button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-opacity"
              style={{
                background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                color: "#000",
                boxShadow: "0 4px 20px rgba(200,168,75,0.3)",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span>Saving…</span>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>

          <div className="px-8 pb-8 pt-4">
            <p className="text-center text-xs" style={{ color: "#3E3C54" }}>
              You can update this balance at any time from your profile settings.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
