import { db } from "./firebase";
import { ref, set, remove } from "firebase/database";

export interface AdminUser {
  email: string;
  token: string;
  loggedInAt: number;
  expiresAt?: number;
}

/**
 * Authenticate admin against the secure serverless endpoint
 */
export async function loginAdmin(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  try {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.error || "Invalid email or password." };
    }

    const user: AdminUser = {
      email: data.user.email,
      token: data.user.token,
      loggedInAt: data.user.loggedInAt || Date.now(),
      expiresAt: data.user.expiresAt,
    };

    localStorage.setItem("admin_session", JSON.stringify(user));
    localStorage.setItem("admin_auth_user", JSON.stringify(user));

    return { success: true, user };
  } catch (err: any) {
    console.error("Authentication request failed:", err);
    return { success: false, error: "Network error during authentication. Please check your connection." };
  }
}

/**
 * Verify active admin session with serverless cryptographic verification
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  const raw = localStorage.getItem("admin_session") || localStorage.getItem("admin_auth_user");
  if (!raw) return null;

  try {
    const user: AdminUser = JSON.parse(raw);
    if (!user || !user.token || !user.email) {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_auth_user");
      return null;
    }

    // Check client-side expiry first
    if (user.expiresAt && Date.now() > user.expiresAt) {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_auth_user");
      return null;
    }

    // Verify token with backend
    try {
      const res = await fetch("/api/admin-verify", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("admin_session");
        localStorage.removeItem("admin_auth_user");
        return null;
      }

      const data = await res.json();
      if (!data.ok || !data.valid) {
        localStorage.removeItem("admin_session");
        localStorage.removeItem("admin_auth_user");
        return null;
      }

      return user;
    } catch {
      // Offline fallback if token not expired
      if (user.expiresAt && Date.now() < user.expiresAt) {
        return user;
      }
      return null;
    }
  } catch {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_auth_user");
    return null;
  }
}

/**
 * Logout admin and clear local session
 */
export async function logoutAdmin(): Promise<void> {
  localStorage.removeItem("admin_session");
  localStorage.removeItem("admin_auth_user");
}

/**
 * Update Admin Password in Firebase RTDB
 */
export async function updateAdminPasswordInDb(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAdminSession();
    const email = user?.email || "gurmitraa@gmail.com";
    const safeKey = email.replace(/[.#$/[\]]/g, "_");

    await set(ref(db, `admins/${safeKey}`), {
      email,
      password: newPassword,
      updatedAt: Date.now(),
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update password" };
  }
}

/**
 * Update Admin Email in Firebase RTDB
 */
export async function updateAdminEmailInDb(newEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAdminSession();
    const oldEmail = user?.email || "gurmitraa@gmail.com";
    const oldSafeKey = oldEmail.replace(/[.#$/[\]]/g, "_");
    const newSafeKey = newEmail.trim().toLowerCase().replace(/[.#$/[\]]/g, "_");

    await remove(ref(db, `admins/${oldSafeKey}`));
    await set(ref(db, `admins/${newSafeKey}`), {
      email: newEmail.trim().toLowerCase(),
      updatedAt: Date.now(),
    });

    if (user) {
      user.email = newEmail.trim().toLowerCase();
      localStorage.setItem("admin_session", JSON.stringify(user));
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update email" };
  }
}
