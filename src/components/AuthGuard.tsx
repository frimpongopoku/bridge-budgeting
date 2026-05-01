"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEmergencyFund } from "@/hooks/useEmergencyFund";
import { EmergencyFundSetup } from "@/components/EmergencyFundSetup";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { balance, loading: efLoading } = useEmergencyFund(user?.uid);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || (user && efLoading)) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ background: "#0A0A14" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #C8A84B 0%, #7A5E1C 100%)",
              boxShadow: "0 8px 32px rgba(200,168,75,0.3)",
            }}
          >
            <TrendingUp className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-sm font-medium" style={{ color: "#706E88" }}>
            Loading…
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  if (balance === null) {
    return <EmergencyFundSetup userId={user.uid} />;
  }

  return <>{children}</>;
}
