import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { getAdminSession } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then((session) => {
        if (!active) return;
        if (session) {
          navigate({ to: "/admin/dashboard", replace: true });
        } else {
          navigate({ to: "/admin/login", replace: true });
        }
      })
      .catch(() => {
        if (active) {
          navigate({ to: "/admin/login", replace: true });
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  return null;
}
