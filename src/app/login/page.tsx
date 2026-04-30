"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#08080F" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(200,168,75,0.06) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,101,32,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-10 text-center space-y-8"
          style={{ background: "#0E0E1C", border: "1px solid #1E1E32" }}
        >
          {/* Logo */}
          <div className="space-y-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #C8A84B 0%, #7A5E1C 100%)",
                boxShadow: "0 8px 32px rgba(200,168,75,0.3)",
              }}
            >
              <TrendingUp className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#EBE5D0" }}>
                Bridge
              </h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "#8A88A0" }}>
                Know where you stand<br />between paychecks
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: "#13132A" }} />

          {/* Sign in section */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#706E88" }}>
              Sign in to continue
            </p>

            <motion.button
              whileHover={{ scale: 1.01, borderColor: "rgba(200,168,75,0.4)" }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "#151520",
                border: "1px solid #1E1E32",
                color: "#C5C0D0",
              }}
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "#5E5C74" }}>
            By signing in, you agree to our{" "}
            <span className="cursor-pointer transition-colors" style={{ color: "#8A88A0" }}>
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="cursor-pointer transition-colors" style={{ color: "#8A88A0" }}>
              Privacy Policy
            </span>
          </p>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs mt-6"
          style={{ color: "#5E5C74" }}
        >
          Built for people who think ahead.
        </motion.p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
