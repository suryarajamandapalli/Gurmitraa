import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, set, push, remove, onValue } from "firebase/database";
import { uploadAssetServerFn } from "@/lib/cloudinary";
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

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

// Master password for bypass and register
const MASTER_PASSWORD = "gurmitraa2026";

// Available pages and their defaults
const PAGE_CONFIGS = {
  home: { label: "Home Page", defaults: DEFAULT_HOME },
  about: { label: "About Page", defaults: DEFAULT_ABOUT },
  services: { label: "Services Page", defaults: DEFAULT_SERVICES },
  products: { label: "Products Page", defaults: DEFAULT_PRODUCTS },
  portfolio: { label: "Portfolio Page", defaults: DEFAULT_PORTFOLIO },
  contact: { label: "Contact Page", defaults: DEFAULT_CONTACT },
};

function AdminRoute() {
  const [isMasterAuthenticated, setIsMasterAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      // Check if master password is cached in localStorage
      const masterSession = localStorage.getItem("gurmitraa_master_auth");
      if (masterSession === "true") {
        setIsMasterAuthenticated(true);
      }
    } catch (e) {
      console.warn("Storage access failed:", e);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = () => {
    setIsMasterAuthenticated(false);
    try {
      localStorage.removeItem("gurmitraa_master_auth");
    } catch (e) {
      console.warn("Storage access failed:", e);
    }
    toast.success("Successfully logged out");
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070b13] text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-orange mx-auto" size={48} />
          <p className="text-white/60 tracking-widest text-sm uppercase">
            Loading security layer...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans antialiased">
      <Toaster position="top-right" theme="dark" />
      {isMasterAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLoginSuccess={() => setIsMasterAuthenticated(true)} />
      )}
    </div>
  );
}

/* ==========================================
   AUTHENTICATION PANEL (MASTER PASSCODE ONLY)
   ========================================== */
function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [masterKey, setMasterKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (masterKey === MASTER_PASSWORD) {
        try {
          localStorage.setItem("gurmitraa_master_auth", "true");
        } catch (e) {
          console.warn("Storage access failed:", e);
        }
        onLoginSuccess();
        toast.success("Master Admin Access Granted");
      } else {
        toast.error("Invalid master passcode");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] relative px-4 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-md p-8 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded bg-orange/15 text-orange mb-4">
            <Shield size={28} />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white">GURMITRAA</h2>
          <p className="text-white/50 text-sm mt-1">Enterprise CMS Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/50 font-medium mb-3">
              Master Access Passcode
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-white/30" size={18} />
              <input
                type="password"
                required
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="Enter master passcode"
                className="w-full bg-white/5 border border-white/10 rounded-md pl-12 pr-4 py-3 text-white placeholder-white/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange hover:bg-orange/95 text-white font-semibold py-3.5 rounded-md transition shadow-lg shadow-orange/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <>
                <Unlock size={18} />
                <span>Verify & Enter Dashboard</span>
              </>
            )}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition"
          >
            <Icons.ArrowLeft size={16} />
            <span>Return to Home</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}

/* ==========================================
   MAIN DASHBOARD LAYOUT
   ========================================== */
interface DashboardProps {
  onLogout: () => void;
}

function AdminDashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"global" | "pages" | "media" | "submissions">(
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

  // Sync real-time global settings, submissions, and media
  useEffect(() => {
    setDbLoading(true);

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
          // Sort descending by timestamp
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
            <div className="h-8 w-8 rounded-full bg-white/10 grid place-items-center text-white/80 font-bold text-sm">
              M
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Signed in as
              </p>
              <p className="text-sm font-bold text-white/90 truncate">
                Master Admin
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
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
