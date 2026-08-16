import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Unlock,
  RefreshCw,
  Check,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  ADMIN_EMAIL,
  loginAdmin,
  subscribeToAdminAuthState,
  sendAdminPasswordReset,
  getResetCooldownRemaining,
  formatAuthError,
} from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // If already authenticated as admin, route directly to dashboard
  useEffect(() => {
    const unsubscribe = subscribeToAdminAuthState((user) => {
      if (user) {
        navigate({ to: "/admin/dashboard", replace: true });
      } else {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070b13] text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-orange mx-auto" size={48} />
          <p className="text-white/60 tracking-widest text-sm uppercase">Verifying security session...</p>
        </div>
      </div>
    );
  }

  return <LoginView />;
}

function LoginView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginAdmin(email.trim(), password);
      toast.success("Welcome back, Administrator!");
      navigate({ to: "/admin/dashboard", replace: true });
    } catch (err: any) {
      toast.error(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] relative px-4 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-orange/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-md p-8 backdrop-blur-xl relative z-10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded bg-orange/15 text-orange mb-4">
              <Shield size={28} />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">GURMITRAA</h2>
            <p className="text-white/55 text-sm mt-1">Enterprise CMS Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/50 font-medium mb-3">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-white/30" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-md pl-12 pr-4 py-3 text-white placeholder-white/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/50 font-medium mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-white/30" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-white/50 hover:text-white transition font-semibold flex items-center gap-1"
              >
                <KeyRound size={12} />
                <span>Forgot Password?</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange hover:bg-orange/95 disabled:opacity-50 text-white font-semibold py-3.5 rounded-md transition shadow-lg shadow-orange/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <>
                  <Unlock size={18} />
                  <span>Verify &amp; Enter Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <a href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition">
              <ArrowLeft size={16} />
              <span>Return to Home</span>
            </a>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showForgotModal && (
          <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(getResetCooldownRemaining());

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      const remaining = getResetCooldownRemaining();
      setCooldown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your administrator email address.");
      return;
    }

    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before sending another reset request.`);
      return;
    }

    setLoading(true);
    try {
      await sendAdminPasswordReset(email.trim());
      setSent(true);
      setCooldown(getResetCooldownRemaining());
      toast.success("Password reset email sent!");
    } catch (err: any) {
      toast.error(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(7,11,19,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-md bg-[#0d1424] border border-white/10 rounded-xl p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mb-4">
              <Check size={22} />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-3">Check Your Inbox</h3>
            <p className="text-white/55 text-sm leading-relaxed mb-4">
              Password reset email sent to <span className="text-white font-semibold">{email}</span>.
            </p>
            <p className="text-white/40 text-xs leading-relaxed mb-6">
              Please check your inbox and follow the secure Firebase link to set your new password.
            </p>
            {cooldown > 0 && (
              <p className="text-orange text-xs font-semibold mb-4">
                You can request another email in {cooldown}s.
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg transition cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange/10 text-orange mb-3">
                <KeyRound size={22} />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Reset Admin Password</h3>
              <p className="text-white/55 text-sm mt-2 leading-relaxed">
                Enter your configured administrator email to receive a secure Firebase reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-medium mb-2">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-white/30" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-white/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition text-sm"
                  />
                </div>
              </div>

              {cooldown > 0 && (
                <div className="flex items-center gap-2 text-xs text-orange bg-orange/10 border border-orange/20 rounded p-2.5">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>Cooldown active: You can request another reset in {cooldown} seconds.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full bg-orange hover:bg-orange/90 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <>
                    <Mail size={16} />
                    <span>{cooldown > 0 ? `Wait ${cooldown}s` : "Send Reset Link"}</span>
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-semibold py-2.5 rounded-lg transition text-sm cursor-pointer"
            >
              Cancel
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
