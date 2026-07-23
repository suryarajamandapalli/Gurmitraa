import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminDashboard } from "./admin";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  // Authenticate session on mount via Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAdminEmail(session.user.email || "admin@example.com");
        setChecking(false);
      } else {
        toast.error("Please log in to access the administrator panel.");
        navigate({ to: "/admin/login", replace: true });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({ to: "/admin/login", replace: true });
      } else if (session.user) {
        setAdminEmail(session.user.email || "admin@example.com");
        setChecking(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully.");
      navigate({ to: "/admin/login", replace: true });
    } catch (err) {
      toast.error("Logout failed.");
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
