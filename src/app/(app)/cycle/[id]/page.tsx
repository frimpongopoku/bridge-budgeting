"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Pencil,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCycle } from "@/hooks/useCycle";
import { useEmergencyFund } from "@/hooks/useEmergencyFund";
import {
  addWithdrawal,
  deleteWithdrawal,
  reconcileCycle,
  calcAllocated,
  updateCycleEFAllocation,
} from "@/lib/firestore";
import { AddCategoryModal } from "@/components/AddCategoryModal";
import { deleteCategory } from "@/lib/firestore";
import { Category } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
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

export default function CyclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cycleId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const { cycle, categories, withdrawals, loading } = useCycle(user?.uid, cycleId);
  const { balance } = useEmergencyFund(user?.uid);

  // Withdrawal form state
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reconcile state
  const [reconcileConfirm, setReconcileConfirm] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileError, setReconcileError] = useState("");

  // Category modal state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  // Delete states
  const [deletingWithdrawalId, setDeletingWithdrawalId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // EF replenishment edit state
  const [editingEF, setEditingEF] = useState(false);
  const [efEditType, setEfEditType] = useState<"percent" | "fixed">("fixed");
  const [efEditValue, setEfEditValue] = useState("");
  const [efEditSaving, setEfEditSaving] = useState(false);

  const totalBorrowed = withdrawals.reduce((s, w) => s + w.amount, 0);
  const efAllocationAmount = cycle
    ? calcAllocated(cycle.expectedIncome, cycle.emergencyFundAllocationType, cycle.emergencyFundAllocationValue)
    : 0;
  const projectedEF = (balance ?? 0) + totalBorrowed + efAllocationAmount;

  const efLabel = cycle
    ? cycle.emergencyFundAllocationType === "percent"
      ? `${cycle.emergencyFundAllocationValue}% of income`
      : `₵${cycle.emergencyFundAllocationValue.toLocaleString()} fixed`
    : "";

  const isReconciled = cycle?.status === "reconciled";

  function startEditEF() {
    if (!cycle) return;
    setEfEditType(cycle.emergencyFundAllocationType);
    setEfEditValue(String(cycle.emergencyFundAllocationValue));
    setEditingEF(true);
  }

  async function handleSaveEF() {
    if (!user || !cycle) return;
    const val = parseFloat(efEditValue);
    if (isNaN(val) || val < 0) return;
    if (efEditType === "percent" && val > 100) return;
    setEfEditSaving(true);
    try {
      await updateCycleEFAllocation(user.uid, cycle.id, efEditType, val);
      setEditingEF(false);
    } finally {
      setEfEditSaving(false);
    }
  }

  async function handleAddWithdrawal() {
    if (!user || !cycle) return;
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setFormError("Enter a valid amount greater than 0.");
      return;
    }
    if (!selectedCategoryId) {
      setFormError("Please select a category.");
      return;
    }
    const category = categories.find((c) => c.id === selectedCategoryId);
    if (!category) {
      setFormError("Invalid category selected.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await addWithdrawal(user.uid, cycle.id, {
        amount: amt,
        categoryId: category.id,
        categoryName: category.name,
        categoryEmoji: category.emoji,
        note: note.trim(),
      });
      setAmount("");
      setSelectedCategoryId("");
      setNote("");
    } catch (err) {
      console.error(err);
      setFormError("Failed to log withdrawal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteWithdrawal(withdrawalId: string, amt: number) {
    if (!user || !cycle) return;
    setDeletingWithdrawalId(withdrawalId);
    try {
      await deleteWithdrawal(user.uid, cycle.id, withdrawalId, amt);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingWithdrawalId(null);
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!user || !cycle) return;
    setDeletingCategoryId(categoryId);
    try {
      await deleteCategory(user.uid, cycle.id, categoryId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingCategoryId(null);
    }
  }

  async function handleReconcile() {
    if (!user || !cycle) return;
    setReconcileError("");
    setReconciling(true);
    try {
      await reconcileCycle(user.uid, cycle.id, totalBorrowed, efAllocationAmount);
      router.push("/history");
    } catch (err) {
      console.error(err);
      setReconcileError("Failed to reconcile. Please try again.");
      setReconciling(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <SkeletonBlock className="h-12 w-80" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonBlock key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 space-y-3">
            {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-32" />)}
          </div>
          <div className="col-span-2 space-y-3">
            <SkeletonBlock className="h-56" />
            <SkeletonBlock className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!cycle) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-96">
        <p className="text-lg font-semibold mb-2" style={{ color: "#EBE5D0" }}>
          Cycle not found
        </p>
        <p className="text-sm mb-6" style={{ color: "#8A88A0" }}>
          This cycle doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Link
          href="/dashboard"
          className="text-sm font-medium px-4 py-2 rounded-xl"
          style={{ background: "#0E0E1C", border: "1px solid #1A1A2C", color: "#C8A84B" }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const reconciledDate = cycle.reconciledAt?.toDate?.()?.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const createdDate = cycle.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      {/* Add/Edit Category Modal */}
      {(showAddCategory || editingCategory) && user && (
        <AddCategoryModal
          userId={user.uid}
          cycleId={cycle.id}
          expectedIncome={cycle.expectedIncome}
          existingOrder={categories.length}
          editCategory={editingCategory}
          onClose={() => {
            setShowAddCategory(false);
            setEditingCategory(undefined);
          }}
        />
      )}

      {/* Reconcile confirm overlay */}
      {reconcileConfirm && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={() => setReconcileConfirm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-3xl p-6 space-y-4"
              style={{ background: "#0E0E1C", border: "1px solid #1E1E32" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(52,211,153,0.1)" }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: "#34D399" }} />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: "#EBE5D0" }}>
                  Reconcile cycle?
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8A88A0" }}>
                  This will mark the cycle as completed and add{" "}
                  <span style={{ color: "#34D399" }}>
                    ₵{(totalBorrowed + efAllocationAmount).toLocaleString()}
                  </span>{" "}
                  to your emergency fund:
                </p>
              </div>
              <div
                className="rounded-2xl p-4 space-y-2"
                style={{ background: "#0B0B16", border: "1px solid #1A1A2C" }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#8A88A0" }}>Borrowed returned</span>
                  <span style={{ color: "#EBE5D0" }}>+₵{totalBorrowed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#8A88A0" }}>EF allocation ({efLabel})</span>
                  <span style={{ color: "#EBE5D0" }}>+₵{efAllocationAmount.toLocaleString()}</span>
                </div>
                <div
                  className="flex justify-between text-sm font-bold pt-2"
                  style={{ borderTop: "1px solid #1A1A2C" }}
                >
                  <span style={{ color: "#8A88A0" }}>New EF balance</span>
                  <span style={{ color: "#34D399" }}>
                    ₵{((balance ?? 0) + totalBorrowed + efAllocationAmount).toLocaleString()}
                  </span>
                </div>
              </div>
              {reconcileError && (
                <p className="text-xs" style={{ color: "#F87171" }}>
                  {reconcileError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setReconcileConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "#131320", color: "#8A88A0", border: "1px solid #1E1E2C" }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: reconciling ? 1 : 1.02 }}
                  whileTap={{ scale: reconciling ? 1 : 0.98 }}
                  onClick={handleReconcile}
                  disabled={reconciling}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
                    color: "#000",
                    opacity: reconciling ? 0.7 : 1,
                    cursor: reconciling ? "not-allowed" : "pointer",
                  }}
                >
                  {reconciling ? "Reconciling…" : "Confirm"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}

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
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
            >
              <ArrowLeft className="w-4 h-4" style={{ color: "#6E6C82" }} />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold" style={{ color: "#EBE5D0" }}>
                  {cycle.name}
                </h1>
                <span
                  className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-full"
                  style={
                    isReconciled
                      ? { background: "rgba(52,211,153,0.12)", color: "#34D399", border: "1px solid rgba(52,211,153,0.2)" }
                      : { background: "rgba(200,168,75,0.12)", color: "#C8A84B", border: "1px solid rgba(200,168,75,0.2)" }
                  }
                >
                  {isReconciled ? "RECONCILED" : "ACTIVE"}
                </span>
              </div>
              <p className="text-sm mt-0.5" style={{ color: "#8A88A0" }}>
                Expected income: ₵{cycle.expectedIncome.toLocaleString()} · Started {createdDate}
                {isReconciled && reconciledDate && ` · Reconciled ${reconciledDate}`}
              </p>
            </div>
          </div>

          {!isReconciled && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
                style={{ background: "#0E0E1C", border: "1px solid #1A1A2C", color: "#6E6C82" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#2A2A3C"; (e.currentTarget as HTMLElement).style.color = "#C5C0D0"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A2C"; (e.currentTarget as HTMLElement).style.color = "#6E6C82"; }}
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setReconcileConfirm(true)}
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
          )}

          {isReconciled && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", color: "#34D399" }}
            >
              <Lock className="w-4 h-4" />
              Read-only
            </div>
          )}
        </motion.div>

        {/* Summary strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="grid grid-cols-4 gap-4"
        >
          {[
            {
              label: "Expected Income",
              value: `₵${cycle.expectedIncome.toLocaleString()}`,
              color: "#EBE5D0",
            },
            {
              label: "Total Borrowed",
              value: `₵${totalBorrowed.toLocaleString()}`,
              color: "#E8A838",
            },
            {
              label: "EF Balance",
              value: balance !== null ? `₵${balance.toLocaleString()}` : "–",
              color: "#34D399",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -1 }}
              className="rounded-2xl p-4 transition-colors"
              style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#252538"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A2C"; }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "#8A88A0" }}>
                {s.label}
              </p>
              <p className="text-xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
            </motion.div>
          ))}

          {/* Projected EF after reconciliation */}
          <motion.div
            whileHover={{ y: -1 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0a1f16 0%, #0b1a13 100%)",
              border: "1px solid rgba(52,211,153,0.18)",
            }}
          >
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)" }}
            />
            <p className="text-xs font-medium mb-1" style={{ color: "rgba(52,211,153,0.6)" }}>
              After Reconciliation
            </p>
            <p className="text-xl font-bold" style={{ color: "#34D399" }}>
              ₵{projectedEF.toLocaleString()}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(52,211,153,0.45)" }}>
              {balance !== null ? `₵${balance.toLocaleString()} now` : "–"} +{" "}
              ₵{totalBorrowed.toLocaleString()} returned + ₵{efAllocationAmount.toLocaleString()} ({efLabel})
            </p>
          </motion.div>
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
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>
                  Category Allocations
                </h2>
                {!isReconciled && (
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: "#131320", border: "1px solid #1E1E2C", color: "#C8A84B" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1A1A2C"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#131320"; }}
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                )}
              </div>

              {categories.length === 0 ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                >
                  <p className="text-sm mb-3" style={{ color: "#8A88A0" }}>
                    No categories yet. Add your first budget category.
                  </p>
                  {!isReconciled && (
                    <button
                      onClick={() => setShowAddCategory(true)}
                      className="flex items-center gap-2 mx-auto text-sm font-semibold px-4 py-2 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                        color: "#000",
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Category
                    </button>
                  )}
                </div>
              ) : (
                categories.map((cat, i) => {
                  const allocated = calcAllocated(
                    cycle.expectedIncome,
                    cat.allocationType,
                    cat.allocationValue
                  );
                  const catTotal = withdrawals
                    .filter((w) => w.categoryId === cat.id)
                    .reduce((s, w) => s + w.amount, 0);
                  const remaining = allocated - catTotal;
                  const pct = allocated > 0 ? Math.min((catTotal / allocated) * 100, 100) : 0;
                  const isOver = catTotal > allocated;
                  const isWarning = !isOver && pct > 80;
                  const barColor = isOver ? "#F87171" : isWarning ? "#E8A838" : "#C8A84B";
                  const isDeleting = deletingCategoryId === cat.id;

                  return (
                    <motion.div
                      key={cat.id}
                      custom={i}
                      initial="hidden"
                      animate="show"
                      variants={fadeUp}
                      whileHover={{ y: -1 }}
                      className="rounded-2xl p-5 group"
                      style={{
                        background: "#0E0E1C",
                        border: "1px solid #1A1A2C",
                        opacity: isDeleting ? 0.5 : 1,
                      }}
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
                            <p className="text-sm font-semibold" style={{ color: "#C5C0D0" }}>
                              {cat.name}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#706E88" }}>
                              {cat.allocationType === "percent"
                                ? `${cat.allocationValue}%`
                                : `₵${cat.allocationValue.toLocaleString()} fixed`}{" "}
                              · ₵{allocated.toLocaleString()} allocated
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
                          {!isReconciled && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingCategory(cat); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: "#131320" }}
                                title="Edit category"
                              >
                                <Pencil className="w-3.5 h-3.5" style={{ color: "#8A88A0" }} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                disabled={isDeleting}
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(248,113,113,0.08)" }}
                                title="Delete category"
                              >
                                <Trash2 className="w-3.5 h-3.5" style={{ color: "#F87171" }} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#131320" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.2 + i * 0.08,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="h-full rounded-full"
                          style={{ background: barColor }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span style={{ color: "#8A88A0" }}>
                          Borrowed:{" "}
                          <span className="font-semibold" style={{ color: "#C5C0D0" }}>
                            ₵{catTotal.toLocaleString()}
                          </span>
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: remaining < 0 ? "#F87171" : "#34D399" }}
                        >
                          {remaining < 0 ? "–" : "+"}₵{Math.abs(remaining).toLocaleString()}{" "}
                          {remaining < 0 ? "over" : "left"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {/* Emergency fund allocation card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="rounded-2xl p-5 space-y-3"
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
                    <p className="text-sm font-semibold" style={{ color: "#C5C0D0" }}>
                      Emergency Fund Replenishment
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>
                      {efLabel} · ₵{efAllocationAmount.toLocaleString()} added on reconciliation
                    </p>
                  </div>
                </div>
                {!isReconciled && !editingEF && (
                  <button
                    onClick={startEditEF}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "rgba(52,211,153,0.08)", color: "#34D399" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(52,211,153,0.18)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(52,211,153,0.08)"; }}
                    title="Edit EF allocation"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {editingEF && (
                <div className="space-y-3 pt-1">
                  {/* Type toggle */}
                  <div className="flex gap-2">
                    {(["fixed", "percent"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setEfEditType(t)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={
                          efEditType === t
                            ? { background: "rgba(52,211,153,0.15)", color: "#34D399", border: "1px solid rgba(52,211,153,0.3)" }
                            : { background: "rgba(0,0,0,0.2)", color: "#8A88A0", border: "1px solid transparent" }
                        }
                      >
                        {t === "fixed" ? "₵ Fixed" : "% of income"}
                      </button>
                    ))}
                  </div>
                  {/* Value input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "#34D399" }}>
                      {efEditType === "fixed" ? "₵" : "%"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={efEditType === "percent" ? 100 : undefined}
                      value={efEditValue}
                      onChange={(e) => setEfEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEF(); if (e.key === "Escape") setEditingEF(false); }}
                      autoFocus
                      className="w-full pl-7 pr-3 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(52,211,153,0.25)", color: "#EBE5D0", outline: "none" }}
                    />
                    {efEditValue && cycle && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "#34D399" }}>
                        {efEditType === "percent"
                          ? `₵${((parseFloat(efEditValue) / 100) * cycle.expectedIncome).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                          : `${((parseFloat(efEditValue) / cycle.expectedIncome) * 100).toFixed(1)}%`}
                      </span>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: efEditSaving ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveEF}
                      disabled={efEditSaving}
                      className="flex-1 py-2 rounded-xl text-xs font-bold"
                      style={{ background: "rgba(52,211,153,0.15)", color: "#34D399", opacity: efEditSaving ? 0.6 : 1 }}
                    >
                      {efEditSaving ? "Saving…" : "Save"}
                    </motion.button>
                    <button
                      onClick={() => setEditingEF(false)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{ background: "rgba(0,0,0,0.2)", color: "#8A88A0" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.2)"; }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Withdrawal panel — 2/5 */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="col-span-2 space-y-4"
          >
            {/* Log withdrawal form — only when active */}
            {!isReconciled && (
              <div
                className="rounded-2xl p-5 space-y-4"
                style={{ background: "#0B0B16", border: "1px solid #1A1A2C" }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: "#EBE5D0" }}>
                    Log a Withdrawal
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#706E88" }}>
                    From emergency fund
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                      style={{ color: "#8A88A0" }}
                    >
                      ₵
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setFormError(""); }}
                      className="w-full pl-6 pr-3 py-2.5 rounded-xl text-sm placeholder-[#5E5C74]"
                      style={{
                        background: "#131320",
                        border: "1px solid #1E1E2C",
                        color: "#EBE5D0",
                        outline: "none",
                      }}
                    />
                  </div>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => { setSelectedCategoryId(e.target.value); setFormError(""); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm appearance-none"
                    style={{
                      background: "#131320",
                      border: "1px solid #1E1E2C",
                      color: selectedCategoryId ? "#EBE5D0" : "#6E6C82",
                      outline: "none",
                    }}
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm placeholder-[#5E5C74]"
                    style={{
                      background: "#131320",
                      border: "1px solid #1E1E2C",
                      color: "#EBE5D0",
                      outline: "none",
                    }}
                  />
                  {formError && (
                    <p className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(248,113,113,0.08)", color: "#F87171" }}>
                      {formError}
                    </p>
                  )}
                  <motion.button
                    whileHover={{ scale: submitting ? 1 : 1.01 }}
                    whileTap={{ scale: submitting ? 1 : 0.99 }}
                    onClick={handleAddWithdrawal}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                      color: "#000",
                      opacity: submitting ? 0.7 : 1,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? (
                      "Logging…"
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Log Withdrawal
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Withdrawal list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: "#EBE5D0" }}>
                  Withdrawal Log
                </h3>
                <span className="text-xs" style={{ color: "#706E88" }}>
                  {withdrawals.length} {withdrawals.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {withdrawals.length === 0 ? (
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                >
                  <p className="text-sm" style={{ color: "#8A88A0" }}>
                    No withdrawals logged yet.
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
                >
                  {withdrawals.map((w, i) => {
                    const date =
                      w.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }) ?? "";
                    const isDeleting = deletingWithdrawalId === w.id;

                    return (
                      <motion.div
                        key={w.id}
                        custom={i}
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        className="flex items-center gap-3 px-4 py-3.5 group transition-colors"
                        style={{
                          borderBottom: i !== withdrawals.length - 1 ? "1px solid #131320" : "none",
                          opacity: isDeleting ? 0.4 : 1,
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
                            {w.categoryName} · {date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#E8A838" }}
                          >
                            –₵{w.amount.toLocaleString()}
                          </span>
                          {!isReconciled && (
                            <button
                              onClick={() => handleDeleteWithdrawal(w.id, w.amount)}
                              disabled={isDeleting}
                              className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: "rgba(248,113,113,0.08)" }}
                              title="Delete withdrawal"
                            >
                              <Trash2 className="w-3 h-3" style={{ color: "#F87171" }} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div
                className="rounded-2xl px-4 py-3 flex justify-between items-center"
                style={{ background: "#0E0E1C", border: "1px solid #1A1A2C" }}
              >
                <span className="text-sm font-medium" style={{ color: "#8A88A0" }}>
                  Total borrowed this cycle
                </span>
                <span className="text-base font-bold" style={{ color: "#E8A838" }}>
                  –₵{totalBorrowed.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
