import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { subscribeToAdminAuthState } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToAdminAuthState((user) => {
      if (user) {
        navigate({ to: "/admin/dashboard", replace: true });
      } else {
        navigate({ to: "/admin/login", replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return null;
}
