"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { addCategory, updateCategory } from "@/lib/firestore";
import { Category } from "@/types";

const PRESET_EMOJIS = [
  "🏠","🛒","🚗","💡","🎬","💊","📚","👕",
  "💰","🛡️","📱","🌐","✈️","💳","🎁","🏋️",
  "🐕","🍔","🏥","🔧",
];

interface Props {
  userId: string;
  cycleId: string;
  expectedIncome: number;
  existingOrder: number;
  editCategory?: Category;
  onClose: () => void;
}

export function AddCategoryModal({
  userId,
  cycleId,
  expectedIncome,
  existingOrder,
  editCategory,
  onClose,
}: Props) {
  const isEdit = !!editCategory;

  const [emoji, setEmoji] = useState(editCategory?.emoji ?? "🏠");
  const [name, setName] = useState(editCategory?.name ?? "");
  const [allocationType, setAllocationType] = useState<"percent" | "fixed">(
    editCategory?.allocationType ?? "fixed"
  );
  const [allocationValue, setAllocationValue] = useState(
    editCategory?.allocationValue?.toString() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const value = parseFloat(allocationValue) || 0;
  const preview =
    allocationType === "percent"
      ? (expectedIncome * value) / 100
      : value;

  async function handleSave() {
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    if (!allocationValue || isNaN(parseFloat(allocationValue)) || value <= 0) {
      setError("Enter a valid allocation value greater than 0.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isEdit && editCategory) {
        await updateCategory(userId, cycleId, editCategory.id, {
          emoji,
          name: name.trim(),
          allocationType,
          allocationValue: value,
        });
      } else {
        await addCategory(userId, cycleId, {
          emoji,
          name: name.trim(),
          allocationType,
          allocationValue: value,
          order: existingOrder,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save category. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
          className="w-full max-w-md rounded-3xl pointer-events-auto"
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
                {isEdit ? "Edit Category" : "Add Category"}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#8A88A0" }}>
                {isEdit ? "Update allocation details" : "Set up a budget category"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#1A1A2C" }}
            >
              <X className="w-4 h-4" style={{ color: "#6E6C82" }} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Emoji picker */}
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                Icon
              </label>
              <div className="grid grid-cols-10 gap-1.5">
                {PRESET_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all"
                    style={{
                      background: emoji === e ? "rgba(200,168,75,0.15)" : "#131320",
                      border: emoji === e ? "1px solid #C8A84B" : "1px solid transparent",
                    }}
                    onMouseEnter={(e2) => {
                      if (emoji !== e) (e2.currentTarget as HTMLElement).style.background = "#1A1A2C";
                    }}
                    onMouseLeave={(e2) => {
                      if (emoji !== e) (e2.currentTarget as HTMLElement).style.background = "#131320";
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                Category name
              </label>
              <input
                type="text"
                placeholder="e.g. Rent, Food, Transport"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: "#131320",
                  border: "1px solid #1E1E30",
                  color: "#EBE5D0",
                  outline: "none",
                }}
              />
            </div>

            {/* Allocation type toggle */}
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                Allocation type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["percent", "fixed"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAllocationType(type)}
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={
                      allocationType === type
                        ? {
                            background: "rgba(200,168,75,0.12)",
                            border: "1px solid rgba(200,168,75,0.35)",
                            color: "#DEC070",
                          }
                        : {
                            background: "#131320",
                            border: "1px solid #1E1E30",
                            color: "#8A88A0",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (allocationType !== type) {
                        (e.currentTarget as HTMLElement).style.background = "#1A1A2C";
                        (e.currentTarget as HTMLElement).style.color = "#C5C0D0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (allocationType !== type) {
                        (e.currentTarget as HTMLElement).style.background = "#131320";
                        (e.currentTarget as HTMLElement).style.color = "#8A88A0";
                      }
                    }}
                  >
                    {type === "percent" ? "Percent %" : "Fixed ₵"}
                  </button>
                ))}
              </div>
            </div>

            {/* Allocation value */}
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: "#6E6C82" }}>
                {allocationType === "percent" ? "Percentage of income" : "Fixed amount"}
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: "#8A88A0" }}
                >
                  {allocationType === "percent" ? "%" : "₵"}
                </span>
                <input
                  type="number"
                  min="0"
                  step={allocationType === "percent" ? "1" : "0.01"}
                  placeholder={allocationType === "percent" ? "20" : "500"}
                  value={allocationValue}
                  onChange={(e) => { setAllocationValue(e.target.value); setError(""); }}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: "#131320",
                    border: "1px solid #1E1E30",
                    color: "#EBE5D0",
                    outline: "none",
                  }}
                />
                {value > 0 && expectedIncome > 0 && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                    style={{ color: "#C8A84B" }}
                  >
                    = ₵{preview.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                )}
              </div>
              {value > 0 && (
                <p className="text-xs" style={{ color: "#5E5C74" }}>
                  {allocationType === "percent"
                    ? `${value}% of ₵${expectedIncome.toLocaleString()} = ₵${preview.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : `Fixed ₵${preview.toLocaleString()} per cycle`}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(248,113,113,0.08)", color: "#F87171" }}>
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={loading}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #C8A84B 0%, #8B6520 100%)",
                color: "#000",
                boxShadow: "0 4px 16px rgba(200,168,75,0.3)",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Category"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
