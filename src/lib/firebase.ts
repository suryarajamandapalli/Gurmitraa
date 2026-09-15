import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBB5XJo9YlG_gvCedCKrsnl_cn3BzA8XPI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gurumitraa.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gurumitraa",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gurumitraa.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "79702563015",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:79702563015:web:6e15188f7780f112ad46e2",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://gurumitraa-default-rtdb.firebaseio.com",
};

// Initialize Firebase app singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

