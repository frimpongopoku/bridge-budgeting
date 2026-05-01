"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cycle, Category, Withdrawal } from "@/types";

interface UseActiveCycleResult {
  cycle: Cycle | null;
  categories: Category[];
  withdrawals: Withdrawal[];
  loading: boolean;
}

export function useActiveCycle(userId: string | undefined): UseActiveCycleResult {
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listen to active cycle
    const cycleQuery = query(
      collection(db, "users", userId, "cycles"),
      where("status", "==", "active"),
      limit(1)
    );

    const unsubCycle = onSnapshot(
      cycleQuery,
      (snap) => {
        if (snap.empty) {
          setCycle(null);
          setCategories([]);
          setWithdrawals([]);
          setLoading(false);
          return;
        }
        const d = snap.docs[0];
        const activeCycle = { id: d.id, ...d.data() } as Cycle;
        setCycle(activeCycle);
        setLoading(false);
      },
      (err) => {
        console.error("useActiveCycle cycle error:", err);
        setLoading(false);
      }
    );

    return () => unsubCycle();
  }, [userId]);

  useEffect(() => {
    if (!userId || !cycle) {
      setCategories([]);
      setWithdrawals([]);
      return;
    }

    const catQuery = query(
      collection(db, "users", userId, "cycles", cycle.id, "categories"),
      orderBy("order", "asc")
    );

    const unsubCats = onSnapshot(
      catQuery,
      (snap) => {
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
      },
      (err) => console.error("useActiveCycle categories error:", err)
    );

    const wdQuery = query(
      collection(db, "users", userId, "cycles", cycle.id, "withdrawals"),
      orderBy("createdAt", "desc")
    );

    const unsubWds = onSnapshot(
      wdQuery,
      (snap) => {
        setWithdrawals(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Withdrawal)));
      },
      (err) => console.error("useActiveCycle withdrawals error:", err)
    );

    return () => {
      unsubCats();
      unsubWds();
    };
  }, [userId, cycle?.id]);

  return { cycle, categories, withdrawals, loading };
}
