"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { Cycle, Category, Withdrawal } from "@/types";
import { calcAllocated } from "@/lib/firestore";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2",
      fontWeight: 700,
    },
  ],
});

const S = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    backgroundColor: "#FFFFFF",
    paddingTop: 44,
    paddingBottom: 52,
    paddingHorizontal: 48,
    fontSize: 10,
    color: "#1A1A2C",
  },
  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  brandText: { fontSize: 18, fontWeight: 700, color: "#0E0E1C", letterSpacing: 0.3 },
  brandSub: { fontSize: 9, color: "#8A88A0", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: "#DCFCE7", marginTop: 2 },
  badgeText: { fontSize: 8, fontWeight: 700, color: "#15803D", letterSpacing: 1.2 },
  // Title section
  cycleName: { fontSize: 22, fontWeight: 700, color: "#0E0E1C", marginBottom: 4 },
  cycleMeta: { fontSize: 9, color: "#8A88A0" },
  divider: { height: 1, backgroundColor: "#E8E6F0", marginVertical: 20 },
  // Summary cards
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, backgroundColor: "#F8F7FC", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E8E6F0" },
  summaryCardGreen: { flex: 1, backgroundColor: "#F0FDF4", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#BBF7D0" },
  summaryCardAmber: { flex: 1, backgroundColor: "#FFFBEB", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#FDE68A" },
  summaryLabel: { fontSize: 8, color: "#8A88A0", marginBottom: 5, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" },
  summaryValue: { fontSize: 16, fontWeight: 700, color: "#0E0E1C" },
  summaryValueGreen: { fontSize: 16, fontWeight: 700, color: "#15803D" },
  summaryValueAmber: { fontSize: 16, fontWeight: 700, color: "#92400E" },
  // Section headers
  sectionHeader: { fontSize: 11, fontWeight: 700, color: "#0E0E1C", marginBottom: 10 },
  // Category table
  tableHeader: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 12, backgroundColor: "#F1F0F8", borderRadius: 6, marginBottom: 6 },
  tableHeaderText: { fontSize: 8, fontWeight: 700, color: "#8A88A0", letterSpacing: 0.6, textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 3 },
  tableRowAlt: { backgroundColor: "#F8F7FC" },
  tableCell: { fontSize: 9, color: "#3A3850" },
  tableCellBold: { fontSize: 9, fontWeight: 700, color: "#0E0E1C" },
  colName: { width: "30%" },
  colAlloc: { width: "20%", textAlign: "right" },
  colBorrowed: { width: "20%", textAlign: "right" },
  colRemaining: { width: "20%", textAlign: "right" },
  colStatus: { width: "10%", textAlign: "center" },
  // Status dots
  statusOk: { fontSize: 8, color: "#15803D", fontWeight: 700 },
  statusWarn: { fontSize: 8, color: "#92400E", fontWeight: 700 },
  statusOver: { fontSize: 8, color: "#DC2626", fontWeight: 700 },
  // EF card
  efCard: { backgroundColor: "#F0FDF4", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#BBF7D0", marginBottom: 24 },
  efRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  efLabel: { fontSize: 9, color: "#6B7280" },
  efValue: { fontSize: 11, fontWeight: 700, color: "#15803D" },
  efValueLarge: { fontSize: 18, fontWeight: 700, color: "#15803D" },
  // Withdrawal table
  wRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 3 },
  wDate: { width: "18%", fontSize: 8, color: "#8A88A0" },
  wCat: { width: "22%", fontSize: 9, color: "#3A3850" },
  wNote: { flex: 1, fontSize: 9, color: "#6B7280" },
  wAmount: { width: "16%", textAlign: "right", fontSize: 9, fontWeight: 700, color: "#92400E" },
  // Footer
  footer: { position: "absolute", bottom: 28, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 8, color: "#C5C0D0" },
  pageNum: { fontSize: 8, color: "#C5C0D0" },
});

interface PDFProps {
  cycle: Cycle;
  categories: Category[];
  withdrawals: Withdrawal[];
  efBalance: number;
}

