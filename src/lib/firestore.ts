import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  writeBatch,
  increment,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Cycle, Category, Withdrawal } from "@/types";

// ─── User Doc ────────────────────────────────────────────────────────────────

export async function getUserDoc(userId: string) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { emergencyFundBalance: null });
    return { emergencyFundBalance: null };
  }
  return snap.data();
}

export async function getEmergencyFundBalance(userId: string): Promise<number | null> {
  const data = await getUserDoc(userId);
  const raw = data?.emergencyFundBalance;
  if (raw === undefined || raw === null) return null;
  return raw as number;
}

export async function setEmergencyFundBalance(userId: string, balance: number): Promise<void> {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { emergencyFundBalance: balance });
  } else {
    await setDoc(ref, { emergencyFundBalance: balance });
  }
}

// ─── Cycles ──────────────────────────────────────────────────────────────────

export async function createCycle(
  userId: string,
  data: {
    name: string;
    expectedIncome: number;
    emergencyFundAllocationType: "percent" | "fixed";
    emergencyFundAllocationValue: number;
    borrowSource?: "emergencyFund" | "customFund";
    customFundName?: string;
    customFundBalance?: number;
  },
  categoriesData?: Omit<Category, "id">[]
): Promise<string> {
  const cyclesRef = collection(db, "users", userId, "cycles");
  const cyclePayload: Record<string, unknown> = {
    name: data.name,
    expectedIncome: data.expectedIncome,
    emergencyFundAllocationType: data.emergencyFundAllocationType,
    emergencyFundAllocationValue: data.emergencyFundAllocationValue,
    borrowSource: data.borrowSource ?? "emergencyFund",
    status: "active",
    createdAt: serverTimestamp(),
  };
  if (data.borrowSource === "customFund") {
    cyclePayload.customFundName = data.customFundName ?? "";
    cyclePayload.customFundBalance = data.customFundBalance ?? 0;
  }
  const cycleDoc = await addDoc(cyclesRef, cyclePayload);

  if (categoriesData && categoriesData.length > 0) {
    const batch = writeBatch(db);
    categoriesData.forEach((cat) => {
      const catRef = doc(collection(db, "users", userId, "cycles", cycleDoc.id, "categories"));
      batch.set(catRef, {
        name: cat.name,
        emoji: cat.emoji,
        allocationType: cat.allocationType,
        allocationValue: cat.allocationValue,
        order: cat.order,
      });
    });
    await batch.commit();
  }

  return cycleDoc.id;
}

export async function getCycles(userId: string): Promise<Cycle[]> {
  const q = query(
    collection(db, "users", userId, "cycles"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cycle));
}

