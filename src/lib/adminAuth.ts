import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

// Allowed administrator emails (supports comma-separated VITE_ADMIN_EMAILS / VITE_ADMIN_EMAIL with defaults)
const DEFAULT_ADMIN_EMAILS = [
  "gurmitraa@gmail.com",
  "suryarajamandapalli@gmail.com",
];

const envAdminConfig = (import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || "")
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAILS: string[] = envAdminConfig.length > 0
  ? [...new Set([...envAdminConfig, ...DEFAULT_ADMIN_EMAILS])]
  : DEFAULT_ADMIN_EMAILS;

export const ADMIN_EMAIL = ADMIN_EMAILS[0];

/**
 * Check if the given email is an authorized administrator email
 */
export function isAuthorizedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(trimmed);
}

/**
 * Check if the given Firebase user matches an authorized administrator email
 */
export function isAdminUser(user: User | null): boolean {
  if (!user || !user.email) return false;
  return isAuthorizedEmail(user.email);
}

/**
 * Clean & friendly human-readable error messages without internal stack traces
 */
export function formatAuthError(error: any): string {
  console.error("[Firebase Auth Error]", error);
  const code = error?.code || "";
  const msg = error?.message || "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/invalid-email":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "No account found with this email in Firebase. Please create the user in Firebase Console first.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled in Firebase Console. Go to Authentication > Sign-in method and enable Email/Password.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/user-disabled":
      return "This administrator account has been disabled. Contact support.";
    case "auth/too-many-requests":
      return "Too many authentication attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Unable to connect. Please check your internet connection and try again.";
    case "auth/requires-recent-login":
      return "For security, please re-enter your current password before proceeding.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password (minimum 6 characters).";
    default:
      if (msg && !msg.includes("Firebase:")) {
        return msg;
      }
      return msg ? `Authentication error: ${msg.replace("Firebase: ", "")}` : "An error occurred during authentication. Please try again.";
  }
}

/**
 * Sign in as administrator.
 * Enforces that only authorized administrator accounts are permitted.
 */
export async function loginAdmin(email: string, pass: string): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!trimmedEmail || !pass) {
    throw new Error("Please enter both email and password.");
  }

  // Pre-check email against configured admin emails to prevent unauthorized sign-ins
  if (!isAuthorizedEmail(trimmedEmail)) {
    throw new Error("This account is not authorized to access the Gurmitraa admin portal.");
  }

  const credential = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
  const user = credential.user;

  if (!isAdminUser(user)) {
    await signOut(auth);
    throw new Error("This account is not authorized to access the Gurmitraa admin portal.");
  }

  return user;
}

/**
 * Securely sign out the current administrator
 */
export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

const RESET_COOLDOWN_KEY = "gurmitraa_admin_reset_cooldown";
const COOLDOWN_SECONDS = 60;

/**
 * Returns remaining seconds on the password reset cooldown (0 if ready)
 */
export function getResetCooldownRemaining(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(RESET_COOLDOWN_KEY);
  if (!stored) return 0;
  const expiry = parseInt(stored, 10);
  if (isNaN(expiry)) return 0;
  const remaining = Math.ceil((expiry - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

/**
 * Starts the 60-second cooldown timer persisted in localStorage
 */
export function setResetCooldown(): void {
  if (typeof window === "undefined") return;
  const expiry = Date.now() + COOLDOWN_SECONDS * 1000;
  localStorage.setItem(RESET_COOLDOWN_KEY, expiry.toString());
}

/**
 * Send official Firebase password reset email to an authorized administrator
 */
export async function sendAdminPasswordReset(email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  
  if (!trimmed) {
    throw new Error("Please enter your administrator email address.");
  }

  const remaining = getResetCooldownRemaining();
  if (remaining > 0) {
    throw new Error(`Please wait ${remaining} seconds before requesting another reset email.`);
  }

  // For security, only allow requesting reset for authorized admin emails
  if (!isAuthorizedEmail(trimmed)) {
    // Return smoothly to avoid exposing user existence, but do not send
    setResetCooldown();
    return;
  }

  await sendPasswordResetEmail(auth, trimmed);
  setResetCooldown();
}

/**
 * Update the administrator's password with current password verification
 */
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No active administrator session found. Please log in again.");
  }

  if (!isAdminUser(user)) {
    await signOut(auth);
    throw new Error("Unauthorized administrator session.");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  // Re-authenticate with current credentials
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password in Firebase Auth
  await updatePassword(user, newPassword);
}

/**
 * Subscribe to admin auth state changes with automatic rejection of unauthorized accounts
 */
export function subscribeToAdminAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (isAdminUser(user)) {
        callback(user);
      } else {
        await signOut(auth);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}
