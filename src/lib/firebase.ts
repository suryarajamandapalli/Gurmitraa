import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Gurmitraa Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDNCVcvAqWR9Cjl6RzFNzLYbMadElfhC5c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gurmitraa-2026.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gurmitraa-2026",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gurmitraa-2026.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "254256758938",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:254256758938:web:2b06f3442f4793467c9f23",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E88CGXZF0X",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://gurmitraa-2026-default-rtdb.firebaseio.com",
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Realtime Database
export const db = getDatabase(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
