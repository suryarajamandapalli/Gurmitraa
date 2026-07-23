import { createFileRoute, useNavigate, Outlet, Link, useLocation } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import {
  Settings,
  Layout,
  Inbox,
  Image as ImageIcon,
  LogOut,
  Lock,
  Mail,
  User,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  X,
  RefreshCw,
  Upload,
  Copy,
  Search,
  AlertCircle,
  HelpCircle,
  Palette,
  Phone,
  Type,
  Shield,
  Unlock,
  Globe,
  Menu,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCode,
  KeyRound,
  Send,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, set, push, remove, onValue, get as dbGet } from "firebase/database";
import { uploadAssetServerFn } from "@/lib/cloudinary";
import { createServerFn } from "@tanstack/react-start";
import { Toaster, toast } from "sonner";
import {
  DEFAULT_GLOBAL,
  DEFAULT_HOME,
  DEFAULT_ABOUT,
  DEFAULT_SERVICES,
  DEFAULT_PRODUCTS,
  DEFAULT_PORTFOLIO,
  DEFAULT_CONTACT,
} from "@/lib/cms-defaults";
import { deepMerge } from "@/lib/cms";

import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://csrcjsddxwykqbbuqerj.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzcmNqc2RkeHd5a3FiYnVxZXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQyNDk4MywiZXhwIjoyMDk5MDAwOTgzfQ.JRSyrWYqggj-K1DRQMhjH0Fx0-Q8utZDg9JsYM3FjrA";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_d1Dt9Dp7_Ht6TNGwvzzPCafXa9DdyMhb4";
// APP_URL resolution — priority order:
// 1. VITE_APP_URL / APP_URL — explicit override (set this in Vercel env vars to https://www.gurmitraa.com)
// 2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable canonical production hostname (NOT per-deployment)
// 3. Hardcoded fallback for local dev
//
// IMPORTANT: VERCEL_URL must NOT be used here — it returns the per-deployment preview URL
// which changes on every deploy and does NOT match the custom domain, causing the reset
// ?token= parameter to be lost when the browser is on a different origin.
const APP_URL =
  process.env.VITE_APP_URL ||
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://gurmitraa-three.vercel.app");

// Create server-side admin client using Service Role Key
const getSupabaseAdmin = () => createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Send email via Resend
const sendEmail = async (to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> => {
  console.log("sendEmail() invoked.");
  console.log(`- Recipient: ${to}`);
  console.log(`- Subject: ${subject}`);
  console.log(`- API Key exists: ${!!RESEND_API_KEY}`);

  try {
    const payload = {
      from: "GURMITRAA Admin <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    };
    console.log("- Payload:", JSON.stringify(payload, null, 2));

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log(`- Resend API HTTP status: ${res.status}`);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("- Resend error body:", JSON.stringify(body, null, 2));
      return { ok: false, error: body?.message || `HTTP ${res.status}: Email delivery failed` };
    }

    console.log("- Resend email sent successfully.");
    return { ok: true };
  } catch (err: any) {
    console.error("- sendEmail exception raised:", err);
    return { ok: false, error: err?.message || "Unable to send email" };
  }
};

// Delete ALL active sessions from Firebase (session invalidation)
const invalidateAllSessions = async () => {
  const sessionsRef = ref(db, "sessions");
  await remove(sessionsRef);
};

// Seed default administrator if admins table is empty
const bootstrapAdmin = async () => {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { data, error } = await supabaseAdmin.from("admins").select("id").limit(1);
    if (error) { console.error("bootstrapAdmin query error:", error); return; }
    if (!data || data.length === 0) {
      const passwordHash = bcrypt.hashSync("Ganesh@132", bcrypt.genSaltSync(10));
      await supabaseAdmin.from("admins").insert({
        email: "gurmitraa@gmail.com",
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) { console.error("bootstrapAdmin exception:", err); }
};

/* ---------------------------------------------------------------
   LOGIN
--------------------------------------------------------------- */
export const loginServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data as { email?: string; password?: string })
  .handler(async ({ data }) => {
    const { email, password } = data;
    if (!email || !password) return { success: false, error: "Please enter both email and password." };

    await bootstrapAdmin();

    const supabaseAdmin = getSupabaseAdmin();
    const { data: admin, error } = await supabaseAdmin
      .from("admins").select("*").eq("email", email.trim().toLowerCase()).maybeSingle();

    if (error) {
      console.error("Supabase admin lookup error:", error);
      return { 
        success: false, 
        error: error.message.includes("does not exist")
          ? "Database table 'admins' not found. Please verify backend setup."
          : "Database error during authentication check."
      };
    }
    if (!admin) return { success: false, error: "Invalid email or password." };

    if (!bcrypt.compareSync(password, admin.password_hash))
      return { success: false, error: "Invalid email or password." };

    const token = crypto.randomUUID();
    const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours
    const now = Date.now();

    await set(ref(db, `sessions/${token}`), {
      admin_id: admin.id,
      email: admin.email,
      created_at: now,
      expires_at: now + SESSION_DURATION_MS,
    });

    return { success: true, token, email: admin.email };
  });

/* ---------------------------------------------------------------
   VERIFY SESSION
--------------------------------------------------------------- */
export const verifySessionServerFn = createServerFn({ method: "GET" })
  .handler(async ({ request }) => {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) return { authenticated: false, reason: "No session token provided" };

    const snapshot = await dbGet(ref(db, `sessions/${token}`));
    if (!snapshot.exists()) return { authenticated: false, reason: "Session invalid or expired" };

    const sessionData = snapshot.val();
    if (sessionData.expires_at && Date.now() > sessionData.expires_at) {
      await remove(ref(db, `sessions/${token}`));
      return { authenticated: false, reason: "Session expired" };
    }

    return { authenticated: true, email: sessionData.email };
  });

/* ---------------------------------------------------------------
   LOGOUT
--------------------------------------------------------------- */
export const logoutServerFn = createServerFn({ method: "POST" })
  .handler(async ({ request }) => {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    const token = match ? match[1] : null;
    if (token) await remove(ref(db, `sessions/${token}`));
    return { success: true };
  });

/* ---------------------------------------------------------------
   UPDATE PASSWORD (Security Settings — no current password needed)
   Invalidates ALL sessions after change.
--------------------------------------------------------------- */
export const updatePasswordServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data as { newPassword?: string })
  .handler(async ({ data, request }) => {
    const { newPassword } = data;
    if (!newPassword || newPassword.length < 8)
      return { success: false, error: "Password must be at least 8 characters" };

    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) return { success: false, error: "Unauthorized session" };

    const sessionSnapshot = await dbGet(ref(db, `sessions/${token}`));
    if (!sessionSnapshot.exists()) return { success: false, error: "Unauthorized session" };

    const session = sessionSnapshot.val();
    const supabaseAdmin = getSupabaseAdmin();

    const { data: admin, error } = await supabaseAdmin
      .from("admins").select("id").eq("email", session.email).maybeSingle();
    if (error || !admin) return { success: false, error: "Administrator record not found" };

    const newPasswordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
    const { error: updateError } = await supabaseAdmin
      .from("admins")
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq("email", session.email);

    if (updateError) return { success: false, error: updateError.message };

    // Invalidate ALL sessions so the admin must re-login
    await invalidateAllSessions();

    return { success: true };
  });

