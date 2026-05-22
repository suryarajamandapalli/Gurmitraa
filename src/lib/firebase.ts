import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBB5XJo9YlG_gvCedCKrsnl_cn3BzA8XPI",
  authDomain: "gurumitraa.firebaseapp.com",
  projectId: "gurumitraa",
  storageBucket: "gurumitraa.firebasestorage.app",
  messagingSenderId: "79702563015",
  appId: "1:79702563015:web:6e15188f7780f112ad46e2",
  databaseURL: "https://gurumitraa-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
