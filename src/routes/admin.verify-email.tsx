import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { verifyEmailChangeServerFn } from "./admin";

export const Route = createFileRoute("/admin/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [message, setMessage] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    verifyEmailChangeServerFn({ data: { token } }).then((res) => {
      if (res?.success) {
        setStatus("success");
        setNewEmail(res.newEmail || "");
      } else {
        setStatus("error");
        setMessage(res?.error || "Invalid or expired verification link.");
      }
    }).catch(() => {
      setStatus("error");
      setMessage("Unable to verify email. Please try again.");
    });
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-orange mx-auto" size={48} />
          <p className="text-white/60 tracking-widest text-sm uppercase">Verifying email change...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] px-4">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-orange/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md bg-white/5 border rounded-xl p-8 backdrop-blur-xl relative z-10 shadow-2xl text-center ${
          status === "success" ? "border-emerald-500/20" : "border-red-500/20"
        }`}
      >
        {status === "success" ? (
          <>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mb-4">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Email Updated</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-2">
              Your administrator email has been successfully updated.
            </p>
            {newEmail && (
              <p className="text-sm text-orange font-semibold mb-6">{newEmail}</p>
            )}
            <p className="text-white/40 text-xs mb-6">All active sessions have been invalidated for security. Please sign in again.</p>
          </>
        ) : (
          <>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400 mb-4">
              <AlertCircle size={28} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">{message}</p>
          </>
        )}

        <Link
          to="/admin/login"
          className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          <ArrowLeft size={16} />
          Go to Login
        </Link>
      </motion.div>
    </div>
  );
}