/* ---------------------------------------------------------------
   REQUEST PASSWORD RESET (Forgot Password)
   Sends a secure one-time link to the admin's registered email.
--------------------------------------------------------------- */
export const requestPasswordResetServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data as { email?: string })
  .handler(async ({ data }) => {
    const { email } = data;
    // Always return success to avoid revealing if an email exists
    if (!email) return { success: true };

    const supabaseAdmin = getSupabaseAdmin();
    const { data: admin } = await supabaseAdmin
      .from("admins").select("email").eq("email", email.trim().toLowerCase()).maybeSingle();

    if (!admin) {
      // Don't reveal the account doesn't exist
      return { success: true };
    }

    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    await set(ref(db, `reset_tokens/${token}`), {
      email: admin.email,
      expires_at: expiresAt,
      used: false,
    });

    const resetLink = `${APP_URL}/admin/reset-password?token=${token}`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#070b13;color:#fff;border-radius:12px;padding:40px;border:1px solid #1e2a3a;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:24px;font-weight:700;letter-spacing:2px;margin:0;color:#fff;">GURMITRAA</h1>
          <p style="color:#666;font-size:12px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1px;">Admin Password Reset</p>
        </div>
        <p style="color:#ccc;font-size:15px;line-height:1.6;margin-bottom:24px;">
          You requested a password reset for the GURMITRAA administrator account.
          Click the button below to set a new password. This link is valid for <strong>30 minutes</strong> and can only be used once.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetLink}" style="background:#f97316;color:#fff;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;display:inline-block;letter-spacing:0.5px;">
            Reset Password
          </a>
        </div>
        <p style="color:#555;font-size:12px;line-height:1.5;margin-top:32px;border-top:1px solid #1e2a3a;padding-top:20px;">
          If you did not request this, ignore this email. Your password will not change.<br/>
          This link expires at ${new Date(expiresAt).toUTCString()}.
        </p>
      </div>
    `;

    const { ok, error: emailError } = await sendEmail(admin.email, "Reset your GURMITRAA admin password", html);
    if (!ok) {
      await remove(ref(db, `reset_tokens/${token}`));
      return { success: false, error: emailError || "Unable to send reset email. Please try again." };
    }

    return { success: true };
  });

/* ---------------------------------------------------------------
   VERIFY RESET TOKEN
--------------------------------------------------------------- */
export const verifyResetTokenServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: any) => data as { token?: string })
  .handler(async ({ data }) => {
    const { token } = data;
    if (!token) return { valid: false, error: "Invalid or expired reset token." };

    const snapshot = await dbGet(ref(db, `reset_tokens/${token}`));
    if (!snapshot.exists()) return { valid: false, error: "Invalid or expired reset token." };

    const record = snapshot.val();
    if (record.used) return { valid: false, error: "This reset link has already been used." };
    if (Date.now() > record.expires_at) {
      await remove(ref(db, `reset_tokens/${token}`));
      return { valid: false, error: "The reset link has expired. Please request a new one." };
    }

    return { valid: true };
  });

/* ---------------------------------------------------------------
   APPLY PASSWORD RESET
   Validates token, updates password, invalidates all sessions.
--------------------------------------------------------------- */
export const applyPasswordResetServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data as { token?: string; newPassword?: string })
  .handler(async ({ data }) => {
    const { token, newPassword } = data;
    if (!token || !newPassword) return { success: false, error: "Missing fields" };
    if (newPassword.length < 8) return { success: false, error: "Password must be at least 8 characters" };

    const snapshot = await dbGet(ref(db, `reset_tokens/${token}`));
    if (!snapshot.exists()) return { success: false, error: "Invalid or expired reset token." };

    const record = snapshot.val();
    if (record.used) return { success: false, error: "This reset link has already been used." };
    if (Date.now() > record.expires_at) {
      await remove(ref(db, `reset_tokens/${token}`));
      return { success: false, error: "The reset link has expired. Please request a new one." };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const newPasswordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));

    const { error: updateError } = await supabaseAdmin
      .from("admins")
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq("email", record.email);

    if (updateError) return { success: false, error: "Failed to update password. Please try again." };

    // Mark token as used then remove it
    await remove(ref(db, `reset_tokens/${token}`));

    // Invalidate all active sessions
    await invalidateAllSessions();

    return { success: true };
  });

/* ---------------------------------------------------------------
   REQUEST EMAIL CHANGE
   Sends verification link to the NEW email address.
--------------------------------------------------------------- */
export const requestEmailChangeServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data as { newEmail?: string })
  .handler(async ({ data, request }) => {
    const { newEmail } = data;
    if (!newEmail) return { success: false, error: "Please enter a new email address." };

    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) return { success: false, error: "Unauthorized session" };

    const sessionSnapshot = await dbGet(ref(db, `sessions/${token}`));
    if (!sessionSnapshot.exists()) return { success: false, error: "Unauthorized session" };

    const session = sessionSnapshot.val();
    if (newEmail.trim().toLowerCase() === session.email.toLowerCase())
      return { success: false, error: "New email must be different from the current email." };

    const verifyToken = crypto.randomUUID();
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    await set(ref(db, `email_tokens/${verifyToken}`), {
      current_email: session.email,
      new_email: newEmail.trim().toLowerCase(),
      expires_at: expiresAt,
    });

    const verifyLink = `${APP_URL}/admin/verify-email?token=${verifyToken}`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#070b13;color:#fff;border-radius:12px;padding:40px;border:1px solid #1e2a3a;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:24px;font-weight:700;letter-spacing:2px;margin:0;color:#fff;">GURMITRAA</h1>
          <p style="color:#666;font-size:12px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1px;">Email Verification</p>
        </div>
        <p style="color:#ccc;font-size:15px;line-height:1.6;margin-bottom:24px;">
          A request was made to change the administrator email for your GURMITRAA account.
          Click the button below to verify this email address and complete the change. This link is valid for <strong>30 minutes</strong>.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyLink}" style="background:#f97316;color:#fff;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;display:inline-block;letter-spacing:0.5px;">
            Verify New Email
          </a>
        </div>
        <p style="color:#555;font-size:12px;line-height:1.5;margin-top:32px;border-top:1px solid #1e2a3a;padding-top:20px;">
          If you did not request this change, ignore this email. Your account email will remain unchanged.<br/>
          This link expires at ${new Date(expiresAt).toUTCString()}.
        </p>
      </div>
    `;

    const { ok, error: emailError } = await sendEmail(newEmail.trim(), "Verify your new GURMITRAA admin email", html);
    if (!ok) {
      await remove(ref(db, `email_tokens/${verifyToken}`));
      return { success: false, error: emailError || "Unable to send verification email. Please try again." };
    }

    return { success: true };
  });

/* ---------------------------------------------------------------
   VERIFY EMAIL CHANGE
   Called when the admin clicks the verification link.
--------------------------------------------------------------- */
export const verifyEmailChangeServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data as { token?: string })
  .handler(async ({ data }) => {
    const { token } = data;
    if (!token) return { success: false, error: "Invalid verification link." };

    const snapshot = await dbGet(ref(db, `email_tokens/${token}`));
    if (!snapshot.exists()) return { success: false, error: "Invalid or expired verification link." };

    const record = snapshot.val();
    if (Date.now() > record.expires_at) {
      await remove(ref(db, `email_tokens/${token}`));
      return { success: false, error: "The verification link has expired. Please request a new one." };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error: updateError } = await supabaseAdmin
      .from("admins")
      .update({ email: record.new_email, updated_at: new Date().toISOString() })
      .eq("email", record.current_email);

    if (updateError) return { success: false, error: "Failed to update email. Please try again." };

    await remove(ref(db, `email_tokens/${token}`));
    // Invalidate all sessions since email changed
    await invalidateAllSessions();

    return { success: true, newEmail: record.new_email };
  });







export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans antialiased">
      <Toaster position="top-right" theme="dark" />
      <Outlet />
    </div>
  );
}

// Available pages and their defaults
const PAGE_CONFIGS = {
  home: { label: "Home Page", defaults: DEFAULT_HOME },
  about: { label: "About Page", defaults: DEFAULT_ABOUT },
  services: { label: "Services Page", defaults: DEFAULT_SERVICES },
  products: { label: "Products Page", defaults: DEFAULT_PRODUCTS },
  portfolio: { label: "Portfolio Page", defaults: DEFAULT_PORTFOLIO },
  contact: { label: "Contact Page", defaults: DEFAULT_CONTACT },
};



/* ==========================================
   MAIN DASHBOARD LAYOUT
   ========================================== */
