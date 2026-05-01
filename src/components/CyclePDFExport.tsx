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

// Register fonts dynamically at call time so window is available
function ensureFonts() {
  const base = window.location.origin;
  Font.register({
    family: "NotoSans",
    fonts: [
      { src: `${base}/fonts/noto-sans-400.woff`, fontWeight: 400 },
      { src: `${base}/fonts/noto-sans-600.woff`, fontWeight: 600 },
      { src: `${base}/fonts/noto-sans-700.woff`, fontWeight: 700 },
    ],
  });
}

const S = StyleSheet.create({
  page: {
    fontFamily: "NotoSans",
    backgroundColor: "#FFFFFF",
    paddingTop: 44,
    paddingBottom: 52,
    paddingHorizontal: 48,
    fontSize: 10,
    color: "#1A1A2C",
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  brandText: { fontSize: 18, fontWeight: 700, color: "#0E0E1C" },
  brandSub: { fontSize: 9, color: "#8A88A0", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: "#DCFCE7" },
  badgeText: { fontSize: 8, fontWeight: 700, color: "#15803D" },
  cycleName: { fontSize: 22, fontWeight: 700, color: "#0E0E1C", marginBottom: 4 },
  cycleMeta: { fontSize: 9, color: "#8A88A0" },
  divider: { height: 1, backgroundColor: "#E8E6F0", marginVertical: 20 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, backgroundColor: "#F8F7FC", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E8E6F0" },
  summaryCardGreen: { flex: 1, backgroundColor: "#F0FDF4", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#BBF7D0" },
  summaryCardAmber: { flex: 1, backgroundColor: "#FFFBEB", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#FDE68A" },
  summaryLabel: { fontSize: 8, color: "#8A88A0", marginBottom: 5, fontWeight: 600 },
  summaryValue: { fontSize: 16, fontWeight: 700, color: "#0E0E1C" },
  summaryValueGreen: { fontSize: 16, fontWeight: 700, color: "#15803D" },
  summaryValueAmber: { fontSize: 16, fontWeight: 700, color: "#92400E" },
  sectionHeader: { fontSize: 11, fontWeight: 700, color: "#0E0E1C", marginBottom: 10 },
  tableHeader: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 12, backgroundColor: "#F1F0F8", borderRadius: 6, marginBottom: 6 },
  tableHeaderText: { fontSize: 8, fontWeight: 700, color: "#8A88A0" },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 3 },
  tableRowAlt: { backgroundColor: "#F8F7FC" },
  tableCell: { fontSize: 9, color: "#3A3850" },
  tableCellBold: { fontSize: 9, fontWeight: 700, color: "#0E0E1C" },
  colName: { width: "30%" },
  colAlloc: { width: "20%", textAlign: "right" },
  colBorrowed: { width: "20%", textAlign: "right" },
  colRemaining: { width: "20%", textAlign: "right" },
  colStatus: { width: "10%", textAlign: "center" },
  statusOk: { fontSize: 8, color: "#15803D", fontWeight: 700 },
  statusWarn: { fontSize: 8, color: "#92400E", fontWeight: 700 },
  statusOver: { fontSize: 8, color: "#DC2626", fontWeight: 700 },
  efCard: { backgroundColor: "#F0FDF4", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#BBF7D0", marginBottom: 20 },
  efRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  efLabel: { fontSize: 9, color: "#6B7280" },
  efValue: { fontSize: 11, fontWeight: 600, color: "#15803D" },
  efValueLarge: { fontSize: 18, fontWeight: 700, color: "#15803D" },
  wRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 3 },
  wDate: { width: "18%", fontSize: 8, color: "#8A88A0" },
  wCat: { width: "22%", fontSize: 9, color: "#3A3850" },
  wNote: { flex: 1, fontSize: 9, color: "#6B7280" },
  wAmount: { width: "16%", textAlign: "right", fontSize: 9, fontWeight: 700, color: "#92400E" },
  footer: { position: "absolute", bottom: 28, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 8, color: "#C5C0D0" },
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

  const wdCount = `${withdrawals.length} ${withdrawals.length === 1 ? "entry" : "entries"}`;

  const catMap: Record<string, number> = {};
  withdrawals.forEach((w) => { catMap[w.categoryId] = (catMap[w.categoryId] ?? 0) + w.amount; });

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

        <Text style={S.cycleName}>{cycle.name}</Text>
        <Text style={S.cycleMeta}>{`Started ${createdDate}${reconciledDate ? `  ·  Reconciled ${reconciledDate}` : ""}`}</Text>

        <View style={S.divider} />

        {/* Summary cards */}
        <View style={S.summaryRow}>
          <View style={S.summaryCard}>
            <Text style={S.summaryLabel}>EXPECTED INCOME</Text>
            <Text style={S.summaryValue}>{`₵${cycle.expectedIncome.toLocaleString()}`}</Text>
          </View>
          <View style={S.summaryCardAmber}>
            <Text style={S.summaryLabel}>TOTAL BORROWED</Text>
            <Text style={S.summaryValueAmber}>{`₵${totalBorrowed.toLocaleString()}`}</Text>
          </View>
          <View style={S.summaryCard}>
            <Text style={S.summaryLabel}>EF REPLENISHED</Text>
            <Text style={S.summaryValue}>{`+₵${(totalBorrowed + efAllocationAmount).toLocaleString()}`}</Text>
          </View>
          <View style={S.summaryCardGreen}>
            <Text style={S.summaryLabel}>FINAL EF BALANCE</Text>
            <Text style={S.summaryValueGreen}>{`₵${finalEFBalance.toLocaleString()}`}</Text>
          </View>
        </View>

        {/* Emergency Fund */}
        <Text style={S.sectionHeader}>Emergency Fund</Text>
        <View style={S.efCard}>
          <View style={[S.efRow, { marginBottom: 12 }]}>
            <Text style={{ fontSize: 10, fontWeight: 600, color: "#0E0E1C" }}>EF Breakdown</Text>
            <Text style={S.efValueLarge}>{`₵${finalEFBalance.toLocaleString()}`}</Text>
          </View>
          <View style={S.efRow}>
            <Text style={S.efLabel}>Borrowed returned on reconciliation</Text>
            <Text style={S.efValue}>{`+₵${totalBorrowed.toLocaleString()}`}</Text>
          </View>
          <View style={[S.efRow, { marginTop: 5 }]}>
            <Text style={S.efLabel}>{`Cycle allocation (${efLabel})`}</Text>
            <Text style={S.efValue}>{`+₵${efAllocationAmount.toLocaleString()}`}</Text>
          </View>
        </View>

        {/* Categories */}
        <Text style={S.sectionHeader}>Category Performance</Text>
        <View style={S.tableHeader}>
          <Text style={[S.tableHeaderText, S.colName]}>CATEGORY</Text>
          <Text style={[S.tableHeaderText, S.colAlloc]}>ALLOCATED</Text>
          <Text style={[S.tableHeaderText, S.colBorrowed]}>BORROWED</Text>
          <Text style={[S.tableHeaderText, S.colRemaining]}>REMAINING</Text>
          <Text style={[S.tableHeaderText, S.colStatus]}>STATUS</Text>
        </View>

        {categories.map((cat, i) => {
          const allocated = calcAllocated(cycle.expectedIncome, cat.allocationType, cat.allocationValue);
          const borrowed = catMap[cat.id] ?? 0;
          const remaining = allocated - borrowed;
          const pct = allocated > 0 ? (borrowed / allocated) * 100 : 0;
          const isOver = borrowed > allocated;
          const isWarn = !isOver && pct > 80;

          return (
            <View key={cat.id} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCellBold, S.colName]}>{cat.name}</Text>
              <Text style={[S.tableCell, S.colAlloc]}>{`₵${allocated.toLocaleString()}`}</Text>
              <Text style={[S.tableCell, S.colBorrowed]}>{`₵${borrowed.toLocaleString()}`}</Text>
              <Text style={[S.tableCell, S.colRemaining, { color: remaining < 0 ? "#DC2626" : "#15803D" }]}>
                {`${remaining < 0 ? "-" : "+"}₵${Math.abs(remaining).toLocaleString()}`}
              </Text>
              <Text style={[S.colStatus, isOver ? S.statusOver : isWarn ? S.statusWarn : S.statusOk]}>
                {isOver ? "OVER" : isWarn ? "HIGH" : "OK"}
              </Text>
            </View>
          );
        })}

        <View style={[S.divider, { marginTop: 16 }]} />

        {/* Withdrawals */}
        <Text style={[S.sectionHeader, { marginTop: 4 }]}>{`Withdrawal Log — ${wdCount}`}</Text>
        <View style={S.tableHeader}>
          <Text style={[S.tableHeaderText, S.wDate]}>DATE</Text>
          <Text style={[S.tableHeaderText, S.wCat]}>CATEGORY</Text>
          <Text style={[S.tableHeaderText, S.wNote]}>NOTE</Text>
          <Text style={[S.tableHeaderText, S.wAmount]}>AMOUNT</Text>
        </View>

        {withdrawals.length === 0 ? (
          <View style={[S.wRow, { paddingVertical: 14 }]}>
            <Text style={[S.tableCell, { color: "#8A88A0" }]}>No withdrawals logged in this cycle.</Text>
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
                <Text style={S.wAmount}>{`-₵${w.amount.toLocaleString()}`}</Text>
              </View>
            );
          })
        )}

        {/* Total row */}
        <View style={{ flexDirection: "row", paddingVertical: 9, paddingHorizontal: 12, backgroundColor: "#FFF7ED", borderRadius: 8, marginTop: 4 }}>
          <Text style={[S.tableCellBold, S.wDate]} />
          <Text style={[S.tableCellBold, S.wCat]} />
          <Text style={[S.tableCellBold, S.wNote]}>Total Borrowed</Text>
          <Text style={[S.wAmount, { fontWeight: 700, color: "#92400E" }]}>{`-₵${totalBorrowed.toLocaleString()}`}</Text>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>{`Generated ${generatedDate}  ·  Bridge`}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
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
      ensureFonts();
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
