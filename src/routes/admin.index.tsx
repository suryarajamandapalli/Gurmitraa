import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/admin/dashboard", replace: true });
      } else {
        navigate({ to: "/admin/login", replace: true });
      }
    });
  }, [navigate]);

  return null;
}
