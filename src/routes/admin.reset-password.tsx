import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Shield, Lock, Eye, EyeOff, RefreshCw, Check, AlertCircle, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  sendAdminPasswordReset,
  getResetCooldownRemaining,
  formatAuthError,
} from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "confirm_form" | "request_form" | "invalid">("checking");
  const [targetEmail, setTargetEmail] = useState("");
  
  // Confirmation state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Request link state
  const [requestSent, setRequestSent] = useState(false);
  const [cooldown, setCooldown] = useState(getResetCooldownRemaining());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("oobCode");

    if (code) {
      setOobCode(code);
      verifyPasswordResetCode(auth, code)
        .then((email) => {
          setTargetEmail(email || "");
          setStatus("confirm_form");
        })
        .catch(() => {
          setStatus("invalid");
        });
    } else {
      setStatus("request_form");
    }
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      const remaining = getResetCooldownRemaining();
      setCooldown(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) {
      toast.error("Please enter your administrator email.");
      return;
    }
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown}s before sending another request.`);
      return;
    }

    setLoading(true);
    try {
      await sendAdminPasswordReset(targetEmail.trim());
      setRequestSent(true);
      setCooldown(getResetCooldownRemaining());
      toast.success("Password reset email sent!");
    } catch (err: any) {
      toast.error(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setDone(true);
      toast.success("Password updated successfully!");
      setTimeout(() => {
        navigate({ to: "/admin/login", replace: true });
      }, 2000);
    } catch (err: any) {
      toast.error(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-orange mx-auto" size={48} />
          <p className="text-white/60 tracking-widest text-sm uppercase">Verifying password reset request...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] px-4">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/5 border border-red-500/20 rounded-xl p-8 backdrop-blur-xl relative z-10 shadow-2xl text-center"
        >
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400 mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Invalid or Expired Reset Link</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            The password reset link is invalid or has expired. Please request a new link.
          </p>
          <button
            onClick={() => setStatus("request_form")}
            className="inline-flex items-center justify-center gap-2 w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg transition text-sm cursor-pointer mb-3"
          >
            Request New Link
          </button>
          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white/70 font-semibold py-2.5 rounded-lg transition text-sm"
          >
            <ArrowLeft size={16} />
            <span>Return to Login</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] relative px-4 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-orange/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        {status === "confirm_form" ? (
          done ? (
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mb-4">
                <Check size={28} />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Password Updated!</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Your administrator password has been updated in Firebase. Redirecting to login...
              </p>
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg transition cursor-pointer"
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
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">Set New Password</h2>
                <p className="text-white/55 text-sm mt-1">
                  For account: <span className="text-orange font-semibold">{targetEmail}</span>
                </p>
              </div>

              <form onSubmit={handleConfirmSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-medium mb-3">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-white/30" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
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
                      minLength={8}
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
                  className="w-full bg-orange hover:bg-orange/95 disabled:opacity-50 text-white font-semibold py-3.5 rounded-md transition shadow-lg shadow-orange/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                  <span>Update Password</span>
                </button>
              </form>
            </>
          )
        ) : requestSent ? (
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mb-4">
              <Check size={28} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Check Your Inbox</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Password reset link sent to <span className="text-white font-semibold">{targetEmail}</span>.
            </p>
            <p className="text-white/40 text-xs leading-relaxed mb-6">
              Follow the secure link in the email to set your new password.
            </p>
            {cooldown > 0 && (
              <p className="text-orange text-xs font-semibold mb-4">
                You can request another email in {cooldown}s.
              </p>
            )}
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg transition"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded bg-orange/15 text-orange mb-4">
                <Shield size={28} />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">Reset Admin Password</h2>
              <p className="text-white/55 text-sm mt-1">Enter your administrator email below.</p>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-medium mb-3">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-white/30" size={18} />
                  <input
                    type="email"
                    required
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-md pl-12 pr-4 py-3 text-white placeholder-white/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition"
                  />
                </div>
              </div>

              {cooldown > 0 && (
                <div className="flex items-center gap-2 text-xs text-orange bg-orange/10 border border-orange/20 rounded p-2.5">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>Cooldown active: You can request another reset in {cooldown}s.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full bg-orange hover:bg-orange/95 disabled:opacity-50 text-white font-semibold py-3.5 rounded-md transition shadow-lg shadow-orange/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Mail size={18} />}
                <span>{cooldown > 0 ? `Wait ${cooldown}s` : "Send Reset Link"}</span>
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
