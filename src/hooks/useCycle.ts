"use client";

import { useState, useEffect } from "react";
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cycle, Category, Withdrawal } from "@/types";

interface UseCycleResult {
  cycle: Cycle | null;
  categories: Category[];
  withdrawals: Withdrawal[];
  loading: boolean;
}

export function useCycle(
  userId: string | undefined,
  cycleId: string | undefined
): UseCycleResult {
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !cycleId) {
      setLoading(false);
      return;
    }

    setLoading(true); // reset on any userId/cycleId change

    const cycleRef = doc(db, "users", userId, "cycles", cycleId);
    const unsubCycle = onSnapshot(
      cycleRef,
      (snap) => {
        if (snap.exists()) {
          setCycle({ id: snap.id, ...snap.data() } as Cycle);
        } else {
          setCycle(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("useCycle cycle error:", err);
        setLoading(false);
      }
    );

    const catQuery = query(
      collection(db, "users", userId, "cycles", cycleId, "categories"),
      orderBy("order", "asc")
    );
    const unsubCats = onSnapshot(
      catQuery,
      (snap) => {
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
      },
      (err) => console.error("useCycle categories error:", err)
    );

    const wdQuery = query(
      collection(db, "users", userId, "cycles", cycleId, "withdrawals"),
      orderBy("createdAt", "desc")
    );
    const unsubWds = onSnapshot(
      wdQuery,
      (snap) => {
        setWithdrawals(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Withdrawal)));
      },
      (err) => console.error("useCycle withdrawals error:", err)
    );

    return () => {
      unsubCycle();
      unsubCats();
      unsubWds();
    };
  }, [userId, cycleId]);

  return { cycle, categories, withdrawals, loading };
}
