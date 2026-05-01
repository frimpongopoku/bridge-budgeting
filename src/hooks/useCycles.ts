"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cycle } from "@/types";

interface UseCyclesResult {
  cycles: Cycle[];
  loading: boolean;
}

export function useCycles(userId: string | undefined): UseCyclesResult {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "users", userId, "cycles"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setCycles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cycle)));
        setLoading(false);
      },
      (err) => {
        console.error("useCycles error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { cycles, loading };
}
