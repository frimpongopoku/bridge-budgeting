"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseEmergencyFundResult {
  balance: number | null;
  loading: boolean;
}

export function useEmergencyFund(userId: string | undefined): UseEmergencyFundResult {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const userRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const raw = data?.emergencyFundBalance;
          setBalance(raw === undefined || raw === null ? null : (raw as number));
        } else {
          setBalance(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("useEmergencyFund error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { balance, loading };
}