export async function getCycle(userId: string, cycleId: string): Promise<Cycle | null> {
  const ref = doc(db, "users", userId, "cycles", cycleId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Cycle;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(userId: string, cycleId: string): Promise<Category[]> {
  const q = query(
    collection(db, "users", userId, "cycles", cycleId, "categories"),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function addCategory(
  userId: string,
  cycleId: string,
  data: Omit<Category, "id">
): Promise<string> {
  const ref = await addDoc(
    collection(db, "users", userId, "cycles", cycleId, "categories"),
    {
      name: data.name,
      emoji: data.emoji,
      allocationType: data.allocationType,
      allocationValue: data.allocationValue,
      order: data.order,
    }
  );
  return ref.id;
}

export async function updateCategory(
  userId: string,
  cycleId: string,
  categoryId: string,
  data: Partial<Omit<Category, "id">>
): Promise<void> {
  const ref = doc(db, "users", userId, "cycles", cycleId, "categories", categoryId);
  await updateDoc(ref, data);
}

export async function deleteCategory(
  userId: string,
  cycleId: string,
  categoryId: string
): Promise<void> {
  const ref = doc(db, "users", userId, "cycles", cycleId, "categories", categoryId);
  await deleteDoc(ref);
}

// ─── Withdrawals ─────────────────────────────────────────────────────────────

export async function getWithdrawals(userId: string, cycleId: string): Promise<Withdrawal[]> {
  const q = query(
    collection(db, "users", userId, "cycles", cycleId, "withdrawals"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Withdrawal));
}

export async function addWithdrawal(
  userId: string,
  cycleId: string,
  data: {
    amount: number;
    categoryId: string;
    categoryName: string;
    categoryEmoji: string;
    note: string;
  },
  borrowSource: "emergencyFund" | "customFund" = "emergencyFund"
): Promise<void> {
  const batch = writeBatch(db);

  const withdrawalRef = doc(
    collection(db, "users", userId, "cycles", cycleId, "withdrawals")
  );
  batch.set(withdrawalRef, {
    amount: data.amount,
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    categoryEmoji: data.categoryEmoji,
    note: data.note,
    createdAt: serverTimestamp(),
  });

  if (borrowSource === "customFund") {
    const cycleRef = doc(db, "users", userId, "cycles", cycleId);
    batch.update(cycleRef, { customFundBalance: increment(-data.amount) });
  } else {
    const userRef = doc(db, "users", userId);
    batch.update(userRef, { emergencyFundBalance: increment(-data.amount) });
  }

  await batch.commit();
}

export async function deleteWithdrawal(
  userId: string,
  cycleId: string,
  withdrawalId: string,
  amount: number,
  borrowSource: "emergencyFund" | "customFund" = "emergencyFund"
): Promise<void> {
  const batch = writeBatch(db);

  const withdrawalRef = doc(db, "users", userId, "cycles", cycleId, "withdrawals", withdrawalId);
  batch.delete(withdrawalRef);

  if (borrowSource === "customFund") {
    const cycleRef = doc(db, "users", userId, "cycles", cycleId);
    batch.update(cycleRef, { customFundBalance: increment(amount) });
  } else {
    const userRef = doc(db, "users", userId);
    batch.update(userRef, { emergencyFundBalance: increment(amount) });
  }

  await batch.commit();
}

// ─── Reconcile ───────────────────────────────────────────────────────────────

export async function reconcileCycle(
  userId: string,
  cycleId: string,
  totalBorrowed: number,
  efAllocationAmount: number,
  currentBalance: number,
  borrowSource: "emergencyFund" | "customFund" = "emergencyFund"
): Promise<void> {
  const batch = writeBatch(db);

  const reconciledEFBalance = currentBalance + totalBorrowed + efAllocationAmount;
  const replenishAmount = totalBorrowed + efAllocationAmount;

  const cycleRef = doc(db, "users", userId, "cycles", cycleId);
  batch.update(cycleRef, {
    status: "reconciled",
    reconciledAt: serverTimestamp(),
    reconciledEFBalance,
  });

  if (borrowSource === "customFund") {
    batch.update(cycleRef, { customFundBalance: increment(replenishAmount) });
  } else {
    const userRef = doc(db, "users", userId);
    batch.update(userRef, { emergencyFundBalance: increment(replenishAmount) });
  }

  await batch.commit();
}

export async function updateCycleEFAllocation(
  userId: string,
  cycleId: string,
  allocationType: "percent" | "fixed",
  allocationValue: number
): Promise<void> {
  const ref = doc(db, "users", userId, "cycles", cycleId);
  await updateDoc(ref, { emergencyFundAllocationType: allocationType, emergencyFundAllocationValue: allocationValue });
}

// ─── Active Cycle Query ───────────────────────────────────────────────────────

export async function getActiveCycle(userId: string): Promise<Cycle | null> {
  const q = query(
    collection(db, "users", userId, "cycles"),
    where("status", "==", "active"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Cycle;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function calcAllocated(
  income: number,
  allocType: "percent" | "fixed",
  value: number
): number {
  return allocType === "percent" ? (income * value) / 100 : value;
}

// Suppress unused import warning — Timestamp is re-exported for convenience
export { Timestamp };
