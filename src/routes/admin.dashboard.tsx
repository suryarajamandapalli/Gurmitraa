import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminDashboard } from "./admin";
import { subscribeToAdminAuthState, logoutAdmin } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  // Authenticate session via Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = subscribeToAdminAuthState((user) => {
      if (user) {
        setAdminEmail(user.email || "Administrator");
        setChecking(false);
      } else {
        toast.error("Please log in to access the administrator panel.");
        navigate({ to: "/admin/login", replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      toast.success("Logged out successfully.");
      navigate({ to: "/admin/login", replace: true });
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070b13] text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-orange mx-auto" size={48} />
          <p className="text-white/60 tracking-widest text-sm uppercase">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard adminEmail={adminEmail} onLogout={handleLogout} />
  );
}
