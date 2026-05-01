"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCycles } from "@/hooks/useCycles";
import { getCategories, createCycle, calcAllocated } from "@/lib/firestore";
import { Category } from "@/types";

interface Props {
  onClose: () => void;
}

function getDefaultCycleName() {
  const now = new Date();
  return now.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function NewCycleModal({ onClose }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { cycles } = useCycles(user?.uid);

  const [cycleName, setCycleName] = useState(getDefaultCycleName());
  const [expectedIncome, setExpectedIncome] = useState("3200");
  const [efAllocationType, setEfAllocationType] = useState<"percent" | "fixed">("fixed");
  const [efValue, setEfValue] = useState("640");
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [copyMode, setCopyMode] = useState<"copy" | "fresh">("copy");
  const [previewCategories, setPreviewCategories] = useState<Category[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Reconciled cycles available for copying
  const reconciledCycles = cycles.filter((c) => c.status === "reconciled");

  async function handleSelectCycle(cycleId: string) {
    if (!user) return;
    if (cycleId === selectedCycleId) {
      setSelectedCycleId(null);
      setPreviewCategories([]);
      return;
    }
    setSelectedCycleId(cycleId);
    setLoadingPreview(true);
    try {
      const cats = await getCategories(user.uid, cycleId);
      setPreviewCategories(cats);
    } catch (err) {
      console.error(err);
      setPreviewCategories([]);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleCreate() {
    if (!user) return;
    const income = parseFloat(expectedIncome);
    const ef = parseFloat(efValue);
    if (!cycleName.trim()) { setError("Cycle name is required."); return; }
    if (!expectedIncome || isNaN(income) || income <= 0) { setError("Enter a valid expected income."); return; }
    if (isNaN(ef) || ef < 0) { setError("Enter a valid EF allocation."); return; }
    if (efAllocationType === "percent" && ef > 100) { setError("Percentage must be 0–100."); return; }

    setError("");
    setCreating(true);
    try {
      let categoriesToCopy: Omit<Category, "id">[] | undefined;
      if (copyMode === "copy" && selectedCycleId && previewCategories.length > 0) {
        categoriesToCopy = previewCategories.map((c) => ({
          name: c.name,
          emoji: c.emoji,
          allocationType: c.allocationType,
          allocationValue: c.allocationValue,
          order: c.order,
        }));
      }

      const newId = await createCycle(
        user.uid,
        {
          name: cycleName.trim(),
          expectedIncome: income,
          emergencyFundAllocationType: efAllocationType,
          emergencyFundAllocationValue: ef,
        },
        categoriesToCopy
      );

      onClose();
      router.push(`/cycle/${newId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create cycle. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  const income = parseFloat(expectedIncome) || 3200;

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
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-lg rounded-3xl pointer-events-auto overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{ background: "#0E0E1C", border: "1px solid #1E1E32" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 pt-6 pb-5"
            style={{ borderBottom: "1px solid #1A1A2C" }}
          >
            <div>
              <h2 className="text-base font-bold" style={{ color: "#EBE5D0" }}>
                New Income Cycle
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>
                Set up your next budget cycle
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "#1A1A2C" }}
            >
              <X className="w-4 h-4" style={{ color: "#6E6C82" }} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Cycle name + income */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                  Cycle name
                </label>
                <input
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: "#151520",
                    border: "1px solid #1E1E30",
                    color: "#EBE5D0",
                    outline: "none",
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                  Expected income
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                    style={{ color: "#6E6C82" }}
                  >
                    ₵
                  </span>
                  <input
                    type="number"
                    value={expectedIncome}
                    onChange={(e) => setExpectedIncome(e.target.value)}
                    className="w-full pl-6 pr-3 py-2.5 rounded-xl text-sm font-medium"
                    style={{
                      background: "#151520",
                      border: "1px solid #1E1E30",
                      color: "#EBE5D0",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* EF allocation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                  Emergency fund allocation
                </label>
                <div className="flex gap-1">
                  {(["fixed", "percent"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setEfAllocationType(type)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={
                        efAllocationType === type
                          ? { background: "rgba(200,168,75,0.15)", color: "#DEC070", border: "1px solid rgba(200,168,75,0.3)" }
                          : { background: "#131320", color: "#6E6C82", border: "1px solid transparent" }
                      }
                    >
                      {type === "fixed" ? "₵ Fixed" : "% of income"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: "#6E6C82" }}
                >
                  {efAllocationType === "fixed" ? "₵" : "%"}
                </span>
                <input
                  type="number"
                  min="0"
                  max={efAllocationType === "percent" ? 100 : undefined}
                  step={efAllocationType === "fixed" ? "1" : "0.1"}
                  value={efValue}
                  onChange={(e) => setEfValue(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: "#151520",
                    border: "1px solid #1E1E30",
                    color: "#EBE5D0",
                    outline: "none",
                  }}
                />
                {efValue && income > 0 && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                    style={{ color: "#34D399" }}
                  >
                    {efAllocationType === "percent"
                      ? `= ₵${((parseFloat(efValue) / 100) * income).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : `${((parseFloat(efValue) / income) * 100).toFixed(1)}% of income`}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: "#5E5C74" }}>
                This amount is added back to your EF when you reconcile.
              </p>
            </div>

            {/* Setup mode toggle */}
            <div className="space-y-3">
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "#8A88A0" }}
              >
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
                  onMouseEnter={(e) => { if (copyMode !== "copy") { (e.currentTarget as HTMLElement).style.background = "#1A1A2C"; (e.currentTarget as HTMLElement).style.color = "#C5C0D0"; } }}
                  onMouseLeave={(e) => { if (copyMode !== "copy") { (e.currentTarget as HTMLElement).style.background = "#131320"; (e.currentTarget as HTMLElement).style.color = "#8A88A0"; } }}
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  Copy from previous
                </button>
                <button
                  onClick={() => { setCopyMode("fresh"); setSelectedCycleId(null); setPreviewCategories([]); }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left"
                  style={
                    copyMode === "fresh"
                      ? { background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)", color: "#DEC070" }
                      : { background: "#131320", border: "1px solid #1E1E30", color: "#8A88A0" }
                  }
                  onMouseEnter={(e) => { if (copyMode !== "fresh") { (e.currentTarget as HTMLElement).style.background = "#1A1A2C"; (e.currentTarget as HTMLElement).style.color = "#C5C0D0"; } }}
                  onMouseLeave={(e) => { if (copyMode !== "fresh") { (e.currentTarget as HTMLElement).style.background = "#131320"; (e.currentTarget as HTMLElement).style.color = "#8A88A0"; } }}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  Start fresh
                </button>
              </div>
            </div>

            {/* Cycle picker */}
            <AnimatePresence>
              {copyMode === "copy" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3 overflow-hidden"
                >
                  {reconciledCycles.length === 0 ? (
                    <p className="text-xs" style={{ color: "#8A88A0" }}>
                      No past cycles yet. Create your first cycle from scratch.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs" style={{ color: "#8A88A0" }}>
                        Select a past cycle to copy its category allocations
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {reconciledCycles.slice(0, 4).map((cycle) => (
                          <button
                            key={cycle.id}
                            onClick={() => handleSelectCycle(cycle.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                            style={
                              selectedCycleId === cycle.id
                                ? {
                                    background: "rgba(200,168,75,0.15)",
                                    border: "1px solid #C8A84B",
                                    color: "#DEC070",
                                  }
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
                            {loadingPreview ? (
                              <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="h-5 rounded-lg animate-pulse" style={{ background: "#131320" }} />
                                ))}
                              </div>
                            ) : previewCategories.length === 0 ? (
                              <p className="text-xs" style={{ color: "#8A88A0" }}>
                                No categories found in this cycle.
                              </p>
                            ) : (
                              <>
                                <p className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                                  Will copy these {previewCategories.length} categories:
                                </p>
                                <div className="space-y-2">
                                  {previewCategories.map((cat) => {
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
                                            {cat.allocationType === "percent"
                                              ? `${cat.allocationValue}%`
                                              : `₵${cat.allocationValue}`}
                                          </span>
                                          <span className="text-xs font-semibold" style={{ color: "#C8A84B" }}>
                                            ₵{allocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                                  <span className="text-xs" style={{ color: "#8A88A0" }}>
                                    Total allocated
                                  </span>
                                  <span className="text-xs font-bold" style={{ color: "#DEC070" }}>
                                    ₵
                                    {previewCategories
                                      .reduce((s, c) => s + calcAllocated(income, c.allocationType, c.allocationValue), 0)
                                      .toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <p
                className="text-xs px-3 py-2 rounded-lg"
                style={{ background: "rgba(248,113,113,0.08)", color: "#F87171" }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: "1px solid #1A1A2C" }}
          >
            <button
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-xl"
              style={{ color: "#8A88A0" }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: creating ? 1 : 1.02 }}
              whileTap={{ scale: creating ? 1 : 0.98 }}
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                color: "#000",
                boxShadow: "0 4px 16px rgba(200,168,75,0.3)",
                opacity: creating ? 0.7 : 1,
                cursor: creating ? "not-allowed" : "pointer",
              }}
            >
              {creating ? (
                "Creating…"
              ) : (
                <>
                  Create Cycle
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
