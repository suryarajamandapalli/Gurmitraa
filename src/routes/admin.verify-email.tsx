import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import { motion } from "motion/react";
import { Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] px-4">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-orange/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-xl relative z-10 shadow-2xl text-center"
      >
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange/15 text-orange mb-4">
          <Shield size={28} />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Admin Portal</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          Administrator authentication is managed securely via Firebase Authentication.
        </p>

        <Link
          to="/admin/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          <ArrowLeft size={16} />
          <span>Go to Admin Login</span>
        </Link>
      </motion.div>
    </div>
  );
}
