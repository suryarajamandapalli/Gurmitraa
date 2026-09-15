import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, Lock, Eye, EyeOff, RefreshCw, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { updateAdminPasswordInDb } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateAdminPasswordInDb(newPassword);
      if (res.success) {
        setDone(true);
        toast.success("Password updated successfully!");
        setTimeout(() => {
          navigate({ to: "/admin/login", replace: true });
        }, 2000);
      } else {
        toast.error(res.error || "Failed to update password.");
      }
    } catch (err: any) {
      console.error("Password update error:", err);
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] relative px-4 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-orange/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        {done ? (
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mb-4">
              <Check size={28} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Password Updated!</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Your administrator password has been updated successfully. Redirecting to login...
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg transition"
            >
              Go to Login Now
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded bg-orange/15 text-orange mb-4">
                <Shield size={28} />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">Reset Password</h2>
              <p className="text-white/55 text-sm mt-1">Enter your new administrator password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-medium mb-3">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-white/30" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-md pl-12 pr-12 py-3 text-white placeholder-white/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-white/44 hover:text-white/70 transition p-0.5"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-medium mb-3">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-white/30" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-white/5 border border-white/10 rounded-md pl-12 pr-4 py-3 text-white placeholder-white/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange hover:bg-orange/95 disabled:opacity-50 text-white font-semibold py-3.5 rounded-md transition shadow-lg shadow-orange/20 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                <span>Update Password</span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition">
                <ArrowLeft size={16} />
                <span>Return to Login</span>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