function CyclePDFDocument({ cycle, categories, withdrawals, efBalance }: PDFProps) {
  const totalBorrowed = withdrawals.reduce((s, w) => s + w.amount, 0);
  const efAllocationAmount = calcAllocated(
    cycle.expectedIncome,
    cycle.emergencyFundAllocationType,
    cycle.emergencyFundAllocationValue
  );
  const finalEFBalance = cycle.reconciledEFBalance ?? efBalance + totalBorrowed + efAllocationAmount;

  const createdDate = cycle.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }) ?? "";
  const reconciledDate = cycle.reconciledAt?.toDate?.()?.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }) ?? "";
  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const efLabel = cycle.emergencyFundAllocationType === "percent"
    ? `${cycle.emergencyFundAllocationValue}% of income`
    : `₵${cycle.emergencyFundAllocationValue.toLocaleString()} fixed`;

  // Group withdrawals by category for summary
  const catMap: Record<string, { name: string; emoji: string; total: number }> = {};
  withdrawals.forEach((w) => {
    if (!catMap[w.categoryId]) catMap[w.categoryId] = { name: w.categoryName, emoji: w.categoryEmoji, total: 0 };
    catMap[w.categoryId].total += w.amount;
  });

  return (
    <Document title={`${cycle.name} — Cycle Report`} author="Bridge">
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.brandText}>Bridge</Text>
            <Text style={S.brandSub}>Cash Flow Report</Text>
          </View>
          <View style={S.badge}>
            <Text style={S.badgeText}>RECONCILED</Text>
          </View>
        </View>

        {/* Cycle title */}
        <Text style={S.cycleName}>{cycle.name}</Text>
        <Text style={S.cycleMeta}>
          Started {createdDate}
          {reconciledDate ? `  ·  Reconciled ${reconciledDate}` : ""}
        </Text>

        <View style={S.divider} />

        {/* Summary cards */}
        <View style={S.summaryRow}>
          <View style={S.summaryCard}>
            <Text style={S.summaryLabel}>Expected Income</Text>
            <Text style={S.summaryValue}>₵{cycle.expectedIncome.toLocaleString()}</Text>
          </View>
          <View style={S.summaryCardAmber}>
            <Text style={S.summaryLabel}>Total Borrowed</Text>
            <Text style={S.summaryValueAmber}>₵{totalBorrowed.toLocaleString()}</Text>
          </View>
          <View style={S.summaryCard}>
            <Text style={S.summaryLabel}>EF Replenished</Text>
            <Text style={S.summaryValue}>+₵{(totalBorrowed + efAllocationAmount).toLocaleString()}</Text>
          </View>
          <View style={S.summaryCardGreen}>
            <Text style={S.summaryLabel}>Final EF Balance</Text>
            <Text style={S.summaryValueGreen}>₵{finalEFBalance.toLocaleString()}</Text>
          </View>
        </View>

        {/* Emergency Fund */}
        <Text style={S.sectionHeader}>Emergency Fund</Text>
        <View style={[S.efCard, { marginBottom: 20 }]}>
          <View style={[S.efRow, { marginBottom: 10 }]}>
            <Text style={[S.efLabel, { fontSize: 10, color: "#0E0E1C", fontWeight: 600 }]}>Emergency Fund Breakdown</Text>
            <Text style={S.efValueLarge}>₵{finalEFBalance.toLocaleString()}</Text>
          </View>
          <View style={S.efRow}>
            <Text style={S.efLabel}>Borrowed this cycle (returned on reconciliation)</Text>
            <Text style={S.efValue}>+₵{totalBorrowed.toLocaleString()}</Text>
          </View>
          <View style={[S.efRow, { marginTop: 4 }]}>
            <Text style={S.efLabel}>Cycle allocation ({efLabel})</Text>
            <Text style={S.efValue}>+₵{efAllocationAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Categories */}
        <Text style={S.sectionHeader}>Category Performance</Text>
        <View style={S.tableHeader}>
          <Text style={[S.tableHeaderText, S.colName]}>Category</Text>
          <Text style={[S.tableHeaderText, S.colAlloc]}>Allocated</Text>
          <Text style={[S.tableHeaderText, S.colBorrowed]}>Borrowed</Text>
          <Text style={[S.tableHeaderText, S.colRemaining]}>Remaining</Text>
          <Text style={[S.tableHeaderText, S.colStatus]}>Status</Text>
        </View>

        {categories.map((cat, i) => {
          const allocated = calcAllocated(cycle.expectedIncome, cat.allocationType, cat.allocationValue);
          const borrowed = catMap[cat.id]?.total ?? 0;
          const remaining = allocated - borrowed;
          const pct = allocated > 0 ? (borrowed / allocated) * 100 : 0;
          const isOver = borrowed > allocated;
          const isWarn = !isOver && pct > 80;

          return (
            <View key={cat.id} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCellBold, S.colName]}>{cat.name}</Text>
              <Text style={[S.tableCell, S.colAlloc]}>₵{allocated.toLocaleString()}</Text>
              <Text style={[S.tableCell, S.colBorrowed]}>₵{borrowed.toLocaleString()}</Text>
              <Text style={[S.tableCell, S.colRemaining, { color: remaining < 0 ? "#DC2626" : "#15803D" }]}>
                {remaining < 0 ? "-" : "+"}₵{Math.abs(remaining).toLocaleString()}
              </Text>
              <Text style={[S.colStatus, isOver ? S.statusOver : isWarn ? S.statusWarn : S.statusOk]}>
                {isOver ? "OVER" : isWarn ? "HIGH" : "OK"}
              </Text>
            </View>
          );
        })}

        <View style={[S.divider, { marginTop: 16 }]} />

        {/* Withdrawals */}
        <Text style={[S.sectionHeader, { marginTop: 4 }]}>
          Withdrawal Log ({withdrawals.length} {withdrawals.length === 1 ? "entry" : "entries"})
        </Text>
        <View style={S.tableHeader}>
          <Text style={[S.tableHeaderText, S.wDate]}>Date</Text>
          <Text style={[S.tableHeaderText, S.wCat]}>Category</Text>
          <Text style={[S.tableHeaderText, S.wNote]}>Note</Text>
          <Text style={[S.tableHeaderText, S.wAmount]}>Amount</Text>
        </View>

        {withdrawals.length === 0 ? (
          <View style={[S.tableRow, { paddingVertical: 14 }]}>
            <Text style={[S.tableCell, { color: "#8A88A0" }]}>No withdrawals were logged in this cycle.</Text>
          </View>
        ) : (
          withdrawals.map((w, i) => {
            const date = w.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
              month: "short", day: "numeric",
            }) ?? "";
            return (
              <View key={w.id} style={[S.wRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={S.wDate}>{date}</Text>
                <Text style={S.wCat}>{w.categoryName}</Text>
                <Text style={S.wNote}>{w.note || "—"}</Text>
                <Text style={S.wAmount}>–₵{w.amount.toLocaleString()}</Text>
              </View>
            );
          })
        )}

        {/* Total row */}
        <View style={{ flexDirection: "row", paddingVertical: 9, paddingHorizontal: 12, backgroundColor: "#FFF7ED", borderRadius: 8, marginTop: 4 }}>
          <Text style={[S.tableCellBold, S.wDate]} />
          <Text style={[S.tableCellBold, S.wCat]} />
          <Text style={[S.tableCellBold, S.wNote]}>Total Borrowed</Text>
          <Text style={[S.wAmount, { fontWeight: 700, color: "#92400E" }]}>–₵{totalBorrowed.toLocaleString()}</Text>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>Generated {generatedDate} · Bridge</Text>
          <Text style={S.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

interface ExportButtonProps {
  cycle: Cycle;
  categories: Category[];
  withdrawals: Withdrawal[];
  efBalance: number;
}

export function CyclePDFExportButton({ cycle, categories, withdrawals, efBalance }: ExportButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleExport() {
    setGenerating(true);
    try {
      const blob = await pdf(
        <CyclePDFDocument
          cycle={cycle}
          categories={categories}
          withdrawals={withdrawals}
          efBalance={efBalance}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cycle.name.replace(/\s+/g, "-")}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <motion.button
      whileHover={{ scale: generating ? 1 : 1.02 }}
      whileTap={{ scale: generating ? 1 : 0.98 }}
      onClick={handleExport}
      disabled={generating}
      className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
      style={{
        background: "#0E0E1C",
        border: "1px solid #1A1A2C",
        color: generating ? "#6E6C82" : "#C8A84B",
        cursor: generating ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!generating) {
          (e.currentTarget as HTMLElement).style.borderColor = "#2A2A3C";
          (e.currentTarget as HTMLElement).style.color = "#E8C86A";
        }
      }}
      onMouseLeave={(e) => {
        if (!generating) {
          (e.currentTarget as HTMLElement).style.borderColor = "#1A1A2C";
          (e.currentTarget as HTMLElement).style.color = "#C8A84B";
        }
      }}
    >
      <FileDown className="w-4 h-4" />
      {generating ? "Generating…" : "Export PDF"}
    </motion.button>
  );
}