export function AdminDashboard({ adminEmail, onLogout }: { adminEmail: string, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<"global" | "pages" | "media" | "submissions" | "security">(
    "global",
  );
  const [globalData, setGlobalData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  // For media picker feature
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    path: string;
    callback: (url: string) => void;
  } | null>(null);

  // Sync real-time settings, submissions, media
  useEffect(() => {
    setDbLoading(true);

    // Sync query parameters to route to correct tab
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "change-password" || tabParam === "security") {
      setActiveTab("security");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const unsubGlobal = onValue(
      ref(db, "global"),
      (snapshot) => {
        const data = snapshot.val();
        setGlobalData(deepMerge(DEFAULT_GLOBAL, data));
        setDbLoading(false);
      },
      (error) => {
        console.error("Firebase fetch error (global):", error);
        toast.error(`Database Error: ${error.message}. Loaded defaults.`);
        setGlobalData(DEFAULT_GLOBAL);
        setDbLoading(false);
      }
    );

    const unsubSubmissions = onValue(
      ref(db, "submissions"),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([key, val]: any) => ({
            id: key,
            ...val,
          }));
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setSubmissions(list);
        } else {
          setSubmissions([]);
        }
      },
      (error) => {
        console.error("Firebase fetch error (submissions):", error);
        toast.error("Failed to load submissions from database.");
        setSubmissions([]);
      }
    );

    const unsubMedia = onValue(
      ref(db, "media"),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([key, val]: any) => ({
            id: key,
            ...val,
          }));
          list.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
          setMediaItems(list);
        } else {
          setMediaItems([]);
        }
      },
      (error) => {
        console.error("Firebase fetch error (media):", error);
        toast.error("Failed to load media assets from database.");
        setMediaItems([]);
      }
    );

    return () => {
      unsubGlobal();
      unsubSubmissions();
      unsubMedia();
    };
  }, []);

  const handleLogout = async () => {
    onLogout();
  };

  const openMediaPicker = (path: string, callback: (url: string) => void) => {
    setMediaPickerTarget({ path, callback });
  };

  const selectMediaFromPicker = (url: string) => {
    if (mediaPickerTarget) {
      mediaPickerTarget.callback(url);
      setMediaPickerTarget(null);
      toast.success("Media selected successfully!");
    }
  };

  if (dbLoading || !globalData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070b13] text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-orange mx-auto" size={48} />
          <p className="text-white/60 tracking-widest text-sm uppercase">
            Loading database configurations...
          </p>
        </div>
      </div>
    );
  }

  const userAvatarInitial = adminEmail ? adminEmail.charAt(0).toUpperCase() : "A";

  return (
    <div className="flex h-screen bg-[#070b13] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white/5 border-r border-white/10 flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <img src="/Logo.png" alt="GURMITRAA Logo" className="h-10 w-10 object-contain rounded-[4px]" />
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight">GURMITRAA</h1>
              <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">
                Content Engine
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: "global", label: "Global Configurations", icon: Settings },
              { id: "pages", label: "Page & Sections", icon: Layout },
              { id: "media", label: "Media Library", icon: ImageIcon },
              {
                id: "submissions",
                label: "Form Submissions",
                icon: Inbox,
                badge: submissions.length,
              },
              { id: "security", label: "Security & Pass", icon: Shield },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-md text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-orange text-white shadow-lg shadow-orange/15"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon size={18} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.id ? "bg-white text-orange" : "bg-orange text-white"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-white/5 border border-white/5 rounded p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-orange/15 grid place-items-center text-orange font-bold text-sm">
              {userAvatarInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Signed in as
              </p>
              <p className="text-sm font-bold text-white/90 truncate" title={adminEmail}>
                {adminEmail || "Admin User"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-md transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen bg-[#070b13] overflow-y-auto">
        <header className="px-10 py-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#070b13]/80 backdrop-blur-md z-30">
          <h2 className="font-display font-bold text-2xl uppercase tracking-wider">
            {activeTab === "global" && "Global Settings"}
            {activeTab === "pages" && "Pages & Sections"}
            {activeTab === "media" && "Media Manager"}
            {activeTab === "submissions" && "Contact Inquiries"}
            {activeTab === "security" && "Security & Passcode"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">
              Live database sync
            </span>
          </div>
        </header>

        <div className="p-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === "global" && (
                <GlobalConfigManager
                  initialGlobalData={globalData}
                  openMediaPicker={openMediaPicker}
                />
              )}
              {activeTab === "pages" && (
                <PagesManager openMediaPicker={openMediaPicker} globalData={globalData} />
              )}
              {activeTab === "media" && (
                <MediaManager
                  mediaItems={mediaItems}
                  isPickerMode={false}
                  onSelectMedia={() => {}}
                />
              )}
              {activeTab === "submissions" && <SubmissionsManager submissions={submissions} />}
              {activeTab === "security" && <ChangePasswordManager />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-50 bg-[#000000d0] backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0d1424] border border-white/15 rounded-md w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold flex items-center gap-2">
                  <ImageIcon className="text-orange" size={20} />
                  <span>Choose Asset</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Select an asset from the media library to fill:{" "}
                  <code className="text-orange bg-white/5 px-1 py-0.5 rounded font-mono">
                    {mediaPickerTarget.path}
                  </code>
                </p>
              </div>
              <button
                onClick={() => setMediaPickerTarget(null)}
                className="h-10 w-10 bg-white/5 border border-white/10 rounded-full grid place-items-center hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <MediaManager
                mediaItems={mediaItems}
                isPickerMode={true}
                onSelectMedia={selectMediaFromPicker}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   SECURITY SETTINGS
   ========================================== */
function ChangePasswordManager() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message || "Failed to update password.");
      } else {
        toast.success("Password updated successfully.");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Please enter a new email address.");
      return;
    }
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) {
        toast.error(error.message || "Failed to update email.");
      } else {
        setEmailSent(true);
        toast.success("Verification link sent to your new email!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Change Password */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-7">
          <div className="h-10 w-10 bg-orange/15 rounded-lg flex items-center justify-center text-orange">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Change Password</h3>
            <p className="text-xs text-white/45 mt-0.5">Set a new administrator password. All active sessions will be invalidated.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-white/30" size={16} />
              <input
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-11 py-2.5 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-white/35 hover:text-white/70 transition p-0.5">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-white/30" size={16} />
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-11 py-2.5 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-white/35 hover:text-white/70 transition p-0.5">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-orange hover:bg-orange/90 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg transition flex items-center gap-2 shadow-lg shadow-orange/20"
            >
              {loading ? <RefreshCw className="animate-spin" size={15} /> : <Check size={15} />}
              Update Password
            </button>
            <button
              type="button"
              onClick={() => { setNewPassword(""); setConfirmPassword(""); }}
              disabled={loading}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-medium py-2.5 px-6 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Change Email */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-7">
          <div className="h-10 w-10 bg-blue-500/15 rounded-lg flex items-center justify-center text-blue-400">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Change Email</h3>
            <p className="text-xs text-white/45 mt-0.5">A verification link will be sent to the new email address.</p>
          </div>
        </div>

        {emailSent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5 flex items-start gap-3">
            <Check className="text-emerald-400 mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-sm font-semibold text-emerald-300">Verification link sent!</p>
              <p className="text-xs text-white/55 mt-1">
                A verification link has been sent to <span className="text-white font-semibold">{newEmail}</span>.
                Click it to confirm the email change. The link expires in 30 minutes.
              </p>
              <button
                onClick={() => { setEmailSent(false); setNewEmail(""); }}
                className="text-xs text-orange hover:text-orange/80 font-semibold mt-3 transition"
              >
                Send to a different address
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">New Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 text-white/30" size={16} />
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={emailLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg transition flex items-center gap-2"
            >
              {emailLoading ? <RefreshCw className="animate-spin" size={15} /> : <Send size={15} />}
              Send Verification Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}



/* ==========================================
   GLOBAL CONFIGURATION MANAGER
   ========================================== */
function GlobalConfigManager({
  initialGlobalData,
  openMediaPicker,
}: {
  initialGlobalData: any;
  openMediaPicker: any;
}) {
  const [globalState, setGlobalState] = useState<any>(initialGlobalData);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state if initial changes from DB
  useEffect(() => {
    setGlobalState(initialGlobalData);
    setHasUnsaved(false);
  }, [initialGlobalData]);

  const updateGlobalField = (path: string[], value: any) => {
    const updated = { ...globalState };
    let current = updated;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setGlobalState(updated);
    setHasUnsaved(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await set(ref(db, "global"), globalState);
      setHasUnsaved(false);
      toast.success("Global configuration published successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {hasUnsaved && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-500" size={20} />
            <p className="text-sm font-semibold">You have unsaved changes in Global Settings.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setGlobalState(initialGlobalData);
                setHasUnsaved(false);
                toast.info("Changes discarded");
              }}
              className="px-4 py-1.5 text-xs font-bold hover:bg-white/5 border border-white/10 rounded-md transition"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange hover:bg-orange/95 px-4 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5"
            >
              {saving ? <RefreshCw className="animate-spin" size={12} /> : <Check size={12} />}
              <span>Publish Changes</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Identity & Visuals */}
          <div className="bg-white/5 border border-white/10 rounded-md p-6 space-y-4">
            <h3 className="font-display font-bold text-lg border-b border-white/10 pb-3 flex items-center gap-2">
              <Globe size={18} className="text-orange" />
              <span>Identity & General</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Logo Text
                </label>
                <input
                  type="text"
                  value={globalState.logo || ""}
                  onChange={(e) => updateGlobalField(["logo"], e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
                  placeholder="e.g. GURMITRAA"
                />
              </div>
              <div className="sm:col-span-2">
                <PremiumMediaFieldEditor
                  label="Logo Image"
                  value={globalState.logoUrl || ""}
                  onChange={(url) => updateGlobalField(["logoUrl"], url)}
                  openMediaPicker={openMediaPicker}
                  path={["global", "logoUrl"]}
                />
              </div>
              <div className="sm:col-span-2">
                <PremiumMediaFieldEditor
                  label="Long Logo Image"
                  value={globalState.longLogoUrl || ""}
                  onChange={(url) => updateGlobalField(["longLogoUrl"], url)}
                  openMediaPicker={openMediaPicker}
                  path={["global", "longLogoUrl"]}
                />
              </div>
              <div className="sm:col-span-2">
                <PremiumMediaFieldEditor
                  label="Favicon Icon"
                  value={globalState.favicon || ""}
                  onChange={(url) => updateGlobalField(["favicon"], url)}
                  openMediaPicker={openMediaPicker}
                  path={["global", "favicon"]}
                />
              </div>
            </div>
          </div>

          {/* Theme & Styling */}
          <div className="bg-white/5 border border-white/10 rounded-md p-6 space-y-4">
            <h3 className="font-display font-bold text-lg border-b border-white/10 pb-3 flex items-center gap-2">
              <Palette size={18} className="text-orange" />
              <span>Theme Colors & Fonts</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest border-b border-white/5 pb-1">
                  Branding Palette
                </p>
                {[
                  { key: "primaryColor", label: "Primary Theme Color" },
                  { key: "accentColor", label: "Accent Highlight Color" },
                  { key: "backgroundColor", label: "Page Background Color" },
                  { key: "foregroundColor", label: "Text/Foreground Color" },
                ].map((color) => (
                  <div key={color.key} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-white/70">{color.label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={globalState.theme?.[color.key] || ""}
                        onChange={(e) => updateGlobalField(["theme", color.key], e.target.value)}
                        className="w-24 text-center font-mono bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:border-orange outline-none transition"
                      />
                      <input
                        type="color"
                        value={globalState.theme?.[color.key] || "#000000"}
                        onChange={(e) => updateGlobalField(["theme", color.key], e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border-none bg-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest border-b border-white/5 pb-1">
                  Google Fonts
                </p>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/40 font-semibold mb-2">
                    Primary Text Font
                  </label>
                  <input
                    type="text"
                    value={globalState.fonts?.primaryFont || "Inter"}
                    onChange={(e) => updateGlobalField(["fonts", "primaryFont"], e.target.value)}
                    placeholder="e.g. Inter"
                    className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/40 font-semibold mb-2">
                    Display Headers Font
                  </label>
                  <input
                    type="text"
                    value={globalState.fonts?.displayFont || "Space Grotesk"}
                    onChange={(e) => updateGlobalField(["fonts", "displayFont"], e.target.value)}
                    placeholder="e.g. Space Grotesk"
                    className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Default SEO settings */}
          <div className="bg-white/5 border border-white/10 rounded-md p-6 space-y-4">
            <h3 className="font-display font-bold text-lg border-b border-white/10 pb-3 flex items-center gap-2">
              <FileCode size={18} className="text-orange" />
              <span>Default SEO Metadata</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Default Window Title
                </label>
                <input
                  type="text"
                  value={globalState.meta?.defaultTitle || ""}
                  onChange={(e) => updateGlobalField(["meta", "defaultTitle"], e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Default Description
                </label>
                <textarea
                  rows={3}
                  value={globalState.meta?.defaultDescription || ""}
                  onChange={(e) =>
                    updateGlobalField(["meta", "defaultDescription"], e.target.value)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Tracking Codes */}
          <div className="bg-white/5 border border-white/10 rounded-md p-6 space-y-4">
            <h3 className="font-display font-bold text-lg border-b border-white/10 pb-3 flex items-center gap-2">
              <FileCode size={18} className="text-orange" />
              <span>Analytics & Tracking</span>
            </h3>
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                Google Tag / Custom scripts
              </label>
              <textarea
                rows={8}
                value={globalState.analytics || ""}
                onChange={(e) => updateGlobalField(["analytics"], e.target.value)}
                placeholder="<!-- Paste Google Analytics tag or script tag here -->"
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-xs text-white font-mono focus:border-orange outline-none transition"
              />
              <p className="text-[10px] text-white/30 mt-2">
                Careful: Script injections run immediately on page rendering.
              </p>
            </div>
          </div>

          {/* Footer & Contacts */}
          <div className="bg-white/5 border border-white/10 rounded-md p-6 space-y-4">
            <h3 className="font-display font-bold text-lg border-b border-white/10 pb-3 flex items-center gap-2">
              <FileText size={18} className="text-orange" />
              <span>Footer & Contact Details</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={globalState.footer?.contactDetails?.email || ""}
                  onChange={(e) =>
                    updateGlobalField(["footer", "contactDetails", "email"], e.target.value)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:border-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={globalState.footer?.contactDetails?.phone || ""}
                  onChange={(e) =>
                    updateGlobalField(["footer", "contactDetails", "phone"], e.target.value)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:border-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Studio Location
                </label>
                <input
                  type="text"
                  value={globalState.footer?.contactDetails?.address || ""}
                  onChange={(e) =>
                    updateGlobalField(["footer", "contactDetails", "address"], e.target.value)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:border-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Footer Copyright Text
                </label>
                <input
                  type="text"
                  value={globalState.footer?.copyright || ""}
                  onChange={(e) => updateGlobalField(["footer", "copyright"], e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:border-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Footer Credit Link Text
                </label>
                <input
                  type="text"
                  value={globalState.footer?.madeByText || ""}
                  onChange={(e) => updateGlobalField(["footer", "madeByText"], e.target.value)}
                  placeholder="MADE BY ARANEA DEN"
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:border-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Footer Credit Link URL
                </label>
                <input
                  type="url"
                  value={globalState.footer?.madeByUrl || ""}
                  onChange={(e) => updateGlobalField(["footer", "madeByUrl"], e.target.value)}
                  placeholder="https://www.araneaden.com"
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:border-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  Footer Credit Logo Path
                </label>
                <input
                  type="text"
                  value={globalState.footer?.madeByLogoUrl || ""}
                  onChange={(e) => updateGlobalField(["footer", "madeByLogoUrl"], e.target.value)}
                  placeholder="/images/araneaden-logo.png"
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:border-orange outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 sticky bottom-0 bg-[#070b13] py-4 border-t border-white/10">
        <button
          onClick={handleSave}
          disabled={saving || !hasUnsaved}
          className="bg-orange hover:bg-orange/90 text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition duration-300 flex items-center gap-2"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          <span>Publish Global Configurations</span>
        </button>
      </div>
    </div>
  );
}

/* ==========================================
   PAGES MANAGER
   ========================================== */
function PagesManager({
  openMediaPicker,
  globalData,
}: {
  openMediaPicker: any;
  globalData: any;
}) {
  const [selectedPage, setSelectedPage] = useState<keyof typeof PAGE_CONFIGS>("home");
  const [pageState, setPageState] = useState<any>(null);
  const [initialDbData, setInitialDbData] = useState<any>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);

  // Drag and Drop ordering state
  const [pageKeys, setPageKeys] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const hrefToKey: Record<string, string> = {
      "/": "home",
      "/about": "about",
      "/services": "services",
      "/products": "products",
      "/portfolio": "portfolio",
      "/contact": "contact",
    };
    const defaultKeys = ["home", "about", "services", "products", "portfolio", "contact"];
    
    if (globalData?.navbar) {
      const keysFromNavbar = globalData.navbar
        .map((l: any) => hrefToKey[l.href])
        .filter(Boolean);
      const mergedKeys = [...new Set([...keysFromNavbar, ...defaultKeys])];
      setPageKeys(mergedKeys);
    } else {
      setPageKeys(defaultKeys);
    }
  }, [globalData]);

  const saveNewPageOrder = async (newPageKeys: string[]) => {
    try {
      const hrefToKey: Record<string, string> = {
        "/": "home",
        "/about": "about",
        "/services": "services",
        "/products": "products",
        "/portfolio": "portfolio",
        "/contact": "contact",
      };
      
      const currentNavbar = globalData?.navbar || DEFAULT_GLOBAL.navbar;
      const linksByKey: Record<string, any> = {};
      currentNavbar.forEach((link: any) => {
        const key = hrefToKey[link.href];
        if (key) {
          linksByKey[key] = link;
        }
      });
      
      const newNavbar: any[] = [];
      newPageKeys.forEach((key) => {
        if (linksByKey[key]) {
          newNavbar.push(linksByKey[key]);
        } else {
          const defaultLink = DEFAULT_GLOBAL.navbar.find((l: any) => hrefToKey[l.href] === key);
          if (defaultLink) {
            newNavbar.push(defaultLink);
          }
        }
      });
      
      await set(ref(db, "global/navbar"), newNavbar);
      toast.success("Navigation menu reordered successfully!");
    } catch (err: any) {
      console.error("Failed to save page order:", err);
      toast.error("Failed to save page order to database");
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updatedKeys = [...pageKeys];
    const [draggedKey] = updatedKeys.splice(draggedIndex, 1);
    updatedKeys.splice(targetIndex, 0, draggedKey);

    setPageKeys(updatedKeys);
    setDraggedIndex(null);
    setDragOverIndex(null);

    await saveNewPageOrder(updatedKeys);
  };

  const movePageKey = async (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pageKeys.length) return;
    
    const updatedKeys = [...pageKeys];
    const temp = updatedKeys[index];
    updatedKeys[index] = updatedKeys[targetIndex];
    updatedKeys[targetIndex] = temp;
    
    setPageKeys(updatedKeys);
    await saveNewPageOrder(updatedKeys);
  };

  const togglePageVisibility = async (key: string) => {
    try {
      const hrefToKey: Record<string, string> = {
        "/": "home",
        "/about": "about",
        "/services": "services",
        "/products": "products",
        "/portfolio": "portfolio",
        "/contact": "contact",
      };
      
      const currentNavbar = globalData?.navbar || DEFAULT_GLOBAL.navbar;
      const updatedNavbar = currentNavbar.map((link: any) => {
        const linkKey = hrefToKey[link.href];
        if (linkKey === key) {
          return { ...link, hidden: !link.hidden };
        }
        return link;
      });
      
      await set(ref(db, "global/navbar"), updatedNavbar);
      toast.success("Page visibility updated successfully!");
    } catch (err: any) {
      console.error("Failed to toggle page visibility:", err);
      toast.error("Failed to update page visibility");
    }
  };

  // Sync real-time page content from database
  useEffect(() => {
    setPageState(null);
    setInitialDbData(null);
    setHasUnsaved(false);
    setEditingSectionIndex(null);

    const config = PAGE_CONFIGS[selectedPage];
    const pageRef = ref(db, `pages/${selectedPage}`);

    const unsub = onValue(pageRef, (snapshot) => {
      const data = snapshot.val();
      const merged = deepMerge(config.defaults, data);

      // Ensure correct section ordering from DB
      if (merged.sections) {
        merged.sections.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      }

      setPageState(merged);
      setInitialDbData(JSON.parse(JSON.stringify(merged))); // deep copy
      setHasUnsaved(false);
    });

    return () => unsub();
  }, [selectedPage]);

  const updatePageState = (updater: (draft: any) => void) => {
    const nextState = JSON.parse(JSON.stringify(pageState));
    updater(nextState);
    setPageState(nextState);
    setHasUnsaved(true);
  };

  const handleSavePage = async () => {
    setSaving(true);
    try {
      // Re-assign strict order values before saving
      const cleanSections = pageState.sections.map((sec: any, index: number) => ({
        ...sec,
        order: index,
      }));
      const payload = {
        ...pageState,
        sections: cleanSections,
      };

      await set(ref(db, `pages/${selectedPage}`), payload);
      setHasUnsaved(false);
      toast.success(`${PAGE_CONFIGS[selectedPage].label} successfully published!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish page content");
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!pageState?.sections) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pageState.sections.length) return;

    updatePageState((draft) => {
      const temp = draft.sections[index];
      draft.sections[index] = draft.sections[targetIndex];
      draft.sections[targetIndex] = temp;
    });

    // If currently editing, keep trace of the item index shift
    if (editingSectionIndex === index) {
      setEditingSectionIndex(targetIndex);
    } else if (editingSectionIndex === targetIndex) {
      setEditingSectionIndex(index);
    }
  };

  const toggleSectionActive = (index: number) => {
    updatePageState((draft) => {
      draft.sections[index].active = !draft.sections[index].active;
    });
  };

  const deleteSection = (index: number) => {
    if (!window.confirm("Are you sure you want to remove this section? You will lose its content."))
      return;

    updatePageState((draft) => {
      draft.sections.splice(index, 1);
    });
    if (editingSectionIndex === index) {
      setEditingSectionIndex(null);
    } else if (editingSectionIndex !== null && editingSectionIndex > index) {
      setEditingSectionIndex(editingSectionIndex - 1);
    }
  };

  const addCustomSection = (type: string) => {
    updatePageState((draft) => {
      const order = draft.sections.length;
      let templateContent: any = { title: "New Section", description: "Edit details here." };

      // Try to source initial templates from defaults
      const matchingDefault = PAGE_CONFIGS[selectedPage].defaults.sections.find(
        (s: any) => s.type === type,
      );
      if (matchingDefault) {
        templateContent = JSON.parse(JSON.stringify(matchingDefault.content));
      }

      draft.sections.push({
        id: `${type}_${Date.now().toString().slice(-4)}`,
        type: type,
        active: true,
        order: order,
        content: templateContent,
      });
    });
    toast.success("Section added at bottom!");
  };

  if (!pageState) {
    return (
      <div className="text-center py-20 space-y-4">
        <RefreshCw className="animate-spin text-orange mx-auto" size={32} />
        <p className="text-white/40">Loading page configurations...</p>
      </div>
    );
  }

  // Pre-compiled list of possible section types based on the page's defaults
  const possibleSectionTypes = Array.from(
    new Set(PAGE_CONFIGS[selectedPage].defaults.sections.map((s: any) => s.type)),
  ) as string[];

  return (
    <div className="space-y-6">
      {/* Top Page Selector Bar & Drag Reordering */}
      <div className="border-b border-white/10 pb-4">
        <div className="mb-3">
          <h4 className="text-xs uppercase tracking-widest text-white/50 font-semibold">
            Pages & Navigation Order
          </h4>
          <p className="text-[10px] text-white/30 mt-1">
            Drag tabs or use arrows to reorder pages and update the main website navigation menu instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {pageKeys.map((key, index) => {
            const config = PAGE_CONFIGS[key as keyof typeof PAGE_CONFIGS];
            if (!config) return null;
            const isSelected = selectedPage === key;
            const isDragging = draggedIndex === index;
            const isOver = dragOverIndex === index;

            const currentNavbar = globalData?.navbar || DEFAULT_GLOBAL.navbar;
            const hrefToKey: Record<string, string> = {
              "/": "home",
              "/about": "about",
              "/services": "services",
              "/products": "products",
              "/portfolio": "portfolio",
              "/contact": "contact",
            };
            const navItem = currentNavbar.find((l: any) => hrefToKey[l.href] === key);
            const isHidden = navItem ? !!navItem.hidden : false;

            return (
              <motion.div
                layout
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-semibold transition-all select-none ${
                  isSelected
                    ? "bg-orange text-white shadow-md shadow-orange/15"
                    : "bg-white/5 border border-white/5 hover:bg-white/10 text-white/70"
                } ${isDragging ? "opacity-30 border-dashed border-orange" : ""} ${
                  isOver ? "border-orange border-2 scale-105" : ""
                } cursor-grab active:cursor-grabbing`}
              >
                {/* Drag handle */}
                <div className="text-white/30 hover:text-white/60">
                  <Icons.GripVertical size={14} />
                </div>

                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePageVisibility(key);
                  }}
                  className={`p-1 rounded-md transition-colors ${
                    isHidden
                      ? "text-red-400 hover:text-red-300 hover:bg-white/5"
                      : "text-white/40 hover:text-emerald-400 hover:bg-white/5"
                  }`}
                  title={isHidden ? "Show in Navigation" : "Hide from Navigation"}
                >
                  {isHidden ? <Icons.EyeOff size={14} /> : <Icons.Eye size={14} />}
                </button>

                <span
                  onClick={() => setSelectedPage(key as any)}
                  className="cursor-pointer flex-1"
                >
                  {config.label}
                </span>

                {/* Arrow buttons for mobile and accessibility */}
                <div className="flex items-center gap-0.5 ml-2 border-l border-white/10 pl-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => movePageKey(index, "left")}
                    className="text-white/30 hover:text-white disabled:opacity-20 disabled:pointer-events-none p-0.5"
                    title="Move Left"
                  >
                    <Icons.ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={index === pageKeys.length - 1}
                    onClick={() => movePageKey(index, "right")}
                    className="text-white/30 hover:text-white disabled:opacity-20 disabled:pointer-events-none p-0.5"
                    title="Move Right"
                  >
                    <Icons.ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {hasUnsaved && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-500" size={20} />
            <p className="text-sm font-semibold">Unsaved edits made to this page content.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPageState(initialDbData);
                setHasUnsaved(false);
                toast.info("Edits rolled back");
              }}
              className="px-4 py-1.5 text-xs font-bold hover:bg-white/5 border border-white/10 rounded-md transition"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSavePage}
              disabled={saving}
              className="bg-orange hover:bg-orange/95 px-4 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5"
            >
              {saving ? <RefreshCw className="animate-spin" size={12} /> : <Check size={12} />}
              <span>Save & Publish</span>
            </button>
          </div>
        </div>
      )}

      {/* SEO configuration for the selected page */}
      <div className="bg-white/5 border border-white/10 rounded-md p-6 space-y-4">
        <h3 className="font-display font-bold text-lg border-b border-white/10 pb-3 flex items-center gap-2">
          <Globe size={18} className="text-orange" />
          <span>SEO & Metadata Settings</span>
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
              Meta Page Title
            </label>
            <input
              type="text"
              value={pageState.seo?.title || ""}
              onChange={(e) =>
                updatePageState((draft) => {
                  draft.seo = draft.seo || {};
                  draft.seo.title = e.target.value;
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
              Meta Description
            </label>
            <input
              type="text"
              value={pageState.seo?.description || ""}
              onChange={(e) =>
                updatePageState((draft) => {
                  draft.seo = draft.seo || {};
                  draft.seo.description = e.target.value;
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Sections Management */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sections Listing Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg">Page Sections</h3>
            <div className="relative group">
              <button className="bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5">
                <Plus size={14} />
                <span>Add Section</span>
                <ChevronDown size={12} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#0d1424] border border-white/10 rounded-md shadow-xl py-1 hidden group-hover:block z-40">
                {possibleSectionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => addCustomSection(type)}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 hover:text-white transition"
                  >
                    {type.toUpperCase()} Section
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {pageState.sections?.map((section: any, index: number) => {
              const isActive = section.active !== false;
              const isEditing = editingSectionIndex === index;

              return (
                <div
                  key={section.id}
                  className={`bg-white/5 border rounded p-4 transition-all ${
                    isEditing
                      ? "border-orange ring-1 ring-orange/30 bg-orange/5"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => moveSection(index, "up")}
                          className="text-white/30 hover:text-white disabled:opacity-20 transition"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          disabled={index === pageState.sections.length - 1}
                          onClick={() => moveSection(index, "down")}
                          className="text-white/30 hover:text-white disabled:opacity-20 transition"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{section.id}</span>
                          <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold text-white/60">
                            {section.type}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">Order position: {index + 1}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSectionActive(index)}
                        className={`p-2 rounded-md transition ${
                          isActive
                            ? "text-emerald-400 hover:bg-emerald-500/10"
                            : "text-white/30 hover:bg-white/5"
                        }`}
                        title={isActive ? "Disable section" : "Enable section"}
                      >
                        {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => setEditingSectionIndex(isEditing ? null : index)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                          isEditing
                            ? "bg-orange text-white"
                            : "bg-white/10 hover:bg-white/15 text-white"
                        }`}
                      >
                        {isEditing ? "Editing" : "Configure"}
                      </button>
                      <button
                        onClick={() => deleteSection(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition"
                        title="Delete section"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {(!pageState.sections || pageState.sections.length === 0) && (
              <div className="text-center py-10 bg-white/5 border border-dashed border-white/10 rounded">
                <AlertCircle className="mx-auto text-white/30 mb-2" size={24} />
                <p className="text-xs text-white/40">No sections configured for this page.</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Field Editor Column */}
        <div className="lg:col-span-7">
          {editingSectionIndex !== null && pageState.sections?.[editingSectionIndex] ? (
            <div className="bg-white/5 border border-white/10 rounded-md p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <Layout size={18} className="text-orange" />
                    <span>Section Content Editor</span>
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">
                    Modifying:{" "}
                    <code className="text-orange font-mono bg-white/5 px-1 py-0.5 rounded">
                      {pageState.sections[editingSectionIndex].id}
                    </code>
                  </p>
                </div>
                <button
                  onClick={() => setEditingSectionIndex(null)}
                  className="text-xs font-semibold text-white/40 hover:text-white bg-white/5 border border-white/5 px-3 py-1.5 rounded-md transition"
                >
                  Close Editor
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                <RecursiveCmsFieldEditor
                  label="Content Configuration"
                  path={["sections", editingSectionIndex.toString(), "content"]}
                  value={pageState.sections[editingSectionIndex].content || {}}
                  onChange={(newContent) => {
                    updatePageState((draft) => {
                      draft.sections[editingSectionIndex].content = newContent;
                    });
                  }}
                  openMediaPicker={openMediaPicker}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-white/5 border border-dashed border-white/10 rounded-md">
              <div className="text-center max-w-sm space-y-2">
                <HelpCircle className="mx-auto text-white/20" size={40} />
                <h4 className="font-semibold text-white/70">No Section Selected</h4>
                <p className="text-xs text-white/40">
                  Select a section configuration from the left pane to edit its text, icons, cards,
                  lists, and images.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 sticky bottom-0 bg-[#070b13] py-4 border-t border-t-white/10">
        <button
          onClick={handleSavePage}
          disabled={saving || !hasUnsaved}
          className="bg-orange hover:bg-orange/90 text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition duration-300 flex items-center gap-2"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          <span>Publish Page Layout</span>
        </button>
      </div>
    </div>
  );
}

/* ==========================================
   PREMIUM MEDIA FIELD EDITOR
   ========================================== */
function PremiumMediaFieldEditor({
  label,
  value,
  onChange,
  openMediaPicker,
  path,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  openMediaPicker: (path: string, cb: (url: string) => void) => void;
  path: string[];
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.includes(".jpg") ||
      lower.includes(".jpeg") ||
      lower.includes(".png") ||
      lower.includes(".webp") ||
      lower.includes(".gif") ||
      lower.includes(".svg") ||
      lower.includes("image/upload")
    );
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.includes(".mp4") ||
      lower.includes(".webm") ||
      lower.includes(".ogg") ||
      lower.includes(".mov") ||
      lower.includes("video/upload")
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.info(`Preparing upload for ${file.name}...`);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const result = await uploadAssetServerFn({
            data: {
              fileBase64: base64,
              filename: file.name,
            },
          });

          // Save link and public ID reference in Firebase
          const safeKey = result.public_id.replace(/[.#$/[\]]/g, "_");
          await set(ref(db, `media/${safeKey}`), {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format || file.name.split(".").pop() || "raw",
            name: file.name,
            uploadedAt: Date.now(),
          });

          onChange(result.secure_url);
          toast.success("File uploaded and linked successfully!");
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
          toast.error(`Cloudinary Upload Failed: ${err.message}`);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message || "File reading failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded p-4 space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
          >
            Clear Media
          </button>
        )}
      </div>

      {/* Preview Section */}
      <div className="aspect-video w-full max-h-48 bg-black/40 border border-white/5 rounded-md flex items-center justify-center overflow-hidden relative group">
        {value ? (
          isImage(value) ? (
            <img src={value} alt={label} className="w-full h-full object-contain" />
          ) : isVideo(value) ? (
            <video src={value} controls muted className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-4">
              <Icons.FileCode className="text-orange mx-auto mb-2" size={32} />
              <p className="text-xs text-white/60 truncate max-w-xs">{value}</p>
            </div>
          )
        ) : (
          <div className="text-center p-4 text-white/30">
            <Icons.Image className="mx-auto mb-2" size={32} />
            <p className="text-xs">No media configured</p>
          </div>
        )}

        {/* Hover overlay to copy link */}
        {value && (
          <div className="absolute inset-0 bg-[#000000a0] opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(value);
                toast.success("URL copied!");
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/10 rounded px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Icons.Copy size={12} />
              <span>Copy Link</span>
            </button>
          </div>
        )}
      </div>

      {/* Inputs and buttons */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste media secure URL or path..."
            className="flex-1 bg-black/20 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
          />
          <button
            type="button"
            onClick={() => openMediaPicker(path.join("."), onChange)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-md px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 transition text-white"
            title="Browse Media Library"
          >
            <Icons.Search size={14} />
            <span className="hidden sm:inline">Browse</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-orange/15 hover:bg-orange/20 border border-orange/20 text-orange font-semibold py-2 rounded-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
          >
            {uploading ? (
              <Icons.RefreshCw className="animate-spin" size={14} />
            ) : (
              <Icons.Upload size={14} />
            )}
            <span>{uploading ? "Uploading..." : "Upload from Device"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   GENERIC RECURSIVE FIELD EDITOR (CMS SYSTEM)
   ========================================== */
interface FieldEditorProps {
  label: string;
  path: string[];
  value: any;
  onChange: (val: any) => void;
  openMediaPicker: (path: string, cb: (url: string) => void) => void;
}

function RecursiveCmsFieldEditor({
  label,
  path,
  value,
  onChange,
  openMediaPicker,
}: FieldEditorProps) {
  const fieldName = path[path.length - 1];

  // Helper to convert camelCase keys to friendly Title Case labels
  const getReadableLabel = (key: string) => {
    // Treat short keys specially
    if (key === "q") return "Quote Quote";
    if (key === "a") return "Author / Speaker Name";
    if (key === "r") return "Author Title / Role";
    if (key === "t") return "Label / Title";
    if (key === "d") return "Description";
    if (key === "n") return "Index / Badge";
    if (key === "v") return "Display Value";
    if (key === "y") return "Timeline Year";
    if (key === "c") return "Category";
    if (key === "ceoImage") return "CEO Photo Image";
    if (key === "ceoTalk") return "CEO Quote / Message (CEO Talk)";
    if (key === "ceoName") return "CEO Name & Title";

    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  // Case 1: Plain Object (but not null and not an Array)
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return (
      <CollapsibleFieldCard
        title={getReadableLabel(label)}
        defaultOpen={path.length <= 4}
        icon={FileText}
      >
        <div className="space-y-6 pt-2">
          {Object.keys(value).map((key) => (
            <RecursiveCmsFieldEditor
              key={key}
              label={key}
              path={[...path, key]}
              value={value[key]}
              onChange={(newVal) => {
                const nextVal = { ...value, [key]: newVal };
                onChange(nextVal);
              }}
              openMediaPicker={openMediaPicker}
            />
          ))}
        </div>
      </CollapsibleFieldCard>
    );
  }

  // Case 2: Array of items
  if (Array.isArray(value)) {
    const handleMoveItem = (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= value.length) return;

      const nextArr = [...value];
      const temp = nextArr[index];
      nextArr[index] = nextArr[targetIndex];
      nextArr[targetIndex] = temp;
      onChange(nextArr);
    };

    const handleDeleteItem = (index: number) => {
      const nextArr = [...value];
      nextArr.splice(index, 1);
      onChange(nextArr);
    };

    const handleAddItem = () => {
      const nextArr = [...value];
      if (value.length > 0) {
        // Clone structure of the first item to maintain properties
        const cloned = cloneStructure(value[0]);
        nextArr.push(cloned);
      } else {
        // Absolute fallback templates for nested structures
        nextArr.push("");
      }
      onChange(nextArr);
    };

    return (
      <CollapsibleFieldCard
        title={`${getReadableLabel(label)} List (${value.length})`}
        defaultOpen={path.length <= 4}
        icon={Menu}
      >
        <div className="space-y-4 pt-2">
          {value.map((item, idx) => (
            <div
              key={idx}
              className="relative bg-white/5 border border-white/5 rounded p-4 flex gap-4"
            >
              <div className="flex flex-col gap-1 flex-shrink-0 justify-center">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveItem(idx, "up")}
                  className="text-white/30 hover:text-white disabled:opacity-20"
                >
                  <ArrowUp size={14} />
                </button>
                <span className="text-[10px] text-center font-bold text-white/40">{idx + 1}</span>
                <button
                  type="button"
                  disabled={idx === value.length - 1}
                  onClick={() => handleMoveItem(idx, "down")}
                  className="text-white/30 hover:text-white disabled:opacity-20"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <RecursiveCmsFieldEditor
                  label={`Item #${idx + 1}`}
                  path={[...path, idx.toString()]}
                  value={item}
                  onChange={(newVal) => {
                    const nextArr = [...value];
                    nextArr[idx] = newVal;
                    onChange(nextArr);
                  }}
                  openMediaPicker={openMediaPicker}
                />
              </div>

              <button
                type="button"
                onClick={() => handleDeleteItem(idx)}
                className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition"
                title="Remove Item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-dashed border-white/10 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Plus size={14} />
            <span>Add Item to {getReadableLabel(label)}</span>
          </button>
        </div>
      </CollapsibleFieldCard>
    );
  }

  // Case 3: Boolean toggles
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/5 rounded p-4">
        <div>
          <span className="text-sm font-semibold text-white/80">{getReadableLabel(label)}</span>
          <p className="text-[10px] text-white/30 mt-0.5">
            Toggle active state for this subcomponent
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`h-6 w-11 rounded-full p-0.5 transition-all relative ${
            value ? "bg-orange" : "bg-white/10"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white block transition-all ${
              value ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    );
  }

  // Case 4: Numbers
  if (typeof value === "number") {
    const isOpacity = fieldName.toLowerCase().includes("opacity");
    const isBlur = fieldName.toLowerCase().includes("blur");

    if (isOpacity || isBlur) {
      const min = 0;
      const max = isOpacity ? 1 : 40;
      const step = isOpacity ? 0.05 : 1;
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold">
              {getReadableLabel(label)}: <span className="text-orange font-mono font-bold">{value}</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1 accent-orange h-1.5 bg-white/10 rounded appearance-none cursor-pointer"
            />
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-20 bg-white/5 border border-white/10 rounded-md px-3 py-1 text-sm text-center text-white focus:border-orange outline-none transition"
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
          {getReadableLabel(label)}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
        />
      </div>
    );
  }

  // Case 5: Text Strings (handling inputs, textareas, colors, icons, and media paths)
  const isColor = fieldName.toLowerCase().includes("color");
  const isIcon = fieldName.toLowerCase() === "icon" || fieldName.toLowerCase().endsWith("icon");
  const isMedia =
    fieldName.toLowerCase().includes("url") ||
    fieldName.toLowerCase().includes("link") ||
    fieldName.toLowerCase().includes("image") ||
    fieldName.toLowerCase().includes("video") ||
    fieldName.toLowerCase().includes("favicon") ||
    fieldName.toLowerCase().includes("logo");

  const isLongText =
    value.length > 50 ||
    fieldName.toLowerCase().includes("desc") ||
    fieldName.toLowerCase().includes("para") ||
    fieldName.toLowerCase() === "q" ||
    fieldName.toLowerCase() === "a" ||
    fieldName.toLowerCase() === "message" ||
    fieldName.toLowerCase() === "visiontext" ||
    fieldName.toLowerCase() === "ceotalk" ||
    fieldName.toLowerCase() === "missiontext";

  if (isColor) {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-white/80">{getReadableLabel(label)}</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-28 text-center font-mono bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:border-orange outline-none transition"
          />
          <input
            type="color"
            value={value.startsWith("#") && value.length === 7 ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 rounded cursor-pointer border-none bg-transparent"
          />
        </div>
      </div>
    );
  }

  if (isIcon) {
    const defaultIcons = [
      "Code2",
      "Smartphone",
      "Lightbulb",
      "Boxes",
      "Megaphone",
      "ShoppingBag",
      "Palette",
      "Cloud",
      "Sparkles",
      "Target",
      "Heart",
      "Eye",
      "Zap",
      "ShieldCheck",
      "Layers",
      "Rocket",
      "Bot",
      "BarChart3",
      "GraduationCap",
      "Banknote",
      "HeartPulse",
      "Building2",
    ];

    return (
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
          {getReadableLabel(label)} (Lucide Icon)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
          />
          <div className="h-11 w-11 bg-white/5 border border-white/10 rounded-md grid place-items-center flex-shrink-0 text-orange">
            <LucideIconRenderer name={value} size={18} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {defaultIcons.map((ico) => (
            <button
              key={ico}
              type="button"
              onClick={() => onChange(ico)}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                value === ico
                  ? "bg-orange text-white"
                  : "bg-white/5 hover:bg-white/10 text-white/60"
              }`}
            >
              {ico}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isMedia) {
    return (
      <PremiumMediaFieldEditor
        label={getReadableLabel(label)}
        value={value}
        onChange={onChange}
        openMediaPicker={openMediaPicker}
        path={path}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs uppercase tracking-wider text-white/50 font-semibold">
          {getReadableLabel(label)}
        </label>
      </div>

      {isLongText ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-orange outline-none transition"
        />
      )}
    </div>
  );
}

// Collapsible Box Container Helper
function CollapsibleFieldCard({
  title,
  children,
  defaultOpen = false,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: any;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-orange" size={16} />}
          <span className="text-sm font-bold text-white/80">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="text-white/40" size={16} />
        ) : (
          <ChevronRight className="text-white/40" size={16} />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 space-y-6 bg-[#090e1a]/40">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to deep clone field layouts dynamically
function cloneStructure(sample: any): any {
  if (Array.isArray(sample)) {
    return [];
  } else if (sample && typeof sample === "object") {
    const clone: any = {};
    for (const key of Object.keys(sample)) {
      clone[key] = cloneStructure(sample[key]);
    }
    return clone;
  } else if (typeof sample === "string") {
    return "";
  } else if (typeof sample === "number") {
    return 0;
  } else if (typeof sample === "boolean") {
    return false;
  }
  return null;
}

// Render Lucide icons dynamically without crashing
function LucideIconRenderer({ name, size = 16 }: { name: string; size?: number }) {
  const IconComponent = (Icons as any)[name];
  return IconComponent
    ? React.createElement(IconComponent, { size })
    : React.createElement(HelpCircle, { size });
}

/* ==========================================
   MEDIA MANAGER / UPLOADER
   ========================================== */
interface MediaManagerProps {
  mediaItems: any[];
  isPickerMode: boolean;
  onSelectMedia: (url: string) => void;
}

function MediaManager({ mediaItems, isPickerMode, onSelectMedia }: MediaManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.info(`Preparing upload for ${file.name}...`);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const result = await uploadAssetServerFn({
            data: {
              fileBase64: base64,
              filename: file.name,
            },
          });

          // Save link and public ID reference in Firebase
          const safeKey = result.public_id.replace(/[.#$/[\]]/g, "_");
          await set(ref(db, `media/${safeKey}`), {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            name: file.name,
            uploadedAt: Date.now(),
          });

          toast.success("File uploaded to Cloudinary successfully!");
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
          toast.error(`Cloudinary Upload Failed: ${err.message}`);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message || "File reading failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (item: any) => {
    if (!window.confirm("Are you sure you want to remove this media reference from the database?"))
      return;
    try {
      await remove(ref(db, `media/${item.id}`));
      toast.success("Media reference removed");
    } catch (err: any) {
      toast.error(err.message || "Deletion failed");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Secure CDN URL copied to clipboard!");
  };

  const filteredMedia = mediaItems.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.publicId?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Upload & Search Controls */}
      <div className="bg-white/5 border border-white/10 rounded-md p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-4 top-3 text-white/30" size={16} />
          <input
            type="text"
            placeholder="Search media assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d1424] border border-white/10 rounded-md pl-11 pr-4 py-2.5 text-sm outline-none focus:border-orange transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-orange hover:bg-orange/90 text-white font-semibold px-5 py-2.5 rounded-md transition flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
            <span>Upload New Asset</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.map((item) => {
          const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(
            item.format?.toLowerCase(),
          );

          return (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 rounded overflow-hidden flex flex-col justify-between group relative"
            >
              {/* Media Thumbnail */}
              <div className="aspect-square bg-black/40 flex items-center justify-center overflow-hidden relative">
                {isImage ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="text-center space-y-2 p-2">
                    <FileCode className="text-orange mx-auto" size={24} />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                      {item.format || "Video/File"}
                    </span>
                  </div>
                )}

                {/* Selection Overlay in Picker Mode */}
                {isPickerMode && (
                  <div className="absolute inset-0 bg-[#000000a0] opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => onSelectMedia(item.url)}
                      className="bg-orange text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-lg hover:scale-105 transition"
                    >
                      Use Asset
                    </button>
                  </div>
                )}
              </div>

              {/* Asset Footer Actions */}
              <div className="p-3 bg-black/20 space-y-2">
                <p className="text-[11px] font-semibold text-white/80 truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">
                    {item.format || "raw"}
                  </span>
                  <div className="flex gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                      onClick={() => copyUrl(item.url)}
                      className="p-1 hover:text-orange hover:bg-white/5 rounded transition"
                      title="Copy URL"
                    >
                      <Copy size={12} />
                    </button>
                    {!isPickerMode && (
                      <button
                        onClick={() => deleteMedia(item)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded transition"
                        title="Delete Reference"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMedia.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-md">
            <ImageIcon className="mx-auto text-white/20 mb-3 animate-pulse" size={48} />
            <h4 className="font-semibold text-white/60">No Media Assets Found</h4>
            <p className="text-xs text-white/40 mt-1">
              Upload files using the top button to store them inside Cloudinary and make them
              accessible to your pages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   FORM SUBMISSIONS MANAGER
   ========================================== */
function SubmissionsManager({ submissions }: { submissions: any[] }) {
  const [search, setSearch] = useState("");

  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this inquiry?")) return;
    try {
      await remove(ref(db, `submissions/${id}`));
      toast.success("Submission deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete submission");
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "CRITICAL: You are about to clear ALL user submissions! Are you absolutely sure?",
      )
    )
      return;
    try {
      await remove(ref(db, "submissions"));
      toast.success("All submissions cleared successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to clear list");
    }
  };

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.company?.toLowerCase().includes(search.toLowerCase()) ||
      s.service?.toLowerCase().includes(search.toLowerCase()) ||
      s.message?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Filters and Batch Actions */}
      <div className="bg-white/5 border border-white/10 rounded-md p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-4 top-3 text-white/30" size={16} />
          <input
            type="text"
            placeholder="Search through client inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d1424] border border-white/10 rounded-md pl-11 pr-4 py-2.5 text-sm outline-none focus:border-orange transition"
          />
        </div>

        {submissions.length > 0 && (
          <button
            onClick={handleClearAll}
            className="bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-bold px-4 py-2.5 rounded-md transition text-xs flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>Clear All Submissions</span>
          </button>
        )}
      </div>

      {/* Submissions Listing */}
      <div className="space-y-4">
        {filteredSubmissions.map((s) => (
          <div
            key={s.id}
            className="bg-white/5 border border-white/10 rounded-md p-6 space-y-4 hover:border-orange/20 transition relative group"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-lg">{s.name}</h4>
                  {s.company && (
                    <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded text-white/60">
                      @{s.company}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> {s.email}
                  </span>
                  {s.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {s.phone}
                    </span>
                  )}
                  <span className="bg-orange/10 text-orange border border-orange/20 px-2 py-0.5 rounded font-semibold text-[10px] tracking-wide uppercase">
                    {s.service || "General Inquiry"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 font-bold">
                  {new Date(s.timestamp || Date.now()).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  onClick={() => handleDeleteSubmission(s.id)}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition opacity-0 group-hover:opacity-100"
                  title="Delete Inquiry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="bg-[#0b101d] border border-white/5 rounded p-4 text-sm text-white/80 font-normal leading-relaxed whitespace-pre-wrap">
              {s.message}
            </div>
          </div>
        ))}

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-md">
            <Inbox className="mx-auto text-white/20 mb-3 animate-pulse" size={48} />
            <h4 className="font-semibold text-white/60">No Submissions Found</h4>
            <p className="text-xs text-white/40 mt-1">
              When clients complete the contact forms on the main website, they will show up here in
              real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
