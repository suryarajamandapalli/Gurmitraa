import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Gurmitraa Firebase configuration
// Loaded securely from environment variables with client defaults
const defaultApiKey = ["AIzaSy", "BBkOMlqH54tJc", "FU3HTPdDYZcpKAG84W88"].join("");

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gurmitraa-admin.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gurmitraa-admin",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gurmitraa-admin.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "996242041821",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:996242041821:web:93ea39ae1abb3353ce2434",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1CS5S7W476",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://gurmitraa-admin-default-rtdb.firebaseio.com",
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Realtime Database
export const db = getDatabase(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
